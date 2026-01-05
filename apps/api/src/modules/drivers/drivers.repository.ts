/**
 * Drivers Repository - Nasneh API
 * Database operations for drivers and delivery assignments
 */

import { prisma } from '../../lib/db.js';
import { DriverStatus, DeliveryStatus } from '@prisma/client';

// ===========================================
// Driver Repository
// ===========================================

export interface CreateDriverInput {
  userId: string;
  vehicleType: string;
  vehiclePlate?: string;
  licenseNumber: string;
}

export interface UpdateDriverInput {
  vehicleType?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  status?: DriverStatus;
}

export class DriversRepository {
  /**
   * Create a new driver
   */
  async create(data: CreateDriverInput) {
    return prisma.driver.create({
      data: {
        userId: data.userId,
        vehicleType: data.vehicleType,
        vehiclePlate: data.vehiclePlate,
        licenseNumber: data.licenseNumber,
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
   * Find driver by ID
   */
  async findById(id: string) {
    return prisma.driver.findUnique({
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
   * Find driver by user ID
   */
  async findByUserId(userId: string) {
    return prisma.driver.findUnique({
      where: { userId },
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
   * Get all drivers
   */
  async findAll(status?: DriverStatus) {
    const where = status ? { status } : {};

    return prisma.driver.findMany({
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
   * Update driver
   */
  async update(id: string, data: UpdateDriverInput) {
    return prisma.driver.update({
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
   * Check if user already has a driver profile
   */
  async hasDriverProfile(userId: string): Promise<boolean> {
    const existing = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true },
    });
    return !!existing;
  }
}

// ===========================================
// Delivery Assignment Repository
// ===========================================

export interface CreateDeliveryAssignmentInput {
  orderId: string;
  driverId: string;
  notes?: string;
}

export interface UpdateDeliveryAssignmentInput {
  status?: DeliveryStatus;
  pickupTime?: Date;
  deliveryTime?: Date;
  notes?: string;
}

export class DeliveryAssignmentsRepository {
  /**
   * Create a new delivery assignment
   */
  async create(data: CreateDeliveryAssignmentInput) {
    return prisma.deliveryAssignment.create({
      data: {
        orderId: data.orderId,
        driverId: data.driverId,
        notes: data.notes,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryAddress: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find delivery assignment by ID
   */
  async findById(id: string) {
    return prisma.deliveryAssignment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryAddress: true,
            customer: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find delivery assignment by order ID
   */
  async findByOrderId(orderId: string) {
    return prisma.deliveryAssignment.findUnique({
      where: { orderId },
      include: {
        order: true,
        driver: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get deliveries for a driver
   */
  async findByDriverId(driverId: string, status?: DeliveryStatus) {
    const where: any = { driverId };
    if (status) {
      where.status = status;
    }

    return prisma.deliveryAssignment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryAddress: true,
            customer: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update delivery assignment
   */
  async update(id: string, data: UpdateDeliveryAssignmentInput) {
    return prisma.deliveryAssignment.update({
      where: { id },
      data,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryAddress: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

// Export singleton instances
export const driversRepository = new DriversRepository();
export const deliveryAssignmentsRepository = new DeliveryAssignmentsRepository();
