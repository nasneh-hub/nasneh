/**
 * Availability Engine
 * 
 * Computes available time slots based on:
 * - Weekly availability rules
 * - Date-specific overrides
 * - Provider settings (timezone, buffers, slot duration)
 * - Existing bookings (conflict detection)
 * 
 * NOTE: Not in repo/docs - implementing minimal MVP defaults
 * Default timezone: Asia/Bahrain
 */

import type { 
  AvailabilityRule, 
  AvailabilityOverride, 
  AvailabilitySettings,
  Booking,
  Service,
} from '@prisma/client';
import type {
  DayOfWeek,
  TimeSlot,
  DayAvailability,
  AvailabilityResponse,
  DateAvailability,
  DateRangeAvailability,
} from '../types/availability.types';
import { INDEX_TO_DAY_OF_WEEK, DAY_OF_WEEK_INDEX } from '../types/availability.types';

// ===========================================
// Time Utilities
// ===========================================

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Extract time string from Date object
 */
export function dateToTimeString(date: Date): string {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Create a Date object from time string for a specific date
 */
export function timeStringToDate(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get day of week enum from Date
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = date.getUTCDay();
  return INDEX_TO_DAY_OF_WEEK[dayIndex];
}

// ===========================================
// Slot Generation
// ===========================================

interface SlotGenerationOptions {
  rules: AvailabilityRule[];
  overrides: AvailabilityOverride[];
  settings: AvailabilitySettings;
  existingBookings?: Array<{
    scheduledDate: Date;
    scheduledTime: Date | null;
    endTime: Date | null;
  }>;
  serviceDurationMinutes?: number;
}

/**
 * Generate time slots for a single day
 */
export function generateDaySlots(
  date: Date,
  options: SlotGenerationOptions
): DayAvailability {
  const { rules, overrides, settings, existingBookings = [], serviceDurationMinutes } = options;
  const dateStr = formatDateString(date);
  const dayOfWeek = getDayOfWeek(date);
  
  // Check for date-specific overrides
  const dayOverrides = overrides.filter(
    (o) => formatDateString(o.date) === dateStr
  );
  
  // If there's an UNAVAILABLE override for the whole day (no times), mark as unavailable
  const fullDayUnavailable = dayOverrides.find(
    (o) => o.type === 'UNAVAILABLE' && !o.startTime && !o.endTime
  );
  
  if (fullDayUnavailable) {
    return {
      date: dateStr,
      dayOfWeek,
      available: false,
      slots: [],
      override: {
        type: 'UNAVAILABLE',
        reason: fullDayUnavailable.reason ?? 'Unavailable',
      },
    };
  }
  
  // Get applicable rules for this day
  const dayRules = rules.filter(
    (r) => r.dayOfWeek === dayOfWeek && r.isActive
  );
  
  // Check for AVAILABLE overrides (special hours)
  const availableOverrides = dayOverrides.filter(
    (o) => o.type === 'AVAILABLE' && o.startTime && o.endTime
  );
  
  // Determine working hours
  let workingRanges: Array<{ start: number; end: number }> = [];
  
  if (availableOverrides.length > 0) {
    // Use override times instead of weekly rules
    workingRanges = availableOverrides.map((o) => ({
      start: parseTimeToMinutes(dateToTimeString(o.startTime!)),
      end: parseTimeToMinutes(dateToTimeString(o.endTime!)),
    }));
  } else if (dayRules.length > 0) {
    // Use weekly rules
    workingRanges = dayRules.map((r) => ({
      start: parseTimeToMinutes(dateToTimeString(r.startTime)),
      end: parseTimeToMinutes(dateToTimeString(r.endTime)),
    }));
  }
  
  // If no working hours, day is unavailable
  if (workingRanges.length === 0) {
    return {
      date: dateStr,
      dayOfWeek,
      available: false,
      slots: [],
    };
  }
  
  // Apply partial unavailable overrides
  const partialUnavailable = dayOverrides.filter(
    (o) => o.type === 'UNAVAILABLE' && o.startTime && o.endTime
  );
  
  // Generate slots
  const slotDuration = serviceDurationMinutes ?? settings.slotDurationMinutes;
  const bufferBefore = settings.bufferBeforeMinutes;
  const bufferAfter = settings.bufferAfterMinutes;
  const totalSlotDuration = slotDuration + bufferBefore + bufferAfter;
  
  const slots: TimeSlot[] = [];
  
  for (const range of workingRanges) {
    let currentTime = range.start;
    
    while (currentTime + slotDuration <= range.end) {
      const slotStart = currentTime;
      const slotEnd = currentTime + slotDuration;
      
      // Check if slot is blocked by partial unavailable override
      const blockedByOverride = partialUnavailable.some((o) => {
        const overrideStart = parseTimeToMinutes(dateToTimeString(o.startTime!));
        const overrideEnd = parseTimeToMinutes(dateToTimeString(o.endTime!));
        return slotStart < overrideEnd && slotEnd > overrideStart;
      });
      
      // Check if slot is blocked by existing booking
      const blockedByBooking = existingBookings.some((booking) => {
        if (formatDateString(booking.scheduledDate) !== dateStr) return false;
        if (!booking.scheduledTime) return false;
        
        const bookingStart = parseTimeToMinutes(dateToTimeString(booking.scheduledTime));
        const bookingEnd = booking.endTime 
          ? parseTimeToMinutes(dateToTimeString(booking.endTime))
          : bookingStart + slotDuration;
        
        // Include buffer times in conflict check
        const effectiveBookingStart = bookingStart - bufferBefore;
        const effectiveBookingEnd = bookingEnd + bufferAfter;
        
        return slotStart < effectiveBookingEnd && slotEnd > effectiveBookingStart;
      });
      
      slots.push({
        date: dateStr,
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        available: !blockedByOverride && !blockedByBooking,
        reason: blockedByOverride 
          ? 'Override' 
          : blockedByBooking 
            ? 'Booked' 
            : undefined,
      });
      
      currentTime += totalSlotDuration;
    }
  }
  
  return {
    date: dateStr,
    dayOfWeek,
    available: slots.some((s) => s.available),
    slots,
    override: availableOverrides.length > 0 
      ? { type: 'AVAILABLE', reason: availableOverrides[0].reason ?? undefined }
      : undefined,
  };
}

/**
 * Generate availability for a date range
 */
export function generateAvailability(
  startDate: Date,
  endDate: Date,
  providerId: string,
  options: SlotGenerationOptions
): AvailabilityResponse {
  const days: DayAvailability[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(generateDaySlots(new Date(currentDate), options));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    providerId,
    timezone: options.settings.timezone,
    days,
  };
}

// ===========================================
// Date-Based Availability (for DELIVERY_DATE, PICKUP_DROPOFF)
// ===========================================

/**
 * Generate date availability for non-appointment services
 * NOTE: Not in repo/docs - implementing date-only availability
 */
export function generateDateAvailability(
  startDate: Date,
  endDate: Date,
  providerId: string,
  options: {
    rules: AvailabilityRule[];
    overrides: AvailabilityOverride[];
    settings: AvailabilitySettings;
    preparationDays?: number;
    now?: Date; // For testing - allows mocking current time
  }
): DateRangeAvailability {
  const { rules, overrides, settings, preparationDays = 0, now: mockNow } = options;
  const dates: DateAvailability[] = [];
  const currentDate = new Date(startDate);
  
  // Calculate minimum date based on preparation days (only if preparationDays > 0)
  const now = mockNow ?? new Date();
  const minDate = new Date(now);
  minDate.setUTCDate(minDate.getUTCDate() + preparationDays);
  minDate.setUTCHours(0, 0, 0, 0); // Start of day
  
  while (currentDate <= endDate) {
    const dateStr = formatDateString(currentDate);
    const dayOfWeek = getDayOfWeek(currentDate);
    
    // Check if date is before minimum (preparation time) - only when preparationDays > 0
    if (preparationDays > 0 && currentDate < minDate) {
      dates.push({
        date: dateStr,
        available: false,
        reason: `Requires ${preparationDays} days preparation`,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }
    
    // Check for date-specific overrides
    const dayOverrides = overrides.filter(
      (o) => formatDateString(o.date) === dateStr
    );
    
    // Check for full-day unavailable override
    const fullDayUnavailable = dayOverrides.find(
      (o) => o.type === 'UNAVAILABLE' && !o.startTime && !o.endTime
    );
    
    if (fullDayUnavailable) {
      dates.push({
        date: dateStr,
        available: false,
        reason: fullDayUnavailable.reason ?? 'Unavailable',
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }
    
    // Check if there are working rules for this day
    const hasWorkingRules = rules.some(
      (r) => r.dayOfWeek === dayOfWeek && r.isActive
    );
    
    // Check for AVAILABLE override
    const hasAvailableOverride = dayOverrides.some(
      (o) => o.type === 'AVAILABLE'
    );
    
    dates.push({
      date: dateStr,
      available: hasWorkingRules || hasAvailableOverride,
      reason: !hasWorkingRules && !hasAvailableOverride ? 'Not a working day' : undefined,
    });
    
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return {
    providerId,
    timezone: settings.timezone,
    dates,
  };
}

// ===========================================
// Conflict Detection (for Bookings Integration)
// ===========================================

export interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingBooking?: {
    id: string;
    scheduledDate: Date;
    scheduledTime: Date | null;
  };
}

/**
 * Check if a proposed booking time conflicts with existing bookings
 * This is the hook used by the bookings module to prevent double-booking
 */
export function checkBookingConflict(
  proposedDate: Date,
  proposedTime: Date | null,
  durationMinutes: number,
  existingBookings: Array<{
    id: string;
    scheduledDate: Date;
    scheduledTime: Date | null;
    endTime: Date | null;
  }>,
  bufferBefore = 0,
  bufferAfter = 0
): ConflictCheckResult {
  const dateStr = formatDateString(proposedDate);
  
  // For date-only bookings (DELIVERY_DATE, PICKUP_DROPOFF)
  if (!proposedTime) {
    const sameDayBooking = existingBookings.find(
      (b) => formatDateString(b.scheduledDate) === dateStr
    );
    
    if (sameDayBooking) {
      return {
        hasConflict: true,
        reason: 'Date already booked',
        conflictingBooking: sameDayBooking,
      };
    }
    
    return { hasConflict: false };
  }
  
  // For time-based bookings (APPOINTMENT)
  const proposedStart = parseTimeToMinutes(dateToTimeString(proposedTime));
  const proposedEnd = proposedStart + durationMinutes;
  
  // Include buffer times
  const effectiveStart = proposedStart - bufferBefore;
  const effectiveEnd = proposedEnd + bufferAfter;
  
  for (const booking of existingBookings) {
    if (formatDateString(booking.scheduledDate) !== dateStr) continue;
    if (!booking.scheduledTime) continue;
    
    const bookingStart = parseTimeToMinutes(dateToTimeString(booking.scheduledTime));
    const bookingEnd = booking.endTime 
      ? parseTimeToMinutes(dateToTimeString(booking.endTime))
      : bookingStart + durationMinutes;
    
    // Include buffer times for existing booking
    const existingEffectiveStart = bookingStart - bufferBefore;
    const existingEffectiveEnd = bookingEnd + bufferAfter;
    
    // Check for overlap
    if (effectiveStart < existingEffectiveEnd && effectiveEnd > existingEffectiveStart) {
      return {
        hasConflict: true,
        reason: 'Time slot conflicts with existing booking',
        conflictingBooking: booking,
      };
    }
  }
  
  return { hasConflict: false };
}

/**
 * Check if a proposed time is within available hours
 */
export function checkWithinAvailableHours(
  date: Date,
  time: Date,
  durationMinutes: number,
  rules: AvailabilityRule[],
  overrides: AvailabilityOverride[]
): { isValid: boolean; reason?: string } {
  const dateStr = formatDateString(date);
  const dayOfWeek = getDayOfWeek(date);
  
  // Check for full-day unavailable override
  const fullDayUnavailable = overrides.find(
    (o) => formatDateString(o.date) === dateStr && 
           o.type === 'UNAVAILABLE' && 
           !o.startTime && !o.endTime
  );
  
  if (fullDayUnavailable) {
    return { isValid: false, reason: fullDayUnavailable.reason ?? 'Day is unavailable' };
  }
  
  // Get working hours for the day
  const availableOverrides = overrides.filter(
    (o) => formatDateString(o.date) === dateStr && 
           o.type === 'AVAILABLE' && 
           o.startTime && o.endTime
  );
  
  let workingRanges: Array<{ start: number; end: number }> = [];
  
  if (availableOverrides.length > 0) {
    workingRanges = availableOverrides.map((o) => ({
      start: parseTimeToMinutes(dateToTimeString(o.startTime!)),
      end: parseTimeToMinutes(dateToTimeString(o.endTime!)),
    }));
  } else {
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive);
    workingRanges = dayRules.map((r) => ({
      start: parseTimeToMinutes(dateToTimeString(r.startTime)),
      end: parseTimeToMinutes(dateToTimeString(r.endTime)),
    }));
  }
  
  if (workingRanges.length === 0) {
    return { isValid: false, reason: 'No availability on this day' };
  }
  
  // Check if proposed time fits within any working range
  const proposedStart = parseTimeToMinutes(dateToTimeString(time));
  const proposedEnd = proposedStart + durationMinutes;
  
  const fitsInRange = workingRanges.some(
    (range) => proposedStart >= range.start && proposedEnd <= range.end
  );
  
  if (!fitsInRange) {
    return { isValid: false, reason: 'Time is outside available hours' };
  }
  
  // Check for partial unavailable overrides
  const partialUnavailable = overrides.filter(
    (o) => formatDateString(o.date) === dateStr && 
           o.type === 'UNAVAILABLE' && 
           o.startTime && o.endTime
  );
  
  const blockedByOverride = partialUnavailable.some((o) => {
    const overrideStart = parseTimeToMinutes(dateToTimeString(o.startTime!));
    const overrideEnd = parseTimeToMinutes(dateToTimeString(o.endTime!));
    return proposedStart < overrideEnd && proposedEnd > overrideStart;
  });
  
  if (blockedByOverride) {
    return { isValid: false, reason: 'Time is blocked by override' };
  }
  
  return { isValid: true };
}

// ===========================================
// Validation Helpers
// ===========================================

/**
 * Validate that rules don't overlap
 */
export function validateRulesNoOverlap(
  rules: Array<{ dayOfWeek: string; startTime: string; endTime: string }>
): { valid: boolean; error?: string } {
  // Group by day
  const byDay = new Map<string, Array<{ start: number; end: number }>>();
  
  for (const rule of rules) {
    const ranges = byDay.get(rule.dayOfWeek) ?? [];
    ranges.push({
      start: parseTimeToMinutes(rule.startTime),
      end: parseTimeToMinutes(rule.endTime),
    });
    byDay.set(rule.dayOfWeek, ranges);
  }
  
  // Check for overlaps within each day
  for (const [day, ranges] of byDay) {
    ranges.sort((a, b) => a.start - b.start);
    
    for (let i = 0; i < ranges.length - 1; i++) {
      if (ranges[i].end > ranges[i + 1].start) {
        return {
          valid: false,
          error: `Overlapping rules on ${day}: ${minutesToTime(ranges[i].start)}-${minutesToTime(ranges[i].end)} overlaps with ${minutesToTime(ranges[i + 1].start)}-${minutesToTime(ranges[i + 1].end)}`,
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Validate date is within booking window
 */
export function validateWithinBookingWindow(
  date: Date,
  settings: AvailabilitySettings
): { valid: boolean; error?: string } {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setHours(minDate.getHours() + settings.minAdvanceHours);
  
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
  
  if (date < minDate) {
    return {
      valid: false,
      error: `Booking requires at least ${settings.minAdvanceHours} hours advance notice`,
    };
  }
  
  if (date > maxDate) {
    return {
      valid: false,
      error: `Booking cannot be more than ${settings.maxAdvanceDays} days in advance`,
    };
  }
  
  return { valid: true };
}
