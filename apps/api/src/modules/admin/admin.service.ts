/**
 * Admin Service - Nasneh API
 * Platform statistics and admin operations
 */

import { prisma } from '../../lib/db.js';
import { UserRole, OrderStatus } from '@prisma/client';

// ===========================================
// Types
// ===========================================

export interface PlatformStats {
  users: {
    total: number;
    roles: {
      customers: number;
      vendors: number;
      providers: number;
      drivers: number;
      admins: number;
    };
  };
  vendors: {
    total: number;
    active: number;
    pending: number;
  };
  providers: {
    total: number;
    active: number;
    pending: number;
  };
  orders: {
    total: number;
    status: {
      pending: number;
      confirmed: number;
      ready: number;
      delivered: number;
      cancelled: number;
    };
  };
  revenue: {
    total: string; // Decimal as string
    last30days: string; // Decimal as string
  };
}

// ===========================================
// Admin Service
// ===========================================

export class AdminService {
  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    // Get user counts by role
    const [
      totalUsers,
      customers,
      vendors,
      providers,
      drivers,
      admins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.user.count({ where: { role: UserRole.VENDOR } }),
      prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      prisma.user.count({ where: { role: UserRole.DRIVER } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
    ]);

    // Get vendor counts
    const [totalVendors, activeVendors, pendingVendorApps] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.vendorApplication.count({ where: { status: 'PENDING' } }),
    ]);

    // Get provider counts
    const [totalProviders, activeProviders, pendingProviderApps] = await Promise.all([
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { status: 'APPROVED' } }),
      prisma.providerApplication.count({ where: { status: 'PENDING' } }),
    ]);

    // Get order counts by status
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { status: OrderStatus.READY } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    // Calculate revenue
    const [totalRevenue, last30DaysRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.DELIVERED,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        roles: {
          customers,
          vendors,
          providers,
          drivers,
          admins,
        },
      },
      vendors: {
        total: totalVendors,
        active: activeVendors,
        pending: pendingVendorApps,
      },
      providers: {
        total: totalProviders,
        active: activeProviders,
        pending: pendingProviderApps,
      },
      orders: {
        total: totalOrders,
        status: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          ready: readyOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
      },
      revenue: {
        total: totalRevenue._sum.total?.toString() || '0',
        last30days: last30DaysRevenue._sum.total?.toString() || '0',
      },
    };
  }
}

// Export singleton instance
export const adminService = new AdminService();
