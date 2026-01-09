/**
 * Payment Provider Types
 * 
 * Defines the interface for payment providers.
 * Currently supports mock payment only.
 * Future: Add APS (Amazon Payment Services) provider.
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentProvider {
  /**
   * Process a payment for an order
   * @param orderId - The order ID to process payment for
   * @param amount - The amount to charge (in BHD)
   * @returns Payment result with success status and transaction ID
   */
  processPayment(orderId: string, amount: number): Promise<PaymentResult>;

  /**
   * Get the provider name
   */
  getName(): string;
}
