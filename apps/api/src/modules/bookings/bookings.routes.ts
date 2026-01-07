/**
 * Bookings Routes
 * 
 * Customer and provider booking endpoints including status transitions and listing.
 * All routes require authentication.
 */

import { Router, type Router as RouterType } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import {
  createBooking,
  getBooking,
  listBookings,
  listCustomerBookings,
  listProviderBookings,
  confirmBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  markNoShow,
} from './bookings.controller.js';

const router: RouterType = Router();

// ===========================================
// Booking Listing
// ===========================================

// GET /bookings - List bookings with role-based visibility
// - CUSTOMER: only own bookings
// - PROVIDER: only bookings for their provider account
// - ADMIN: all bookings
router.get('/', authMiddleware, listBookings);

// ===========================================
// Booking CRUD
// ===========================================

// POST /bookings - Create a new booking
router.post('/', authMiddleware, createBooking);

// GET /bookings/:id - Get booking details
router.get('/:id', authMiddleware, getBooking);

// ===========================================
// Status Transition Endpoints
// ===========================================

// POST /bookings/:id/confirm - Confirm a pending booking
// Allowed: Provider, Admin
router.post('/:id/confirm', authMiddleware, confirmBooking);

// POST /bookings/:id/start - Start a confirmed booking
// Allowed: Provider, Admin
router.post('/:id/start', authMiddleware, startBooking);

// POST /bookings/:id/complete - Complete an in-progress booking
// Allowed: Provider, Admin
router.post('/:id/complete', authMiddleware, completeBooking);

// POST /bookings/:id/cancel - Cancel a booking
// Allowed: Customer (PENDING/CONFIRMED), Provider, Admin
router.post('/:id/cancel', authMiddleware, cancelBooking);

// POST /bookings/:id/no-show - Mark booking as no-show
// Allowed: Provider, Admin
router.post('/:id/no-show', authMiddleware, markNoShow);

export default router;

// ===========================================
// Customer-specific routes (for /customer prefix)
// ===========================================

export const customerBookingRoutes: RouterType = Router();

// GET /customer/bookings - List customer's own bookings
customerBookingRoutes.get('/bookings', authMiddleware, listCustomerBookings);

// ===========================================
// Provider-specific routes (for /provider prefix)
// ===========================================

export const providerBookingRoutes: RouterType = Router();

// GET /provider/bookings - List provider's bookings
providerBookingRoutes.get('/bookings', authMiddleware, requireRoles(UserRole.PROVIDER, UserRole.ADMIN), listProviderBookings);
