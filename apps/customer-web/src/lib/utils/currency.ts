import { en } from '@nasneh/ui/copy';

/**
 * Format currency amount according to Nasneh standards
 * 
 * Standard: BHD with 3 decimal places
 * Example: 25.500 → "BHD 25.500"
 * 
 * @param amount - The amount to format (in BHD) - accepts number, string, null, or undefined
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  // Handle null/undefined
  if (amount == null) {
    return `${en.currency.bhd} 0.000`;
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numAmount)) {
    return `${en.currency.bhd} 0.000`;
  }

  return `${en.currency.bhd} ${numAmount.toFixed(3)}`;
}

/**
 * Format currency amount for display (shorter format)
 * 
 * @param amount - The amount to format (in BHD) - accepts number, string, null, or undefined
 * @returns Formatted currency string without trailing zeros
 */
export function formatCurrencyCompact(amount: number | string | null | undefined): string {
  // Handle null/undefined
  if (amount == null) {
    return `${en.currency.bhd} 0`;
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numAmount)) {
    return `${en.currency.bhd} 0`;
  }

  const formatted = numAmount.toFixed(3);
  // Remove trailing zeros but keep at least one decimal place
  const trimmed = formatted.replace(/\.?0+$/, '');
  return `${en.currency.bhd} ${trimmed}`;
}
