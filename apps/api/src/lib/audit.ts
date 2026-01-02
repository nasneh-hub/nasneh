/**
 * Audit Log Service - Nasneh API
 * Centralized audit logging for all actions
 */

import { prisma } from './db.js';
import {
  ActorRole,
  AuditAction,
  EntityType,
  CreateAuditLogInput,
} from '../types/audit.types.js';

export class AuditService {
  /**
   * Create an audit log entry
   */
  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          actorRole: input.actorRole,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
        diff: input.diff ?? undefined,
        metadata: input.metadata ?? undefined,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break main flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log order status change
   */
  async logOrderStatusChange(params: {
    orderId: string;
    actorId: string | null;
    actorRole: ActorRole;
    previousStatus: string;
    newStatus: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: AuditAction.ORDER_STATUS_CHANGED,
      entityType: EntityType.ORDER,
      entityId: params.orderId,
      diff: {
        status: {
          before: params.previousStatus,
          after: params.newStatus,
        },
      },
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  }

  /**
   * Log order creation
   */
  async logOrderCreated(params: {
    orderId: string;
    customerId: string;
    orderNumber: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      actorId: params.customerId,
      actorRole: ActorRole.CUSTOMER,
      action: AuditAction.ORDER_CREATED,
      entityType: EntityType.ORDER,
      entityId: params.orderId,
      metadata: {
        orderNumber: params.orderNumber,
      },
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  }

  /**
   * Log order cancellation
   */
  async logOrderCancelled(params: {
    orderId: string;
    actorId: string | null;
    actorRole: ActorRole;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: AuditAction.ORDER_CANCELLED,
      entityType: EntityType.ORDER,
      entityId: params.orderId,
      metadata: params.reason ? { reason: params.reason } : null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  }

  /**
   * Get audit logs for an entity
   */
  async getLogsForEntity(entityType: string, entityId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Re-export types for convenience
export { ActorRole, AuditAction, EntityType };
