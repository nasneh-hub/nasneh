/**
 * Drivers Controller - Nasneh API
 * Handles HTTP requests for driver and delivery endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
  driversService,
  deliveryAssignmentsService,
  DriverAlreadyExistsError,
  DriverNotFoundError,
  DeliveryNotFoundError,
  OrderAlreadyAssignedError,
} from './drivers.service.js';
import { z } from 'zod';
import { DriverStatus, DeliveryStatus } from '@prisma/client';

// ===========================================
// Validation Schemas
// ===========================================

const createDriverSchema = z.object({
  userId: z.string().uuid(),
  vehicleType: z.string().min(2, 'Vehicle type must be at least 2 characters'),
  vehiclePlate: z.string().optional(),
  licenseNumber: z.string().min(3, 'License number is required'),
});

const createDeliveryAssignmentSchema = z.object({
  orderId: z.string().uuid(),
  driverId: z.string().uuid(),
  notes: z.string().optional(),
});

const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
});

// ===========================================
// Admin Driver Controllers
// ===========================================

/**
 * Create Driver (Admin)
 * POST /api/v1/admin/drivers
 */
export async function createDriver(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = createDriverSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await driversService.createDriver(validation.data);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof DriverAlreadyExistsError) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * List All Drivers (Admin)
 * GET /api/v1/admin/drivers
 */
export async function listDrivers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;

    const validStatus = status ? (status as DriverStatus) : undefined;

    const result = await driversService.getAllDrivers(validStatus);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ===========================================
// Driver Delivery Controllers
// ===========================================

/**
 * Get My Deliveries (Driver)
 * GET /api/v1/driver/deliveries
 */
export async function getMyDeliveries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;

    const validStatus = status ? (status as DeliveryStatus) : undefined;

    const result = await deliveryAssignmentsService.getMyDeliveries(
      req.user!.userId,
      validStatus
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof DriverNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update Delivery Status (Driver)
 * PATCH /api/v1/driver/deliveries/:id
 */
export async function updateDeliveryStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const validation = updateDeliveryStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await deliveryAssignmentsService.updateDeliveryStatus(
      id,
      req.user!.userId,
      validation.data.status
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof DeliveryNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

// ===========================================
// Admin Delivery Assignment Controllers
// ===========================================

/**
 * Create Delivery Assignment (Admin)
 * POST /api/v1/admin/deliveries
 */
export async function createDeliveryAssignment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = createDeliveryAssignmentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await deliveryAssignmentsService.createAssignment(
      validation.data
    );

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof OrderAlreadyAssignedError) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof DriverNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}
