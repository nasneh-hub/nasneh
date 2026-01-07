# @nasneh/ui

This package is the **Single Source of Truth** for all UI components in the Nasneh platform.

## Core Principles

- **Consistency:** All components follow the same design language.
- **Accessibility:** All components are accessible by default.
- **Performance:** Components are optimized for speed.

## Import Paths

The package provides multiple import paths:

| Path | Description |
|------|-------------|
| `@nasneh/ui` | All components |
| `@nasneh/ui/copy` | Copy tokens (ar, en, terminology) |
| `@nasneh/ui/styles/tokens.css` | CSS design tokens |

## Quick Start

### 1. Import CSS Tokens

In your app's root layout or global CSS:

```css
/* globals.css */
@import '@nasneh/ui/styles/tokens.css';
```

Or in Next.js layout:

```tsx
// app/layout.tsx
import '@nasneh/ui/styles/tokens.css';
```

### 2. Import Components

```tsx
import { Button, Input, Card } from '@nasneh/ui';
```

### 3. Import Copy Tokens

```tsx
import { ar, en } from '@nasneh/ui/copy';

// Use in components
<Button>{ar.ui.save}</Button>
```

## Available Components (12 Core)

| Component | Description |
|-----------|-------------|
| `Button` | Primary interactive element |
| `Input` | Text entry field |
| `Card` | Content container |
| `Badge` | Status indicators |
| `Dialog` | Modal overlay |
| `Skeleton` | Loading placeholders |
| `Avatar` | User/vendor photos |
| `SegmentedControl` | 2-6 option selection |
| `Tabs` | Page navigation |
| `Toast` | Notifications |
| `Select` | Dropdown for 7+ options |
| `Table` | Data lists |
| `Logo` | Brand mark |

## Component Variants

### Button

```tsx
// Variants: 'default' | 'secondary' | 'ghost' | 'destructive'
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// Sizes: 'sm' | 'md' | 'lg'
<Button size="lg">Large Button</Button>
```

> ⚠️ **Note:** There is NO `variant="primary"` - use `variant="default"` instead.

### Logo

```tsx
// Variants: 'auto' | 'black' | 'white'
<Logo variant="auto" size={40} />  // Inherits parent color
<Logo variant="black" />           // For light backgrounds
<Logo variant="white" />           // For dark backgrounds
```

> ⚠️ **Note:** There is NO `variant="full"` - use `variant="auto"` instead.

### Input

```tsx
// Error prop is a STRING, not boolean
<Input error="Invalid email" />     // ✅ Correct
<Input error={!!error} />           // ❌ Wrong (boolean)
<Input error={error || undefined} /> // ✅ Correct
```

### Card

```tsx
// Use padding prop instead of CardContent className
<Card padding="lg">
  Content here
</Card>
```

## Copy Tokens

```tsx
import { ar, en } from '@nasneh/ui/copy';

// Arabic
ar.ui.save        // "حفظ"
ar.auth.login     // "تسجيل الدخول"
ar.errors.required // "هذا الحقل مطلوب"

// English
en.ui.save        // "Save"
en.auth.login     // "Login"
```

## UI Laws (Enforced by CI)

1. **NO BORDERS** - Use backgrounds and shadows
2. **ONLY rounded-xl/rounded-full** - No other radius values
3. **ONLY MONO COLORS** - Except semantic status
4. **ONLY Vazirmatn Font** - No other fonts
5. **NO className prop** - Components don't accept className

## Related Documentation

- **UI Law:** [`../../docs/SPECS/UI_LAW.md`](../../docs/SPECS/UI_LAW.md)
- **Design System:** [`../../docs/SPECS/DESIGN_SYSTEM.md`](../../docs/SPECS/DESIGN_SYSTEM.md)
- **Component Specs:** [`../../docs/SPECS/COMPONENT_SPECS.md`](../../docs/SPECS/COMPONENT_SPECS.md)
- **Brand Voice:** [`../../docs/SPECS/BRAND_VOICE.md`](../../docs/SPECS/BRAND_VOICE.md)

## Version

- **Package:** 0.0.1
- **Components:** 12/12 implemented
- **Last Updated:** January 2026
