/**
 * Payments Controller - Nasneh API
 * Handles HTTP requests for payment endpoints
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  paymentsService,
  PaymentNotFoundError,
  OrderNotFoundError,
  OrderNotPendingError,
  PaymentAlreadyExistsError,
  ApsNotConfiguredError,
  UnauthorizedPaymentAccessError,
} from './payments.service';
import { paymentQuerySchema } from '../../types/payment.types';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { config } from '../../config/env';

// ===========================================
// Validation Schemas
// ===========================================

const initiatePaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

// ===========================================
// Customer Endpoints
// ===========================================

/**
 * Initiate Payment
 * POST /payments/initiate
 */
export async function initiatePayment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const validation = initiatePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { orderId, returnUrl } = validation.data;

    // Get customer email from user profile or request
    const customerEmail = req.user!.email || `${req.user!.phone}@nasneh.app`;

    const result = await paymentsService.initiateOrderPayment({
      orderId,
      customerId: req.user!.userId,
      customerEmail,
      customerName: req.user!.name || undefined,
      customerIp: req.ip,
      returnUrl: returnUrl || `${config.urls.frontend}/orders/${orderId}/payment-complete`,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof OrderNotPendingError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof PaymentAlreadyExistsError) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof ApsNotConfiguredError) {
      res.status(503).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UnauthorizedPaymentAccessError) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get Payment by ID
 * GET /payments/:id
 */
export async function getPaymentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const result = await paymentsService.getPaymentById(id, req.user!.userId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof PaymentNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UnauthorizedPaymentAccessError) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get Customer Payments
 * GET /payments
 */
export async function getCustomerPayments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query params
    const validation = paymentQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await paymentsService.getCustomerPayments(
      req.user!.userId,
      validation.data
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
