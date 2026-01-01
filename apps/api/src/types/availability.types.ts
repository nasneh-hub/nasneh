import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const DayOfWeek = {
  SUNDAY: 'SUNDAY',
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const OverrideType = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type OverrideType = (typeof OverrideType)[keyof typeof OverrideType];

// Day of week index (0 = Sunday, 6 = Saturday)
export const DAY_OF_WEEK_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const INDEX_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

// ===========================================
// Time Validation Helpers
// ===========================================

// Time format: HH:MM (24-hour)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const timeSchema = z.string().regex(timeRegex, 'Invalid time format. Use HH:MM (24-hour)');

// ===========================================
// Availability Rule Schemas
// ===========================================

export const createAvailabilityRuleSchema = z.object({
  dayOfWeek: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: timeSchema,
  endTime: timeSchema,
  isActive: z.boolean().optional().default(true),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  { message: 'End time must be after start time' }
);

export type CreateAvailabilityRuleInput = z.infer<typeof createAvailabilityRuleSchema>;

export const updateAvailabilityRuleSchema = z.object({
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    }
    return true;
  },
  { message: 'End time must be after start time' }
);

export type UpdateAvailabilityRuleInput = z.infer<typeof updateAvailabilityRuleSchema>;

// Bulk update schema
export const bulkAvailabilityRulesSchema = z.object({
  rules: z.array(createAvailabilityRuleSchema),
});

export type BulkAvailabilityRulesInput = z.infer<typeof bulkAvailabilityRulesSchema>;

// ===========================================
// Availability Override Schemas
// ===========================================

export const createAvailabilityOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  type: z.enum(['AVAILABLE', 'UNAVAILABLE']),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  reason: z.string().max(255).optional(),
}).refine(
  (data) => {
    // If type is AVAILABLE and times are provided, validate them
    if (data.type === 'AVAILABLE' && data.startTime && data.endTime) {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    }
    return true;
  },
  { message: 'End time must be after start time' }
);

export type CreateAvailabilityOverrideInput = z.infer<typeof createAvailabilityOverrideSchema>;

export const updateAvailabilityOverrideSchema = z.object({
  type: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  reason: z.string().max(255).nullable().optional(),
});

export type UpdateAvailabilityOverrideInput = z.infer<typeof updateAvailabilityOverrideSchema>;

// ===========================================
// Availability Settings Schemas
// ===========================================

// Valid IANA timezones for Bahrain region
const validTimezones = [
  'Asia/Bahrain',
  'Asia/Dubai',
  'Asia/Qatar',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'UTC',
] as const;

export const updateAvailabilitySettingsSchema = z.object({
  timezone: z.string().refine(
    (tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid timezone' }
  ).optional(),
  slotDurationMinutes: z.number().int().min(15).max(480).optional(), // 15 min to 8 hours
  bufferBeforeMinutes: z.number().int().min(0).max(120).optional(), // 0 to 2 hours
  bufferAfterMinutes: z.number().int().min(0).max(120).optional(),
  minAdvanceHours: z.number().int().min(0).max(168).optional(), // 0 to 7 days
  maxAdvanceDays: z.number().int().min(1).max(365).optional(), // 1 to 365 days
});

export type UpdateAvailabilitySettingsInput = z.infer<typeof updateAvailabilitySettingsSchema>;

// ===========================================
// Slot Query Schemas
// ===========================================

export const getSlotsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  serviceId: z.string().uuid().optional(), // If provided, uses service duration
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  { message: 'End date must be on or after start date' }
).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90; // Max 90 days range
  },
  { message: 'Date range cannot exceed 90 days' }
);

export type GetSlotsQueryInput = z.infer<typeof getSlotsQuerySchema>;

// ===========================================
// Response Types
// ===========================================

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  available: boolean;
  reason?: string; // Why unavailable (e.g., "Booked", "Outside hours", "Override")
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  available: boolean;
  slots: TimeSlot[];
  override?: {
    type: OverrideType;
    reason?: string;
  };
}

export interface AvailabilityResponse {
  providerId: string;
  timezone: string;
  days: DayAvailability[];
}

// For DELIVERY_DATE and PICKUP_DROPOFF service types
export interface DateAvailability {
  date: string; // YYYY-MM-DD
  available: boolean;
  reason?: string;
}

export interface DateRangeAvailability {
  providerId: string;
  timezone: string;
  dates: DateAvailability[];
}
