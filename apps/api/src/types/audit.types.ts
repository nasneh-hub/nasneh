/**
 * Audit Log Types - Nasneh API
 * Following TECHNICAL_SPEC.md data models
 */

import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const ActorRole = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  PROVIDER: 'PROVIDER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
} as const;

export type ActorRole = (typeof ActorRole)[keyof typeof ActorRole];

// ===========================================
// Action Constants
// ===========================================

export const AuditAction = {
  // Order actions
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_DRIVER_ASSIGNED: 'order.driver_assigned',
  
  // Payment actions
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // User actions
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_SUSPENDED: 'user.suspended',
  
  // Vendor actions
  VENDOR_CREATED: 'vendor.created',
  VENDOR_APPROVED: 'vendor.approved',
  VENDOR_SUSPENDED: 'vendor.suspended',
  
  // Product actions
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ===========================================
// Entity Types
// ===========================================

export const EntityType = {
  ORDER: 'order',
  PAYMENT: 'payment',
  USER: 'user',
  VENDOR: 'vendor',
  PRODUCT: 'product',
  BOOKING: 'booking',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

// ===========================================
// Validation Schemas
// ===========================================

export const createAuditLogSchema = z.object({
  actorId: z.string().uuid().nullable(),
  actorRole: z.nativeEnum(ActorRole as any),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  diff: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export const auditLogQuerySchema = z.object({
  actorId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ===========================================
// Types
// ===========================================

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;

// Audit log response type
export interface AuditLogResponse {
  id: string;
  actorId: string | null;
  actorRole: ActorRole;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  actor?: {
    id: string;
    name: string | null;
    phone: string;
  } | null;
}
