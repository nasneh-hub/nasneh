/**
 * Bookings Controller
 * 
 * HTTP handlers for booking endpoints including status transitions.
 */

import type { Request, Response } from 'express';
import { bookingService, BookingValidationError } from './bookings.service.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingQuerySchema,
  BookingErrorCode,
  StatusTransitionErrorCode,
  ListingErrorCode,
  UserRole,
} from '../../types/booking.types.js';

// ===========================================
// Type Extensions
// ===========================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    providerId?: string; // Provider's provider ID (for PROVIDER role)
  };
}

// ===========================================
// Create Booking
// ===========================================

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = createBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await bookingService.createBooking(customerId, parseResult.data);

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

// ===========================================
// Get Booking
// ===========================================

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        code: StatusTransitionErrorCode.BOOKING_NOT_FOUND,
      });
    }

    // Authorization check: user must be customer, provider, or admin
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    
    if (userRole !== UserRole.ADMIN && 
        booking.customerId !== userId && 
        booking.providerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

// ===========================================
// Status Transition Endpoints
// ===========================================

/**
 * POST /bookings/:id/confirm
 * Transition: PENDING -> CONFIRMED
 * Allowed: Provider, Admin
 */
export async function confirmBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await bookingService.confirmBooking(id, userId, userRole);

    return res.json({
      success: true,
      data: booking,
      message: 'Booking confirmed successfully',
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * POST /bookings/:id/start
 * Transition: CONFIRMED -> IN_PROGRESS
 * Allowed: Provider, Admin
 */
export async function startBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await bookingService.startBooking(id, userId, userRole);

    return res.json({
      success: true,
      data: booking,
      message: 'Booking started successfully',
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * POST /bookings/:id/complete
 * Transition: IN_PROGRESS -> COMPLETED
 * Allowed: Provider, Admin
 */
export async function completeBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await bookingService.completeBooking(id, userId, userRole);

    return res.json({
      success: true,
      data: booking,
      message: 'Booking completed successfully',
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * POST /bookings/:id/cancel
 * Transition: PENDING/CONFIRMED/IN_PROGRESS -> CANCELLED
 * Allowed: Customer (PENDING/CONFIRMED only), Provider, Admin
 */
export async function cancelBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = cancelBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const booking = await bookingService.cancelBooking(
      id,
      userId,
      userRole,
      parseResult.data.reason
    );

    return res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * POST /bookings/:id/no-show
 * Transition: CONFIRMED -> NO_SHOW
 * Allowed: Provider, Admin
 */
export async function markNoShow(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await bookingService.markNoShow(id, userId, userRole);

    return res.json({
      success: true,
      data: booking,
      message: 'Booking marked as no-show',
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

// ===========================================
// Listing Endpoints
// ===========================================

/**
 * GET /bookings
 * List bookings with pagination, filters, and role-based visibility
 * 
 * Role-based visibility:
 * - CUSTOMER: only own bookings
 * - PROVIDER: only bookings for their provider account
 * - ADMIN: all bookings
 */
export async function listBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    const providerId = req.user?.providerId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const parseResult = bookingQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await bookingService.listBookings(
      userId,
      userRole,
      parseResult.data,
      providerId
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * GET /customer/bookings
 * List bookings for the authenticated customer
 */
export async function listCustomerBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const parseResult = bookingQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await bookingService.getCustomerBookings(customerId, parseResult.data);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

/**
 * GET /provider/bookings
 * List bookings for the authenticated provider
 */
export async function listProviderBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const providerId = req.user?.providerId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!providerId) {
      return res.status(403).json({
        error: 'Provider account required',
        code: ListingErrorCode.ACCESS_DENIED,
      });
    }

    // Parse and validate query parameters
    const parseResult = bookingQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await bookingService.getProviderBookings(userId, providerId, parseResult.data);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleBookingError(res, error);
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Map user role string to UserRole enum
 */
function mapToUserRole(role?: string): UserRole {
  switch (role?.toUpperCase()) {
    case 'PROVIDER':
    case 'VENDOR':
      return UserRole.PROVIDER;
    case 'ADMIN':
      return UserRole.ADMIN;
    default:
      return UserRole.CUSTOMER;
  }
}

/**
 * Handle booking errors and return appropriate HTTP response
 */
function handleBookingError(res: Response, error: unknown) {
  if (error instanceof BookingValidationError) {
    const statusCode = getStatusCodeForError(error.code);
    return res.status(statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  console.error('Booking error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: string): number {
  switch (code) {
    // Booking creation errors
    case BookingErrorCode.SERVICE_NOT_FOUND:
    case StatusTransitionErrorCode.BOOKING_NOT_FOUND:
      return 404;
    case BookingErrorCode.SERVICE_NOT_AVAILABLE:
    case BookingErrorCode.PROVIDER_NOT_ACTIVE:
      return 422;
    case BookingErrorCode.OUTSIDE_BOOKING_WINDOW:
    case BookingErrorCode.TIME_NOT_AVAILABLE:
    case BookingErrorCode.MISSING_TIME_FOR_APPOINTMENT:
    case BookingErrorCode.INVALID_DATE:
    case StatusTransitionErrorCode.CANCELLATION_REASON_REQUIRED:
      return 400;
    case BookingErrorCode.SLOT_ALREADY_BOOKED:
      return 409;
    
    // Status transition errors
    case StatusTransitionErrorCode.INVALID_TRANSITION:
    case StatusTransitionErrorCode.BOOKING_IN_TERMINAL_STATE:
      return 422;
    case StatusTransitionErrorCode.PERMISSION_DENIED:
    case ListingErrorCode.ACCESS_DENIED:
      return 403;
    
    // Listing errors
    case ListingErrorCode.INVALID_DATE_RANGE:
      return 400;
    
    default:
      return 400;
  }
}
