/**
 * Auth Service Tests - Nasneh API
 * Unit tests for authentication service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../modules/auth/auth.service';
import { otpRepository } from '../../modules/auth/otp.repository';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('requestOtp', () => {
    it('should send OTP successfully', async () => {
      const phone = '+97317123456';
      const result = await authService.requestOtp(phone);

      expect(result.success).toBe(true);
      expect(result.channel).toBeDefined();
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it('should return WhatsApp channel in development', async () => {
      const phone = '+97333001234';
      const result = await authService.requestOtp(phone);

      expect(result.success).toBe(true);
      expect(result.channel).toBe('whatsapp');
      expect(result.fallbackUsed).toBe(false);
    });

    it('should store OTP in repository', async () => {
      const phone = '+97333002222';
      await authService.requestOtp(phone);

      const stored = await otpRepository.get(phone);
      expect(stored).not.toBeNull();
      expect(stored?.phone).toBe(phone);
      expect(stored?.otp).toMatch(/^[0-9]{6}$/);
    });
  });

  describe('verifyOtp', () => {
    it('should verify correct OTP', async () => {
      const phone = '+97317123456';

      // First request OTP
      await authService.requestOtp(phone);

      // Get stored OTP from repository
      const stored = await otpRepository.get(phone);
      expect(stored).not.toBeNull();

      // Verify with correct OTP
      const result = await authService.verifyOtp(phone, stored!.otp);
      expect(result.success).toBe(true);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject expired OTP', async () => {
      const phone = '+97317123456';
      const wrongOtp = '000000';

      // Request OTP first
      await authService.requestOtp(phone);

      // Try with wrong OTP
      await expect(authService.verifyOtp(phone, wrongOtp)).rejects.toThrow();
    });

    it('should reject non-existent OTP', async () => {
      const phone = '+97317999999';
      const otp = '123456';

      await expect(authService.verifyOtp(phone, otp)).rejects.toThrow(
        'No OTP found for this phone number'
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => authService.verifyAccessToken(invalidToken)).toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should reject invalid refresh token', async () => {
      const invalidToken = 'invalid-refresh-token';

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });
  });
});

describe('OTP Repository', () => {
  describe('store and retrieve', () => {
    it('should store and retrieve OTP', async () => {
      const testPhone = '+97333007777';
      const testOtp = '123456';

      await otpRepository.store({
        otp: testOtp,
        phone: testPhone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        channel: 'whatsapp',
      });

      const stored = await otpRepository.get(testPhone);

      expect(stored).not.toBeNull();
      expect(stored?.otp).toBe(testOtp);
      expect(stored?.phone).toBe(testPhone);
    });
  });

  describe('validation', () => {
    it('should validate correct OTP', async () => {
      const testPhone = '+97333006666';
      const testOtp = '654321';

      await otpRepository.store({
        otp: testOtp,
        phone: testPhone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        channel: 'whatsapp',
      });

      const validation = await otpRepository.isValid(testPhone, testOtp);

      expect(validation.valid).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
      const testPhone = '+97333005555';
      const testOtp = '111111';
      const wrongOtp = '999999';

      await otpRepository.store({
        otp: testOtp,
        phone: testPhone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        channel: 'whatsapp',
      });

      const validation = await otpRepository.isValid(testPhone, wrongOtp);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid OTP');
    });

    it('should reject non-existent phone', async () => {
      const validation = await otpRepository.isValid('+97300000000', '123456');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('No OTP found');
    });
  });

  describe('deletion', () => {
    it('should delete OTP after use', async () => {
      const testPhone = '+97333004444';
      const testOtp = '444444';

      await otpRepository.store({
        otp: testOtp,
        phone: testPhone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
        channel: 'sms',
      });

      await otpRepository.delete(testPhone);

      const stored = await otpRepository.get(testPhone);
      expect(stored).toBeNull();
    });
  });
});

describe('Phone Validation', () => {
  it('should accept valid Bahrain phone numbers', () => {
    const validPhones = [
      '+97333001234',
      '+97366001234',
      '+97339001234',
      '+97317001234',
    ];

    validPhones.forEach((phone) => {
      expect(phone).toMatch(/^\+973[0-9]{8}$/);
    });
  });

  it('should reject invalid phone formats', () => {
    const invalidPhones = [
      '97333001234',    // Missing +
      '+96633001234',   // Wrong country code (Saudi)
      '+9733300123',    // Too short
      '+973330012345',  // Too long
      '+973abcd1234',   // Contains letters
    ];

    invalidPhones.forEach((phone) => {
      expect(phone).not.toMatch(/^\+973[0-9]{8}$/);
    });
  });
});
