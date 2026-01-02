/**
 * Address Types
 * 
 * Types and schemas for address management.
 * Based on existing Address model in Prisma schema.
 */

import { z } from 'zod';

// ===========================================
// Address Schemas
// ===========================================

/**
 * Create address schema
 */
export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50, 'Label must be at most 50 characters'),
  addressLine: z.string().min(1, 'Address line is required').max(200, 'Address line must be at most 200 characters'),
  area: z.string().min(1, 'Area is required').max(100, 'Area must be at most 100 characters'),
  block: z.string().max(20).optional().nullable(),
  road: z.string().max(50).optional().nullable(),
  building: z.string().max(50).optional().nullable(),
  floor: z.string().max(20).optional().nullable(),
  apartment: z.string().max(20).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

/**
 * Update address schema
 */
export const updateAddressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  addressLine: z.string().min(1).max(200).optional(),
  area: z.string().min(1).max(100).optional(),
  block: z.string().max(20).optional().nullable(),
  road: z.string().max(50).optional().nullable(),
  building: z.string().max(50).optional().nullable(),
  floor: z.string().max(20).optional().nullable(),
  apartment: z.string().max(20).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

// ===========================================
// Response Types
// ===========================================

/**
 * Address response
 */
export interface AddressResponse {
  id: string;
  userId: string;
  label: string;
  addressLine: string;
  area: string;
  block: string | null;
  road: string | null;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Error Codes
// ===========================================

export const AddressErrorCode = {
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CANNOT_DELETE_DEFAULT: 'CANNOT_DELETE_DEFAULT',
} as const;

export type AddressErrorCode = typeof AddressErrorCode[keyof typeof AddressErrorCode];
