/**
 * Drivers Service - Nasneh API
 * Business logic for driver management and delivery assignments
 */

import {
  driversRepository,
  deliveryAssignmentsRepository,
  CreateDriverInput,
  UpdateDriverInput,
  CreateDeliveryAssignmentInput,
  UpdateDeliveryAssignmentInput,
} from './drivers.repository.js';
import { DriverStatus, DeliveryStatus, UserRole } from '@prisma/client';
import { prisma } from '../../lib/db.js';

// ===========================================
// Custom Errors
// ===========================================

export class DriverAlreadyExistsError extends Error {
  constructor() {
    super('User already has a driver profile');
    this.name = 'DriverAlreadyExistsError';
  }
}

export class DriverNotFoundError extends Error {
  constructor() {
    super('Driver not found');
    this.name = 'DriverNotFoundError';
  }
}

export class DeliveryNotFoundError extends Error {
  constructor() {
    super('Delivery assignment not found');
    this.name = 'DeliveryNotFoundError';
  }
}

export class OrderAlreadyAssignedError extends Error {
  constructor() {
    super('Order already has a delivery assignment');
    this.name = 'OrderAlreadyAssignedError';
  }
}

// ===========================================
// Drivers Service
// ===========================================

export class DriversService {
  /**
   * Create a new driver (Admin only)
   */
  async createDriver(data: CreateDriverInput) {
    // Check if user already has a driver profile
    const hasProfile = await driversRepository.hasDriverProfile(data.userId);
    if (hasProfile) {
      throw new DriverAlreadyExistsError();
    }

    // Create driver and update user role in transaction
    const result = await prisma.$transaction(async (tx) => {
      const driver = await tx.driver.create({
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

      // Update user role to DRIVER
      await tx.user.update({
        where: { id: data.userId },
        data: { role: UserRole.DRIVER },
      });

      return driver;
    });

    return {
      success: true,
      data: result,
      message: 'Driver created successfully',
    };
  }

  /**
   * Get all drivers (Admin only)
   */
  async getAllDrivers(status?: DriverStatus) {
    const drivers = await driversRepository.findAll(status);

    return {
      success: true,
      data: drivers,
      count: drivers.length,
    };
  }

  /**
   * Get driver by ID
   */
  async getDriverById(id: string) {
    const driver = await driversRepository.findById(id);

    if (!driver) {
      throw new DriverNotFoundError();
    }

    return {
      success: true,
      data: driver,
    };
  }

  /**
   * Update driver status (Admin only)
   */
  async updateDriver(id: string, data: UpdateDriverInput) {
    const driver = await driversRepository.findById(id);

    if (!driver) {
      throw new DriverNotFoundError();
    }

    const updated = await driversRepository.update(id, data);

    return {
      success: true,
      data: updated,
      message: 'Driver updated successfully',
    };
  }
}

// ===========================================
// Delivery Assignments Service
// ===========================================

export class DeliveryAssignmentsService {
  /**
   * Create delivery assignment (Admin only)
   */
  async createAssignment(data: CreateDeliveryAssignmentInput) {
    // Check if order already has an assignment
    const existing = await deliveryAssignmentsRepository.findByOrderId(data.orderId);
    if (existing) {
      throw new OrderAlreadyAssignedError();
    }

    // Check if driver exists
    const driver = await driversRepository.findById(data.driverId);
    if (!driver) {
      throw new DriverNotFoundError();
    }

    const assignment = await deliveryAssignmentsRepository.create(data);

    return {
      success: true,
      data: assignment,
      message: 'Delivery assigned successfully',
    };
  }

  /**
   * Get deliveries for current driver
   */
  async getMyDeliveries(userId: string, status?: DeliveryStatus) {
    // Find driver by user ID
    const driver = await driversRepository.findByUserId(userId);

    if (!driver) {
      throw new DriverNotFoundError();
    }

    const deliveries = await deliveryAssignmentsRepository.findByDriverId(
      driver.id,
      status
    );

    return {
      success: true,
      data: deliveries,
      count: deliveries.length,
    };
  }

  /**
   * Update delivery status (Driver only)
   */
  async updateDeliveryStatus(
    deliveryId: string,
    userId: string,
    status: DeliveryStatus
  ) {
    const delivery = await deliveryAssignmentsRepository.findById(deliveryId);

    if (!delivery) {
      throw new DeliveryNotFoundError();
    }

    // Verify driver owns this delivery
    if (delivery.driver.userId !== userId) {
      throw new Error('Unauthorized: This delivery is not assigned to you');
    }

    // Set timestamps based on status
    const updateData: UpdateDeliveryAssignmentInput = { status };

    if (status === DeliveryStatus.PICKED_UP && !delivery.pickupTime) {
      updateData.pickupTime = new Date();
    }

    if (status === DeliveryStatus.DELIVERED && !delivery.deliveryTime) {
      updateData.deliveryTime = new Date();
    }

    const updated = await deliveryAssignmentsRepository.update(
      deliveryId,
      updateData
    );

    return {
      success: true,
      data: updated,
      message: `Delivery status updated to ${status}`,
    };
  }
}

// Export singleton instances
export const driversService = new DriversService();
export const deliveryAssignmentsService = new DeliveryAssignmentsService();
