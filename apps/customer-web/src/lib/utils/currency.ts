import { en } from '@nasneh/ui/copy';

/**
 * Format currency amount according to Nasneh standards
 * 
 * Standard: BHD with 3 decimal places
 * Example: 25.500 → "BHD 25.500"
 * 
 * @param amount - The amount to format (in BHD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return `${en.currency.bhd} ${amount.toFixed(3)}`;
}

/**
 * Format currency amount for display (shorter format)
 * 
 * @param amount - The amount to format (in BHD)
 * @returns Formatted currency string without trailing zeros
 */
export function formatCurrencyCompact(amount: number): string {
  const formatted = amount.toFixed(3);
  // Remove trailing zeros but keep at least one decimal place
  const trimmed = formatted.replace(/\.?0+$/, '');
  return `${en.currency.bhd} ${trimmed}`;
}
