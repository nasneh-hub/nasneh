import { z } from 'zod';

// ===========================================
// Booking Enums (matching Prisma)
// ===========================================

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// ===========================================
// Booking Schemas
// ===========================================

// Address schema for service location
const serviceAddressSchema = z.object({
  addressLine: z.string().min(1).max(200),
  area: z.string().min(1).max(100),
  block: z.string().max(20).optional(),
  road: z.string().max(50).optional(),
  building: z.string().max(50).optional(),
  floor: z.string().max(20).optional(),
  apartment: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format').optional(), // Required for appointment type
  serviceAddress: serviceAddressSchema.optional(), // Required for home services
  notes: z.string().max(1000).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.CONFIRMED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
    BookingStatus.NO_SHOW,
  ]),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// ===========================================
// Query Schemas
// ===========================================

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  providerId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: z.nativeEnum(BookingStatus as Record<string, string>).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type BookingQuery = z.infer<typeof bookingQuerySchema>;

// ===========================================
// Status Transition Rules
// ===========================================

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [], // Terminal state
  [BookingStatus.CANCELLED]: [], // Terminal state
  [BookingStatus.NO_SHOW]: [], // Terminal state
};

export function isValidBookingTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ===========================================
// Response Types
// ===========================================

export interface BookingResponse {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: Date | null;
  endTime: Date | null;
  price: number;
  commission: number;
  total: number;
  status: BookingStatus;
  serviceAddress: {
    addressLine: string;
    area: string;
    block?: string;
    road?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string | null;
    phone: string;
  };
  provider?: {
    id: string;
    businessName: string;
    logoUrl: string | null;
  };
  service?: {
    id: string;
    name: string;
    nameAr: string | null;
    serviceType: string;
    durationMinutes: number | null;
  };
}

export interface PaginatedBookingsResponse {
  data: BookingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===========================================
// Booking Validation Error Codes
// ===========================================

export const BookingErrorCode = {
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  SERVICE_NOT_AVAILABLE: 'SERVICE_NOT_AVAILABLE',
  PROVIDER_NOT_ACTIVE: 'PROVIDER_NOT_ACTIVE',
  OUTSIDE_BOOKING_WINDOW: 'OUTSIDE_BOOKING_WINDOW',
  TIME_NOT_AVAILABLE: 'TIME_NOT_AVAILABLE',
  SLOT_ALREADY_BOOKED: 'SLOT_ALREADY_BOOKED',
  MISSING_TIME_FOR_APPOINTMENT: 'MISSING_TIME_FOR_APPOINTMENT',
  INVALID_DATE: 'INVALID_DATE',
} as const;

export type BookingErrorCodeType = typeof BookingErrorCode[keyof typeof BookingErrorCode];
