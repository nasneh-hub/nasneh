/**
 * Nasneh Copy Tokens - Main Export
 * 
 * THE SINGLE SOURCE OF TRUTH for all UI text.
 * 
 * Usage:
 *   import { ar, en } from '@nasneh/ui/copy';
 *   import { FORBIDDEN_TERMS, APPROVED_TERMS } from '@nasneh/ui/copy';
 * 
 * Source: docs/SPECS/BRAND_VOICE.md
 * Version: 2.0
 * Last Updated: January 2026
 */

// Export copy tokens
export { ar } from './ar.js';
export { en } from './en.js';

// Export terminology
export {
  FORBIDDEN_TERMS,
  APPROVED_TERMS,
  BRAND_REPLACEMENTS,
  hasForbiddenTerms,
  replaceForbiddenTerms,
} from './terminology.js';

// Export types
export type { ArCopy } from './ar.js';
export type { EnCopy } from './en.js';
export type {
  ForbiddenTerms,
  ApprovedTerms,
  BrandReplacements,
} from './terminology.js';
