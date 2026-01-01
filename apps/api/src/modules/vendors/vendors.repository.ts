/**
 * Vendors Repository - Nasneh API
 * Database operations for vendors
 */

import { prisma } from '../../lib/db';
import { VendorCategory, VendorStatus, SubscriptionPlan } from '../../types/product.types';

export interface CreateVendorInput {
  userId: string;
  storeName: string;
  storeDescription?: string;
  logoUrl?: string;
  category: VendorCategory;
}

export interface UpdateVendorInput {
  storeName?: string;
  storeDescription?: string;
  logoUrl?: string;
  category?: VendorCategory;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  commissionRate?: number;
  status?: VendorStatus;
}

export class VendorsRepository {
  /**
   * Create a new vendor
   */
  async create(data: CreateVendorInput) {
    return prisma.vendor.create({
      data: {
        userId: data.userId,
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        logoUrl: data.logoUrl,
        category: data.category,
        status: VendorStatus.PENDING,
        subscriptionPlan: SubscriptionPlan.BASIC,
        commissionRate: 15.0, // Default 15% commission
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find vendor by ID
   */
  async findById(id: string) {
    return prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Find vendor by user ID
   */
  async findByUserId(userId: string) {
    return prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get all vendors with filters
   */
  async findMany(options: {
    category?: VendorCategory;
    status?: VendorStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, status, search, page = 1, limit = 20 } = options;

    const where: any = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { storeName: { contains: search } },
        { storeDescription: { contains: search } },
      ];
    }

    // Default: only show active vendors
    if (!status) {
      where.status = VendorStatus.ACTIVE;
    }

    const total = await prisma.vendor.count({ where });

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: vendors,
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
   * Update a vendor
   */
  async update(id: string, data: UpdateVendorInput) {
    return prisma.vendor.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update vendor status (for admin approval)
   */
  async updateStatus(id: string, status: VendorStatus) {
    return prisma.vendor.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Check if user is already a vendor
   */
  async userIsVendor(userId: string): Promise<boolean> {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });
    return !!vendor;
  }

  /**
   * Get vendor statistics
   */
  async getStats(vendorId: string) {
    const [productCount, activeProductCount] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.product.count({
        where: { vendorId, status: 'ACTIVE', isAvailable: true },
      }),
    ]);

    return {
      totalProducts: productCount,
      activeProducts: activeProductCount,
    };
  }
}

// Export singleton instance
export const vendorsRepository = new VendorsRepository();
