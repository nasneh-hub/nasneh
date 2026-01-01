/**
 * Auth Types - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 */

import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  PROVIDER = 'provider',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum TrustLevel {
  NEW = 'new',
  BASIC = 'basic',
  VERIFIED = 'verified',
  TRUSTED = 'trusted',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum OtpChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

export enum OtpStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  VERIFIED = 'verified',
}

// ===========================================
// Zod Schemas (Validation)
// ===========================================

/**
 * Phone number validation for Bahrain (+973)
 * Format: +973XXXXXXXX (8 digits after country code)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+973[0-9]{8}$/, 'Invalid Bahrain phone number. Format: +973XXXXXXXX');

/**
 * OTP validation (6 digits)
 */
export const otpSchema = z
  .string()
  .regex(/^[0-9]{6}$/, 'OTP must be 6 digits');

/**
 * Request OTP schema
 */
export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

/**
 * Verify OTP schema
 */
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ===========================================
// TypeScript Types (derived from Zod)
// ===========================================

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ===========================================
// Response Types
// ===========================================

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  /** Channel used for OTP delivery */
  channel: OtpChannel;
  /** Whether fallback was used */
  fallbackUsed: boolean;
  /** Expiry time in seconds */
  expiresIn: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access token expiry in seconds */
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  roles: UserRole[];
  trustLevel: TrustLevel;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  tokens: AuthTokens;
  user: AuthUser;
  /** Whether this is a new user registration */
  isNewUser: boolean;
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: AuthTokens;
}

// ===========================================
// JWT Payload
// ===========================================

export interface JwtPayload {
  userId: string;
  roles: UserRole[];
  phone?: string;
  email?: string | null;
  name?: string | null;
  iat?: number;
  exp?: number;
}

// ===========================================
// OTP Log Entry (for audit)
// ===========================================

export interface OtpLogEntry {
  phone: string;
  channel: OtpChannel;
  status: OtpStatus;
  timestamp: Date;
  fallbackUsed: boolean;
}
