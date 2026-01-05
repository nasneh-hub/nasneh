/**
 * Applications Repository - Nasneh API
 * Database operations for vendor and provider applications
 */

import { prisma } from '../../lib/db.js';
import { VendorCategory, ProviderCategory, ApplicationStatus } from '@prisma/client';

// ===========================================
// Vendor Applications
// ===========================================

export interface CreateVendorApplicationInput {
  userId: string;
  businessName: string;
  crNumber?: string;
  category: VendorCategory;
  description?: string;
}

export interface UpdateVendorApplicationInput {
  status?: ApplicationStatus;
  notes?: string;
}

export class VendorApplicationsRepository {
  /**
   * Create a new vendor application
   */
  async create(data: CreateVendorApplicationInput) {
    return prisma.vendorApplication.create({
      data: {
        userId: data.userId,
        businessName: data.businessName,
        crNumber: data.crNumber,
        category: data.category,
        description: data.description,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find application by ID
   */
  async findById(id: string) {
    return prisma.vendorApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find application by user ID
   */
  async findByUserId(userId: string) {
    return prisma.vendorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all applications (for admin)
   */
  async findAll(status?: ApplicationStatus) {
    const where = status ? { status } : {};

    return prisma.vendorApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update application status
   */
  async update(id: string, data: UpdateVendorApplicationInput) {
    return prisma.vendorApplication.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Check if user already has a pending application
   */
  async hasPendingApplication(userId: string): Promise<boolean> {
    const existing = await prisma.vendorApplication.findFirst({
      where: {
        userId,
        status: ApplicationStatus.PENDING,
      },
      select: { id: true },
    });
    return !!existing;
  }
}

// ===========================================
// Provider Applications
// ===========================================

export interface CreateProviderApplicationInput {
  userId: string;
  businessName: string;
  category: ProviderCategory;
  qualifications?: string;
  description?: string;
}

export interface UpdateProviderApplicationInput {
  status?: ApplicationStatus;
  notes?: string;
}

export class ProviderApplicationsRepository {
  /**
   * Create a new provider application
   */
  async create(data: CreateProviderApplicationInput) {
    return prisma.providerApplication.create({
      data: {
        userId: data.userId,
        businessName: data.businessName,
        category: data.category,
        qualifications: data.qualifications,
        description: data.description,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find application by ID
   */
  async findById(id: string) {
    return prisma.providerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find application by user ID
   */
  async findByUserId(userId: string) {
    return prisma.providerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all applications (for admin)
   */
  async findAll(status?: ApplicationStatus) {
    const where = status ? { status } : {};

    return prisma.providerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update application status
   */
  async update(id: string, data: UpdateProviderApplicationInput) {
    return prisma.providerApplication.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Check if user already has a pending application
   */
  async hasPendingApplication(userId: string): Promise<boolean> {
    const existing = await prisma.providerApplication.findFirst({
      where: {
        userId,
        status: ApplicationStatus.PENDING,
      },
      select: { id: true },
    });
    return !!existing;
  }
}

// Export singleton instances
export const vendorApplicationsRepository = new VendorApplicationsRepository();
export const providerApplicationsRepository = new ProviderApplicationsRepository();
