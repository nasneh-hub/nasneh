/**
 * Nasneh Brand Terminology
 * 
 * Forbidden terms and their approved replacements.
 * Used for CI linting and brand consistency enforcement.
 * 
 * Source: docs/SPECS/BRAND_VOICE.md Section 4
 * Version: 2.0
 * Last Updated: January 2026
 */

/**
 * FORBIDDEN TERMS
 * These words MUST NEVER appear in UI copy
 * CI will fail if any of these are found
 */
export const FORBIDDEN_TERMS = {
  /**
   * English Forbidden Terms
   * Source: Brand Voice Doc Section 4
   */
  en: {
    // Never say "local" - Nasneh means local
    local: 'Nasneh',
    Local: 'Nasneh',
    LOCAL: 'NASNEH',
    
    // Never say "vendor" or "seller" - use "Nasneh"
    vendor: 'Nasneh',
    Vendor: 'Nasneh',
    vendors: 'Nasneh',
    Vendors: 'Nasneh',
    seller: 'Nasneh',
    Seller: 'Nasneh',
    sellers: 'Nasneh',
    Sellers: 'Nasneh',
    
    // Never say "customer" - use "supporter"
    customer: 'supporter',
    Customer: 'Supporter',
    customers: 'supporters',
    Customers: 'Supporters',
    
    // Never say "help" - use "support"
    'help them': 'support',
    'Help them': 'Support',
    
    // Never say "cheap" - use "great value"
    cheap: 'great value',
    Cheap: 'Great value',
    
    // Never use spam tactics
    'URGENT!!!': 'Limited time',
    'URGENT!': 'Limited time',
    'BUY NOW!!!': 'Shop now',
  },
  
  /**
   * Arabic Forbidden Terms
   * Source: Brand Voice Doc Section 4
   */
  ar: {
    // Never say "محلي" - use "ناسنه"
    'محلي': 'ناسنه',
    'محلية': 'ناسنه',
    'المحلي': 'ناسنه',
    'المحلية': 'ناسنه',
    
    // Never say "بائع" - use "ناسنه"
    'بائع': 'ناسنه',
    'البائع': 'ناسنه',
    'بائعين': 'ناسنه',
    'البائعين': 'ناسنه',
    'بائعة': 'ناسنه',
    'البائعة': 'ناسنه',
    
    // Never say "زبون" - use "داعم"
    'زبون': 'داعم',
    'الزبون': 'الداعم',
    'زبائن': 'داعمين',
    'الزبائن': 'الداعمين',
    'عميل': 'داعم',
    'العميل': 'الداعم',
    'عملاء': 'داعمين',
    'العملاء': 'الداعمين',
    
    // Never say "ساعدهم" - use "ادعم"
    'ساعدهم': 'ادعم',
    'ساعد': 'ادعم',
    'المساعدة': 'الدعم',
    
    // Never say "رخيص" - use "قيمة ممتازة"
    'رخيص': 'قيمة ممتازة',
    'رخيصة': 'قيمة ممتازة',
    'سعر رخيص': 'قيمة ممتازة',
  },
} as const;

/**
 * APPROVED TERMINOLOGY
 * Use these terms consistently across the platform
 */
export const APPROVED_TERMS = {
  /**
   * English Approved Terms
   * Source: Brand Voice Doc Section 4
   */
  en: {
    // Core Identity
    platform: 'Nasneh',
    sellers: 'Nasneh',
    seller: 'Nasneh',
    buyers: 'Supporters',
    buyer: 'Supporter',
    community: 'Community',
    
    // Quality
    quality: 'Quality',
    premium: 'Premium',
    crafted: 'Crafted',
    
    // Growth
    empowerment: 'Empowerment',
    growth: 'Growth',
    support: 'Support',
    
    // Actions
    shop: 'Shop',
    browse: 'Browse',
    become: 'Become a Nasneh',
  },
  
  /**
   * Arabic Approved Terms
   * Source: Brand Voice Doc Section 4
   */
  ar: {
    // Core Identity
    platform: 'ناسنه',
    sellers: 'ناسنه',
    seller: 'ناسنه',
    buyers: 'داعمين',
    buyer: 'داعم',
    community: 'أهلنا',
    
    // Greetings
    welcome: 'حياكم',
    hi: 'أهلين',
    hello: 'يا هلا',
    
    // Quality
    quality: 'جودة',
    premium: 'تبيض الوجه',
    crafted: 'إتقان',
    
    // Growth
    empowerment: 'تمكين',
    growth: 'نكبر سوا',
    support: 'ادعم',
    sustainability: 'استدامة',
    
    // Actions
    shop: 'تسوّق',
    browse: 'تصفح',
    become: 'صير ناسنه',
  },
} as const;

/**
 * BRAND REPLACEMENTS
 * Automatic replacements for common mistakes
 */
export const BRAND_REPLACEMENTS = {
  en: {
    'All vendors': 'All Nasneh',
    'Browse vendors': 'Browse Nasneh',
    'Featured vendors': 'Featured Nasneh',
    'Become a vendor': 'Become a Nasneh',
    'Vendor dashboard': 'Nasneh Dashboard',
    'Our sellers': 'Our Nasneh',
    'Local marketplace': 'Nasneh marketplace',
    'Support local': 'Support Nasneh',
    'Local products': 'Nasneh products',
    'Local creators': 'Nasneh creators',
    'Shop local': 'Shop Nasneh',
  },
  
  ar: {
    'جميع البائعين': 'جميع ناسنه',
    'تصفح البائعين': 'تصفح ناسنه',
    'بائع مميز': 'ناسنه مميز',
    'انضم كبائع': 'صير ناسنه',
    'لوحة البائع': 'لوحة ناسنه',
    'بائعينا': 'ناسنتنا',
    'سوق محلي': 'سوق ناسنه',
    'ادعم المحلي': 'ادعم ناسنه',
    'منتجات محلية': 'منتجات ناسنه',
  },
} as const;

/**
 * Helper function to check if text contains forbidden terms
 */
export function hasForbiddenTerms(text: string, lang: 'en' | 'ar'): {
  found: boolean;
  terms: Array<{ forbidden: string; replacement: string }>;
} {
  const forbidden = FORBIDDEN_TERMS[lang];
  const found: Array<{ forbidden: string; replacement: string }> = [];
  
  for (const [term, replacement] of Object.entries(forbidden)) {
    if (text.includes(term)) {
      found.push({ forbidden: term, replacement });
    }
  }
  
  return {
    found: found.length > 0,
    terms: found,
  };
}

/**
 * Helper function to replace forbidden terms with approved ones
 */
export function replaceForbiddenTerms(text: string, lang: 'en' | 'ar'): string {
  let result = text;
  const forbidden = FORBIDDEN_TERMS[lang];
  
  for (const [term, replacement] of Object.entries(forbidden)) {
    result = result.replace(new RegExp(term, 'g'), replacement);
  }
  
  return result;
}

export type ForbiddenTerms = typeof FORBIDDEN_TERMS;
export type ApprovedTerms = typeof APPROVED_TERMS;
export type BrandReplacements = typeof BRAND_REPLACEMENTS;
