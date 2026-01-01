/**
 * OTP Delivery Service - Nasneh API
 * Following TECHNICAL_SPEC.md §5. OTP Delivery Channels
 *
 * Flow:
 * 1. Send WhatsApp first
 * 2. Wait 10 seconds for delivery confirmation
 * 3. If not delivered/failed → fallback to SMS
 *
 * UI Wording: "Try WhatsApp first (faster) then SMS fallback"
 */

import { config } from '../../config/env';
import { sendWhatsAppOtpWithTimeout, WhatsAppDeliveryStatus } from '../../lib/whatsapp';
import { OtpChannel, OtpStatus, OtpLogEntry } from '../../types/auth.types';

// ===========================================
// Types
// ===========================================

export interface OtpDeliveryResult {
  success: boolean;
  channel: OtpChannel;
  fallbackUsed: boolean;
  messageId?: string;
  error?: string;
}

export interface OtpDeliveryLog extends OtpLogEntry {
  messageId?: string;
  deliveryStatus?: string;
  fallbackReason?: string;
}

// ===========================================
// In-memory log storage (replace with DB in production)
// ===========================================

const deliveryLogs: OtpDeliveryLog[] = [];

// ===========================================
// OTP Delivery Service
// ===========================================

export class OtpDeliveryService {
  /**
   * Deliver OTP to phone number
   * Following the WhatsApp → SMS fallback flow
   */
  async deliver(phone: string, otp: string): Promise<OtpDeliveryResult> {
    let channel: OtpChannel = OtpChannel.WHATSAPP;
    let fallbackUsed = false;
    let fallbackReason: string | undefined;
    let messageId: string | undefined;

    console.log(`[OTP Delivery] Starting delivery to ${phone}`);

    // Step 1: Try WhatsApp first
    console.log('[OTP Delivery] Attempting WhatsApp delivery...');
    const whatsappResult = await this.sendViaWhatsApp(phone, otp);

    if (whatsappResult.success) {
      messageId = whatsappResult.messageId;
      console.log(`[OTP Delivery] WhatsApp delivery successful: ${messageId}`);

      // Log successful delivery
      this.logDelivery({
        phone,
        channel: OtpChannel.WHATSAPP,
        status: OtpStatus.DELIVERED,
        timestamp: new Date(),
        fallbackUsed: false,
        messageId,
        deliveryStatus: whatsappResult.deliveryStatus?.status,
      });

      return {
        success: true,
        channel: OtpChannel.WHATSAPP,
        fallbackUsed: false,
        messageId,
      };
    }

    // Step 2: WhatsApp failed - fallback to SMS
    fallbackReason = whatsappResult.error || 'WhatsApp delivery failed/timeout';
    console.log(`[OTP Delivery] WhatsApp failed: ${fallbackReason}`);
    console.log('[OTP Delivery] Falling back to SMS...');

    channel = OtpChannel.SMS;
    fallbackUsed = true;

    // Log WhatsApp failure
    this.logDelivery({
      phone,
      channel: OtpChannel.WHATSAPP,
      status: OtpStatus.FAILED,
      timestamp: new Date(),
      fallbackUsed: true,
      messageId: whatsappResult.messageId,
      deliveryStatus: whatsappResult.deliveryStatus?.status,
      fallbackReason,
    });

    // Step 3: Send via SMS
    const smsResult = await this.sendViaSms(phone, otp);

    if (smsResult.success) {
      messageId = smsResult.messageId;
      console.log(`[OTP Delivery] SMS delivery successful: ${messageId}`);

      // Log successful SMS delivery
      this.logDelivery({
        phone,
        channel: OtpChannel.SMS,
        status: OtpStatus.SENT,
        timestamp: new Date(),
        fallbackUsed: true,
        messageId,
        fallbackReason,
      });

      return {
        success: true,
        channel: OtpChannel.SMS,
        fallbackUsed: true,
        messageId,
      };
    }

    // Both channels failed
    console.error('[OTP Delivery] Both WhatsApp and SMS failed');

    // Log SMS failure
    this.logDelivery({
      phone,
      channel: OtpChannel.SMS,
      status: OtpStatus.FAILED,
      timestamp: new Date(),
      fallbackUsed: true,
      fallbackReason: smsResult.error,
    });

    return {
      success: false,
      channel: OtpChannel.SMS,
      fallbackUsed: true,
      error: 'Failed to deliver OTP via both WhatsApp and SMS',
    };
  }

  /**
   * Send OTP via WhatsApp with timeout
   */
  private async sendViaWhatsApp(
    phone: string,
    otp: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    deliveryStatus?: WhatsAppDeliveryStatus;
    error?: string;
  }> {
    const timeoutMs = config.otp.whatsappTimeoutSeconds * 1000;

    try {
      const result = await sendWhatsAppOtpWithTimeout(phone, otp, timeoutMs);
      return result;
    } catch (error) {
      console.error('[OTP Delivery] WhatsApp error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send OTP via SMS (AWS SNS)
   * TODO: Implement actual AWS SNS integration
   */
  private async sendViaSms(
    phone: string,
    otp: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    // Development mode - mock delivery
    if (config.isDevelopment) {
      return this.mockSmsSend(phone, otp);
    }

    // TODO: Implement AWS SNS integration
    // const sns = new SNSClient({ region: config.aws.snsRegion });
    // const command = new PublishCommand({
    //   PhoneNumber: phone,
    //   Message: `Your Nasneh verification code: ${otp}. Valid for ${config.otp.expiryMinutes} minutes.`,
    //   MessageAttributes: {
    //     'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'Nasneh' },
    //     'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    //   },
    // });
    // const response = await sns.send(command);
    // return { success: true, messageId: response.MessageId };

    // For now, return failure in production without SNS configured
    console.warn('[OTP Delivery] SMS not configured in production');
    return {
      success: false,
      error: 'SMS not configured',
    };
  }

  /**
   * Mock SMS delivery for development
   */
  private mockSmsSend(
    phone: string,
    otp: string
  ): { success: boolean; messageId?: string } {
    const mockMessageId = `mock_sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log('[OTP Delivery] [DEV MODE] Mock SMS delivery:');
    console.log(`  Phone: ${phone}`);
    console.log(`  OTP: ${otp}`);
    console.log(`  Message ID: ${mockMessageId}`);

    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  /**
   * Log delivery attempt
   */
  private logDelivery(entry: OtpDeliveryLog): void {
    deliveryLogs.push(entry);

    // Log to console for debugging
    console.log('[OTP Delivery Log]', JSON.stringify({
      phone: entry.phone.slice(0, 7) + '****', // Mask phone for logs
      channel: entry.channel,
      status: entry.status,
      fallbackUsed: entry.fallbackUsed,
      messageId: entry.messageId,
      timestamp: entry.timestamp.toISOString(),
    }));

    // TODO: Persist to database for audit trail
  }

  /**
   * Get delivery logs for a phone number (for debugging/audit)
   */
  getLogsForPhone(phone: string): OtpDeliveryLog[] {
    return deliveryLogs.filter((log) => log.phone === phone);
  }

  /**
   * Get recent delivery logs
   */
  getRecentLogs(limit: number = 100): OtpDeliveryLog[] {
    return deliveryLogs.slice(-limit);
  }
}

// ===========================================
// Singleton Instance
// ===========================================

export const otpDeliveryService = new OtpDeliveryService();
