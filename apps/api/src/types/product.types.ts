/**
 * Product Types - Nasneh API
 * Following TECHNICAL_SPEC.md data models
 */

import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const VendorCategory = {
  HOME_KITCHEN: 'HOME_KITCHEN',
  CRAFTS: 'CRAFTS',
  MARKET: 'MARKET',
  FOOD_TRUCK: 'FOOD_TRUCK',
} as const;

export type VendorCategory = (typeof VendorCategory)[keyof typeof VendorCategory];

export const VendorStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type VendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];

export const SubscriptionPlan = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

// ===========================================
// Validation Schemas
// ===========================================

// Price validation: BHD uses 3 decimal places
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .multipleOf(0.001, 'Price must have at most 3 decimal places');

// Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  descriptionAr: z.string().max(5000).optional(),
  price: priceSchema,
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string().url()).max(10).default([]),
  isAvailable: z.boolean().default(true),
});

// Product update schema
export const updateProductSchema = createProductSchema.partial();

// Product query schema
export const productQuerySchema = z.object({
  vendorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus as any).optional(),
  isAvailable: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'price', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// Types
// ===========================================

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

// Product response type
export interface ProductResponse {
  id: string;
  vendorId: string;
  categoryId: string | null;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: string; // Decimal as string for precision
  images: string[];
  isAvailable: boolean;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  vendor?: {
    id: string;
    storeName: string;
    logoUrl: string | null;
  };
  category?: {
    id: string;
    name: string;
    nameAr: string | null;
    slug: string;
  } | null;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
