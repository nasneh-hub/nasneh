/**
 * Orders Service - Nasneh API
 * Business logic for order operations including status flow
 */

import { ordersRepository } from './orders.repository';
import {
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
  OrderQueryInput,
} from '../../types/order.types';
import { auditService, ActorRole } from '../../lib/audit';
import { notificationService } from '../../lib/notifications';

// ===========================================
// Custom Errors
// ===========================================

export class OrderNotFoundError extends Error {
  public statusCode = 404;

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidStatusTransitionError extends Error {
  public statusCode = 400;

  constructor(currentStatus: OrderStatus, newStatus: OrderStatus) {
    super(`Invalid status transition: ${currentStatus} → ${newStatus}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class UnauthorizedOrderAccessError extends Error {
  public statusCode = 403;

  constructor() {
    super('You do not have permission to access this order');
    this.name = 'UnauthorizedOrderAccessError';
  }
}

// ===========================================
// Service
// ===========================================

export class OrdersService {
  /**
   * Get order by ID
   */
  async getOrderById(orderId: string) {
    const order = await ordersRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return {
      success: true,
      order,
    };
  }

  /**
   * Get orders with filters
   */
  async getOrders(query: OrderQueryInput) {
    const result = await ordersRepository.findMany(query);

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get vendor's orders
   */
  async getVendorOrders(vendorId: string, query: OrderQueryInput) {
    const result = await ordersRepository.findMany({
      ...query,
      vendorId,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders(customerId: string, query: OrderQueryInput) {
    const result = await ordersRepository.findMany({
      ...query,
      customerId,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Update order status
   * Validates transition, logs audit, sends notification
   */
  async updateOrderStatus(params: {
    orderId: string;
    vendorId: string;
    newStatus: OrderStatus;
    actorId: string;
    actorRole: ActorRole;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Get current order
    const order = await ordersRepository.findById(params.orderId);

    if (!order) {
      throw new OrderNotFoundError(params.orderId);
    }

    // Verify vendor ownership
    if (order.vendorId !== params.vendorId) {
      throw new UnauthorizedOrderAccessError();
    }

    const currentStatus = order.status as OrderStatus;
    const newStatus = params.newStatus;

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStatusTransitionError(currentStatus, newStatus);
    }

    // Update status
    const updatedOrder = await ordersRepository.updateStatus(params.orderId, newStatus);

    // Log audit
    await auditService.logOrderStatusChange({
      orderId: params.orderId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      previousStatus: currentStatus,
      newStatus: newStatus,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Send notification to customer
    await notificationService.notifyOrderStatusChange({
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      previousStatus: currentStatus,
      newStatus: newStatus,
    });

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder,
    };
  }

  /**
   * Cancel order (customer or vendor)
   */
  async cancelOrder(params: {
    orderId: string;
    actorId: string;
    actorRole: ActorRole;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Get current order
    const order = await ordersRepository.findById(params.orderId);

    if (!order) {
      throw new OrderNotFoundError(params.orderId);
    }

    const currentStatus = order.status as OrderStatus;

    // Validate cancellation is allowed
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(OrderStatus.CANCELLED)) {
      throw new InvalidStatusTransitionError(currentStatus, OrderStatus.CANCELLED);
    }

    // Verify access (customer can cancel their own, vendor can cancel their orders)
    if (params.actorRole === ActorRole.CUSTOMER && order.customerId !== params.actorId) {
      throw new UnauthorizedOrderAccessError();
    }
    if (params.actorRole === ActorRole.VENDOR) {
      // Need to verify vendor ownership through vendor table
      const belongsToVendor = await ordersRepository.belongsToVendor(params.orderId, params.actorId);
      if (!belongsToVendor) {
        throw new UnauthorizedOrderAccessError();
      }
    }

    // Update status to cancelled
    const updatedOrder = await ordersRepository.updateStatus(params.orderId, OrderStatus.CANCELLED);

    // Log audit
    await auditService.logOrderCancelled({
      orderId: params.orderId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      reason: params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Send notification
    await notificationService.notifyOrderStatusChange({
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      previousStatus: currentStatus,
      newStatus: OrderStatus.CANCELLED,
    });

    return {
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    };
  }

  /**
   * Get order history (audit logs)
   */
  async getOrderHistory(orderId: string) {
    const order = await ordersRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const logs = await auditService.getLogsForEntity('order', orderId);

    return {
      success: true,
      history: logs,
    };
  }
}

// Export singleton instance
export const ordersService = new OrdersService();
