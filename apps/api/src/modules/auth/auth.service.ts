/**
 * Auth Service - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 *
 * OTP Flow:
 * 1. Send OTP via WhatsApp (primary)
 * 2. Wait 10 seconds for delivery
 * 3. If failed/timeout → fallback to SMS
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
} from '../../types/auth.types';
import { config } from '../../config/env';
import { otpRepository } from './otp.repository';
import { otpDeliveryService } from './otp-delivery.service';

// ===========================================
// In-memory stores (replace with DB in production)
// ===========================================

// Temporary in-memory storage for refresh tokens (will be replaced with Redis)
const refreshTokenStore = new Map<string, string>(); // token -> userId
const otpLogs: OtpLogEntry[] = [];

// ===========================================
// Auth Service Class
// ===========================================

export class AuthService {
  /**
   * Generate a 6-digit OTP
   */
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate a secure refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Log OTP delivery attempt
   */
  private logOtpDelivery(entry: OtpLogEntry): void {
    otpLogs.push(entry);
    // TODO: Persist to database for audit
    console.log('[OTP Log]', JSON.stringify(entry));
  }

  /**
   * Request OTP for phone number
   * Following TECHNICAL_SPEC.md OTP Delivery Channels flow:
   * 1. Send WhatsApp first
   * 2. Wait 10 seconds for delivery
   * 3. If not delivered/failed, fallback to SMS
   */
  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    const otp = this.generateOtp();
    const expiresAt = Date.now() + config.otp.expiryMinutes * 60 * 1000;

    // Use OTP delivery service for WhatsApp → SMS fallback
    console.log(`[OTP] Requesting OTP delivery to ${phone}...`);
    const deliveryResult = await otpDeliveryService.deliver(phone, otp);

    if (!deliveryResult.success) {
      throw new Error('Failed to send OTP. Please try again.');
    }

    // Store OTP in Redis with 5-minute TTL
    await otpRepository.store({
      otp,
      phone,
      expiresAt,
      attempts: 0,
      channel: deliveryResult.channel,
    });

    return {
      success: true,
      message: deliveryResult.fallbackUsed
        ? 'OTP sent via SMS (WhatsApp unavailable)'
        : 'OTP sent via WhatsApp',
      channel: deliveryResult.channel,
      fallbackUsed: deliveryResult.fallbackUsed,
      expiresIn: config.otp.expiryMinutes * 60,
    };
  }

  /**
   * Verify OTP and return tokens
   */
  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    // Validate OTP using repository
    const validation = await otpRepository.isValid(phone, otp);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // OTP is valid - delete it
    await otpRepository.delete(phone);

    // Get or create user
    const user = await this.getOrCreateUser(phone);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Log successful verification
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
   */
  verifyAccessToken(token: string): JwtPayload {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return payload;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const userId = refreshTokenStore.get(refreshToken);

    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await this.getUserById(userId);

    if (!user) {
      refreshTokenStore.delete(refreshToken);
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Invalidate old refresh token
    refreshTokenStore.delete(refreshToken);

    return {
      success: true,
      tokens,
    };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    refreshTokenStore.delete(refreshToken);
    // TODO: Add to blacklist in Redis for distributed systems
  }

  /**
   * Generate JWT access token and refresh token
   */
  private generateTokens(user: AuthUser): AuthTokens {
    const payload: JwtPayload = {
      userId: user.id,
      roles: user.roles,
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

    // Store refresh token
    refreshTokenStore.set(refreshToken, user.id);

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
    // TODO: Implement with Prisma
    // For now, return mock user
    const now = new Date();
    return {
      id: `user_${phone.replace(/\+/g, '')}`,
      phone,
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.BASIC,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get user by ID
   * TODO: Replace with Prisma implementation
   */
  private async getUserById(userId: string): Promise<AuthUser | null> {
    // TODO: Implement with Prisma
    // For now, return mock user
    const phone = userId.replace('user_', '+');
    const now = new Date();
    return {
      id: userId,
      phone,
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.BASIC,
      createdAt: now,
      updatedAt: now,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
