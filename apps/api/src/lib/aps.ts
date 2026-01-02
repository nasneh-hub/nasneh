/**
 * Amazon Payment Services (APS) Integration - Nasneh API
 * Handles payment initiation, signature generation, and webhook verification
 */

import crypto from 'crypto';
import { config } from '../config/env.js';

// ===========================================
// Types
// ===========================================

export interface ApsPaymentRequest {
  command: 'PURCHASE' | 'AUTHORIZATION';
  merchant_identifier: string;
  access_code: string;
  merchant_reference: string;
  amount: string; // Amount in minor units (fils for BHD)
  currency: string;
  language: string;
  customer_email: string;
  return_url: string;
  signature: string;
  // Optional fields
  customer_name?: string;
  customer_ip?: string;
  order_description?: string;
}

export interface ApsPaymentResponse {
  command: string;
  merchant_identifier: string;
  access_code: string;
  merchant_reference: string;
  amount: string;
  currency: string;
  language: string;
  fort_id: string;
  response_code: string;
  response_message: string;
  status: string;
  signature: string;
  // Additional fields from APS
  payment_option?: string;
  card_number?: string;
  expiry_date?: string;
  card_holder_name?: string;
  authorization_code?: string;
  eci?: string;
}

export interface InitiatePaymentParams {
  merchantReference: string;
  amount: number; // Amount in BHD (e.g., 10.500)
  customerEmail: string;
  returnUrl: string;
  customerName?: string;
  customerIp?: string;
  orderDescription?: string;
}

// ===========================================
// APS Service
// ===========================================

export class ApsService {
  private merchantIdentifier: string;
  private accessCode: string;
  private shaRequestPhrase: string;
  private shaResponsePhrase: string;
  private checkoutUrl: string;
  private currency: string;

  constructor() {
    this.merchantIdentifier = config.aps.merchantIdentifier || '';
    this.accessCode = config.aps.accessCode || '';
    this.shaRequestPhrase = config.aps.shaRequestPhrase || '';
    this.shaResponsePhrase = config.aps.shaResponsePhrase || '';
    this.checkoutUrl = config.aps.checkoutUrl;
    this.currency = config.aps.currency;
  }

  /**
   * Check if APS is properly configured
   */
  isConfigured(): boolean {
    return config.aps.isConfigured;
  }

  /**
   * Generate SHA-256 signature for APS request
   * APS requires parameters to be sorted alphabetically and concatenated
   */
  generateRequestSignature(params: Record<string, string>): string {
    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // Build signature string: PHRASE + key=value pairs + PHRASE
    let signatureString = this.shaRequestPhrase;
    for (const key of sortedKeys) {
      if (params[key] !== undefined && params[key] !== '') {
        signatureString += `${key}=${params[key]}`;
      }
    }
    signatureString += this.shaRequestPhrase;

    // Generate SHA-256 hash
    return crypto.createHash('sha256').update(signatureString).digest('hex');
  }

  /**
   * Verify SHA-256 signature from APS response
   */
  verifyResponseSignature(params: Record<string, string>): boolean {
    const receivedSignature = params.signature;
    if (!receivedSignature) {
      return false;
    }

    // Remove signature from params for verification
    const paramsWithoutSignature = { ...params };
    delete paramsWithoutSignature.signature;

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(paramsWithoutSignature).sort();
    
    // Build signature string: PHRASE + key=value pairs + PHRASE
    let signatureString = this.shaResponsePhrase;
    for (const key of sortedKeys) {
      if (paramsWithoutSignature[key] !== undefined && paramsWithoutSignature[key] !== '') {
        signatureString += `${key}=${paramsWithoutSignature[key]}`;
      }
    }
    signatureString += this.shaResponsePhrase;

    // Generate expected SHA-256 hash
    const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature.toLowerCase()),
      Buffer.from(expectedSignature.toLowerCase())
    );
  }

  /**
   * Convert BHD amount to minor units (fils)
   * BHD has 3 decimal places, so 1 BHD = 1000 fils
   */
  toMinorUnits(amount: number): string {
    // Multiply by 1000 and round to avoid floating point issues
    return Math.round(amount * 1000).toString();
  }

  /**
   * Convert minor units (fils) back to BHD
   */
  fromMinorUnits(amount: string): number {
    return parseInt(amount, 10) / 1000;
  }

  /**
   * Build payment form data for redirect to APS checkout
   */
  buildPaymentFormData(params: InitiatePaymentParams): ApsPaymentRequest {
    const requestParams: Record<string, string> = {
      command: 'PURCHASE',
      merchant_identifier: this.merchantIdentifier,
      access_code: this.accessCode,
      merchant_reference: params.merchantReference,
      amount: this.toMinorUnits(params.amount),
      currency: this.currency,
      language: 'en',
      customer_email: params.customerEmail,
      return_url: params.returnUrl,
    };

    // Add optional fields
    if (params.customerName) {
      requestParams.customer_name = params.customerName;
    }
    if (params.customerIp) {
      requestParams.customer_ip = params.customerIp;
    }
    if (params.orderDescription) {
      requestParams.order_description = params.orderDescription;
    }

    // Generate signature
    const signature = this.generateRequestSignature(requestParams);

    return {
      ...requestParams,
      signature,
    } as ApsPaymentRequest;
  }

  /**
   * Get the APS checkout URL
   */
  getCheckoutUrl(): string {
    return this.checkoutUrl;
  }

  /**
   * Parse APS response status
   */
  parseResponseStatus(responseCode: string): 'success' | 'failed' | 'pending' {
    // APS response codes:
    // 14000 - Success
    // 14001-14999 - Various success/pending states
    // 00000-13999 - Various error states
    const code = parseInt(responseCode, 10);
    
    if (code === 14000) {
      return 'success';
    } else if (code >= 14001 && code <= 14999) {
      return 'pending';
    }
    return 'failed';
  }

  /**
   * Check if response indicates successful payment
   */
  isSuccessfulPayment(response: ApsPaymentResponse): boolean {
    return response.response_code === '14000' && response.status === '14';
  }

  /**
   * Check if response indicates authorization (not yet captured)
   */
  isAuthorizedPayment(response: ApsPaymentResponse): boolean {
    return response.response_code === '02000' && response.status === '02';
  }
}

// Export singleton instance
export const apsService = new ApsService();
