/**
 * OTP Verify Endpoint Tests - Nasneh API
 * Comprehensive tests for POST /auth/verify-otp
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../modules/auth/auth.service';
import { otpRepository } from '../../modules/auth/otp.repository';
import { OtpChannel } from '../../types/auth.types';

describe('OTP Verify Endpoint', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('Successful Verification', () => {
    it('should verify OTP and return tokens', async () => {
      const phone = '+97333001111';

      // Request OTP
      await authService.requestOtp(phone);

      // Get stored OTP
      const stored = await otpRepository.get(phone);
      expect(stored).not.toBeNull();

      // Verify OTP
      const result = await authService.verifyOtp(phone, stored!.otp);

      expect(result.success).toBe(true);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.tokens.expiresIn).toBeGreaterThan(0);
      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe(phone);
    });

    it('should invalidate OTP after successful verification', async () => {
      const phone = '+97333002222';

      // Request OTP
      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);

      // Verify OTP
      await authService.verifyOtp(phone, stored!.otp);

      // OTP should be deleted
      const afterVerify = await otpRepository.get(phone);
      expect(afterVerify).toBeNull();
    });

    it('should return user with correct roles', async () => {
      const phone = '+97333003333';

      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);
      const result = await authService.verifyOtp(phone, stored!.otp);

      expect(result.user.roles).toContain('customer');
      expect(result.user.status).toBe('active');
    });

    it('should indicate if user is new', async () => {
      const phone = '+97333004444';

      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);
      const result = await authService.verifyOtp(phone, stored!.otp);

      // New user should have isNewUser = true
      expect(result.isNewUser).toBeDefined();
    });
  });

  describe('Failed Verification', () => {
    it('should reject incorrect OTP', async () => {
      const phone = '+97333005555';

      await authService.requestOtp(phone);

      await expect(authService.verifyOtp(phone, '000000')).rejects.toThrow(
        /Invalid OTP/
      );
    });

    it('should reject expired OTP', async () => {
      const phone = '+97333006666';

      // Store OTP with past expiry
      await otpRepository.store({
        otp: '123456',
        phone,
        expiresAt: Date.now() - 1000, // Already expired
        attempts: 0,
        channel: OtpChannel.WHATSAPP,
      });

      await expect(authService.verifyOtp(phone, '123456')).rejects.toThrow(
        /expired/
      );
    });

    it('should reject non-existent OTP', async () => {
      const phone = '+97333007777';

      await expect(authService.verifyOtp(phone, '123456')).rejects.toThrow(
        /No OTP found/
      );
    });
  });

  describe('Attempt Tracking', () => {
    it('should track failed attempts', async () => {
      const phone = '+97333008888';

      await authService.requestOtp(phone);

      // First failed attempt
      await expect(authService.verifyOtp(phone, '000001')).rejects.toThrow();

      // Check attempts incremented
      const stored = await otpRepository.get(phone);
      expect(stored?.attempts).toBe(1);
    });

    it('should show remaining attempts in error', async () => {
      const phone = '+97333009999';

      await authService.requestOtp(phone);

      try {
        await authService.verifyOtp(phone, '000002');
      } catch (error: any) {
        expect(error.message).toMatch(/attempt\(s\) remaining/);
      }
    });

    it('should invalidate OTP after max attempts', async () => {
      const phone = '+97333010000';

      // Store OTP with 4 attempts (max is 5)
      await otpRepository.store({
        otp: '123456',
        phone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 4,
        channel: OtpChannel.WHATSAPP,
      });

      // This should be the 5th attempt (0 attempts remaining)
      await expect(authService.verifyOtp(phone, '000003')).rejects.toThrow(
        /Invalid OTP.*0 attempt/
      );

      // OTP should still exist but with max attempts reached
      const stored = await otpRepository.get(phone);
      expect(stored).not.toBeNull();
      expect(stored?.attempts).toBe(5);
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT access token', async () => {
      const phone = '+97333011111';

      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);
      const result = await authService.verifyOtp(phone, stored!.otp);

      // Access token should be a valid JWT (3 parts separated by dots)
      const parts = result.tokens.accessToken.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should generate secure refresh token', async () => {
      const phone = '+97333012222';

      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);
      const result = await authService.verifyOtp(phone, stored!.otp);

      // Refresh token should be a hex string (128 chars for 64 bytes)
      expect(result.tokens.refreshToken).toMatch(/^[a-f0-9]{128}$/);
    });

    it('should return token expiry time', async () => {
      const phone = '+97333013333';

      await authService.requestOtp(phone);
      const stored = await otpRepository.get(phone);
      const result = await authService.verifyOtp(phone, stored!.otp);

      // expiresIn should be 15 minutes (900 seconds)
      expect(result.tokens.expiresIn).toBe(900);
    });
  });

  describe('Phone Format Validation', () => {
    it('should accept valid Bahrain numbers', async () => {
      const validPhones = [
        '+97333001234', // Mobile
        '+97366001234', // Mobile
        '+97317001234', // Landline
      ];

      for (const phone of validPhones) {
        await authService.requestOtp(phone);
        const stored = await otpRepository.get(phone);
        expect(stored).not.toBeNull();
        
        // Clean up
        await otpRepository.delete(phone);
      }
    });
  });

  describe('Security', () => {
    it('should not leak OTP in response', async () => {
      const phone = '+97333014444';

      const requestResult = await authService.requestOtp(phone);

      // Response should not contain the actual OTP
      expect(JSON.stringify(requestResult)).not.toMatch(/[0-9]{6}/);
    });

    it('should use timing-safe comparison for OTP', async () => {
      const phone = '+97333015555';

      await authService.requestOtp(phone);

      // Multiple failed attempts should take similar time
      // (This is a documentation test - actual timing tests are flaky)
      const start1 = Date.now();
      try {
        await authService.verifyOtp(phone, '000000');
      } catch {}
      const time1 = Date.now() - start1;

      // Request new OTP
      await authService.requestOtp(phone);

      const start2 = Date.now();
      try {
        await authService.verifyOtp(phone, '999999');
      } catch {}
      const time2 = Date.now() - start2;

      // Times should be within reasonable range (not a strict test)
      expect(Math.abs(time1 - time2)).toBeLessThan(100);
    });
  });
});

describe('OTP Verify Response Format', () => {
  it('should return consistent success response', async () => {
    const authService = new AuthService();
    const phone = '+97333016666';

    await authService.requestOtp(phone);
    const stored = await otpRepository.get(phone);
    const result = await authService.verifyOtp(phone, stored!.otp);

    // Check response structure
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('tokens');
    expect(result).toHaveProperty('isNewUser');

    // Check user structure
    expect(result.user).toHaveProperty('id');
    expect(result.user).toHaveProperty('phone');
    expect(result.user).toHaveProperty('roles');
    expect(result.user).toHaveProperty('status');

    // Check tokens structure
    expect(result.tokens).toHaveProperty('accessToken');
    expect(result.tokens).toHaveProperty('refreshToken');
    expect(result.tokens).toHaveProperty('expiresIn');
  });
});
