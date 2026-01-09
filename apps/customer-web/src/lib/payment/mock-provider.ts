import type { PaymentProvider, PaymentResult } from './types';

/**
 * Mock Payment Provider
 * 
 * Simulates payment processing for development and testing.
 * Does NOT store any sensitive data or card information.
 * 
 * Success/Failure can be controlled via:
 * - Query parameter: ?payment=fail
 * - Environment variable: MOCK_PAYMENT_FAIL=true
 */

export class MockPaymentProvider implements PaymentProvider {
  private shouldFail: boolean;

  constructor(shouldFail: boolean = false) {
    this.shouldFail = shouldFail;
  }

  async processPayment(orderId: string, amount: number): Promise<PaymentResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (this.shouldFail) {
      return {
        success: false,
        error: 'Mock payment failed (simulated)',
      };
    }

    // Generate mock transaction ID
    const transactionId = `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      transactionId,
    };
  }

  getName(): string {
    return 'Mock Payment Provider';
  }
}

/**
 * Get the configured payment provider
 * 
 * Currently returns MockPaymentProvider.
 * Future: Check env vars to determine which provider to use (Mock vs APS).
 */
export function getPaymentProvider(shouldFail: boolean = false): PaymentProvider {
  // Future: Add logic to switch between Mock and APS based on env
  // if (process.env.PAYMENT_PROVIDER === 'APS') {
  //   return new APSPaymentProvider();
  // }
  
  return new MockPaymentProvider(shouldFail);
}
