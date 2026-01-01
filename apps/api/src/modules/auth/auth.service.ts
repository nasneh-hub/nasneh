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

// ===========================================
// In-memory stores (replace with Redis/DB in production)
// ===========================================

interface StoredOtp {
  otp: string;
  phone: string;
  expiresAt: Date;
  attempts: number;
  channel: OtpChannel;
}

// Temporary in-memory storage (will be replaced with Redis)
const otpStore = new Map<string, StoredOtp>();
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
      return true;
    }

    if (!config.whatsapp.isConfigured) {
      console.warn('WhatsApp not configured, skipping...');
      return false;
    }

    try {
      // WhatsApp Business API call would go here
      // const response = await fetch(config.whatsapp.apiUrl, { ... });
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
      // await sns.send(new PublishCommand({ PhoneNumber: phone, Message: `Your Nasneh code: ${otp}` }));
      return false;
    } catch (error) {
      console.error('SMS OTP failed:', error);
      return false;
    }
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
   * Following TECHNICAL_SPEC.md OTP Delivery Channels flow
   */
  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    let channel: OtpChannel = OtpChannel.WHATSAPP;
    let fallbackUsed = false;
    let delivered = false;

    // Step 1: Try WhatsApp first
    delivered = await this.sendWhatsAppOtp(phone, otp);

    // Step 2: If WhatsApp fails, fallback to SMS
    if (!delivered) {
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

    // Store OTP
    otpStore.set(phone, {
      otp,
      phone,
      expiresAt,
      attempts: 0,
      channel,
    });

    return {
      success: true,
      message: fallbackUsed
        ? 'OTP sent via SMS'
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
    const stored = otpStore.get(phone);

    if (!stored) {
      throw new Error('No OTP found for this phone number. Please request a new one.');
    }

    // Check expiry
    if (new Date() > stored.expiresAt) {
      otpStore.delete(phone);
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Check attempts
    if (stored.attempts >= config.otp.maxAttempts) {
      otpStore.delete(phone);
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (stored.otp !== otp) {
      stored.attempts++;
      throw new Error(`Invalid OTP. ${config.otp.maxAttempts - stored.attempts} attempts remaining.`);
    }

    // OTP verified - clean up
    otpStore.delete(phone);

    // Get or create user (TODO: implement with Prisma)
    const user = await this.getOrCreateUser(phone);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      success: true,
      tokens,
      user,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const userId = refreshTokenStore.get(refreshToken);

    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    // Get user (TODO: implement with Prisma)
    const user = await this.getUserById(userId);

    if (!user) {
      refreshTokenStore.delete(refreshToken);
      throw new Error('User not found');
    }

    // Invalidate old refresh token
    refreshTokenStore.delete(refreshToken);

    // Generate new tokens
    const tokens = this.generateTokens(user);

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
    // Placeholder - will be replaced with Prisma
    return {
      id: crypto.randomUUID(),
      phone,
      email: null,
      name: null,
      avatarUrl: null,
      roles: [UserRole.CUSTOMER],
      trustLevel: TrustLevel.NEW,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
    };
  }

  /**
   * Get user by ID
   * TODO: Replace with Prisma implementation
   */
  private async getUserById(userId: string): Promise<AuthUser | null> {
    // Placeholder - will be replaced with Prisma
    return null;
  }

  /**
   * Verify JWT token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
