/**
 * Payments Repository - Nasneh API
 * Database operations for payments and refunds
 */

import { prisma } from '../../lib/db';
import {
  PaymentQueryInput,
  RefundQueryInput,
  PaymentStatus,
  RefundStatus,
  PayableType,
  RefundReason,
  PaymentMethod,
} from '../../types/payment.types';
import { Decimal } from '@prisma/client/runtime/library';

// ===========================================
// Types for internal use
// ===========================================

interface CreatePaymentData {
  transactionId: string;
  idempotencyKey: string;
  payableType: PayableType;
  payableId: string;
  amount: Decimal;
  currency: string;
}

interface CreateRefundData {
  paymentId: string;
  orderId?: string | null;
  bookingId?: string | null;
  amount: Decimal;
  currency: string;
  reason: RefundReason;
  reasonDetails?: string | null;
  createdById: string;
}

export class PaymentsRepository {
  // ===========================================
  // Payment Operations
  // ===========================================

  /**
   * Create a new payment record
   */
  async createPayment(data: CreatePaymentData) {
    return prisma.payment.create({
      data: {
        transactionId: data.transactionId,
        idempotencyKey: data.idempotencyKey,
        payableType: data.payableType,
        payableId: data.payableId,
        amount: data.amount,
        currency: data.currency,
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CARD,
      },
    });
  }

  /**
   * Find payment by ID
   */
  async findPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        refunds: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find payment by transaction ID
   */
  async findPaymentByTransactionId(transactionId: string) {
    return prisma.payment.findUnique({
      where: { transactionId },
    });
  }

  /**
   * Find payment by idempotency key
   */
  async findPaymentByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findUnique({
      where: { idempotencyKey },
    });
  }

  /**
   * Find payments with filters and pagination
   */
  async findPayments(query: PaymentQueryInput) {
    const {
      payableType,
      payableId,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: any = {};

    if (payableType) where.payableType = payableType;
    if (payableId) where.payableId = payableId;
    if (status) where.status = status;

    // Count total
    const total = await prisma.payment.count({ where });

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: PaymentStatus, gatewayResponse?: Record<string, unknown>) {
    return prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(gatewayResponse ? { gatewayResponse: gatewayResponse as any } : {}),
      },
    });
  }

  /**
   * Find payment for payable (order or booking)
   */
  async findPaymentForPayable(payableType: PayableType, payableId: string) {
    return prisma.payment.findFirst({
      where: {
        payableType,
        payableId,
        status: {
          in: [PaymentStatus.CAPTURED, PaymentStatus.PARTIALLY_REFUNDED],
        },
      },
    });
  }

  // ===========================================
  // Refund Operations
  // ===========================================

  /**
   * Create a new refund record
   */
  async createRefund(data: CreateRefundData) {
    return prisma.refund.create({
      data: {
        paymentId: data.paymentId,
        orderId: data.orderId,
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        reasonDetails: data.reasonDetails,
        createdById: data.createdById,
        status: RefundStatus.PENDING,
      },
      include: {
        payment: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find refund by ID
   */
  async findRefundById(id: string) {
    return prisma.refund.findUnique({
      where: { id },
      include: {
        payment: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find refunds with filters and pagination
   */
  async findRefunds(query: RefundQueryInput) {
    const {
      paymentId,
      orderId,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: any = {};

    if (paymentId) where.paymentId = paymentId;
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    // Count total
    const total = await prisma.refund.count({ where });

    // Fetch refunds
    const refunds = await prisma.refund.findMany({
      where,
      include: {
        payment: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update refund status
   */
  async updateRefundStatus(id: string, status: RefundStatus, gatewayRef?: string) {
    return prisma.refund.update({
      where: { id },
      data: {
        status,
        gatewayRef: gatewayRef || undefined,
      },
    });
  }

  /**
   * Get total refunded amount for a payment
   */
  async getTotalRefundedAmount(paymentId: string): Promise<Decimal> {
    const result = await prisma.refund.aggregate({
      where: {
        paymentId,
        status: RefundStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || new Decimal(0);
  }

  /**
   * Generate unique transaction ID
   * Format: TXN-YYYYMMDD-XXXXXX (e.g., TXN-20260101-A1B2C3)
   */
  generateTransactionId(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${dateStr}-${randomPart}`;
  }
}

// Export singleton instance
export const paymentsRepository = new PaymentsRepository();
