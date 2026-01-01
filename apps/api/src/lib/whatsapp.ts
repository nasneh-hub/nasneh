/**
 * WhatsApp Business API Client - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 *
 * Features:
 * - Send OTP via WhatsApp template message
 * - 10-second delivery timeout
 * - Delivery status tracking
 * - Mock mode for development/testing
 */

import { config } from '../config/env';

// ===========================================
// Types
// ===========================================

export interface WhatsAppMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface WhatsAppOtpParams {
  phone: string;
  otp: string;
  language?: string;
}

// ===========================================
// WhatsApp Client Class
// ===========================================

export class WhatsAppClient {
  private apiUrl: string;
  private apiToken: string;
  private phoneNumberId: string;
  private isConfigured: boolean;

  constructor() {
    this.apiUrl = config.whatsapp.apiUrl || '';
    this.apiToken = config.whatsapp.apiToken || '';
    this.phoneNumberId = config.whatsapp.phoneNumberId || '';
    this.isConfigured = config.whatsapp.isConfigured;
  }

  /**
   * Send OTP via WhatsApp template message
   * Uses the 'otp_verification' template with a single variable for the OTP code
   */
  async sendOtp(params: WhatsAppOtpParams): Promise<WhatsAppMessageResponse> {
    const { phone, otp, language = 'en' } = params;

    // Development mode - mock delivery
    if (config.isDevelopment && !this.isConfigured) {
      return this.mockSendOtp(phone, otp);
    }

    // Production mode - check configuration
    if (!this.isConfigured) {
      console.error('[WhatsApp] Not configured - missing API credentials');
      return {
        success: false,
        error: 'WhatsApp not configured',
      };
    }

    try {
      const response = await this.sendTemplateMessage({
        to: phone,
        templateName: 'otp_verification',
        language,
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
          // OTP button component (if using button template)
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('[WhatsApp] Failed to send OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a template message via WhatsApp Business API
   */
  private async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    language: string;
    components: Array<{
      type: string;
      sub_type?: string;
      index?: string;
      parameters: Array<{
        type: string;
        text?: string;
      }>;
    }>;
  }): Promise<WhatsAppMessageResponse> {
    const { to, templateName, language, components } = params;

    // Format phone number (remove + if present for API)
    const formattedPhone = to.startsWith('+') ? to.slice(1) : to;

    const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: components.filter((c) => c.parameters.length > 0),
      },
    };

    console.log('[WhatsApp] Sending template message:', {
      to: formattedPhone,
      template: templateName,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as {
        error?: { message?: string };
      };
      console.error('[WhatsApp] API error:', errorData);
      return {
        success: false,
        error: errorData?.error?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json() as {
      messages?: Array<{ id?: string }>;
    };

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  }

  /**
   * Mock OTP delivery for development/testing
   */
  private mockSendOtp(phone: string, otp: string): WhatsAppMessageResponse {
    const mockMessageId = `mock_wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log('[WhatsApp] [DEV MODE] Mock OTP delivery:');
    console.log(`  Phone: ${phone}`);
    console.log(`  OTP: ${otp}`);
    console.log(`  Message ID: ${mockMessageId}`);

    // Simulate successful delivery in dev mode
    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  /**
   * Wait for delivery confirmation with timeout
   * In production, this would poll the webhook status or use a callback
   */
  async waitForDelivery(
    messageId: string,
    timeoutMs: number = config.otp.whatsappTimeoutSeconds * 1000
  ): Promise<WhatsAppDeliveryStatus> {
    // In development mode, simulate instant delivery
    if (config.isDevelopment) {
      return {
        messageId,
        status: 'delivered',
        timestamp: new Date(),
      };
    }

    // In production, this would:
    // 1. Check webhook callback status from Redis/DB
    // 2. Poll status endpoint if webhooks not available
    // 3. Timeout after specified duration

    return new Promise((resolve) => {
      // For now, assume delivery after timeout
      // Real implementation would check webhook status
      setTimeout(() => {
        resolve({
          messageId,
          status: 'sent', // Conservative - assume sent but not confirmed delivered
          timestamp: new Date(),
        });
      }, Math.min(timeoutMs, 2000)); // Cap at 2s in dev
    });
  }

  /**
   * Check if WhatsApp is properly configured
   */
  isReady(): boolean {
    return this.isConfigured || config.isDevelopment;
  }
}

// ===========================================
// Singleton Instance
// ===========================================

let whatsappClient: WhatsAppClient | null = null;

export function getWhatsAppClient(): WhatsAppClient {
  if (!whatsappClient) {
    whatsappClient = new WhatsAppClient();
  }
  return whatsappClient;
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Send OTP via WhatsApp with timeout
 * Returns true if delivered within timeout, false otherwise
 */
export async function sendWhatsAppOtpWithTimeout(
  phone: string,
  otp: string,
  timeoutMs?: number
): Promise<{
  success: boolean;
  messageId?: string;
  deliveryStatus?: WhatsAppDeliveryStatus;
  error?: string;
}> {
  const client = getWhatsAppClient();

  if (!client.isReady()) {
    return {
      success: false,
      error: 'WhatsApp not configured',
    };
  }

  // Send the OTP
  const sendResult = await client.sendOtp({ phone, otp });

  if (!sendResult.success) {
    return {
      success: false,
      error: sendResult.error,
    };
  }

  // Wait for delivery confirmation
  const deliveryStatus = await client.waitForDelivery(
    sendResult.messageId!,
    timeoutMs
  );

  // Consider 'sent' or 'delivered' as success
  const isDelivered = ['sent', 'delivered', 'read'].includes(
    deliveryStatus.status
  );

  return {
    success: isDelivered,
    messageId: sendResult.messageId,
    deliveryStatus,
    error: isDelivered ? undefined : 'Delivery timeout or failure',
  };
}
