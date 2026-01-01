/**
 * Bookings Service
 * 
 * Business logic for booking creation with availability validation.
 * Uses existing availability engine as the ONLY source of truth.
 */

import { prisma } from '../../lib/db';
import { bookingRepository } from './bookings.repository';
import {
  availabilityRulesRepository,
  availabilityOverridesRepository,
  availabilitySettingsRepository,
} from '../availability/availability.repository';
import {
  checkBookingConflict,
  checkWithinAvailableHours,
  validateWithinBookingWindow,
  timeStringToDate,
  formatDateString,
} from '../../lib/availability-engine';
import { BookingErrorCode, type CreateBookingInput } from '../../types/booking.types';
import { calendarDefaults } from '../../config/calendar.defaults';

// ===========================================
// Custom Errors
// ===========================================

export class BookingValidationError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'BookingValidationError';
    this.code = code;
  }
}

// ===========================================
// Booking Service
// ===========================================

export const bookingService = {
  /**
   * Create a new booking with full availability validation
   * 
   * Validation order:
   * 1. Service exists and is available
   * 2. Provider is active
   * 3. Date is within booking window (min/max advance)
   * 4. Time is within available hours (rules + overrides)
   * 5. No conflicting bookings (double-booking prevention)
   */
  async createBooking(customerId: string, input: CreateBookingInput) {
    const { serviceId, scheduledDate, scheduledTime, serviceAddress, notes } = input;

    // 1. Get service with provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          select: {
            id: true,
            status: true,
            commissionRate: true,
          },
        },
      },
    });

    if (!service) {
      throw new BookingValidationError(
        BookingErrorCode.SERVICE_NOT_FOUND,
        'Service not found'
      );
    }

    if (!service.isAvailable || service.status !== 'ACTIVE') {
      throw new BookingValidationError(
        BookingErrorCode.SERVICE_NOT_AVAILABLE,
        'Service is not available for booking'
      );
    }

    // 2. Check provider is active
    if (service.provider.status !== 'ACTIVE') {
      throw new BookingValidationError(
        BookingErrorCode.PROVIDER_NOT_ACTIVE,
        'Provider is not active'
      );
    }

    const providerId = service.providerId;

    // 3. Validate service type requirements
    if (service.serviceType === 'APPOINTMENT' && !scheduledTime) {
      throw new BookingValidationError(
        BookingErrorCode.MISSING_TIME_FOR_APPOINTMENT,
        'Appointment services require a scheduled time'
      );
    }

    // Parse dates
    const bookingDate = new Date(scheduledDate);
    if (isNaN(bookingDate.getTime())) {
      throw new BookingValidationError(
        BookingErrorCode.INVALID_DATE,
        'Invalid date format'
      );
    }

    // 4. Get provider availability settings (or use defaults)
    const settings = await availabilitySettingsRepository.findByProvider(providerId);
    const effectiveSettings = settings ?? {
      id: '',
      providerId,
      timezone: calendarDefaults.timezone,
      slotDurationMinutes: calendarDefaults.slotDurationMinutes,
      bufferBeforeMinutes: calendarDefaults.bufferBeforeMinutes,
      bufferAfterMinutes: calendarDefaults.bufferAfterMinutes,
      minAdvanceHours: calendarDefaults.minAdvanceHours,
      maxAdvanceDays: calendarDefaults.maxAdvanceDays,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Validate within booking window
    const windowCheck = validateWithinBookingWindow(bookingDate, effectiveSettings);
    if (!windowCheck.valid) {
      throw new BookingValidationError(
        BookingErrorCode.OUTSIDE_BOOKING_WINDOW,
        windowCheck.error ?? 'Date is outside booking window'
      );
    }

    // 6. For appointment type, validate time is within available hours
    let bookingTime: Date | null = null;
    let endTime: Date | null = null;
    const durationMinutes = service.durationMinutes ?? effectiveSettings.slotDurationMinutes;

    if (service.serviceType === 'APPOINTMENT' && scheduledTime) {
      bookingTime = timeStringToDate(scheduledDate, scheduledTime);
      
      // Calculate end time
      const endTimeMinutes = new Date(bookingTime);
      endTimeMinutes.setMinutes(endTimeMinutes.getMinutes() + durationMinutes);
      endTime = endTimeMinutes;

      // Get availability rules and overrides
      const rules = await availabilityRulesRepository.findByProvider(providerId);
      // Get overrides for a reasonable date range (30 days around booking date)
      const rangeStart = new Date(bookingDate);
      rangeStart.setDate(rangeStart.getDate() - 1);
      const rangeEnd = new Date(bookingDate);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
      const overrides = await availabilityOverridesRepository.findByProviderAndDateRange(providerId, rangeStart, rangeEnd);

      // Check if time is within available hours
      const hoursCheck = checkWithinAvailableHours(
        bookingDate,
        bookingTime,
        durationMinutes,
        rules,
        overrides
      );

      if (!hoursCheck.isValid) {
        throw new BookingValidationError(
          BookingErrorCode.TIME_NOT_AVAILABLE,
          hoursCheck.reason ?? 'Time is not available'
        );
      }
    } else {
      // For DELIVERY_DATE and PICKUP_DROPOFF, check if date is available
      // Get overrides for the booking date
      const overrides = await availabilityOverridesRepository.findByProviderAndDate(providerId, bookingDate);
      
      // Check for full-day unavailable override
      const fullDayUnavailable = overrides.find(
        (o: { type: string; startTime: Date | null; endTime: Date | null; reason: string | null }) => 
          o.type === 'UNAVAILABLE' && !o.startTime && !o.endTime
      );
      
      if (fullDayUnavailable) {
        throw new BookingValidationError(
          BookingErrorCode.TIME_NOT_AVAILABLE,
          fullDayUnavailable.reason ?? 'Date is not available'
        );
      }
    }

    // 7. Check for conflicting bookings (double-booking prevention)
    const existingBookings = await bookingRepository.findActiveBookingsForProvider(
      providerId,
      scheduledDate
    );

    const conflictCheck = checkBookingConflict(
      bookingDate,
      bookingTime,
      durationMinutes,
      existingBookings,
      effectiveSettings.bufferBeforeMinutes,
      effectiveSettings.bufferAfterMinutes
    );

    if (conflictCheck.hasConflict) {
      throw new BookingValidationError(
        BookingErrorCode.SLOT_ALREADY_BOOKED,
        conflictCheck.reason ?? 'Time slot is already booked'
      );
    }

    // 8. Calculate pricing
    const price = Number(service.price);
    const commissionRate = Number(service.provider.commissionRate);
    const commission = price * (commissionRate / 100);
    const total = price;

    // 9. Generate booking number
    const bookingNumber = await bookingRepository.generateBookingNumber();

    // 10. Create the booking
    const booking = await bookingRepository.create({
      bookingNumber,
      customerId,
      providerId,
      serviceId,
      scheduledDate: bookingDate,
      scheduledTime: bookingTime,
      endTime,
      price,
      commission,
      total,
      serviceAddress: serviceAddress ?? null,
      notes: notes ?? null,
    });

    return booking;
  },
};
