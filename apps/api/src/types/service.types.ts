import { z } from 'zod';

// ===========================================
// Service Provider Enums (matching Prisma)
// ===========================================

export const ProviderCategory = {
  HOME: 'HOME',
  PERSONAL: 'PERSONAL',
  PROFESSIONAL: 'PROFESSIONAL',
} as const;

export type ProviderCategory = (typeof ProviderCategory)[keyof typeof ProviderCategory];

export const ProviderStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type ProviderStatus = (typeof ProviderStatus)[keyof typeof ProviderStatus];

export const ServiceType = {
  APPOINTMENT: 'APPOINTMENT',
  DELIVERY_DATE: 'DELIVERY_DATE',
  PICKUP_DROPOFF: 'PICKUP_DROPOFF',
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const ServiceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

// ===========================================
// Service Provider Schemas
// ===========================================

export const createProviderSchema = z.object({
  businessName: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional(),
  category: z.nativeEnum(ProviderCategory as Record<string, string>),
});

export const updateProviderSchema = createProviderSchema.partial();

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

// ===========================================
// Service Schemas
// ===========================================

// Base service schema (common fields)
const baseServiceSchema = z.object({
  name: z.string().min(2).max(100),
  nameAr: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  price: z.number().positive().max(99999.999),
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string().url()).max(10).default([]),
  isAvailable: z.boolean().default(true),
});

// Appointment service (requires duration)
const appointmentServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal(ServiceType.APPOINTMENT),
  durationMinutes: z.number().int().min(15).max(480), // 15 min to 8 hours
  preparationDays: z.undefined().optional(),
});

// Delivery date service (requires preparation days)
const deliveryDateServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal(ServiceType.DELIVERY_DATE),
  durationMinutes: z.undefined().optional(),
  preparationDays: z.number().int().min(0).max(30), // 0 to 30 days
});

// Pickup & dropoff service (no duration or prep days required)
const pickupDropoffServiceSchema = baseServiceSchema.extend({
  serviceType: z.literal(ServiceType.PICKUP_DROPOFF),
  durationMinutes: z.undefined().optional(),
  preparationDays: z.number().int().min(0).max(30).optional(), // Optional processing time
});

// Union of all service types
export const createServiceSchema = z.discriminatedUnion('serviceType', [
  appointmentServiceSchema,
  deliveryDateServiceSchema,
  pickupDropoffServiceSchema,
]);

export const updateServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameAr: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  price: z.number().positive().max(99999.999).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  isAvailable: z.boolean().optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  preparationDays: z.number().int().min(0).max(30).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ===========================================
// Query Schemas
// ===========================================

export const serviceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  providerId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  serviceType: z.nativeEnum(ServiceType as Record<string, string>).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isAvailable: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
});

export type ServiceQuery = z.infer<typeof serviceQuerySchema>;

// ===========================================
// Response Types
// ===========================================

export interface ServiceResponse {
  id: string;
  providerId: string;
  categoryId: string | null;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  serviceType: ServiceType;
  durationMinutes: number | null;
  preparationDays: number | null;
  images: string[];
  isAvailable: boolean;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  provider?: {
    id: string;
    businessName: string;
    logoUrl: string | null;
  };
  category?: {
    id: string;
    name: string;
    nameAr: string | null;
  } | null;
}

export interface PaginatedServicesResponse {
  data: ServiceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
