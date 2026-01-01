/**
 * Bookings Controller
 * 
 * HTTP handlers for booking endpoints.
 */

import type { Request, Response } from 'express';
import { bookingService, BookingValidationError } from './bookings.service';
import { createBookingSchema, BookingErrorCode } from '../../types/booking.types';

// ===========================================
// Create Booking
// ===========================================

export async function createBooking(req: Request, res: Response) {
  try {
    // Validate input
    const parseResult = createBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    // Get customer ID from auth (assume middleware sets req.user)
    const customerId = (req as any).user?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create booking
    const booking = await bookingService.createBooking(customerId, parseResult.data);

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    if (error instanceof BookingValidationError) {
      // Map error codes to HTTP status codes
      const statusCode = getStatusCodeForError(error.code);
      return res.status(statusCode).json({
        error: error.message,
        code: error.code,
      });
    }

    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ===========================================
// Helper Functions
// ===========================================

function getStatusCodeForError(code: string): number {
  switch (code) {
    case BookingErrorCode.SERVICE_NOT_FOUND:
      return 404;
    case BookingErrorCode.SERVICE_NOT_AVAILABLE:
    case BookingErrorCode.PROVIDER_NOT_ACTIVE:
      return 422; // Unprocessable Entity
    case BookingErrorCode.OUTSIDE_BOOKING_WINDOW:
    case BookingErrorCode.TIME_NOT_AVAILABLE:
    case BookingErrorCode.MISSING_TIME_FOR_APPOINTMENT:
    case BookingErrorCode.INVALID_DATE:
      return 400; // Bad Request
    case BookingErrorCode.SLOT_ALREADY_BOOKED:
      return 409; // Conflict
    default:
      return 400;
  }
}
