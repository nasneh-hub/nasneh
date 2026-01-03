/**
 * Availability Service
 * 
 * Provides availability management and conflict detection for bookings.
 * Exposes hooks for the bookings module to prevent double-booking.
 */

import { prisma } from '../../lib/db.js';
import {
  availabilityRulesRepository,
  availabilityOverridesRepository,
  availabilitySettingsRepository,
} from './availability.repository.js';
import {
  generateAvailability,
  generateDateAvailability,
  checkBookingConflict,
  checkWithinAvailableHours,
  validateWithinBookingWindow,
  validateRulesNoOverlap,
  timeStringToDate,
  formatDateString,
} from '../../lib/availability-engine.js';
import type {
  CreateAvailabilityRuleInput,
  UpdateAvailabilityRuleInput,
  CreateAvailabilityOverrideInput,
  UpdateAvailabilityOverrideInput,
  UpdateAvailabilitySettingsInput,
  GetSlotsQueryInput,
  AvailabilityResponse,
  DateRangeAvailability,
} from '../../types/availability.types.js';
import type * as PrismaTypes from '@prisma/client';

type PrismaDayOfWeek = PrismaTypes.DayOfWeek;
type PrismaOverrideType = PrismaTypes.OverrideType;

// ===========================================
// Error Classes
// ===========================================

export class AvailabilityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvailabilityNotFoundError';
  }
}

export class AvailabilityConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvailabilityConflictError';
  }
}

export class AvailabilityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvailabilityValidationError';
  }
}

// ===========================================
// Booking Conflict Validation Types
// ===========================================

/**
 * Result of checking for booking conflicts when modifying availability
 */
export interface BookingConflictCheckResult {
  hasConflicts: boolean;
  conflictCount: number;
  reason?: string;
}

/**
 * Active booking statuses that should block availability changes
 */
const ACTIVE_BOOKING_STATUSES = ['CONFIRMED', 'IN_PROGRESS'] as const;

// ===========================================
// Booking Conflict Validation Functions
// ===========================================

/**
 * Check if deleting/modifying a rule would conflict with existing bookings
 * Returns count of conflicting bookings (CONFIRMED or IN_PROGRESS)
 */
export async function checkRuleConflictsWithBookings(
  providerId: string,
  dayOfWeek: PrismaDayOfWeek,
  options?: {
    excludeRuleId?: string;
    newStartTime?: Date;
    newEndTime?: Date;
  }
): Promise<BookingConflictCheckResult> {
  // Find all future bookings on this day of week that are CONFIRMED or IN_PROGRESS
  const now = new Date();
  
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      scheduledDate: { gte: now },
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
    select: {
      id: true,
      scheduledDate: true,
      scheduledTime: true,
    },
  });
  
  // Filter to only bookings on the affected day of week
  const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(dayOfWeek);
  const affectedBookings = conflictingBookings.filter((b) => {
    const bookingDayIndex = b.scheduledDate.getUTCDay();
    return bookingDayIndex === dayIndex;
  });
  
  if (affectedBookings.length === 0) {
    return { hasConflicts: false, conflictCount: 0 };
  }
  
  return {
    hasConflicts: true,
    conflictCount: affectedBookings.length,
    reason: `Cannot modify availability: ${affectedBookings.length} active booking(s) on ${dayOfWeek}`,
  };
}

/**
 * Check if deleting/modifying an override would conflict with existing bookings
 * Returns count of conflicting bookings (CONFIRMED or IN_PROGRESS)
 */
export async function checkOverrideConflictsWithBookings(
  providerId: string,
  date: Date
): Promise<BookingConflictCheckResult> {
  const dateStr = formatDateString(date);
  const startOfDay = new Date(dateStr + 'T00:00:00Z');
  const endOfDay = new Date(dateStr + 'T23:59:59Z');
  
  const conflictingBookings = await prisma.booking.count({
    where: {
      providerId,
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
  });
  
  if (conflictingBookings === 0) {
    return { hasConflicts: false, conflictCount: 0 };
  }
  
  return {
    hasConflicts: true,
    conflictCount: conflictingBookings,
    reason: `Cannot modify availability: ${conflictingBookings} active booking(s) on ${dateStr}`,
  };
}

/**
 * Check if bulk rule update would conflict with existing bookings
 * Compares new rules against existing bookings
 */
export async function checkBulkRulesConflictsWithBookings(
  providerId: string,
  newRules: CreateAvailabilityRuleInput[]
): Promise<BookingConflictCheckResult> {
  const now = new Date();
  
  // Get all future active bookings
  const activeBookings = await prisma.booking.findMany({
    where: {
      providerId,
      scheduledDate: { gte: now },
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
    select: {
      id: true,
      scheduledDate: true,
      scheduledTime: true,
    },
  });
  
  if (activeBookings.length === 0) {
    return { hasConflicts: false, conflictCount: 0 };
  }
  
  // Build a map of which days have rules in the new schedule
  const newRulesByDay = new Map<string, CreateAvailabilityRuleInput[]>();
  for (const rule of newRules) {
    const existing = newRulesByDay.get(rule.dayOfWeek) || [];
    existing.push(rule);
    newRulesByDay.set(rule.dayOfWeek, existing);
  }
  
  // Check each booking against the new rules
  let conflictCount = 0;
  for (const booking of activeBookings) {
    const dayIndex = booking.scheduledDate.getUTCDay();
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dayIndex];
    const dayRules = newRulesByDay.get(dayOfWeek) || [];
    
    // If no rules for this day, it's a conflict
    if (dayRules.length === 0) {
      conflictCount++;
      continue;
    }
    
    // If booking has a specific time, check if it falls within any rule
    if (booking.scheduledTime) {
      const bookingMinutes = booking.scheduledTime.getUTCHours() * 60 + booking.scheduledTime.getUTCMinutes();
      const withinAnyRule = dayRules.some((rule) => {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        const ruleStart = startH * 60 + startM;
        const ruleEnd = endH * 60 + endM;
        return bookingMinutes >= ruleStart && bookingMinutes < ruleEnd;
      });
      
      if (!withinAnyRule) {
        conflictCount++;
      }
    }
  }
  
  if (conflictCount === 0) {
    return { hasConflicts: false, conflictCount: 0 };
  }
  
  return {
    hasConflicts: true,
    conflictCount,
    reason: `Cannot update availability: ${conflictCount} active booking(s) would be outside new schedule`,
  };
}

// ===========================================
// Availability Rules Service
// ===========================================

export async function createAvailabilityRule(
  providerId: string,
  input: CreateAvailabilityRuleInput
) {
  // Check for overlapping rules
  const startTime = timeStringToDate('1970-01-01', input.startTime);
  const endTime = timeStringToDate('1970-01-01', input.endTime);
  
  const overlapping = await availabilityRulesRepository.findOverlapping(
    providerId,
    input.dayOfWeek as PrismaDayOfWeek,
    startTime,
    endTime
  );
  
  if (overlapping.length > 0) {
    throw new AvailabilityConflictError(
      `Rule overlaps with existing rule on ${input.dayOfWeek}`
    );
  }
  
  return availabilityRulesRepository.create({
    providerId,
    dayOfWeek: input.dayOfWeek as PrismaDayOfWeek,
    startTime,
    endTime,
    isActive: input.isActive,
  });
}

export async function createBulkAvailabilityRules(
  providerId: string,
  rules: CreateAvailabilityRuleInput[],
  options?: { skipConflictCheck?: boolean }
) {
  // Validate no overlaps in the input
  const validation = validateRulesNoOverlap(rules);
  if (!validation.valid) {
    throw new AvailabilityValidationError(validation.error!);
  }
  
  // Check for booking conflicts unless explicitly skipped
  if (!options?.skipConflictCheck) {
    const conflictCheck = await checkBulkRulesConflictsWithBookings(providerId, rules);
    if (conflictCheck.hasConflicts) {
      throw new AvailabilityConflictError(conflictCheck.reason!);
    }
  }
  
  // Delete existing rules and create new ones
  await prisma.$transaction(async (tx) => {
    // Delete all existing rules for this provider
    await tx.availabilityRule.deleteMany({
      where: { providerId },
    });
    
    // Create new rules
    const rulesData = rules.map((rule) => ({
      providerId,
      dayOfWeek: rule.dayOfWeek as PrismaDayOfWeek,
      startTime: timeStringToDate('1970-01-01', rule.startTime),
      endTime: timeStringToDate('1970-01-01', rule.endTime),
      isActive: rule.isActive ?? true,
    }));
    
    await tx.availabilityRule.createMany({ data: rulesData });
  });
  
  return availabilityRulesRepository.findByProvider(providerId, false);
}

export async function getAvailabilityRules(providerId: string, activeOnly = false) {
  return availabilityRulesRepository.findByProvider(providerId, activeOnly);
}

export async function updateAvailabilityRule(
  ruleId: string,
  providerId: string,
  input: UpdateAvailabilityRuleInput
) {
  const rule = await availabilityRulesRepository.findById(ruleId);
  
  if (!rule || rule.providerId !== providerId) {
    throw new AvailabilityNotFoundError('Availability rule not found');
  }
  
  const updateData: Parameters<typeof availabilityRulesRepository.update>[1] = {};
  
  if (input.startTime !== undefined) {
    updateData.startTime = timeStringToDate('1970-01-01', input.startTime);
  }
  if (input.endTime !== undefined) {
    updateData.endTime = timeStringToDate('1970-01-01', input.endTime);
  }
  if (input.isActive !== undefined) {
    updateData.isActive = input.isActive;
  }
  
  // Check for overlaps if times are being updated
  if (updateData.startTime || updateData.endTime) {
    const newStartTime = updateData.startTime ?? rule.startTime;
    const newEndTime = updateData.endTime ?? rule.endTime;
    
    const overlapping = await availabilityRulesRepository.findOverlapping(
      providerId,
      rule.dayOfWeek,
      newStartTime,
      newEndTime,
      ruleId
    );
    
    if (overlapping.length > 0) {
      throw new AvailabilityConflictError(
        `Updated rule would overlap with existing rule on ${rule.dayOfWeek}`
      );
    }
  }
  
  return availabilityRulesRepository.update(ruleId, updateData);
}

export async function deleteAvailabilityRule(
  ruleId: string,
  providerId: string,
  options?: { skipConflictCheck?: boolean }
) {
  const rule = await availabilityRulesRepository.findById(ruleId);
  
  if (!rule || rule.providerId !== providerId) {
    throw new AvailabilityNotFoundError('Availability rule not found');
  }
  
  // Check for booking conflicts unless explicitly skipped
  if (!options?.skipConflictCheck) {
    const conflictCheck = await checkRuleConflictsWithBookings(providerId, rule.dayOfWeek);
    if (conflictCheck.hasConflicts) {
      throw new AvailabilityConflictError(conflictCheck.reason!);
    }
  }
  
  return availabilityRulesRepository.delete(ruleId);
}

// ===========================================
// Availability Overrides Service
// ===========================================

export async function createAvailabilityOverride(
  providerId: string,
  input: CreateAvailabilityOverrideInput
) {
  const date = new Date(input.date);
  
  return availabilityOverridesRepository.create({
    providerId,
    date,
    type: input.type as PrismaOverrideType,
    startTime: input.startTime ? timeStringToDate('1970-01-01', input.startTime) : null,
    endTime: input.endTime ? timeStringToDate('1970-01-01', input.endTime) : null,
    reason: input.reason ?? null,
  });
}

export async function getAvailabilityOverrides(
  providerId: string,
  startDate: string,
  endDate: string
) {
  return availabilityOverridesRepository.findByProviderAndDateRange(
    providerId,
    new Date(startDate),
    new Date(endDate)
  );
}

export async function updateAvailabilityOverride(
  overrideId: string,
  providerId: string,
  input: UpdateAvailabilityOverrideInput
) {
  const override = await availabilityOverridesRepository.findById(overrideId);
  
  if (!override || override.providerId !== providerId) {
    throw new AvailabilityNotFoundError('Availability override not found');
  }
  
  const updateData: Parameters<typeof availabilityOverridesRepository.update>[1] = {};
  
  if (input.type !== undefined) {
    updateData.type = input.type as PrismaOverrideType;
  }
  if (input.startTime !== undefined) {
    updateData.startTime = input.startTime ? timeStringToDate('1970-01-01', input.startTime) : null;
  }
  if (input.endTime !== undefined) {
    updateData.endTime = input.endTime ? timeStringToDate('1970-01-01', input.endTime) : null;
  }
  if (input.reason !== undefined) {
    updateData.reason = input.reason;
  }
  
  return availabilityOverridesRepository.update(overrideId, updateData);
}

export async function deleteAvailabilityOverride(
  overrideId: string,
  providerId: string,
  options?: { skipConflictCheck?: boolean }
) {
  const override = await availabilityOverridesRepository.findById(overrideId);
  
  if (!override || override.providerId !== providerId) {
    throw new AvailabilityNotFoundError('Availability override not found');
  }
  
  // Check for booking conflicts when deleting AVAILABLE overrides
  // (deleting an AVAILABLE override removes special hours, potentially affecting bookings)
  // UNAVAILABLE overrides (blocked dates) can be safely deleted as they only add restrictions
  if (!options?.skipConflictCheck && override.type === 'AVAILABLE') {
    const conflictCheck = await checkOverrideConflictsWithBookings(providerId, override.date);
    if (conflictCheck.hasConflicts) {
      throw new AvailabilityConflictError(conflictCheck.reason!);
    }
  }
  
  return availabilityOverridesRepository.delete(overrideId);
}

// ===========================================
// Availability Settings Service
// ===========================================

export async function getAvailabilitySettings(providerId: string) {
  return availabilitySettingsRepository.getOrCreate(providerId);
}

export async function updateAvailabilitySettings(
  providerId: string,
  input: UpdateAvailabilitySettingsInput
) {
  return availabilitySettingsRepository.update(providerId, input);
}

// ===========================================
// Slot Generation Service
// ===========================================

export async function getAvailableSlots(
  providerId: string,
  query: GetSlotsQueryInput
): Promise<AvailabilityResponse> {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  
  // Get provider data
  const [rules, overrides, settings] = await Promise.all([
    availabilityRulesRepository.findByProvider(providerId, true),
    availabilityOverridesRepository.findByProviderAndDateRange(providerId, startDate, endDate),
    availabilitySettingsRepository.getOrCreate(providerId),
  ]);
  
  // Get existing bookings in the date range
  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
    select: {
      scheduledDate: true,
      scheduledTime: true,
      endTime: true,
    },
  });
  
  // Get service duration if serviceId provided
  let serviceDurationMinutes: number | undefined;
  if (query.serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: query.serviceId },
      select: { durationMinutes: true },
    });
    serviceDurationMinutes = service?.durationMinutes ?? undefined;
  }
  
  return generateAvailability(startDate, endDate, providerId, {
    rules,
    overrides,
    settings,
    existingBookings,
    serviceDurationMinutes,
  });
}

export async function getAvailableDates(
  providerId: string,
  startDate: string,
  endDate: string,
  preparationDays?: number
): Promise<DateRangeAvailability> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const [rules, overrides, settings] = await Promise.all([
    availabilityRulesRepository.findByProvider(providerId, true),
    availabilityOverridesRepository.findByProviderAndDateRange(providerId, start, end),
    availabilitySettingsRepository.getOrCreate(providerId),
  ]);
  
  return generateDateAvailability(start, end, providerId, {
    rules,
    overrides,
    settings,
    preparationDays,
  });
}

// ===========================================
// Conflict Detection Hooks (for Bookings Module)
// ===========================================

/**
 * Check if a proposed booking conflicts with existing bookings
 * This is the main hook used by the bookings module
 */
export async function checkBookingAvailability(
  providerId: string,
  serviceId: string,
  scheduledDate: Date,
  scheduledTime: Date | null
): Promise<{ available: boolean; reason?: string }> {
  // Get service details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      serviceType: true,
      durationMinutes: true,
      preparationDays: true,
    },
  });
  
  if (!service) {
    return { available: false, reason: 'Service not found' };
  }
  
  // Get availability data
  const [rules, overrides, settings] = await Promise.all([
    availabilityRulesRepository.findByProvider(providerId, true),
    availabilityOverridesRepository.findByProviderAndDateRange(
      providerId,
      scheduledDate,
      scheduledDate
    ),
    availabilitySettingsRepository.getOrCreate(providerId),
  ]);
  
  // Validate within booking window
  const windowCheck = validateWithinBookingWindow(scheduledDate, settings);
  if (!windowCheck.valid) {
    return { available: false, reason: windowCheck.error };
  }
  
  // For APPOINTMENT type, check time availability
  if (service.serviceType === 'APPOINTMENT' && scheduledTime) {
    const durationMinutes = service.durationMinutes ?? settings.slotDurationMinutes;
    
    // Check within available hours
    const hoursCheck = checkWithinAvailableHours(
      scheduledDate,
      scheduledTime,
      durationMinutes,
      rules,
      overrides
    );
    
    if (!hoursCheck.isValid) {
      return { available: false, reason: hoursCheck.reason };
    }
    
    // Check for booking conflicts
    const existingBookings = await prisma.booking.findMany({
      where: {
        providerId,
        scheduledDate,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        endTime: true,
      },
    });
    
    const conflictCheck = checkBookingConflict(
      scheduledDate,
      scheduledTime,
      durationMinutes,
      existingBookings,
      settings.bufferBeforeMinutes,
      settings.bufferAfterMinutes
    );
    
    if (conflictCheck.hasConflict) {
      return { available: false, reason: conflictCheck.reason };
    }
  }
  
  // For DELIVERY_DATE and PICKUP_DROPOFF, check date availability
  if (service.serviceType === 'DELIVERY_DATE' || service.serviceType === 'PICKUP_DROPOFF') {
    const dateStr = formatDateString(scheduledDate);
    const dateAvailability = await getAvailableDates(
      providerId,
      dateStr,
      dateStr,
      service.preparationDays ?? 0
    );
    
    const dateInfo = dateAvailability.dates[0];
    if (!dateInfo?.available) {
      return { available: false, reason: dateInfo?.reason ?? 'Date not available' };
    }
  }
  
  return { available: true };
}

/**
 * Get the next available slot for a service
 * Useful for suggesting alternative times when a slot is unavailable
 */
export async function getNextAvailableSlot(
  providerId: string,
  serviceId: string,
  afterDate?: Date
): Promise<{ date: string; startTime: string; endTime: string } | null> {
  const startDate = afterDate ?? new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30); // Look 30 days ahead
  
  const availability = await getAvailableSlots(providerId, {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
    serviceId,
  });
  
  for (const day of availability.days) {
    const availableSlot = day.slots.find((s) => s.available);
    if (availableSlot) {
      return {
        date: day.date,
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime,
      };
    }
  }
  
  return null;
}
