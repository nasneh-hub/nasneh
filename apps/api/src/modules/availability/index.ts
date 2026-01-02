/**
 * Availability Module
 * 
 * Exports:
 * - Routes for provider calendar management
 * - Service functions for availability checking (used by bookings module)
 */

// Routes
export { providerCalendarRouter, getServiceSlots } from './availability.routes.js';

// Service functions (for bookings integration)
export {
  checkBookingAvailability,
  getNextAvailableSlot,
  getAvailableSlots,
  getAvailableDates,
  AvailabilityNotFoundError,
  AvailabilityConflictError,
  AvailabilityValidationError,
  // Conflict validation (for availability management)
  checkRuleConflictsWithBookings,
  checkOverrideConflictsWithBookings,
  checkBulkRulesConflictsWithBookings,
  type BookingConflictCheckResult,
} from './availability.service.js';

// Repository (for advanced use cases)
export {
  availabilityRulesRepository,
  availabilityOverridesRepository,
  availabilitySettingsRepository,
} from './availability.repository.js';
