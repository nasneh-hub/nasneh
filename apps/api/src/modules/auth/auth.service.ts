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
} from '../../types/auth.types';
import { config } from '../../config/env';
import { otpRepository, StoredOtp } from './otp.repository';
import { tokenRepository, StoredRefreshToken } from './token.repository';

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
   * Generate a unique JWT ID for blacklisting
   */
  private generateJti(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Send OTP via WhatsApp Business API
   * @returns true if delivered, false otherwise
   */
  private async sendWhatsAppOtp(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement WhatsApp Business API integration
    // For now, simulate delivery in development
    if (config.isDevelopment) {
      console.log(`[DEV] WhatsApp OTP for ${phone}: ${otp}`);
      // Simulate WhatsApp delivery success
      return true;
    }

    if (!config.whatsapp.isConfigured) {
      console.warn('WhatsApp not configured, skipping...');
      return false;
    }

    try {
      // WhatsApp Business API call would go here
      return false;
    } catch (error) {
      console.error('WhatsApp OTP failed:', error);
      return false;
    }
  }

  /**
   * Send OTP via SMS (AWS SNS)
   * @returns true if sent, false otherwise
   */
  private async sendSmsOtp(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement AWS SNS integration
    // For now, simulate delivery in development
    if (config.isDevelopment) {
      console.log(`[DEV] SMS OTP for ${phone}: ${otp}`);
      return true;
    }

    try {
      // AWS SNS call would go here
      return false;
    } catch (error) {
      console.error('SMS OTP failed:', error);
      return false;
    }
  }

  /**
   * Wait for WhatsApp delivery with timeout
   * Returns true if delivered within timeout, false otherwise
   */
  private async waitForWhatsAppDelivery(
    phone: string,
    otp: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const timeoutMs = config.otp.whatsappTimeoutSeconds * 1000;

      this.sendWhatsAppOtp(phone, otp).then((sent) => {
        if (!sent) {
          resolve(false);
          return;
        }

        if (config.isDevelopment) {
          resolve(true);
          return;
        }

        setTimeout(() => {
          resolve(true);
        }, timeoutMs);
      });
    });
  }

  /**
   * Log OTP delivery attempt
   */
  private logOtpDelivery(entry: OtpLogEntry): void {
    otpLogs.push(entry);
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

    let channel: OtpChannel = OtpChannel.WHATSAPP;
    let fallbackUsed = false;
    let delivered = false;

    console.log(`[OTP] Attempting WhatsApp delivery to ${phone}...`);
    delivered = await this.waitForWhatsAppDelivery(phone, otp);

    if (!delivered) {
      console.log(`[OTP] WhatsApp failed/timeout, falling back to SMS for ${phone}...`);
      channel = OtpChannel.SMS;
      fallbackUsed = true;
      delivered = await this.sendSmsOtp(phone, otp);
    }

    this.logOtpDelivery({
      phone,
      channel,
      status: delivered ? OtpStatus.SENT : OtpStatus.FAILED,
      timestamp: new Date(),
      fallbackUsed,
    });

    if (!delivered) {
      throw new Error('Failed to send OTP. Please try again.');
    }

    await otpRepository.store({
      otp,
      phone,
      expiresAt,
      attempts: 0,
      channel,
    });

    return {
      success: true,
      message: fallbackUsed
        ? 'OTP sent via SMS (WhatsApp unavailable)'
        : 'OTP sent via WhatsApp',
      channel,
      fallbackUsed,
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
      throw new Error(validation.error);
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
  async verifyAccessToken(token: string): Promise<JwtPayload> {
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
