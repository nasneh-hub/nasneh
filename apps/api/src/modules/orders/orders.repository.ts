/**
 * Orders Repository - Nasneh API
 * Database operations for orders
 */

import { prisma } from '../../lib/db';
import {
  OrderQueryInput,
  OrderStatus,
  FulfillmentType,
} from '../../types/order.types';
import { Decimal } from '@prisma/client/runtime/library';

// ===========================================
// Types for internal use
// ===========================================

interface CreateOrderData {
  orderNumber: string;
  customerId: string;
  vendorId: string;
  fulfillmentType: FulfillmentType;
  subtotal: Decimal;
  deliveryFee: Decimal | null;
  commission: Decimal;
  total: Decimal;
  deliveryAddress: any | null;
  pickupAddress: any | null;
  notes: string | null;
}

interface CreateOrderItemData {
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: Decimal;
  quantity: number;
  subtotal: Decimal;
}

export class OrdersRepository {
  /**
   * Create a new order with items
   */
  async create(orderData: CreateOrderData, items: Omit<CreateOrderItemData, 'orderId'>[]) {
    return prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          customerId: orderData.customerId,
          vendorId: orderData.vendorId,
          fulfillmentType: orderData.fulfillmentType,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          commission: orderData.commission,
          total: orderData.total,
          deliveryAddress: orderData.deliveryAddress,
          pickupAddress: orderData.pickupAddress,
          notes: orderData.notes,
          status: OrderStatus.PENDING,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      });

      // Return order with items
      return this.findById(order.id);
    });
  }

  /**
   * Find order by ID
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find orders with filters and pagination
   */
  async findMany(query: OrderQueryInput) {
    const {
      customerId,
      vendorId,
      driverId,
      status,
      fulfillmentType,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (vendorId) where.vendorId = vendorId;
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;
    if (fulfillmentType) where.fulfillmentType = fulfillmentType;

    // Count total
    const total = await prisma.order.count({ where });

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
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
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        items: true,
      },
    });
  }

  /**
   * Assign driver to order
   */
  async assignDriver(orderId: string, driverId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { driverId },
    });
  }

  /**
   * Check if order belongs to customer
   */
  async belongsToCustomer(orderId: string, customerId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      select: { id: true },
    });
    return !!order;
  }

  /**
   * Check if order belongs to vendor
   */
  async belongsToVendor(orderId: string, vendorId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
      select: { id: true },
    });
    return !!order;
  }

  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXX (e.g., ORD-20260101-0001)
   */
  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${dateStr}-`;

    // Find the last order number for today
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
      select: {
        orderNumber: true,
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Get order statistics for vendor
   */
  async getVendorStats(vendorId: string) {
    const [total, pending, completed, cancelled] = await Promise.all([
      prisma.order.count({ where: { vendorId } }),
      prisma.order.count({
        where: {
          vendorId,
          status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY] },
        },
      }),
      prisma.order.count({
        where: {
          vendorId,
          status: OrderStatus.DELIVERED,
        },
      }),
      prisma.order.count({
        where: {
          vendorId,
          status: OrderStatus.CANCELLED,
        },
      }),
    ]);

    return { total, pending, completed, cancelled };
  }
}

// Export singleton instance
export const ordersRepository = new OrdersRepository();
