/**
 * Drivers Routes - Nasneh API
 *
 * Admin Endpoints:
 * - POST   /api/v1/admin/drivers      - Create driver
 * - GET    /api/v1/admin/drivers      - List all drivers
 * - POST   /api/v1/admin/deliveries   - Create delivery assignment
 *
 * Driver Endpoints:
 * - GET    /api/v1/driver/deliveries     - Get my deliveries
 * - PATCH  /api/v1/driver/deliveries/:id - Update delivery status
 */

import { Router } from 'express';
import {
  createDriver,
  listDrivers,
  getMyDeliveries,
  updateDeliveryStatus,
  createDeliveryAssignment,
} from './drivers.controller.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';

// ===========================================
// Admin Driver Routes
// ===========================================

const adminDriversRouter: Router = Router();

/**
 * @route   POST /api/v1/admin/drivers
 * @desc    Create a new driver
 * @access  Protected (admin only)
 * @body    { userId, vehicleType, vehiclePlate?, licenseNumber }
 */
adminDriversRouter.post(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  createDriver
);

/**
 * @route   GET /api/v1/admin/drivers
 * @desc    List all drivers
 * @access  Protected (admin only)
 * @query   status? (AVAILABLE | BUSY | OFFLINE | SUSPENDED)
 */
adminDriversRouter.get(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  listDrivers
);

// ===========================================
// Admin Delivery Assignment Routes
// ===========================================

const adminDeliveriesRouter: Router = Router();

/**
 * @route   POST /api/v1/admin/deliveries
 * @desc    Create a delivery assignment
 * @access  Protected (admin only)
 * @body    { orderId, driverId, notes? }
 */
adminDeliveriesRouter.post(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  createDeliveryAssignment
);

// ===========================================
// Driver Routes
// ===========================================

const driverRouter: Router = Router();

/**
 * @route   GET /api/v1/driver/deliveries
 * @desc    Get my assigned deliveries
 * @access  Protected (driver only)
 * @query   status? (ASSIGNED | PICKED_UP | DELIVERED | CANCELLED)
 */
driverRouter.get(
  '/deliveries',
  authMiddleware,
  requireRoles(UserRole.DRIVER),
  getMyDeliveries
);

/**
 * @route   PATCH /api/v1/driver/deliveries/:id
 * @desc    Update delivery status
 * @access  Protected (driver only)
 * @body    { status: 'PICKED_UP' | 'DELIVERED' }
 */
driverRouter.patch(
  '/deliveries/:id',
  authMiddleware,
  requireRoles(UserRole.DRIVER),
  updateDeliveryStatus
);

export { adminDriversRouter, adminDeliveriesRouter, driverRouter };
