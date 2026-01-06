# Nasneh - Design System

**Version:** 3.0  
**Last Updated:** January 1, 2026  
**Status:** Source of Truth

---

## Implementation Notice

This document describes the *design theory*. For the actual implementation, see:

- **CSS Variables:** [`packages/ui/src/styles/tokens.css`](../../packages/ui/src/styles/tokens.css)
- **Copy & Terminology:** [`packages/ui/src/copy/`](../../packages/ui/src/copy/)
- **Component Specs:** [`COMPONENT_SPECS.md`](COMPONENT_SPECS.md)

---

## 1. Core Principles

### Design Philosophy
- **Mono colors** (Black, White, Gray)
- **No borders** (use backgrounds/shadows instead)
- **Single font** (Vazirmatn for Arabic + English)
- **Consistent radius** (12px everywhere)
- **Clean & minimal** (content-focused)

---

## 2. Logo & Brand Mark

### 2.1 Official Logo

The Nasneh logo is a stylized mark representing connection and flow - symbolizing "مني الك ومنك الي" (from me to you, from you to me).

### 2.2 Logo Files

| File | Fill | Usage |
|------|------|-------|
| `nasneh-logo.svg` | currentColor | **Primary** - adapts to text color |
| `nasneh-logo-black.svg` | #000000 | Marketing assets (light backgrounds) |
| `nasneh-logo-white.svg` | #FFFFFF | Marketing assets (dark backgrounds) |

> **Note:** All SVG files have **identical paths** - only the `fill` attribute differs.

### 2.3 Logo Component

```tsx
import { Logo } from '@nasneh/ui';

// Auto color (inherits from parent text color) - RECOMMENDED
<Logo size={40} />

// With accessible label (for important/standalone logos)
<Logo size={40} label="Nasneh" />

// Black variant
<Logo size={40} variant="black" />

// White variant
<Logo size={40} variant="white" />

// Custom color
<Logo size={40} color="#3B82F6" />
```

### 2.4 Logo Sizes

| Context | Size | Example |
|---------|------|--------|
| Favicon | 32px | Browser tab |
| Header | 40px | Navigation bar |
| Footer | 32px | Footer branding |
| Auth pages | 64px | Login/Register |
| Loading | 80px | Splash screen |
| Marketing | 120px+ | Landing pages |

### 2.5 Logo Clear Space

Maintain minimum clear space around the logo equal to 25% of the logo width.

### 2.6 Logo Don'ts

```
❌ Don't stretch or distort
❌ Don't rotate
❌ Don't add effects (shadow, glow)
❌ Don't use unapproved colors
❌ Don't place on busy backgrounds
```

---

## 3. Colors

### 3.1 Mono Palette (Primary)

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary BG** | #FFFFFF | #0A0A0A | Page background |
| **Secondary BG** | #FAFAFA | #111111 | Section background |
| **Tertiary BG** | #F5F5F5 | #1A1A1A | Card background |
| **Input BG** | #F5F5F5 | #262626 | Form inputs |
| **Hover BG** | #F3F4F6 | #1F1F1F | Hover states |
| **Text Primary** | #000000 | #FFFFFF | Main text |
| **Text Secondary** | #6B7280 | #9CA3AF | Secondary text |
| **Text Tertiary** | #9CA3AF | #6B7280 | Placeholder text |

### 3.2 Semantic Colors (Status Only)

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| **Success** | #10B981 | #34D399 | Completed, approved |
| **Warning** | #F59E0B | #FCD34D | Pending, attention |
| **Danger** | #EF4444 | #F87171 | Error, cancelled |
| **Info** | #3B82F6 | #60A5FA | Information |

### 3.3 Color Rules

**✅ DO:**
- Use mono colors for 95% of UI
- Use semantic colors for status only
- Use background colors for states

**❌ DON'T:**
- Use gradients
- Use decorative colors
- Use colored borders

---

## 4. Typography

### 4.1 Font Family

**Primary Font:** Vazirmatn (Arabic + English)

```
Source: Self-hosted
URL: https://fonts.google.com/specimen/Vazirmatn
Weights: 400, 500, 600, 700
```

**Why Vazirmatn:**
- Arabic-first with excellent English support
- Modern & professional
- RTL + LTR seamless
- Single font = faster loading

### 4.2 Font Sizes

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| **H1** | 32px | 700 | Page titles |
| **H2** | 24px | 600 | Section titles |
| **H3** | 20px | 600 | Card titles |
| **H4** | 18px | 500 | Subsections |
| **Body** | 16px | 400 | Regular text |
| **Small** | 14px | 400 | Secondary text |
| **Caption** | 12px | 400 | Labels, hints |

### 4.3 Font Installation

```
/public/fonts/vazirmatn/
├── Vazirmatn-Regular.woff2
├── Vazirmatn-Medium.woff2
├── Vazirmatn-SemiBold.woff2
└── Vazirmatn-Bold.woff2
```

---

## 5. Spacing

### Base Unit: 4px

```
4px   = 0.25rem (xs)
8px   = 0.5rem  (sm)
12px  = 0.75rem (md)
16px  = 1rem    (lg)
20px  = 1.25rem
24px  = 1.5rem  (xl)
32px  = 2rem    (2xl)
40px  = 2.5rem
48px  = 3rem    (3xl)
64px  = 4rem    (4xl)
```

---

## 6. Border Radius

### Standard: 12px (rounded-xl)

**Apply to EVERYTHING:**
- Buttons
- Inputs
- Cards
- Modals
- Dropdowns
- Tables
- Images
- Badges

**Exception:** Icon buttons use `rounded-full`

### ❌ NEVER Use:
- rounded-sm
- rounded-md
- rounded-lg
- rounded-none

---

## 7. No-Border Design

### ⚠️ CRITICAL: No Borders Allowed

**Instead of borders, use:**

1. **Background colors**
```tsx
// Card on gray background
<div className="bg-white">Content</div>

// Input field
<input className="bg-gray-100" />
```

2. **Spacing**
```tsx
<section className="py-8">Content</section>
```

3. **Subtle shadows**
```tsx
<div className="shadow-sm">Card</div>
```

### Hover States (No Border)
```tsx
// Button
<button className="hover:bg-gray-800">Click</button>

// Card
<div className="hover:bg-gray-50">Card</div>
```

### Focus States (Ring, Not Border)
```tsx
<input className="focus:ring-2 focus:ring-black focus:ring-offset-2" />
```

### Form Validation (Background, Not Border)
```tsx
// Error state
<input className="bg-red-100" />

// Success state
<input className="bg-green-100" />
```

---

## 8. Component Heights

### Standard Heights

| Size | Height | Usage |
|------|--------|-------|
| **xs** | 32px | Compact buttons |
| **sm** | 40px | Small inputs |
| **md** | 48px | Default (buttons, inputs) |
| **lg** | 56px | Large buttons |

---

## 9. Components

### 9.1 Buttons

```tsx
// Primary (default)
<Button variant="default">
  Black bg, white text, rounded-xl, 48px height
</Button>

// Secondary
<Button variant="secondary">
  Gray bg, black text, rounded-xl
</Button>

// Ghost
<Button variant="ghost">
  Transparent bg, hover: gray bg
</Button>

// Destructive
<Button variant="destructive">
  Red bg (only for dangerous actions)
</Button>

// Icon button (exception: rounded-full)
<Button variant="ghost" size="icon" className="rounded-full">
  <Icon />
</Button>
```

### 9.2 Inputs

```tsx
<Input
  className="
    h-12              // 48px height
    bg-gray-100       // Gray background
    rounded-xl        // 12px radius
    border-none       // NO BORDER
    px-4              // Horizontal padding
    focus:ring-2      // Focus ring
    focus:ring-black
  "
/>

// Error state
<Input className="bg-red-100" />

// Success state
<Input className="bg-green-100" />
```

### 9.3 Cards

```tsx
<Card className="
  bg-white          // White background
  rounded-xl        // 12px radius
  shadow-sm         // Subtle shadow
  p-4               // Padding
  // NO BORDER
">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 9.4 Badges

```tsx
// Success
<Badge variant="success">Completed</Badge>  // Green bg

// Warning
<Badge variant="warning">Pending</Badge>    // Yellow bg

// Error
<Badge variant="destructive">Cancelled</Badge>  // Red bg

// Default
<Badge variant="default">New</Badge>        // Gray bg

// All badges: rounded-xl, NO BORDER
```

### 9.5 Tables

```tsx
<Table className="rounded-xl overflow-hidden">
  // NO borders between rows
  // Use hover:bg-gray-50 for row hover
  // Use alternating backgrounds OR spacing for separation
</Table>
```

### 9.6 Modals

```tsx
<Dialog>
  <DialogContent className="
    bg-white
    rounded-xl
    shadow-lg
    // NO BORDER
  ">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

---

## 10. Shared UI Package

### Location
All UI components live in `packages/ui/` (imported as `@nasneh/ui`)

### File Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── select.tsx
│   ├── styles/
│   │   └── tokens.css       # CSS variables
│   └── index.ts             # Export all
├── package.json
└── README.md
```

### Import Rule

```tsx
// ✅ CORRECT - Import from shared package
import { Button, Input, Card } from '@nasneh/ui'

// ❌ WRONG - Never create local components
const MyButton = () => <button>...</button>

// ❌ WRONG - Never import from relative path
import { Button } from '../../../packages/ui'
```

### In Apps (customer-web, dashboard, api)

Each app imports from the shared package:
```json
// apps/customer-web/package.json
{
  "dependencies": {
    "@nasneh/ui": "workspace:*"
  }
}
````

### Style Rule

```tsx
// ✅ CORRECT - Use component props
<Button size="lg">Click</Button>

// ❌ WRONG - Override styles
<Button className="h-16">Click</Button>
```

---

## 11. CSS Variables

```css
/* /src/core/styles/tokens.css */

:root {
  /* Font */
  --font-family-primary: 'Vazirmatn', system-ui, sans-serif;
  
  /* Border Radius */
  --radius-standard: 0.75rem;  /* 12px */
  
  /* Colors - Light */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --bg-tertiary: #F5F5F5;
  --input-bg: #F5F5F5;
  --input-bg-error: #FEE2E2;
  --input-bg-success: #D1FAE5;
  --text-primary: #000000;
  --text-secondary: #6B7280;
  --hover-bg: #F3F4F6;
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
}

.dark {
  --bg-primary: #0A0A0A;
  --bg-secondary: #111111;
  --bg-tertiary: #1A1A1A;
  --input-bg: #262626;
  --input-bg-error: #450A0A;
  --input-bg-success: #052E16;
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --hover-bg: #1F1F1F;
}
```

---

## 12. Responsive Breakpoints

```
sm:  640px   // Mobile landscape
md:  768px   // Tablet
lg:  1024px  // Laptop
xl:  1280px  // Desktop
2xl: 1536px  // Large desktop
```

**Approach:** Mobile-first

---

## 13. Quick Reference Checklist

Before submitting UI work, verify:

- [ ] Font is Vazirmatn only
- [ ] Colors are mono (except semantic)
- [ ] All radius = rounded-xl (12px)
- [ ] NO borders anywhere
- [ ] Heights: 32/40/48/56px
- [ ] Components from @nasneh/ui
- [ ] No inline style overrides
- [ ] Spacing uses 4px grid
- [ ] Focus states use ring (not border)
- [ ] Validation uses background (not border)
- [ ] Mobile-responsive
- [ ] Touch targets ≥ 48px

**If ANY fails → Work will be rejected**

---

## 14. Forbidden vs Required

### ❌ Forbidden

```
- Borders
- rounded-sm, rounded-md, rounded-lg
- Multiple fonts
- CDN font loading
- Colored borders for validation
- Components outside @nasneh/ui
- Overriding core styles
- Gradients
- Decorative colors
```

### ✅ Required

```
- rounded-xl everywhere
- Background colors for states
- Vazirmatn font (self-hosted)
- Components from @nasneh/ui
- CSS Variables for theming
- Ring for focus states
- Mono colors (95% of UI)
```

---

**Document End**
