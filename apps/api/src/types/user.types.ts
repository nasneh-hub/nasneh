/**
 * User Profile Types
 * 
 * Types and schemas for user profile CRUD operations.
 * Based on existing User model in Prisma schema.
 */

import { z } from 'zod';

// ===========================================
// User Role (from Prisma schema)
// ===========================================

export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  PROVIDER: 'PROVIDER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ===========================================
// User Status (from Prisma schema)
// ===========================================

export const UserStatus = {
  BASIC: 'BASIC',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// ===========================================
// Profile Schemas
// ===========================================

/**
 * Update profile schema
 * Only allows updating user-editable fields
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  avatarUrl: z.string().url('Invalid URL format').optional().nullable(),
  preferredLang: z.enum(['en', 'ar']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Admin update user schema
 * Allows admins to update additional fields
 */
export const adminUpdateUserSchema = updateProfileSchema.extend({
  role: z.nativeEnum(UserRole as Record<string, string>).optional(),
  status: z.nativeEnum(UserStatus as Record<string, string>).optional(),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

// ===========================================
// Response Types
// ===========================================

/**
 * User profile response (excludes sensitive data)
 */
export interface UserProfileResponse {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  preferredLang: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated users response (for admin listing)
 */
export interface PaginatedUsersResponse {
  data: UserProfileResponse[];
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
// Query Schemas
// ===========================================

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole as Record<string, string>).optional(),
  status: z.nativeEnum(UserStatus as Record<string, string>).optional(),
  search: z.string().min(1).max(100).optional(), // Search by name, email, or phone
});

export type UserQuery = z.infer<typeof userQuerySchema>;

// ===========================================
// Error Codes
// ===========================================

export const ProfileErrorCode = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  CANNOT_UPDATE_OWN_ROLE: 'CANNOT_UPDATE_OWN_ROLE',
  CANNOT_SUSPEND_SELF: 'CANNOT_SUSPEND_SELF',
} as const;

export type ProfileErrorCode = typeof ProfileErrorCode[keyof typeof ProfileErrorCode];
