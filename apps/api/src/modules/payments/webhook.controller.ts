/**
 * Webhook Controller - Nasneh API
 * Handles APS payment webhook callbacks
 * Following TECHNICAL_SPEC.md §6 - APS Webhook Signature Validation
 */

import { Response, NextFunction } from 'express';
import { apsService, ApsPaymentResponse } from '../../lib/aps.js';
import { paymentsRepository } from './payments.repository.js';
import { auditService, ActorRole } from '../../lib/audit.js';
import { prisma } from '../../lib/db.js';
import { PaymentStatus } from '../../types/payment.types.js';
import { RawBodyRequest } from '../../middleware/rawBody.middleware.js';

// ===========================================
// Types
// ===========================================

interface ProcessedWebhookIds {
  [key: string]: number; // fort_id -> timestamp
}

// In-memory store for processed webhook IDs (use Redis in production)
const processedWebhooks: ProcessedWebhookIds = {};

// Cleanup old entries every hour
const WEBHOOK_ID_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
  const now = Date.now();
  for (const id of Object.keys(processedWebhooks)) {
    if (now - processedWebhooks[id] > WEBHOOK_ID_TTL_MS) {
      delete processedWebhooks[id];
    }
  }
}, 60 * 60 * 1000); // Every hour

// ===========================================
// Webhook Handler
// ===========================================

/**
 * Handle APS Webhook
 * POST /payments/webhook
 * 
 * Flow per TECHNICAL_SPEC §6:
 * 1. Capture raw body (done by middleware)
 * 2. Parse and validate signature
 * 3. Check for duplicate processing (idempotency)
 * 4. Update payment status
 * 5. Update order status on success
 * 6. Log all events
 */
export async function handleApsWebhook(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  try {
    // Log incoming webhook
    console.log('[Webhook] Received APS callback from IP:', clientIp);

    // Parse body (already parsed by middleware)
    const webhookData = req.body as ApsPaymentResponse;

    // Validate required fields
    if (!webhookData.merchant_reference || !webhookData.signature) {
      await logWebhookRejection('missing_fields', clientIp, webhookData);
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
      return;
    }

    // Verify signature
    const isValidSignature = apsService.verifyResponseSignature(
      webhookData as unknown as Record<string, string>
    );

    if (!isValidSignature) {
      await logWebhookRejection('invalid_signature', clientIp, webhookData);
      res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
      return;
    }

    // Check for duplicate processing (idempotency)
    const webhookId = webhookData.fort_id;
    if (webhookId && processedWebhooks[webhookId]) {
      console.log('[Webhook] Duplicate webhook ignored:', webhookId);
      // Return 200 to prevent APS from retrying
      res.status(200).json({
        success: true,
        message: 'Webhook already processed',
      });
      return;
    }

    // Find payment by transaction ID (merchant_reference)
    const payment = await paymentsRepository.findPaymentByTransactionId(
      webhookData.merchant_reference
    );

    if (!payment) {
      await logWebhookRejection('payment_not_found', clientIp, webhookData);
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Determine new payment status based on APS response
    const newStatus = mapApsStatusToPaymentStatus(webhookData);

    // Update payment status
    await paymentsRepository.updatePaymentStatus(
      payment.id,
      newStatus,
      webhookData as unknown as Record<string, unknown>
    );

    // If payment successful, update order status
    if (newStatus === PaymentStatus.CAPTURED && payment.payableType === 'ORDER') {
      await updateOrderOnPaymentSuccess(payment.payableId);
    }

    // Mark webhook as processed
    if (webhookId) {
      processedWebhooks[webhookId] = Date.now();
    }

    // Log successful webhook processing
    await auditService.log({
      actorId: null,
      actorRole: ActorRole.SYSTEM,
      action: 'webhook.processed',
      entityType: 'payment',
      entityId: payment.id,
      metadata: {
        webhookId,
        responseCode: webhookData.response_code,
        responseMessage: webhookData.response_message,
        newStatus,
        processingTimeMs: Date.now() - startTime,
      },
    });

    console.log('[Webhook] Successfully processed:', {
      paymentId: payment.id,
      status: newStatus,
      processingTimeMs: Date.now() - startTime,
    });

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    
    // Log error
    await auditService.log({
      actorId: null,
      actorRole: ActorRole.SYSTEM,
      action: 'webhook.error',
      entityType: 'payment',
      entityId: 'unknown',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientIp,
        processingTimeMs: Date.now() - startTime,
      },
    });

    // Return 500 to trigger APS retry
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Handle APS Return URL (customer redirect after payment)
 * GET /payments/return
 */
export async function handleApsReturn(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // APS sends response as query params on return
    const responseData = req.query as unknown as ApsPaymentResponse;

    // Verify signature
    const isValidSignature = apsService.verifyResponseSignature(
      responseData as unknown as Record<string, string>
    );

    if (!isValidSignature) {
      console.log('[Return] Invalid signature on return URL');
      res.status(400).json({
        success: false,
        error: 'Invalid signature',
      });
      return;
    }

    // Find payment
    const payment = await paymentsRepository.findPaymentByTransactionId(
      responseData.merchant_reference
    );

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Return payment status to frontend
    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        payableType: payment.payableType,
        payableId: payment.payableId,
      },
      apsResponse: {
        responseCode: responseData.response_code,
        responseMessage: responseData.response_message,
        status: responseData.status,
      },
    });
  } catch (error) {
    console.error('[Return] Error processing return:', error);
    next(error);
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Map APS response status to internal PaymentStatus
 */
function mapApsStatusToPaymentStatus(response: ApsPaymentResponse): PaymentStatus {
  // APS response codes:
  // 14000 - Success (Purchase)
  // 02000 - Success (Authorization)
  // Other codes - Various failures

  if (response.response_code === '14000') {
    return PaymentStatus.CAPTURED;
  }

  if (response.response_code === '02000') {
    return PaymentStatus.AUTHORIZED;
  }

  // Check status field as fallback
  if (response.status === '14') {
    return PaymentStatus.CAPTURED;
  }

  if (response.status === '02') {
    return PaymentStatus.AUTHORIZED;
  }

  // Any other status is a failure
  return PaymentStatus.FAILED;
}

/**
 * Update order status when payment is successful
 */
async function updateOrderOnPaymentSuccess(orderId: string): Promise<void> {
  try {
    // Update order status from PENDING to CONFIRMED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    // Log order confirmation
    await auditService.log({
      actorId: null,
      actorRole: ActorRole.SYSTEM,
      action: 'order.confirmed',
      entityType: 'order',
      entityId: orderId,
      metadata: {
        reason: 'Payment successful',
      },
    });

    console.log('[Webhook] Order confirmed:', orderId);
  } catch (error) {
    console.error('[Webhook] Error updating order:', error);
    // Don't throw - payment is still successful
  }
}

/**
 * Log webhook rejection for security monitoring
 */
async function logWebhookRejection(
  reason: string,
  clientIp: string,
  data: unknown
): Promise<void> {
  console.warn('[Webhook] Rejected:', { reason, clientIp });

  await auditService.log({
    actorId: null,
    actorRole: ActorRole.SYSTEM,
    action: 'webhook.rejected',
    entityType: 'payment',
    entityId: 'unknown',
    metadata: {
      reason,
      clientIp,
      // Don't log full body for security, just key fields
      merchantReference: (data as any)?.merchant_reference,
      responseCode: (data as any)?.response_code,
    },
    ipAddress: clientIp,
  });
}
