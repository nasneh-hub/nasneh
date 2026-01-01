/**
 * Payments Service - Nasneh API
 * Business logic for payment operations
 */

import { paymentsRepository } from './payments.repository';
import { apsService } from '../../lib/aps';
import { auditService, ActorRole } from '../../lib/audit';
import { prisma } from '../../lib/db';
import { config } from '../../config/env';
import {
  PaymentStatus,
  PayableType,
  PaymentQueryInput,
} from '../../types/payment.types';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

// ===========================================
// Custom Errors
// ===========================================

export class PaymentNotFoundError extends Error {
  public statusCode = 404;

  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`);
    this.name = 'PaymentNotFoundError';
  }
}

export class OrderNotFoundError extends Error {
  public statusCode = 404;

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderNotPendingError extends Error {
  public statusCode = 400;

  constructor(orderId: string) {
    super(`Order is not in pending status: ${orderId}`);
    this.name = 'OrderNotPendingError';
  }
}

export class PaymentAlreadyExistsError extends Error {
  public statusCode = 409;

  constructor(orderId: string) {
    super(`Payment already exists for order: ${orderId}`);
    this.name = 'PaymentAlreadyExistsError';
  }
}

export class ApsNotConfiguredError extends Error {
  public statusCode = 503;

  constructor() {
    super('Payment gateway is not configured');
    this.name = 'ApsNotConfiguredError';
  }
}

export class UnauthorizedPaymentAccessError extends Error {
  public statusCode = 403;

  constructor() {
    super('You do not have permission to access this payment');
    this.name = 'UnauthorizedPaymentAccessError';
  }
}

// ===========================================
// Service
// ===========================================

export class PaymentsService {
  /**
   * Initiate payment for an order
   * - Validates order exists and is pending
   * - Generates idempotency key
   * - Creates payment record with pending status
   * - Returns APS checkout URL and form data
   */
  async initiateOrderPayment(params: {
    orderId: string;
    customerId: string;
    customerEmail: string;
    customerName?: string;
    customerIp?: string;
    returnUrl: string;
  }) {
    // Check if APS is configured
    if (!apsService.isConfigured()) {
      throw new ApsNotConfiguredError();
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new OrderNotFoundError(params.orderId);
    }

    // Verify customer owns this order
    if (order.customerId !== params.customerId) {
      throw new UnauthorizedPaymentAccessError();
    }

    // Check order is pending
    if (order.status !== 'PENDING') {
      throw new OrderNotPendingError(params.orderId);
    }

    // Check if payment already exists for this order
    const existingPayment = await paymentsRepository.findPaymentForPayable(
      PayableType.ORDER,
      params.orderId
    );

    if (existingPayment) {
      throw new PaymentAlreadyExistsError(params.orderId);
    }

    // Generate idempotency key (order-specific to prevent duplicates)
    const idempotencyKey = `order-${params.orderId}-${Date.now()}`;

    // Check for existing payment with same idempotency key
    const existingByKey = await paymentsRepository.findPaymentByIdempotencyKey(idempotencyKey);
    if (existingByKey) {
      // Return existing payment (idempotent)
      return {
        success: true,
        message: 'Payment already initiated',
        payment: existingByKey,
        checkoutUrl: apsService.getCheckoutUrl(),
        formData: null, // Already initiated
      };
    }

    // Generate transaction ID
    const transactionId = paymentsRepository.generateTransactionId();

    // Create payment record
    const payment = await paymentsRepository.createPayment({
      transactionId,
      idempotencyKey,
      payableType: PayableType.ORDER,
      payableId: params.orderId,
      amount: new Decimal(order.total.toString()),
      currency: config.aps.currency,
    });

    // Build APS form data
    const formData = apsService.buildPaymentFormData({
      merchantReference: transactionId,
      amount: parseFloat(order.total.toString()),
      customerEmail: params.customerEmail,
      returnUrl: params.returnUrl,
      customerName: params.customerName,
      customerIp: params.customerIp,
      orderDescription: `Order ${order.orderNumber}`,
    });

    // Log audit
    await auditService.log({
      actorId: params.customerId,
      actorRole: ActorRole.CUSTOMER,
      action: 'payment.initiated',
      entityType: 'payment',
      entityId: payment.id,
      metadata: {
        orderId: params.orderId,
        orderNumber: order.orderNumber,
        amount: order.total.toString(),
        transactionId,
      },
    });

    return {
      success: true,
      message: 'Payment initiated',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount.toString(),
        currency: payment.currency,
        status: payment.status,
      },
      checkoutUrl: apsService.getCheckoutUrl(),
      formData,
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, customerId?: string) {
    const payment = await paymentsRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    // If customerId provided, verify ownership
    if (customerId) {
      // Get the payable to check ownership
      if (payment.payableType === 'ORDER') {
        const order = await prisma.order.findUnique({
          where: { id: payment.payableId },
          select: { customerId: true },
        });
        if (order && order.customerId !== customerId) {
          throw new UnauthorizedPaymentAccessError();
        }
      }
    }

    return {
      success: true,
      payment,
    };
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string) {
    const payment = await paymentsRepository.findPaymentByTransactionId(transactionId);

    if (!payment) {
      throw new PaymentNotFoundError(transactionId);
    }

    return {
      success: true,
      payment,
    };
  }

  /**
   * Get payments with filters
   */
  async getPayments(query: PaymentQueryInput) {
    const result = await paymentsRepository.findPayments(query);

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get customer's payments
   */
  async getCustomerPayments(customerId: string, query: PaymentQueryInput) {
    // Get all orders for this customer
    const orders = await prisma.order.findMany({
      where: { customerId },
      select: { id: true },
    });

    const orderIds = orders.map((o) => o.id);

    // Get payments for these orders
    const result = await paymentsRepository.findPayments({
      ...query,
      payableType: PayableType.ORDER,
    });

    // Filter to only customer's payments
    const filteredData = result.data.filter(
      (p) => p.payableType === 'ORDER' && orderIds.includes(p.payableId)
    );

    return {
      success: true,
      data: filteredData,
      pagination: {
        ...result.pagination,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / query.limit),
      },
    };
  }

  /**
   * Update payment status (internal use, called by webhook handler)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayResponse?: Record<string, unknown>
  ) {
    const payment = await paymentsRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    const updatedPayment = await paymentsRepository.updatePaymentStatus(
      paymentId,
      status,
      gatewayResponse
    );

    return {
      success: true,
      payment: updatedPayment,
    };
  }
}

// Export singleton instance
export const paymentsService = new PaymentsService();
