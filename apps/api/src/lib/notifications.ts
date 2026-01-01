/**
 * Notification Service - Nasneh API
 * Placeholder for customer notifications
 * TODO: Implement actual notification delivery (push, SMS, WhatsApp)
 */

import { OrderStatus } from '../types/order.types';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send notification to user
   * TODO: Implement actual notification delivery
   */
  async send(payload: NotificationPayload): Promise<void> {
    // Placeholder - log notification for now
    console.log('[NOTIFICATION]', {
      to: payload.userId,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  }

  /**
   * Notify customer of order status change
   */
  async notifyOrderStatusChange(params: {
    customerId: string;
    orderNumber: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
  }): Promise<void> {
    const statusMessages: Record<OrderStatus, string> = {
      PENDING: 'Your order is pending confirmation.',
      CONFIRMED: 'Your order has been confirmed!',
      PREPARING: 'Your order is being prepared.',
      READY: 'Your order is ready for pickup/delivery!',
      PICKED_UP: 'Your order has been picked up by the driver.',
      DELIVERED: 'Your order has been delivered. Enjoy!',
      CANCELLED: 'Your order has been cancelled.',
    };

    await this.send({
      userId: params.customerId,
      title: `Order ${params.orderNumber} Update`,
      body: statusMessages[params.newStatus] || `Order status: ${params.newStatus}`,
      data: {
        orderNumber: params.orderNumber,
        previousStatus: params.previousStatus,
        newStatus: params.newStatus,
      },
    });
  }

  /**
   * Notify vendor of new order
   */
  async notifyVendorNewOrder(params: {
    vendorUserId: string;
    orderNumber: string;
    total: string;
  }): Promise<void> {
    await this.send({
      userId: params.vendorUserId,
      title: 'New Order Received!',
      body: `Order ${params.orderNumber} - Total: ${params.total} BHD`,
      data: {
        orderNumber: params.orderNumber,
        total: params.total,
      },
    });
  }

  /**
   * Notify driver of order assignment
   */
  async notifyDriverAssigned(params: {
    driverId: string;
    orderNumber: string;
    pickupAddress: string;
  }): Promise<void> {
    await this.send({
      userId: params.driverId,
      title: 'New Delivery Assignment',
      body: `Order ${params.orderNumber} - Pickup: ${params.pickupAddress}`,
      data: {
        orderNumber: params.orderNumber,
        pickupAddress: params.pickupAddress,
      },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
