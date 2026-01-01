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
import { otpRepository, StoredOtp } from './otp.repository';
import { getRedisClient } from '../../lib/redis';

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
      // const response = await fetch(config.whatsapp.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${config.whatsapp.apiToken}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: phone,
      //     type: 'template',
      //     template: {
      //       name: 'otp_verification',
      //       language: { code: 'en' },
      //       components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }],
      //     },
      //   }),
      // });
      // return response.ok;
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
      // const sns = new SNSClient({ region: config.aws.snsRegion });
      // await sns.send(new PublishCommand({
      //   PhoneNumber: phone,
      //   Message: `Your Nasneh verification code: ${otp}. Valid for ${config.otp.expiryMinutes} minutes.`,
      // }));
      // return true;
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
      // In production, this would check delivery status via webhook
      // For now, we simulate with a timeout

      const timeoutMs = config.otp.whatsappTimeoutSeconds * 1000;

      // Try sending WhatsApp OTP
      this.sendWhatsAppOtp(phone, otp).then((sent) => {
        if (!sent) {
          resolve(false);
          return;
        }

        // In development, assume immediate delivery
        if (config.isDevelopment) {
          resolve(true);
          return;
        }

        // In production, wait for delivery confirmation or timeout
        // This would be replaced with webhook-based confirmation
        setTimeout(() => {
          // Assume delivered if no failure callback
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

    let channel: OtpChannel = OtpChannel.WHATSAPP;
    let fallbackUsed = false;
    let delivered = false;

    // Step 1: Try WhatsApp first with timeout
    console.log(`[OTP] Attempting WhatsApp delivery to ${phone}...`);
    delivered = await this.waitForWhatsAppDelivery(phone, otp);

    // Step 2: If WhatsApp fails/times out, fallback to SMS
    if (!delivered) {
      console.log(`[OTP] WhatsApp failed/timeout, falling back to SMS for ${phone}...`);
      channel = OtpChannel.SMS;
      fallbackUsed = true;
      delivered = await this.sendSmsOtp(phone, otp);
    }

    // Log the delivery attempt
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

    // Store OTP in Redis with 5-minute TTL
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
