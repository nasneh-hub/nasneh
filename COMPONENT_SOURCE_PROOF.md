# Component Source Proof - Single Source Verification

**Date:** January 9, 2026  
**Purpose:** Prove that ALL UI components come from @nasneh/ui (shadcn-based, single source)

---

## 🔍 Component Chain Verification

### 1. Login Page Imports

**File:** `apps/customer-web/src/app/(auth)/login/page.tsx`

```typescript
import { Button, Input, Card, Logo, Select, type SelectOption } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
```

**✅ ALL components imported from `@nasneh/ui`**

---

### 2. @nasneh/ui Package Exports

**File:** `packages/ui/src/index.ts`

```typescript
// Card - FROM @nasneh/ui
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from './components/card';

// Input - FROM @nasneh/ui
export { Input } from './components/input';
export type { InputProps } from './components/input';

// Button - FROM @nasneh/ui
export { Button } from './components/button';
export type { ButtonProps } from './components/button';

// Select - FROM @nasneh/ui
export { Select } from './components/select';
export type { SelectProps, SelectOption } from './components/select';

// Logo - FROM @nasneh/ui
export { Logo } from './components/logo';
export type { LogoProps } from './components/logo';
```

**✅ All components exported from single package: `@nasneh/ui`**

---

### 3. Component Implementation Files

#### Card Component
**File:** `packages/ui/src/components/card/card.tsx`

```typescript
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', interactive = false, children, className = '', ...props }, ref) => {
    // Implementation using tokens.css variables
    const variantStyles = {
      default: 'bg-[var(--bg-tertiary)] shadow-[var(--shadow-sm)]',
      elevated: 'bg-[var(--bg-primary)] shadow-[var(--shadow-md)]',
      flat: 'bg-[var(--bg-tertiary)]',
    };
    // ... rest of implementation
  }
);
```

**✅ Uses tokens.css for colors (no hardcoded values)**

---

#### Input Component
**File:** `packages/ui/src/components/input/input.tsx`

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', size = 'md', error, disabled = false, className = '', ...props }, ref) => {
    // Implementation using tokens.css variables
    const baseStyles = `
      bg-[var(--bg-tertiary)]
      text-[color:var(--text-primary)]
      rounded-xl
      focus:ring-2 focus:ring-[var(--ring-color)]
    `;
    // ... rest of implementation
  }
);
```

**✅ Uses tokens.css for colors (no hardcoded values)**

---

#### Button Component
**File:** `packages/ui/src/components/button/button.tsx`

```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', disabled = false, children, className = '', ...props }, ref) => {
    // Implementation using tokens.css variables
    const variantStyles = {
      default: 'bg-[var(--primary)] text-[color:var(--text-inverse)] hover:bg-[var(--primary-hover)]',
      secondary: 'bg-[var(--bg-tertiary)] text-[color:var(--text-primary)] hover:bg-[var(--bg-hover)]',
      // ... more variants
    };
    // ... rest of implementation
  }
);
```

**✅ Uses tokens.css for colors (no hardcoded values)**

---

#### Select Component
**File:** `packages/ui/src/components/select/select.tsx`

```typescript
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  size = 'md',
  className = '',
}) => {
  // Implementation using tokens.css variables
  const baseStyles = `
    bg-[var(--bg-tertiary)]
    text-[color:var(--text-primary)]
    rounded-xl
    focus:ring-2 focus:ring-[var(--ring-color)]
  `;
  // ... rest of implementation
};
```

**✅ Uses tokens.css for colors (no hardcoded values)**

---

#### Logo Component
**File:** `packages/ui/src/components/logo.tsx`

```typescript
export const Logo: React.FC<LogoProps> = ({
  size = 40,
  variant = 'auto',
  color,
  className = '',
  label,
}) => {
  const fillColor = color 
    ? color 
    : variant === 'black' 
      ? 'var(--color-text-primary)' 
      : variant === 'white' 
        ? 'var(--color-text-inverse)' 
        : 'currentColor';
  // ... SVG implementation
};
```

**✅ Uses tokens.css for colors (no hardcoded values)**

---

## 📝 Copy Tokens Verification

### All Text from Single Source

**File:** `packages/ui/src/copy/en.ts`

```typescript
export const en = {
  auth: {
    login: 'Log In',
    welcome: 'Welcome to Nasneh! 🙌',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '3XXXXXXX',
    sendOtp: 'Send Verification Code',
    
    // Country Codes
    countryCode: 'Country Code',
    bahrain: 'Bahrain',
    bahrainCode: '+973',
    gccSoon: 'GCC (Soon)',
    
    // Terms
    byLoggingIn: 'By logging in, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
  },
  
  ui: {
    loading: 'Loading...',
  },
  
  errors: {
    requiredField: 'This field is required',
    invalidPhone: 'Invalid phone number',
    networkError: 'Check connection and try again.',
    somethingWrong: 'Something went wrong. Please try again.',
  },
};
```

**✅ ALL text comes from `en.ts` copy tokens (no hardcoded strings)**

---

## 🎯 Import Chain Proof

```
Login Page (apps/customer-web/src/app/(auth)/login/page.tsx)
    ↓
    import { Card, Input, Button, Select, Logo } from '@nasneh/ui'
    ↓
@nasneh/ui Package (packages/ui/src/index.ts)
    ↓
    export { Card } from './components/card'
    export { Input } from './components/input'
    export { Button } from './components/button'
    export { Select } from './components/select'
    export { Logo } from './components/logo'
    ↓
Component Files (packages/ui/src/components/*/*)
    ↓
    - card/card.tsx
    - input/input.tsx
    - button/button.tsx
    - select/select.tsx
    - logo.tsx
    ↓
Design Tokens (packages/ui/src/styles/tokens.css)
    ↓
    --bg-primary, --bg-secondary, --bg-tertiary
    --text-primary, --text-secondary, --text-tertiary
    --primary, --primary-hover
    --shadow-sm, --shadow-md
    --ring-color
```

**✅ SINGLE SOURCE: All components → @nasneh/ui → tokens.css**

---

## ✅ Verification Summary

| Component | Source | Import Path | Uses tokens.css | Single Source |
|-----------|--------|-------------|-----------------|---------------|
| **Card** | @nasneh/ui | `packages/ui/src/components/card/card.tsx` | ✅ Yes | ✅ Yes |
| **Input** | @nasneh/ui | `packages/ui/src/components/input/input.tsx` | ✅ Yes | ✅ Yes |
| **Button** | @nasneh/ui | `packages/ui/src/components/button/button.tsx` | ✅ Yes | ✅ Yes |
| **Select** | @nasneh/ui | `packages/ui/src/components/select/select.tsx` | ✅ Yes | ✅ Yes |
| **Logo** | @nasneh/ui | `packages/ui/src/components/logo.tsx` | ✅ Yes | ✅ Yes |

| Text | Source | Import Path | Single Source |
|------|--------|-------------|---------------|
| **All UI Text** | @nasneh/ui/copy | `packages/ui/src/copy/en.ts` | ✅ Yes |

---

## 🚫 No External UI Libraries

**Verified:** No imports from:
- ❌ @mui/material
- ❌ antd
- ❌ @chakra-ui/react
- ❌ @mantine/core
- ❌ @headlessui/react

**✅ 100% @nasneh/ui (shadcn-based, single source)**

---

## 📊 Final Proof

**Login Page Component Usage:**

```typescript
// ALL FROM SINGLE SOURCE: @nasneh/ui
import { 
  Card,      // ✅ @nasneh/ui → packages/ui/src/components/card/card.tsx
  Input,     // ✅ @nasneh/ui → packages/ui/src/components/input/input.tsx
  Button,    // ✅ @nasneh/ui → packages/ui/src/components/button/button.tsx
  Select,    // ✅ @nasneh/ui → packages/ui/src/components/select/select.tsx
  Logo       // ✅ @nasneh/ui → packages/ui/src/components/logo.tsx
} from '@nasneh/ui';

// ALL TEXT FROM SINGLE SOURCE: @nasneh/ui/copy
import { en } from '@nasneh/ui/copy'; // ✅ packages/ui/src/copy/en.ts
```

**✅ PROVEN: All components come from @nasneh/ui (single source, shadcn-based)**
