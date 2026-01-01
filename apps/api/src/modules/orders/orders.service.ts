/**
 * Orders Service - Nasneh API
 * Business logic for order operations including status flow
 */

import { ordersRepository } from './orders.repository';
import {
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
  OrderQueryInput,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  CreateOrderInput,
  FulfillmentType,
} from '../../types/order.types';
import { prisma } from '../../lib/db';
import { Decimal } from '@prisma/client/runtime/library';
=======
} from '../../types/order.types';
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
} from '../../types/order.types';
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
} from '../../types/order.types';
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
import { auditService, ActorRole } from '../../lib/audit';
import { notificationService } from '../../lib/notifications';

// ===========================================
// Custom Errors
// ===========================================

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export class VendorNotFoundError extends Error {
  public statusCode = 404;

  constructor(vendorId: string) {
    super(`Vendor not found: ${vendorId}`);
    this.name = 'VendorNotFoundError';
  }
}

export class ProductNotFoundError extends Error {
  public statusCode = 404;

  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductNotAvailableError extends Error {
  public statusCode = 400;

  constructor(productName: string) {
    super(`Product not available: ${productName}`);
    this.name = 'ProductNotAvailableError';
  }
}

export class ProductVendorMismatchError extends Error {
  public statusCode = 400;

  constructor() {
    super('All products must belong to the same vendor');
    this.name = 'ProductVendorMismatchError';
  }
}

=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// ===========================================
// Constants
// ===========================================

// Default delivery fee in BHD (can be made configurable later)
const DEFAULT_DELIVERY_FEE = new Decimal('1.000');

export class OrdersService {
  /**
   * Create a new order
   * - Validates vendor and products
   * - Snapshots product prices
   * - Calculates subtotal, commission, total
   * - Creates order + order_items in transaction
   */
  async createOrder(params: {
    customerId: string;
    input: CreateOrderInput;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { customerId, input, ipAddress, userAgent } = params;

    // 1. Validate vendor exists and is active
    const vendor = await prisma.vendor.findUnique({
      where: { id: input.vendorId },
      select: {
        id: true,
        storeName: true,
        commissionRate: true,
        status: true,
        userId: true,
      },
    });

    if (!vendor) {
      throw new VendorNotFoundError(input.vendorId);
    }

    if (vendor.status !== 'ACTIVE') {
      throw new VendorNotFoundError(input.vendorId); // Treat inactive as not found
    }

    // 2. Fetch all products and validate
    const productIds = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        vendorId: true,
        name: true,
        price: true,
        isAvailable: true,
        status: true,
      },
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist, belong to vendor, and are available
    for (const item of input.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }

      if (product.vendorId !== input.vendorId) {
        throw new ProductVendorMismatchError();
      }

      if (!product.isAvailable || product.status !== 'ACTIVE') {
        throw new ProductNotAvailableError(product.name);
      }
    }

    // 3. Calculate order totals
    let subtotal = new Decimal(0);
    const orderItems: Array<{
      productId: string;
      productName: string;
      unitPrice: Decimal;
      quantity: number;
      subtotal: Decimal;
    }> = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      const itemSubtotal = new Decimal(product.price.toString()).mul(item.quantity);

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        unitPrice: new Decimal(product.price.toString()),
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      subtotal = subtotal.add(itemSubtotal);
    }

    // 4. Calculate fees and commission
    const deliveryFee =
      input.fulfillmentType === FulfillmentType.DELIVERY ? DEFAULT_DELIVERY_FEE : null;

    // Commission is percentage of subtotal
    const commissionRate = new Decimal(vendor.commissionRate.toString()).div(100);
    const commission = subtotal.mul(commissionRate).toDecimalPlaces(3);

    // Total = subtotal + delivery fee
    const total = deliveryFee ? subtotal.add(deliveryFee) : subtotal;

    // 5. Generate order number
    const orderNumber = await ordersRepository.generateOrderNumber();

    // 6. Create order with items
    const order = await ordersRepository.create(
      {
        orderNumber,
        customerId,
        vendorId: input.vendorId,
        fulfillmentType: input.fulfillmentType,
        subtotal,
        deliveryFee,
        commission,
        total,
        deliveryAddress: input.deliveryAddress || null,
        pickupAddress: input.pickupAddress || null,
        notes: input.notes || null,
      },
      orderItems
    );

    // 7. Log audit
    await auditService.logOrderCreated({
      orderId: order!.id,
      customerId,
      orderNumber,
      ipAddress,
      userAgent,
    });

    // 8. Notify vendor
    await notificationService.notifyVendorNewOrder({
      vendorUserId: vendor.userId,
      orderNumber,
      total: total.toFixed(3),
    });

    return {
      success: true,
      message: 'Order created successfully',
      order,
    };
  }

  /**
=======
export class OrdersService {
  /**
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
export class OrdersService {
  /**
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
export class OrdersService {
  /**
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
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
