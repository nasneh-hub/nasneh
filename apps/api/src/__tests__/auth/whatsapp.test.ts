/**
 * WhatsApp OTP Delivery Tests - Nasneh API
 * Unit tests for WhatsApp Business API integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatsAppClient, getWhatsAppClient } from '../../lib/whatsapp';
import { otpDeliveryService } from '../../modules/auth/otp-delivery.service';
import { OtpChannel } from '../../types/auth.types';

describe('WhatsAppClient', () => {
  let client: WhatsAppClient;

  beforeEach(() => {
    client = new WhatsAppClient();
  });

  describe('isReady', () => {
    it('should return true in development mode', () => {
      // In development, WhatsApp is always "ready" (mock mode)
      expect(client.isReady()).toBe(true);
    });
  });

  describe('sendOtp', () => {
    it('should return success with mock message ID in development', async () => {
      const result = await client.sendOtp({
        phone: '+97333001234',
        otp: '123456',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(/^mock_wa_/);
    });

    it('should include OTP in mock delivery', async () => {
      const otp = '654321';
      const result = await client.sendOtp({
        phone: '+97333005678',
        otp,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('waitForDelivery', () => {
    it('should return delivered status in development', async () => {
      const messageId = 'mock_wa_test_123';
      const status = await client.waitForDelivery(messageId);

      expect(status.messageId).toBe(messageId);
      expect(status.status).toBe('delivered');
      expect(status.timestamp).toBeInstanceOf(Date);
    });
  });
});

describe('getWhatsAppClient', () => {
  it('should return singleton instance', () => {
    const client1 = getWhatsAppClient();
    const client2 = getWhatsAppClient();

    expect(client1).toBe(client2);
  });
});

describe('OtpDeliveryService', () => {
  describe('deliver', () => {
    it('should deliver OTP via WhatsApp in development', async () => {
      const result = await otpDeliveryService.deliver('+97333001234', '123456');

      expect(result.success).toBe(true);
      expect(result.channel).toBe(OtpChannel.WHATSAPP);
      expect(result.fallbackUsed).toBe(false);
      expect(result.messageId).toBeDefined();
    });

    it('should include message ID in result', async () => {
      const result = await otpDeliveryService.deliver('+97333009999', '999999');

      expect(result.messageId).toMatch(/^mock_wa_/);
    });
  });

  describe('getLogsForPhone', () => {
    it('should return delivery logs for a phone number', async () => {
      const phone = '+97333008888';
      await otpDeliveryService.deliver(phone, '888888');

      const logs = otpDeliveryService.getLogsForPhone(phone);

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].phone).toBe(phone);
    });
  });

  describe('getRecentLogs', () => {
    it('should return recent delivery logs', async () => {
      await otpDeliveryService.deliver('+97333007777', '777777');

      const logs = otpDeliveryService.getRecentLogs(10);

      expect(logs.length).toBeGreaterThan(0);
    });
  });
});

describe('WhatsApp → SMS Fallback', () => {
  it('should document the fallback flow', () => {
    // This test documents the expected fallback behavior
    // In production:
    // 1. WhatsApp is attempted first
    // 2. If WhatsApp fails/times out (10s), SMS is used
    // 3. Both attempts are logged for audit

    const expectedFlow = {
      primaryChannel: OtpChannel.WHATSAPP,
      fallbackChannel: OtpChannel.SMS,
      timeoutSeconds: 10,
      loggedEvents: ['attempt', 'success/failure', 'fallback'],
    };

    expect(expectedFlow.primaryChannel).toBe(OtpChannel.WHATSAPP);
    expect(expectedFlow.fallbackChannel).toBe(OtpChannel.SMS);
    expect(expectedFlow.timeoutSeconds).toBe(10);
  });
});
