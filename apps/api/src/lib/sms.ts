/**
 * SMS Client - Nasneh API
 * AWS SNS integration for SMS OTP delivery
 * Following TECHNICAL_SPEC.md §5. OTP Delivery Channels
 *
 * SMS is the fallback channel when WhatsApp fails/times out.
 */

import { config } from '../config/env';

// ===========================================
// Types
// ===========================================

export interface SmsMessageRequest {
  phone: string;
  message: string;
}

export interface SmsMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsDeliveryStatus {
  messageId: string;
  status: 'pending' | 'delivered' | 'failed';
  timestamp: Date;
  error?: string;
}

// ===========================================
// SMS Client Class
// ===========================================

export class SmsClient {
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly senderId: string;

  constructor() {
    this.region = config.aws.snsRegion;
    this.accessKeyId = config.aws.accessKeyId || '';
    this.secretAccessKey = config.aws.secretAccessKey || '';
    this.senderId = 'Nasneh';
  }

  /**
   * Check if SMS client is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.region &&
      this.accessKeyId &&
      this.secretAccessKey
    );
  }

  /**
   * Check if client is ready (configured or in dev mode)
   */
  isReady(): boolean {
    return config.isDevelopment || config.isTest || this.isConfigured();
  }

  /**
   * Send SMS message
   */
  async send(request: SmsMessageRequest): Promise<SmsMessageResponse> {
    const { phone, message } = request;

    // Development/Test mode - mock delivery
    if (config.isDevelopment || config.isTest) {
      return this.mockSend(phone, message);
    }

    // Production mode - check configuration
    if (!this.isConfigured()) {
      console.error('[SMS] AWS SNS not configured');
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      // Use AWS SDK v3 for SNS
      const response = await this.sendViaSns(phone, message);
      return response;
    } catch (error) {
      console.error('[SMS] Send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(phone: string, otp: string): Promise<SmsMessageResponse> {
    const message = `Your Nasneh verification code: ${otp}. Valid for ${config.otp.expiryMinutes} minutes. Do not share this code.`;
    return this.send({ phone, message });
  }

  /**
   * Send SMS via AWS SNS
   * Uses native fetch with AWS Signature v4
   */
  private async sendViaSns(
    phone: string,
    message: string
  ): Promise<SmsMessageResponse> {
    // AWS SNS API endpoint
    const endpoint = `https://sns.${this.region}.amazonaws.com/`;

    // Build request parameters
    const params = new URLSearchParams({
      Action: 'Publish',
      Version: '2010-03-31',
      PhoneNumber: phone,
      Message: message,
      'MessageAttributes.entry.1.Name': 'AWS.SNS.SMS.SenderID',
      'MessageAttributes.entry.1.Value.DataType': 'String',
      'MessageAttributes.entry.1.Value.StringValue': this.senderId,
      'MessageAttributes.entry.2.Name': 'AWS.SNS.SMS.SMSType',
      'MessageAttributes.entry.2.Value.DataType': 'String',
      'MessageAttributes.entry.2.Value.StringValue': 'Transactional',
    });

    // Generate AWS Signature v4
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.slice(0, 8);

    const headers = await this.signRequest({
      method: 'POST',
      endpoint,
      body: params.toString(),
      timestamp,
      date,
    });

    console.log(`[SMS] Sending to ${phone.slice(0, 7)}****`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SMS] AWS SNS error:', errorText);
      return {
        success: false,
        error: `AWS SNS error: ${response.status}`,
      };
    }

    const responseText = await response.text();

    // Parse MessageId from XML response
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : undefined;

    console.log(`[SMS] Sent successfully: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Sign AWS request with Signature v4
   */
  private async signRequest(params: {
    method: string;
    endpoint: string;
    body: string;
    timestamp: string;
    date: string;
  }): Promise<Record<string, string>> {
    const { method, endpoint, body, timestamp, date } = params;
    const service = 'sns';
    const host = new URL(endpoint).host;

    // Create canonical request
    const payloadHash = await this.sha256(body);
    const canonicalHeaders = `host:${host}\nx-amz-date:${timestamp}\n`;
    const signedHeaders = 'host;x-amz-date';

    const canonicalRequest = [
      method,
      '/',
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${this.region}/${service}/aws4_request`;
    const canonicalRequestHash = await this.sha256(canonicalRequest);

    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // Calculate signature
    const signingKey = await this.getSignatureKey(date, service);
    const signature = await this.hmacHex(signingKey, stringToSign);

    // Build authorization header
    const authorization = [
      `${algorithm} Credential=${this.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    return {
      'X-Amz-Date': timestamp,
      Authorization: authorization,
    };
  }

  /**
   * Get AWS signature key
   */
  private async getSignatureKey(date: string, service: string): Promise<ArrayBuffer> {
    const kDate = await this.hmac(`AWS4${this.secretAccessKey}`, date);
    const kRegion = await this.hmac(kDate, this.region);
    const kService = await this.hmac(kRegion, service);
    const kSigning = await this.hmac(kService, 'aws4_request');
    return kSigning;
  }

  /**
   * HMAC-SHA256
   */
  private async hmac(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyData = typeof key === 'string' ? encoder.encode(key) : key;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  }

  /**
   * HMAC-SHA256 returning hex string
   */
  private async hmacHex(key: ArrayBuffer, data: string): Promise<string> {
    const signature = await this.hmac(key, data);
    return this.bufferToHex(signature);
  }

  /**
   * SHA-256 hash
   */
  private async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return this.bufferToHex(hash);
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Mock SMS delivery for development
   */
  private mockSend(phone: string, message: string): SmsMessageResponse {
    const mockMessageId = `mock_sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log('[SMS] [DEV MODE] Mock SMS delivery:');
    console.log(`  Phone: ${phone}`);
    console.log(`  Message: ${message}`);
    console.log(`  Message ID: ${mockMessageId}`);

    return {
      success: true,
      messageId: mockMessageId,
    };
  }
}

// ===========================================
// Singleton Instance
// ===========================================

let smsClientInstance: SmsClient | null = null;

export function getSmsClient(): SmsClient {
  if (!smsClientInstance) {
    smsClientInstance = new SmsClient();
  }
  return smsClientInstance;
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Send OTP via SMS (convenience function)
 */
export async function sendSmsOtp(
  phone: string,
  otp: string
): Promise<SmsMessageResponse> {
  const client = getSmsClient();
  return client.sendOtp(phone, otp);
}
