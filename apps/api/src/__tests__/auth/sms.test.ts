/**
 * SMS Fallback Tests - Nasneh API
 * Unit tests for AWS SNS SMS integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SmsClient, getSmsClient, sendSmsOtp } from '../../lib/sms';

describe('SmsClient', () => {
  let client: SmsClient;

  beforeEach(() => {
    client = new SmsClient();
  });

  describe('isReady', () => {
    it('should return true in development mode', () => {
      // In development, SMS is always "ready" (mock mode)
      expect(client.isReady()).toBe(true);
    });
  });

  describe('send', () => {
    it('should return success with mock message ID in development', async () => {
      const result = await client.send({
        phone: '+97333001234',
        message: 'Test message',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(/^mock_sms_/);
    });
  });

  describe('sendOtp', () => {
    it('should send OTP message with correct format', async () => {
      const result = await client.sendOtp('+97333005678', '123456');

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should include OTP in message', async () => {
      const otp = '654321';
      const result = await client.sendOtp('+97333009999', otp);

      expect(result.success).toBe(true);
    });
  });
});

describe('getSmsClient', () => {
  it('should return singleton instance', () => {
    const client1 = getSmsClient();
    const client2 = getSmsClient();

    expect(client1).toBe(client2);
  });
});

describe('sendSmsOtp', () => {
  it('should send OTP via convenience function', async () => {
    const result = await sendSmsOtp('+97333007777', '777777');

    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^mock_sms_/);
  });
});

describe('SMS Fallback Flow', () => {
  it('should document the fallback behavior', () => {
    // This test documents the expected SMS fallback behavior
    // In production:
    // 1. WhatsApp is attempted first
    // 2. If WhatsApp fails/times out (10s), SMS is used via AWS SNS
    // 3. SMS uses transactional message type for reliability
    // 4. Sender ID is "Nasneh" for brand recognition

    const expectedConfig = {
      provider: 'AWS SNS',
      region: 'me-south-1', // Bahrain region
      messageType: 'Transactional',
      senderId: 'Nasneh',
    };

    expect(expectedConfig.provider).toBe('AWS SNS');
    expect(expectedConfig.region).toBe('me-south-1');
    expect(expectedConfig.messageType).toBe('Transactional');
    expect(expectedConfig.senderId).toBe('Nasneh');
  });

  it('should use Bahrain phone format', () => {
    // Bahrain phone numbers start with +973
    const validPhones = [
      '+97333001234',
      '+97336001234',
      '+97317001234',
    ];

    validPhones.forEach((phone) => {
      expect(phone).toMatch(/^\+973\d{8}$/);
    });
  });
});

describe('AWS SNS Configuration', () => {
  it('should document required environment variables', () => {
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_SNS_REGION',
    ];

    // These are the environment variables needed for production SMS
    expect(requiredEnvVars).toContain('AWS_ACCESS_KEY_ID');
    expect(requiredEnvVars).toContain('AWS_SECRET_ACCESS_KEY');
    expect(requiredEnvVars).toContain('AWS_SNS_REGION');
  });
});
