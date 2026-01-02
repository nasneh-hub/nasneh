/**
 * Bookings Routes
 * 
 * Customer and provider booking endpoints including status transitions.
 */

import { Router, type Router as RouterType } from 'express';
import {
  createBooking,
  getBooking,
  confirmBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  markNoShow,
} from './bookings.controller';

const router: RouterType = Router();

// ===========================================
// Booking CRUD
// ===========================================

// POST /bookings - Create a new booking
router.post('/', createBooking);

// GET /bookings/:id - Get booking details
router.get('/:id', getBooking);

// ===========================================
// Status Transition Endpoints
// ===========================================

// POST /bookings/:id/confirm - Confirm a pending booking
// Allowed: Provider, Admin
router.post('/:id/confirm', confirmBooking);

// POST /bookings/:id/start - Start a confirmed booking
// Allowed: Provider, Admin
router.post('/:id/start', startBooking);

// POST /bookings/:id/complete - Complete an in-progress booking
// Allowed: Provider, Admin
router.post('/:id/complete', completeBooking);

// POST /bookings/:id/cancel - Cancel a booking
// Allowed: Customer (PENDING/CONFIRMED), Provider, Admin
router.post('/:id/cancel', cancelBooking);

// POST /bookings/:id/no-show - Mark booking as no-show
// Allowed: Provider, Admin
router.post('/:id/no-show', markNoShow);

export default router;
