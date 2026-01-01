/**
 * Calendar/Availability Default Configuration
 * 
 * MVP defaults for provider availability settings.
 * These are used when creating new provider settings (AvailabilitySettings).
 * 
 * Priority order:
 * 1. Provider settings (DB) - highest priority, set via PATCH /provider/calendar/settings
 * 2. These config defaults - used when creating new settings
 * 
 * NOTE: Not in repo/docs - MVP assumptions documented in TECHNICAL_SPEC.md
 * 
 * Environment variable overrides are optional - safe defaults are provided.
 */

/**
 * Default timezone for Bahrain region
 * Override: CALENDAR_DEFAULT_TIMEZONE
 */
export const DEFAULT_TIMEZONE = process.env.CALENDAR_DEFAULT_TIMEZONE || 'Asia/Bahrain';

/**
 * Default slot duration in minutes (15-480)
 * Override: CALENDAR_DEFAULT_SLOT_DURATION_MINUTES
 */
export const DEFAULT_SLOT_DURATION_MINUTES = parseInt(
  process.env.CALENDAR_DEFAULT_SLOT_DURATION_MINUTES || '30',
  10
);

/**
 * Default buffer time before booking in minutes (0-120)
 * Override: CALENDAR_DEFAULT_BUFFER_BEFORE_MINUTES
 */
export const DEFAULT_BUFFER_BEFORE_MINUTES = parseInt(
  process.env.CALENDAR_DEFAULT_BUFFER_BEFORE_MINUTES || '0',
  10
);

/**
 * Default buffer time after booking in minutes (0-120)
 * Override: CALENDAR_DEFAULT_BUFFER_AFTER_MINUTES
 */
export const DEFAULT_BUFFER_AFTER_MINUTES = parseInt(
  process.env.CALENDAR_DEFAULT_BUFFER_AFTER_MINUTES || '0',
  10
);

/**
 * Default minimum advance booking time in hours (0-168)
 * Override: CALENDAR_DEFAULT_MIN_ADVANCE_HOURS
 */
export const DEFAULT_MIN_ADVANCE_HOURS = parseInt(
  process.env.CALENDAR_DEFAULT_MIN_ADVANCE_HOURS || '24',
  10
);

/**
 * Default maximum advance booking time in days (1-365)
 * Override: CALENDAR_DEFAULT_MAX_ADVANCE_DAYS
 */
export const DEFAULT_MAX_ADVANCE_DAYS = parseInt(
  process.env.CALENDAR_DEFAULT_MAX_ADVANCE_DAYS || '30',
  10
);

/**
 * All calendar defaults as a single object
 * Used by availability.repository.ts when creating new settings
 */
export const calendarDefaults = {
  timezone: DEFAULT_TIMEZONE,
  slotDurationMinutes: DEFAULT_SLOT_DURATION_MINUTES,
  bufferBeforeMinutes: DEFAULT_BUFFER_BEFORE_MINUTES,
  bufferAfterMinutes: DEFAULT_BUFFER_AFTER_MINUTES,
  minAdvanceHours: DEFAULT_MIN_ADVANCE_HOURS,
  maxAdvanceDays: DEFAULT_MAX_ADVANCE_DAYS,
} as const;

export type CalendarDefaults = typeof calendarDefaults;
