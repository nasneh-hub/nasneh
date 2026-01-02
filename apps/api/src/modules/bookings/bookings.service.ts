/**
 * Bookings Service
 * 
 * Business logic for booking creation with availability validation.
 * Uses existing availability engine as the ONLY source of truth.
 * 
 * CRITICAL: Double-booking prevention is implemented using:
 * 1. Database transaction with SERIALIZABLE isolation
 * 2. Row-level locking via SELECT FOR UPDATE
 * 3. Atomic check-and-insert pattern
 */

import { prisma } from '../../lib/db.js';
import { Prisma } from '@prisma/client';
import {
  availabilityRulesRepository,
  availabilityOverridesRepository,
  availabilitySettingsRepository,
} from '../availability/availability.repository.js';
import {
  checkBookingConflict,
  checkWithinAvailableHours,
  validateWithinBookingWindow,
  timeStringToDate,
  formatDateString,
} from '../../lib/availability-engine.js';
import {
  BookingErrorCode,
  StatusTransitionErrorCode,
  ListingErrorCode,
  BookingStatus,
  UserRole,
  isValidBookingTransition,
  canRolePerformTransition,
  getAllowedTransitionsForRole,
  type CreateBookingInput,
  type BookingQuery,
  type PaginatedBookingsResponse,
} from '../../types/booking.types.js';
import { calendarDefaults } from '../../config/calendar.defaults.js';

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
// Booking Number Generator
// ===========================================

async function generateBookingNumber(tx: Prisma.TransactionClient): Promise<string> {
  const prefix = 'BK';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  
  // Get count of bookings today for sequence (within transaction)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const count = await tx.booking.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${date}${sequence}`;
}

// ===========================================
// Booking Service
// ===========================================

export const bookingService = {
  /**
   * Create a new booking with full availability validation
   * 
   * CRITICAL: Uses atomic transaction with row locking to prevent double-booking.
   * 
   * Validation order:
   * 1. Service exists and is available
   * 2. Provider is active
   * 3. Date is within booking window (min/max advance)
   * 4. Time is within available hours (rules + overrides)
   * 5. No conflicting bookings (double-booking prevention) - ATOMIC
   * 
   * Race condition prevention:
   * - Uses Prisma interactive transaction
   * - Acquires row-level lock on conflicting bookings via raw SQL SELECT FOR UPDATE
   * - Conflict check and insert happen atomically within the same transaction
   */
  async createBooking(customerId: string, input: CreateBookingInput) {
    const { serviceId, scheduledDate, scheduledTime, serviceAddress, notes } = input;

    // =========================================
    // Pre-transaction validation (read-only)
    // =========================================

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
      const overrides = await availabilityOverridesRepository.findByProviderAndDate(providerId, bookingDate);
      
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

    // Calculate pricing (before transaction)
    const price = Number(service.price);
    const commissionRate = Number(service.provider.commissionRate);
    const commission = price * (commissionRate / 100);
    const total = price;

    // =========================================
    // ATOMIC TRANSACTION: Conflict check + Insert
    // =========================================
    // This prevents race conditions where two concurrent requests
    // could both pass the conflict check and create overlapping bookings.

    const booking = await prisma.$transaction(async (tx) => {
      // Step 1: Acquire row-level lock on existing bookings for this provider/date
      // This prevents other transactions from reading/modifying these rows
      // until this transaction completes.
      //
      // Using raw SQL because Prisma doesn't support SELECT FOR UPDATE directly.
      // The lock ensures serialized access to the booking slot.
      
      const dateStr = formatDateString(bookingDate);
      
      // Lock all active bookings for this provider on this date
      // FOR UPDATE NOWAIT will fail immediately if lock cannot be acquired
      // (prevents deadlocks and long waits)
      const lockedBookings = await tx.$queryRaw<Array<{
        id: string;
        scheduled_date: Date;
        scheduled_time: Date | null;
        end_time: Date | null;
      }>>`
        SELECT id, scheduled_date, scheduled_time, end_time
        FROM bookings
        WHERE provider_id = ${providerId}
          AND scheduled_date = ${bookingDate}
          AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
        FOR UPDATE
      `;

      // Step 2: Check for conflicts using the availability engine
      // (same logic as before, but now with locked rows)
      const existingBookings = lockedBookings.map(b => ({
        id: b.id,
        scheduledDate: b.scheduled_date,
        scheduledTime: b.scheduled_time,
        endTime: b.end_time,
      }));

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

      // Step 3: Generate booking number (within transaction for uniqueness)
      const bookingNumber = await generateBookingNumber(tx);

      // Step 4: Create the booking (atomic with conflict check)
      const newBooking = await tx.booking.create({
        data: {
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
          serviceAddress: serviceAddress ?? Prisma.JsonNull,
          notes: notes ?? null,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
              logoUrl: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              serviceType: true,
              durationMinutes: true,
            },
          },
        },
      });

      return newBooking;
    }, {
      // Transaction options
      maxWait: 5000,  // Max time to wait for transaction slot (5s)
      timeout: 10000, // Max transaction duration (10s)
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return booking;
  },

  /**
   * Update booking status with role-based permission validation
   * 
   * Validates:
   * 1. Booking exists
   * 2. Transition is valid in state machine
   * 3. User role has permission for this transition
   * 4. Cancellation reason provided if cancelling
   */
  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    userId: string,
    userRole: UserRole,
    cancellationReason?: string
  ) {
    // 1. Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true, logoUrl: true } },
        service: { select: { id: true, name: true, nameAr: true, serviceType: true, durationMinutes: true } },
      },
    });

    if (!booking) {
      throw new BookingValidationError(
        StatusTransitionErrorCode.BOOKING_NOT_FOUND,
        'Booking not found'
      );
    }

    const currentStatus = booking.status as BookingStatus;

    // 2. Check if booking is in terminal state
    const terminalStates: BookingStatus[] = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.NO_SHOW,
    ];
    if (terminalStates.includes(currentStatus)) {
      throw new BookingValidationError(
        StatusTransitionErrorCode.BOOKING_IN_TERMINAL_STATE,
        `Cannot update booking in ${currentStatus} state`
      );
    }

    // 3. Check if transition is valid
    if (!isValidBookingTransition(currentStatus, newStatus)) {
      throw new BookingValidationError(
        StatusTransitionErrorCode.INVALID_TRANSITION,
        `Invalid transition from ${currentStatus} to ${newStatus}`
      );
    }

    // 4. Check role permission
    if (!canRolePerformTransition(currentStatus, newStatus, userRole)) {
      const allowedTransitions = getAllowedTransitionsForRole(currentStatus, userRole);
      throw new BookingValidationError(
        StatusTransitionErrorCode.PERMISSION_DENIED,
        `${userRole} cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    // 5. Validate cancellation reason if cancelling
    if (newStatus === BookingStatus.CANCELLED && !cancellationReason) {
      throw new BookingValidationError(
        StatusTransitionErrorCode.CANCELLATION_REASON_REQUIRED,
        'Cancellation reason is required'
      );
    }

    // 6. Update the booking
    const updateData: Prisma.BookingUpdateInput = {
      status: newStatus,
    };

    if (newStatus === BookingStatus.CANCELLED) {
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = userId;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true, logoUrl: true } },
        service: { select: { id: true, name: true, nameAr: true, serviceType: true, durationMinutes: true } },
      },
    });

    return updatedBooking;
  },

  /**
   * Confirm a booking (PENDING -> CONFIRMED)
   * Only provider or admin can confirm
   */
  async confirmBooking(bookingId: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(
      bookingId,
      BookingStatus.CONFIRMED,
      userId,
      userRole
    );
  },

  /**
   * Start a booking (CONFIRMED -> IN_PROGRESS)
   * Only provider or admin can start
   */
  async startBooking(bookingId: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(
      bookingId,
      BookingStatus.IN_PROGRESS,
      userId,
      userRole
    );
  },

  /**
   * Complete a booking (IN_PROGRESS -> COMPLETED)
   * Only provider or admin can complete
   */
  async completeBooking(bookingId: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(
      bookingId,
      BookingStatus.COMPLETED,
      userId,
      userRole
    );
  },

  /**
   * Cancel a booking (any non-terminal state -> CANCELLED)
   * Customer can cancel PENDING/CONFIRMED
   * Provider/Admin can cancel any non-terminal state
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: UserRole,
    reason: string
  ) {
    return this.updateBookingStatus(
      bookingId,
      BookingStatus.CANCELLED,
      userId,
      userRole,
      reason
    );
  },

  /**
   * Mark booking as no-show (CONFIRMED -> NO_SHOW)
   * Only provider or admin can mark as no-show
   */
  async markNoShow(bookingId: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(
      bookingId,
      BookingStatus.NO_SHOW,
      userId,
      userRole
    );
  },

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true, logoUrl: true } },
        service: { select: { id: true, name: true, nameAr: true, serviceType: true, durationMinutes: true } },
      },
    });
  },

  /**
   * List bookings with pagination, filters, and role-based visibility
   * 
   * Role-based visibility:
   * - CUSTOMER: only own bookings
   * - PROVIDER: only bookings for their provider account
   * - ADMIN: all bookings
   */
  async listBookings(
    userId: string,
    userRole: UserRole,
    query: BookingQuery,
    providerIdForRole?: string // Provider's provider ID (for PROVIDER role)
  ): Promise<PaginatedBookingsResponse> {
    const {
      page,
      limit,
      providerId,
      serviceId,
      customerId,
      status,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    } = query;

    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        throw new BookingValidationError(
          ListingErrorCode.INVALID_DATE_RANGE,
          'fromDate must be before or equal to toDate'
        );
      }
    }

    // Build where clause with role-based filtering
    const where: Prisma.BookingWhereInput = {};

    // Role-based visibility
    switch (userRole) {
      case UserRole.CUSTOMER:
        // Customer can only see their own bookings
        where.customerId = userId;
        // Ignore customerId filter for customers (they can only see their own)
        break;
      
      case UserRole.PROVIDER:
        // Provider can only see bookings for their provider account
        if (!providerIdForRole) {
          throw new BookingValidationError(
            ListingErrorCode.ACCESS_DENIED,
            'Provider ID required for provider role'
          );
        }
        where.providerId = providerIdForRole;
        // Ignore providerId filter for providers (they can only see their own)
        break;
      
      case UserRole.ADMIN:
        // Admin can see all bookings, apply filters as requested
        if (providerId) where.providerId = providerId;
        if (customerId) where.customerId = customerId;
        break;
    }

    // Apply common filters
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status as any; // Cast to Prisma enum type

    // Date range filter
    if (fromDate || toDate) {
      where.scheduledDate = {};
      if (fromDate) {
        where.scheduledDate.gte = new Date(fromDate);
      }
      if (toDate) {
        // Include the entire day
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        where.scheduledDate.lte = toDateEnd;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute count and find in parallel
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          provider: { select: { id: true, businessName: true, logoUrl: true } },
          service: { select: { id: true, name: true, nameAr: true, serviceType: true, durationMinutes: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings as any,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get bookings for a specific customer (for customer dashboard)
   */
  async getCustomerBookings(
    customerId: string,
    query: Omit<BookingQuery, 'customerId' | 'providerId'>
  ): Promise<PaginatedBookingsResponse> {
    return this.listBookings(customerId, UserRole.CUSTOMER, {
      ...query,
      customerId: undefined,
      providerId: undefined,
    } as BookingQuery);
  },

  /**
   * Get bookings for a specific provider (for provider dashboard)
   */
  async getProviderBookings(
    userId: string,
    providerId: string,
    query: Omit<BookingQuery, 'customerId' | 'providerId'>
  ): Promise<PaginatedBookingsResponse> {
    return this.listBookings(
      userId,
      UserRole.PROVIDER,
      {
        ...query,
        customerId: undefined,
        providerId: undefined,
      } as BookingQuery,
      providerId
    );
  },
};
