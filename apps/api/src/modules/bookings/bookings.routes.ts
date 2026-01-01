/**
 * Bookings Routes
 * 
 * Customer booking endpoints.
 */

import { Router, type Router as RouterType } from 'express';
import { createBooking } from './bookings.controller';

const router: RouterType = Router();

// POST /bookings - Create a new booking
router.post('/', createBooking);

export default router;
