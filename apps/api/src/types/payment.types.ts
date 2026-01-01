/**
 * Payment Types - Nasneh API
 * Following TECHNICAL_SPEC.md v2.1 data models
 */

import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const PayableType = {
  ORDER: 'ORDER',
  BOOKING: 'BOOKING',
} as const;

export type PayableType = (typeof PayableType)[keyof typeof PayableType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CARD: 'CARD',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const RefundReason = {
  CUSTOMER_REQUEST: 'CUSTOMER_REQUEST',
  VENDOR_CANCEL: 'VENDOR_CANCEL',
  QUALITY_ISSUE: 'QUALITY_ISSUE',
  DUPLICATE: 'DUPLICATE',
  OTHER: 'OTHER',
} as const;

export type RefundReason = (typeof RefundReason)[keyof typeof RefundReason];

export const RefundStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

// ===========================================
// Validation Schemas
// ===========================================

// Amount validation: BHD uses 3 decimal places
export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.001, 'Amount must have at most 3 decimal places');

// Initiate payment schema
export const initiatePaymentSchema = z.object({
  payableType: z.nativeEnum(PayableType as any),
  payableId: z.string().uuid(),
  amount: amountSchema,
  currency: z.string().default('BHD'),
  returnUrl: z.string().url('Invalid return URL'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

// APS webhook payload schema (simplified)
export const apsWebhookSchema = z.object({
  merchant_reference: z.string(),
  fort_id: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  response_code: z.string(),
  response_message: z.string(),
  signature: z.string(),
});

// Create refund schema
export const createRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: amountSchema,
  reason: z.nativeEnum(RefundReason as any),
  reasonDetails: z.string().max(1000).optional(),
});

// Payment query schema
export const paymentQuerySchema = z.object({
  payableType: z.nativeEnum(PayableType as any).optional(),
  payableId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus as any).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Refund query schema
export const refundQuerySchema = z.object({
  paymentId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  status: z.nativeEnum(RefundStatus as any).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// Types
// ===========================================

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ApsWebhookPayload = z.infer<typeof apsWebhookSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
export type RefundQueryInput = z.infer<typeof refundQuerySchema>;

// Payment response type
export interface PaymentResponse {
  id: string;
  transactionId: string;
  idempotencyKey: string;
  payableType: PayableType;
  payableId: string;
  amount: string; // Decimal as string for precision
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Refund response type
export interface RefundResponse {
  id: string;
  paymentId: string;
  orderId: string | null;
  bookingId: string | null;
  amount: string; // Decimal as string for precision
  currency: string;
  reason: RefundReason;
  reasonDetails: string | null;
  status: RefundStatus;
  gatewayRef: string | null;
  createdById: string;
  createdAt: Date;
  payment?: PaymentResponse;
  createdBy?: {
    id: string;
    name: string | null;
    phone: string;
  };
}

// Paginated responses
export interface PaginatedPaymentResponse {
  data: PaymentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedRefundResponse {
  data: RefundResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// APS payment initiation response
export interface ApsInitiateResponse {
  paymentUrl: string;
  transactionId: string;
  paymentId: string;
}

// Payment status transition map (valid transitions)
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.AUTHORIZED, PaymentStatus.FAILED],
  [PaymentStatus.AUTHORIZED]: [PaymentStatus.CAPTURED, PaymentStatus.FAILED],
  [PaymentStatus.CAPTURED]: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
  [PaymentStatus.FAILED]: [], // Terminal state
  [PaymentStatus.REFUNDED]: [], // Terminal state
  [PaymentStatus.PARTIALLY_REFUNDED]: [PaymentStatus.REFUNDED],
};
