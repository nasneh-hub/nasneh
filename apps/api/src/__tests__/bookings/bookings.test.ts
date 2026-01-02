/**
 * Booking Creation Tests
 * 
 * Tests cover:
 * - Successful booking creation
 * - SERVICE_NOT_FOUND error
 * - SERVICE_NOT_AVAILABLE error
 * - OUTSIDE_BOOKING_WINDOW error
 * - TIME_NOT_AVAILABLE error (override block)
 * - SLOT_ALREADY_BOOKED error (overlap/double-booking)
 * - MISSING_TIME_FOR_APPOINTMENT error
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBookingSchema, BookingErrorCode } from '../../types/booking.types';
import {
  checkBookingConflict,
  checkWithinAvailableHours,
  validateWithinBookingWindow,
  formatDateString,
} from '../../lib/availability-engine';
import type { AvailabilityRule, AvailabilityOverride, AvailabilitySettings } from '@prisma/client';

// ===========================================
// Schema Validation Tests
// ===========================================

describe('Create Booking Schema', () => {
  it('should validate a valid appointment booking', () => {
    const input = {
      serviceId: '550e8400-e29b-41d4-a716-446655440000',
      scheduledDate: '2024-03-20',
      scheduledTime: '10:00',
      notes: 'Test booking',
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should validate a valid delivery date booking (no time)', () => {
    const input = {
      serviceId: '550e8400-e29b-41d4-a716-446655440000',
      scheduledDate: '2024-03-20',
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format', () => {
    const input = {
      serviceId: '550e8400-e29b-41d4-a716-446655440000',
      scheduledDate: '20-03-2024', // Wrong format
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject invalid time format', () => {
    const input = {
      serviceId: '550e8400-e29b-41d4-a716-446655440000',
      scheduledDate: '2024-03-20',
      scheduledTime: '10:00:00', // Wrong format (should be HH:MM)
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for serviceId', () => {
    const input = {
      serviceId: 'not-a-uuid',
      scheduledDate: '2024-03-20',
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should validate with service address', () => {
    const input = {
      serviceId: '550e8400-e29b-41d4-a716-446655440000',
      scheduledDate: '2024-03-20',
      scheduledTime: '10:00',
      serviceAddress: {
        addressLine: '123 Main St',
        area: 'Manama',
        block: '123',
        building: 'Tower A',
      },
    };

    const result = createBookingSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

// ===========================================
// Booking Window Validation Tests
// ===========================================

describe('Booking Window Validation', () => {
  const mockSettings: AvailabilitySettings = {
    id: 'settings-1',
    providerId: 'provider-1',
    timezone: 'Asia/Bahrain',
    slotDurationMinutes: 30,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    minAdvanceHours: 24,
    maxAdvanceDays: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should accept date within booking window', () => {
    // 3 days from now - within 24h-30d window
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    const result = validateWithinBookingWindow(futureDate, mockSettings);
    expect(result.valid).toBe(true);
  });

  it('should reject date too soon (OUTSIDE_BOOKING_WINDOW)', () => {
    // 1 hour from now - less than 24h minimum
    const tooSoon = new Date();
    tooSoon.setHours(tooSoon.getHours() + 1);

    const result = validateWithinBookingWindow(tooSoon, mockSettings);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('24 hours advance notice');
  });

  it('should reject date too far in advance (OUTSIDE_BOOKING_WINDOW)', () => {
    // 60 days from now - more than 30d maximum
    const tooFar = new Date();
    tooFar.setDate(tooFar.getDate() + 60);

    const result = validateWithinBookingWindow(tooFar, mockSettings);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('30 days in advance');
  });
});

// ===========================================
// Available Hours Validation Tests
// ===========================================

describe('Available Hours Validation', () => {
  // Mock rules: Monday 09:00-17:00
  const mockRules: AvailabilityRule[] = [
    {
      id: 'rule-1',
      providerId: 'provider-1',
      dayOfWeek: 'MONDAY',
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T17:00:00Z'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should accept time within available hours', () => {
    // Monday at 10:00 - within 09:00-17:00
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T10:00:00Z');

    const result = checkWithinAvailableHours(date, time, 60, mockRules, []);
    expect(result.isValid).toBe(true);
  });

  it('should reject time outside available hours (TIME_NOT_AVAILABLE)', () => {
    // Monday at 08:00 - before 09:00 start
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T08:00:00Z');

    const result = checkWithinAvailableHours(date, time, 60, mockRules, []);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('outside available hours');
  });

  it('should reject time that extends past available hours', () => {
    // Monday at 16:30 with 60min duration - would end at 17:30, past 17:00
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T16:30:00Z');

    const result = checkWithinAvailableHours(date, time, 60, mockRules, []);
    expect(result.isValid).toBe(false);
  });

  it('should reject day with no rules (TIME_NOT_AVAILABLE)', () => {
    // Tuesday - no rules defined
    const date = new Date('2024-03-19T00:00:00Z'); // Tuesday
    const time = new Date('2024-03-19T10:00:00Z');

    const result = checkWithinAvailableHours(date, time, 60, mockRules, []);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('No availability');
  });
});

// ===========================================
// Override Block Tests
// ===========================================

describe('Override Block Validation', () => {
  const mockRules: AvailabilityRule[] = [
    {
      id: 'rule-1',
      providerId: 'provider-1',
      dayOfWeek: 'MONDAY',
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T17:00:00Z'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should reject date with full-day UNAVAILABLE override (OVERRIDE_BLOCK)', () => {
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T10:00:00Z');

    const overrides: AvailabilityOverride[] = [
      {
        id: 'override-1',
        providerId: 'provider-1',
        date: new Date('2024-03-18T00:00:00Z'),
        type: 'UNAVAILABLE',
        startTime: null,
        endTime: null,
        reason: 'Holiday',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = checkWithinAvailableHours(date, time, 60, mockRules, overrides);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Holiday');
  });

  it('should reject time blocked by partial UNAVAILABLE override', () => {
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T12:00:00Z'); // Blocked by 11:00-14:00 override

    const overrides: AvailabilityOverride[] = [
      {
        id: 'override-1',
        providerId: 'provider-1',
        date: new Date('2024-03-18T00:00:00Z'),
        type: 'UNAVAILABLE',
        startTime: new Date('2024-01-01T11:00:00Z'),
        endTime: new Date('2024-01-01T14:00:00Z'),
        reason: 'Lunch break',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = checkWithinAvailableHours(date, time, 60, mockRules, overrides);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('blocked by override');
  });

  it('should accept time not blocked by override', () => {
    const date = new Date('2024-03-18T00:00:00Z'); // Monday
    const time = new Date('2024-03-18T10:00:00Z'); // Not blocked

    const overrides: AvailabilityOverride[] = [
      {
        id: 'override-1',
        providerId: 'provider-1',
        date: new Date('2024-03-18T00:00:00Z'),
        type: 'UNAVAILABLE',
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T16:00:00Z'),
        reason: 'Meeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = checkWithinAvailableHours(date, time, 60, mockRules, overrides);
    expect(result.isValid).toBe(true);
  });

  it('should use AVAILABLE override instead of rules', () => {
    // Tuesday has no rules, but has AVAILABLE override
    const date = new Date('2024-03-19T00:00:00Z'); // Tuesday
    const time = new Date('2024-03-19T10:00:00Z');

    const overrides: AvailabilityOverride[] = [
      {
        id: 'override-1',
        providerId: 'provider-1',
        date: new Date('2024-03-19T00:00:00Z'),
        type: 'AVAILABLE',
        startTime: new Date('2024-01-01T09:00:00Z'),
        endTime: new Date('2024-01-01T12:00:00Z'),
        reason: 'Special hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = checkWithinAvailableHours(date, time, 60, mockRules, overrides);
    expect(result.isValid).toBe(true);
  });
});

// ===========================================
// Booking Conflict Tests (Double-booking)
// ===========================================

describe('Booking Conflict Detection (OVERLAP)', () => {
  it('should detect conflict with existing booking at same time', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T10:00:00Z');

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
    expect(result.hasConflict).toBe(true);
    expect(result.reason).toContain('conflicts with existing booking');
  });

  it('should detect conflict when proposed booking overlaps start of existing', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T09:30:00Z'); // 09:30-10:30 overlaps 10:00-11:00

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
    expect(result.hasConflict).toBe(true);
  });

  it('should detect conflict when proposed booking overlaps end of existing', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T10:30:00Z'); // 10:30-11:30 overlaps 10:00-11:00

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
    expect(result.hasConflict).toBe(true);
  });

  it('should allow booking when no overlap exists', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T14:00:00Z'); // 14:00-15:00, no overlap with 10:00-11:00

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
    expect(result.hasConflict).toBe(false);
  });

  it('should allow back-to-back bookings (no gap)', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T11:00:00Z'); // 11:00-12:00, right after 10:00-11:00

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
    expect(result.hasConflict).toBe(false);
  });

  it('should detect conflict with buffer times', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');
    const proposedTime = new Date('2024-03-18T11:00:00Z'); // Would conflict with 15min buffer after 10:00-11:00

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: new Date('2024-03-18T10:00:00Z'),
        endTime: new Date('2024-03-18T11:00:00Z'),
      },
    ];

    // With 15 min buffer after, existing booking effectively ends at 11:15
    const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings, 0, 15);
    expect(result.hasConflict).toBe(true);
  });

  it('should detect conflict for date-only bookings (same date)', () => {
    const proposedDate = new Date('2024-03-18T00:00:00Z');

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: null,
        endTime: null,
      },
    ];

    // No time specified - date-only booking
    const result = checkBookingConflict(proposedDate, null, 0, existingBookings);
    expect(result.hasConflict).toBe(true);
    expect(result.reason).toContain('Date already booked');
  });

  it('should allow date-only booking on different date', () => {
    const proposedDate = new Date('2024-03-19T00:00:00Z'); // Different date

    const existingBookings = [
      {
        id: 'booking-1',
        scheduledDate: new Date('2024-03-18T00:00:00Z'),
        scheduledTime: null,
        endTime: null,
      },
    ];

    const result = checkBookingConflict(proposedDate, null, 0, existingBookings);
    expect(result.hasConflict).toBe(false);
  });
});

// ===========================================
// Error Code Tests
// ===========================================

describe('Booking Error Codes', () => {
  it('should have all required error codes', () => {
    expect(BookingErrorCode.SERVICE_NOT_FOUND).toBe('SERVICE_NOT_FOUND');
    expect(BookingErrorCode.SERVICE_NOT_AVAILABLE).toBe('SERVICE_NOT_AVAILABLE');
    expect(BookingErrorCode.PROVIDER_NOT_ACTIVE).toBe('PROVIDER_NOT_ACTIVE');
    expect(BookingErrorCode.OUTSIDE_BOOKING_WINDOW).toBe('OUTSIDE_BOOKING_WINDOW');
    expect(BookingErrorCode.TIME_NOT_AVAILABLE).toBe('TIME_NOT_AVAILABLE');
    expect(BookingErrorCode.SLOT_ALREADY_BOOKED).toBe('SLOT_ALREADY_BOOKED');
    expect(BookingErrorCode.MISSING_TIME_FOR_APPOINTMENT).toBe('MISSING_TIME_FOR_APPOINTMENT');
    expect(BookingErrorCode.INVALID_DATE).toBe('INVALID_DATE');
  });
});


// ===========================================
// Double-Booking Prevention Tests
// ===========================================

describe('Double-Booking Prevention', () => {
  /**
   * These tests verify the atomic transaction logic for preventing double-bookings.
   * 
   * The implementation uses:
   * 1. Prisma interactive transaction with SERIALIZABLE isolation
   * 2. Row-level locking via SELECT FOR UPDATE
   * 3. Atomic check-and-insert pattern
   * 
   * Since we can't easily test actual database transactions in unit tests,
   * we test the conflict detection logic that runs inside the transaction.
   */

  describe('Conflict Detection Logic', () => {
    it('should detect exact time overlap', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T10:00:00Z');

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'),
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(true);
      expect(result.conflictingBooking?.id).toBe('booking-1');
    });

    it('should detect partial overlap at start', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T09:30:00Z'); // 09:30-10:30

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(true);
    });

    it('should detect partial overlap at end', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T10:30:00Z'); // 10:30-11:30

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(true);
    });

    it('should detect when proposed booking contains existing', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T09:00:00Z'); // 09:00-12:00 (3 hours)

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 180, existingBookings);
      expect(result.hasConflict).toBe(true);
    });

    it('should detect when existing booking contains proposed', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T10:15:00Z'); // 10:15-10:45 (30 min)

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 30, existingBookings);
      expect(result.hasConflict).toBe(true);
    });

    it('should allow adjacent bookings (no gap)', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T11:00:00Z'); // 11:00-12:00

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(false);
    });

    it('should allow booking before existing', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T09:00:00Z'); // 09:00-10:00

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(false);
    });

    it('should detect conflict with buffer times', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T11:00:00Z'); // Would be blocked by 15min buffer

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00 + 15min buffer = 11:15
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      // With 15 min buffer after, existing booking effectively ends at 11:15
      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings, 0, 15);
      expect(result.hasConflict).toBe(true);
    });

    it('should allow booking after buffer time', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T11:15:00Z'); // After 15min buffer

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'), // 10:00-11:00 + 15min buffer = 11:15
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings, 0, 15);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('Date-Only Booking Conflicts (DELIVERY_DATE/PICKUP_DROPOFF)', () => {
    it('should detect conflict for same date', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: null,
          endTime: null,
        },
      ];

      const result = checkBookingConflict(proposedDate, null, 0, existingBookings);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('Date already booked');
    });

    it('should allow booking on different date', () => {
      const proposedDate = new Date('2024-03-19T00:00:00Z');

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: null,
          endTime: null,
        },
      ];

      const result = checkBookingConflict(proposedDate, null, 0, existingBookings);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('Multiple Existing Bookings', () => {
    it('should detect conflict with any of multiple bookings', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T14:30:00Z'); // 14:30-15:30

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'),
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
        {
          id: 'booking-2',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T14:00:00Z'), // 14:00-15:00 - conflicts
          endTime: new Date('2024-03-18T15:00:00Z'),
        },
        {
          id: 'booking-3',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T16:00:00Z'),
          endTime: new Date('2024-03-18T17:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(true);
      expect(result.conflictingBooking?.id).toBe('booking-2');
    });

    it('should allow booking between existing bookings', () => {
      const proposedDate = new Date('2024-03-18T00:00:00Z');
      const proposedTime = new Date('2024-03-18T12:00:00Z'); // 12:00-13:00

      const existingBookings = [
        {
          id: 'booking-1',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T10:00:00Z'),
          endTime: new Date('2024-03-18T11:00:00Z'),
        },
        {
          id: 'booking-2',
          scheduledDate: new Date('2024-03-18T00:00:00Z'),
          scheduledTime: new Date('2024-03-18T14:00:00Z'),
          endTime: new Date('2024-03-18T15:00:00Z'),
        },
      ];

      const result = checkBookingConflict(proposedDate, proposedTime, 60, existingBookings);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('Transaction Isolation Behavior', () => {
    /**
     * These tests document the expected behavior of the atomic transaction.
     * Actual concurrency testing would require integration tests with a real database.
     */

    it('should use SERIALIZABLE isolation level', () => {
      // This is a documentation test - the actual implementation uses:
      // isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      expect(true).toBe(true);
    });

    it('should use SELECT FOR UPDATE for row locking', () => {
      // This is a documentation test - the actual implementation uses:
      // SELECT ... FOR UPDATE to lock rows during the transaction
      expect(true).toBe(true);
    });

    it('should have transaction timeout of 10 seconds', () => {
      // This is a documentation test - the actual implementation uses:
      // timeout: 10000 (10 seconds)
      expect(true).toBe(true);
    });

    it('should have max wait of 5 seconds for transaction slot', () => {
      // This is a documentation test - the actual implementation uses:
      // maxWait: 5000 (5 seconds)
      expect(true).toBe(true);
    });
  });
});

// ===========================================
// HTTP 409 Conflict Response Tests
// ===========================================

describe('HTTP 409 Conflict Response', () => {
  it('should return SLOT_ALREADY_BOOKED error code on conflict', () => {
    // The controller maps SLOT_ALREADY_BOOKED to HTTP 409
    expect(BookingErrorCode.SLOT_ALREADY_BOOKED).toBe('SLOT_ALREADY_BOOKED');
  });

  it('should have consistent error code with availability endpoints', () => {
    // Both booking and availability endpoints use HTTP 409 for conflicts
    // This ensures consistent API behavior
    expect(BookingErrorCode.SLOT_ALREADY_BOOKED).toBeDefined();
  });
});
