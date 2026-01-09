# Footer Hardcoded Text - PROOF

**File:** `apps/customer-web/src/components/layout/footer.tsx`  
**Issue:** Footer contains **100% HARDCODED TEXT** - NO copy tokens used

---

## ❌ PROOF: Footer is HARDCODED

### 1. No Copy Token Imports
```typescript
// Line 1-6: Imports
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@nasneh/ui';
// ❌ NO IMPORT: import { en } from '@nasneh/ui/copy';
```

**Result:** Footer does NOT import copy tokens at all.

---

### 2. All Text is Hardcoded

#### Hardcoded Link Names (Lines 11-33)
```typescript
const footerLinks = {
  marketplace: [
    { name: 'Kitchens', href: '/kitchens' },           // ❌ HARDCODED
    { name: 'Craft', href: '/craft' },                 // ❌ HARDCODED
    { name: 'Products', href: '/products' },           // ❌ HARDCODED
    { name: 'Food Trucks', href: '/food-trucks' },     // ❌ HARDCODED
    { name: 'Services', href: '/services' },           // ❌ HARDCODED
  ],
  company: [
    { name: 'About Us', href: '/about' },              // ❌ HARDCODED
    { name: 'How It Works', href: '/how-it-works' },   // ❌ HARDCODED
    { name: 'Careers', href: '/careers' },             // ❌ HARDCODED
    { name: 'Press', href: '/press' },                 // ❌ HARDCODED
  ],
  support: [
    { name: 'Help Center', href: '/support' },         // ❌ HARDCODED
    { name: 'Safety', href: '/safety' },               // ❌ HARDCODED
    { name: 'Contact Us', href: '/contact' },          // ❌ HARDCODED
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },      // ❌ HARDCODED
    { name: 'Privacy Policy', href: '/privacy' },      // ❌ HARDCODED
    { name: 'Cookie Policy', href: '/cookies' },       // ❌ HARDCODED
  ],
};
```

#### Hardcoded Tagline (Line 65)
```typescript
<p>
  From us, for us — Your marketplace for homemade food, handcrafted products, and trusted services
  // ❌ HARDCODED - Should be: {en.taglines.primary}
</p>
```

#### Hardcoded Section Titles (Lines 79, 109, 139, 169)
```typescript
<h3>Marketplace</h3>     // ❌ HARDCODED - Should be: {en.footer.marketplace}
<h3>Company</h3>         // ❌ HARDCODED - Should be: {en.footer.company}
<h3>Support</h3>         // ❌ HARDCODED - Should be: {en.footer.support}
<h3>Legal</h3>           // ❌ HARDCODED - Should be: {en.footer.legal}
```

#### Hardcoded Copyright Text (Line 260)
```typescript
<p>
  Made with care in Bahrain
  // ❌ HARDCODED - Should be: {en.footer.madeIn} + {en.footer.bahrain}
</p>
```

---

## 📊 Hardcoded Text Summary

| Category | Hardcoded Items | Should Use |
|----------|----------------|------------|
| **Link Names** | 15 items | `en.categories.*`, `en.footer.*` |
| **Section Titles** | 4 items | `en.footer.marketplace`, etc. |
| **Tagline** | 1 item | `en.taglines.primary` |
| **Copyright** | 1 item | `en.footer.madeIn` + location |
| **TOTAL** | **21 hardcoded strings** | Copy tokens |

---

## ✅ What Should Be Done

### Step 1: Add Footer Tokens to `en.ts`
```typescript
footer: {
  // Section Titles
  marketplace: 'Marketplace',
  company: 'Company',
  support: 'Support',
  legal: 'Legal',
  
  // Marketplace Links
  kitchens: 'Kitchens',
  craft: 'Craft',
  products: 'Products',
  foodTrucks: 'Food Trucks',
  services: 'Services',
  
  // Company Links
  aboutUs: 'About Us',
  howItWorks: 'How It Works',
  careers: 'Careers',
  press: 'Press',
  
  // Support Links
  helpCenter: 'Help Center',
  safety: 'Safety',
  contactUs: 'Contact Us',
  
  // Legal Links
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  cookiePolicy: 'Cookie Policy',
  
  // Copyright
  madeIn: 'Made with care in',
  bahrain: 'Bahrain',
}
```

### Step 2: Update Footer Component
```typescript
import { en } from '@nasneh/ui/copy';

const footerLinks = {
  marketplace: [
    { name: en.footer.kitchens, href: '/kitchens' },
    { name: en.footer.craft, href: '/craft' },
    // ... etc
  ],
  // ... etc
};

// Section titles
<h3>{en.footer.marketplace}</h3>

// Copyright
<p>{en.footer.madeIn} {en.footer.bahrain}</p>
```

---

## 🚨 VIOLATION: Single Source Rule

**Rule:** ALL UI text MUST come from copy tokens (`en.ts` or `ar.ts`)

**Current Status:** Footer violates this rule with 21 hardcoded strings

**Required Action:** 
1. Add all footer text to `packages/ui/src/copy/en.ts`
2. Update footer component to import and use copy tokens
3. Remove ALL hardcoded strings

---

## Status: ❌ FOOTER IS 100% HARDCODED

**Evidence:** No copy token imports, 21 hardcoded English strings found.
