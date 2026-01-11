/**
 * Auth Service - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 *
 * OTP Flow:
 * 1. Send OTP via WhatsApp (primary)
 * 2. Wait 10 seconds for delivery
 * 3. If failed/timeout → fallback to SMS
 *
 * Token Flow:
 * - Access token: 15 minutes, JWT
 * - Refresh token: 7 days, Redis-stored with rotation
 */

import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import {
  OtpChannel,
  OtpStatus,
  OtpRequestResponse,
  VerifyOtpResponse,
  RefreshTokenResponse,
  AuthTokens,
  AuthUser,
  JwtPayload,
  OtpLogEntry,
  UserRole,
  TrustLevel,
  UserStatus,
} from '../../types/auth.types.js';
import { config } from '../../config/env.js';
import { otpRepository } from './otp.repository.js';
import { tokenRepository, StoredRefreshToken } from './token.repository.js';
import { otpDeliveryService } from './otp-delivery.service.js';
import { prisma } from '../../lib/db.js';

// ===========================================
// In-memory stores (for audit logs only)
// ===========================================

const otpLogs: OtpLogEntry[] = [];

// ===========================================
// Auth Service Class
// ===========================================

export class AuthService {
  /**
   * Generate a 6-digit OTP
   * For staging mock mode with test number +97336000000, returns fixed OTP "123456"
   */
  private generateOtp(phone?: string): string {
    // Fixed OTP for test number in staging mock mode
    if (config.otp.mockEnabled && 
        config.environment === 'staging' && 
        phone === '+97336000000') {
      return '123456';
    }
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate a secure refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate a unique JWT ID for blacklisting
   */
  private generateJti(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Log OTP delivery attempt
   */
  private logOtpDelivery(entry: OtpLogEntry): void {
    otpLogs.push(entry);
    // TODO: Persist to database for audit
    console.log('[OTP Log]', JSON.stringify({
      phone: entry.phone.slice(0, 7) + '****',
      channel: entry.channel,
      status: entry.status,
      fallbackUsed: entry.fallbackUsed,
      timestamp: entry.timestamp.toISOString(),
    }));
  }

  /**
   * Request OTP for phone number
   * Following TECHNICAL_SPEC.md OTP Delivery Channels flow:
   * 1. Send WhatsApp first
   * 2. Wait 10 seconds for delivery
   * 3. If not delivered/failed, fallback to SMS
   */
  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    console.log('[AUTH DEBUG] requestOtp service - Phone received:', phone);
    const otp = this.generateOtp(phone);
    const expiresAt = Date.now() + config.otp.expiryMinutes * 60 * 1000;

    // Use OTP delivery service for WhatsApp → SMS fallback
    console.log(`[OTP] Requesting OTP delivery to ${phone}...`);
    const deliveryResult = await otpDeliveryService.deliver(phone, otp);

    if (!deliveryResult.success) {
      throw new Error('Failed to send OTP. Please try again.');
    }

    await otpRepository.store({
      otp,
      phone,
      expiresAt,
      attempts: 0,
      channel: deliveryResult.channel,
    });

    // Determine response message based on channel
    let message: string;
    if (deliveryResult.channel === OtpChannel.MOCK) {
      message = 'OTP generated and logged (staging mock mode)';
    } else if (deliveryResult.fallbackUsed) {
      message = 'OTP sent via SMS (WhatsApp unavailable)';
    } else {
      message = 'OTP sent via WhatsApp';
    }

    return {
      success: true,
      message,
      channel: deliveryResult.channel,
      fallbackUsed: deliveryResult.fallbackUsed,
      expiresIn: config.otp.expiryMinutes * 60,
    };
  }

  /**
   * Verify OTP and return tokens
   */
  async verifyOtp(
    phone: string,
    otp: string,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<VerifyOtpResponse> {
    const validation = await otpRepository.isValid(phone, otp);

    if (!validation.valid) {
      const error: any = new Error(validation.error);
      error.statusCode = 400; // Client error, not server error
      error.attemptsRemaining = validation.attemptsRemaining;
      throw error;
    }

    await otpRepository.delete(phone);

    const user = await this.getOrCreateUser(phone);
    const tokens = await this.generateTokens(user, metadata);

    this.logOtpDelivery({
      phone,
      channel: validation.stored!.channel,
      status: OtpStatus.VERIFIED,
      timestamp: new Date(),
      fallbackUsed: false,
    });

    return {
      success: true,
      message: 'Phone verified successfully',
      user,
      tokens,
      isNewUser: user.createdAt === user.updatedAt,
    };
  }

  /**
   * Verify access token and return payload
   * Also checks if token is blacklisted
   */
  verifyAccessToken(token: string): JwtPayload {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Note: For async blacklist check, use verifyAccessTokenAsync
    return payload;
  }

  /**
   * Verify access token with async blacklist check
   */
  async verifyAccessTokenAsync(token: string): Promise<JwtPayload> {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Check if token is blacklisted (for logout)
    if (payload.jti) {
      const isBlacklisted = await tokenRepository.isAccessTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
    }

    return payload;
  }

  /**
   * Refresh access token using refresh token
   * Implements token rotation: old token is invalidated
   */
  async refreshToken(
    refreshToken: string,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<RefreshTokenResponse> {
    // Validate refresh token
    const storedToken = await tokenRepository.validate(refreshToken);

    if (!storedToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.getUserById(storedToken.userId);

    if (!user) {
      await tokenRepository.revoke(refreshToken);
      throw new Error('User not found');
    }

    // Token rotation: revoke old token before generating new one
    await tokenRepository.revoke(refreshToken);

    // Generate new tokens
    const tokens = await this.generateTokens(user, metadata);

    return {
      success: true,
      tokens,
    };
  }

  /**
   * Logout - invalidate refresh token and blacklist access token
   */
  async logout(refreshToken: string, accessTokenJti?: string): Promise<void> {
    // Revoke refresh token
    await tokenRepository.revoke(refreshToken);

    // Blacklist access token if JTI provided
    if (accessTokenJti) {
      await tokenRepository.blacklistAccessToken(accessTokenJti);
    }
  }

  /**
   * Logout from all devices - revoke all refresh tokens for user
   */
  async logoutAll(userId: string): Promise<{ revokedCount: number }> {
    const revokedCount = await tokenRepository.revokeAllForUser(userId);
    return { revokedCount };
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<StoredRefreshToken[]> {
    return tokenRepository.getUserSessions(userId);
  }

  /**
   * Generate JWT access token and refresh token
   * Stores refresh token in Redis with 7-day TTL
   */
  private async generateTokens(
    user: AuthUser,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<AuthTokens> {
    const jti = this.generateJti();

    const payload: JwtPayload = {
      userId: user.id,
      roles: user.roles,
      jti,
    };

    const signOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as `${number}m`,
    };

    const accessToken = jwt.sign(
      payload as object,
      config.jwt.secret,
      signOptions
    );

    const refreshToken = this.generateRefreshToken();

    // Store refresh token in Redis with metadata
    await tokenRepository.store(refreshToken, user.id, metadata);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Get or create user by phone
   * TODO: Replace with Prisma implementation
   */
  private async getOrCreateUser(phone: string): Promise<AuthUser> {
    console.log('[AUTH DEBUG] getOrCreateUser - Looking up phone:', phone);
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { phone },
    });
    console.log('[AUTH DEBUG] getOrCreateUser - User found:', user ? `YES (ID: ${user.id}, Role: ${user.role})` : 'NO - will create new');

    // If user doesn't exist, create new customer
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'CUSTOMER',
          status: 'VERIFIED',
        },
      });
    }

    // Map Prisma user to AuthUser
    return {
      id: user.id,
      phone: user.phone,
      roles: [user.role as UserRole],
      status: user.status === 'VERIFIED' ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
      trustLevel: TrustLevel.BASIC,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user by ID
   * TODO: Replace with Prisma implementation
   */
  private async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Map Prisma user to AuthUser
    return {
      id: user.id,
      phone: user.phone,
      roles: [user.role as UserRole],
      status: user.status === 'VERIFIED' ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
      trustLevel: TrustLevel.BASIC,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
