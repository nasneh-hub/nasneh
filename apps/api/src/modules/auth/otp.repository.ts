/**
 * OTP Repository - Nasneh API
 * Redis-based OTP storage following TECHNICAL_SPEC.md
 *
 * Features:
 * - 5-minute TTL for OTP codes
 * - Atomic operations for thread safety
 * - Attempt tracking for brute-force protection
 */

import { getRedisClient, getOtpKey } from '../../lib/redis.js';
import { config } from '../../config/env.js';
import { OtpChannel } from '../../types/auth.types.js';

// ===========================================
// Types
// ===========================================

export interface StoredOtp {
  otp: string;
  phone: string;
  expiresAt: number; // Unix timestamp
  attempts: number;
  channel: OtpChannel;
  createdAt: number;
}

// ===========================================
// OTP Repository
// ===========================================

export class OtpRepository {
  /**
   * Store OTP in Redis with TTL
   */
  async store(data: Omit<StoredOtp, 'createdAt'>): Promise<void> {
    const redis = await getRedisClient();
    const key = getOtpKey(data.phone);

    const storedData: StoredOtp = {
      ...data,
      createdAt: Date.now(),
    };

    // Store as JSON with TTL
    await redis.set(key, JSON.stringify(storedData), {
      EX: config.otp.expiryMinutes * 60,
    });
  }

  /**
   * Get OTP from Redis
   */
  async get(phone: string): Promise<StoredOtp | null> {
    const redis = await getRedisClient();
    const key = getOtpKey(phone);

    const data = await redis.get(key);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as StoredOtp;
    } catch {
      return null;
    }
  }

  /**
   * Delete OTP from Redis
   */
  async delete(phone: string): Promise<void> {
    const redis = await getRedisClient();
    const key = getOtpKey(phone);
    await redis.del(key);
  }

  /**
   * Increment attempt counter
   * Returns the new attempt count
   */
  async incrementAttempts(phone: string): Promise<number> {
    const stored = await this.get(phone);
    if (!stored) {
      return 0;
    }

    stored.attempts += 1;

    // Re-store with remaining TTL
    const redis = await getRedisClient();
    const key = getOtpKey(phone);
    const ttl = await redis.ttl(key);

    if (ttl > 0) {
      await redis.set(key, JSON.stringify(stored), { EX: ttl });
    }

    return stored.attempts;
  }

  /**
   * Check if OTP exists and is valid
   */
  async isValid(phone: string, otp: string): Promise<{
    valid: boolean;
    error?: string;
    attemptsRemaining?: number;
    stored?: StoredOtp;
  }> {
    // STAGING-ONLY: Test OTP bypass for permanent test accounts
    // Only active when APP_ENVIRONMENT=staging AND TEST_OTP env var is set
    const isStaging = process.env.APP_ENVIRONMENT === 'staging';
    const testOtp = process.env.TEST_OTP;
    const testPhones = ['+97336000000', '+97336000001', '+97336000002'];
    
    if (isStaging && testOtp && testPhones.includes(phone) && otp === testOtp) {
      // Create a mock stored OTP for test accounts
      const mockStored: StoredOtp = {
        otp: testOtp,
        phone,
        expiresAt: Date.now() + 300000, // 5 minutes from now
        attempts: 0,
        channel: 'SMS' as OtpChannel,
        createdAt: Date.now(),
      };
      
      return {
        valid: true,
        stored: mockStored,
      };
    }
    
    // Regular OTP validation flow
    const stored = await this.get(phone);

    if (!stored) {
      return {
        valid: false,
        error: 'No OTP found for this phone number. Please request a new one.',
      };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      await this.delete(phone);
      return {
        valid: false,
        error: 'OTP has expired. Please request a new one.',
      };
    }

    // Check attempts
    if (stored.attempts >= config.otp.maxAttempts) {
      await this.delete(phone);
      return {
        valid: false,
        error: 'Too many failed attempts. Please request a new OTP.',
      };
    }

    // Check OTP match
    if (stored.otp !== otp) {
      await this.incrementAttempts(phone);
      const remaining = config.otp.maxAttempts - stored.attempts - 1;
      return {
        valid: false,
        error: `Invalid OTP. ${remaining} attempt(s) remaining.`,
        attemptsRemaining: remaining,
        stored,
      };
    }

    return {
      valid: true,
      stored,
    };
  }

  /**
   * Get time until OTP expires (in seconds)
   */
  async getTimeToExpiry(phone: string): Promise<number> {
    const redis = await getRedisClient();
    const key = getOtpKey(phone);
    return redis.ttl(key);
  }
}

// Export singleton instance
export const otpRepository = new OtpRepository();
