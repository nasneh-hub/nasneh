# Nasneh UI Law (Shadcn-First)

**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** ENFORCED — Violations will cause PR rejection

---

## Purpose

This document defines the **RELAXED UI LAW** that governs all UI development in the Nasneh platform. The new policy embraces **shadcn/ui components as-is** while preserving Nasneh brand identity through a **Single Source of Truth**: `packages/ui/src/styles/tokens.css`.

**Philosophy:** Reduce friction for UI work by allowing shadcn semantic utilities freely, while enforcing brand consistency through CSS variables only.

---

## The New Rules

### ✅ ALLOWED

#### 1. Shadcn/UI Components As-Is
- Copy/paste shadcn/ui components **literally without editing** their internal color logic
- Use shadcn semantic utility classes freely:
  - `bg-background`, `text-foreground`, `border-border`
  - `bg-primary`, `text-primary-foreground`
  - `bg-muted`, `text-muted-foreground`
  - `bg-card`, `text-card-foreground`
  - `ring-ring`, `bg-accent`, `text-accent-foreground`
  - `bg-secondary`, `text-secondary-foreground`
  - `bg-destructive`, `text-destructive-foreground`

#### 2. Tailwind for Layout Only
- Flexbox: `flex`, `flex-col`, `flex-row`, `items-*`, `justify-*`
- Grid: `grid`, `grid-cols-*`, `grid-rows-*`
- Spacing: `gap-*`, `p-*`, `m-*`, `space-*`
- Sizing: `w-*`, `h-*`, `min-w-*`, `max-w-*`
- Border radius: `rounded-*` (all variants allowed)
- Shadows: `shadow-*`
- Positioning: `absolute`, `relative`, `fixed`, `sticky`, `top-*`, `left-*`
- Z-index: `z-*`
- Display: `block`, `inline`, `hidden`

#### 3. CSS Modules for Complex Styling
- Allowed for complex positioning, z-index, transitions, animations
- **NO colors inside CSS Modules** — colors MUST come from tokens.css

```tsx
// ✅ CORRECT: CSS Module for layout/animation
import styles from './component.module.css';

<div className={styles.container}>
  <div className="bg-background text-foreground">
    Content
  </div>
</div>
```

```css
/* component.module.css */
.container {
  position: relative;
  z-index: 10;
  transition: transform 0.2s ease;
}

.container:hover {
  transform: scale(1.05);
}
```

---

### ❌ FORBIDDEN (Hard Fail)

#### 1. Hex Colors Anywhere
**Rule:** NO hex colors except inside `packages/ui/src/styles/tokens.css`

```tsx
// ❌ WRONG
<div style={{ color: '#fff' }}>...</div>
<div style={{ backgroundColor: '#111827' }}>...</div>
<button className="hover:bg-[#3b82f6]">...</button>

// ✅ CORRECT
<div className="text-foreground">...</div>
<div className="bg-background">...</div>
<button className="hover:bg-primary">...</button>
```

#### 2. Tailwind Palette Colors Anywhere
**Rule:** NO Tailwind color palette classes (e.g., `bg-slate-*`, `text-gray-*`)

```tsx
// ❌ WRONG
<div className="bg-slate-100">...</div>
<p className="text-gray-700">...</p>
<button className="bg-blue-500 hover:bg-blue-600">...</button>
<div className="border-zinc-300">...</div>
<span className="text-red-500">Error</span>

// ✅ CORRECT
<div className="bg-muted">...</div>
<p className="text-foreground">...</p>
<button className="bg-primary hover:bg-primary/90">...</button>
<div className="border-border">...</div>
<span className="text-destructive">Error</span>
```

#### 3. Inline Styles for Colors
**Rule:** NO inline color styles

```tsx
// ❌ WRONG
<div style={{ color: 'red' }}>...</div>
<div style={{ backgroundColor: 'white' }}>...</div>
<button style={{ borderColor: '#ccc' }}>...</button>

// ✅ CORRECT
<div className="text-destructive">...</div>
<div className="bg-background">...</div>
<button className="border-border">...</button>
```

#### 4. Localhost in Staging/Prod Configs
**Rule:** NO `localhost` in any `NEXT_PUBLIC_*` environment variables for staging/production

```bash
# ❌ WRONG
NEXT_PUBLIC_API_URL=http://localhost:3000

# ✅ CORRECT
NEXT_PUBLIC_API_URL=https://api.nasneh.com
```

---

## Brand Enforcement (Single Source of Truth)

### The Rule
**ALL brand colors MUST come from:** `packages/ui/src/styles/tokens.css`

### Implementation
Map Nasneh "Nature" palette into shadcn CSS variables so shadcn components work unchanged:

```css
/* packages/ui/src/styles/tokens.css */
:root {
  /* Shadcn semantic variables mapped to Nasneh Nature palette */
  --background: #FFFFFF;           /* Nasneh bg-primary */
  --foreground: #1A1A1A;          /* Nasneh text-primary */
  
  --primary: #2D5016;             /* Nasneh Nature Green */
  --primary-foreground: #FFFFFF;
  
  --secondary: #F5F5F5;           /* Nasneh bg-secondary */
  --secondary-foreground: #1A1A1A;
  
  --muted: #F9F9F9;               /* Nasneh bg-tertiary */
  --muted-foreground: #666666;    /* Nasneh text-secondary */
  
  --accent: #E8F0E3;              /* Nasneh Nature Light Green */
  --accent-foreground: #2D5016;
  
  --destructive: #DC2626;         /* Semantic red */
  --destructive-foreground: #FFFFFF;
  
  --border: #E5E5E5;              /* Nasneh border color */
  --input: #E5E5E5;
  --ring: #2D5016;                /* Focus ring */
  
  --card: #FFFFFF;
  --card-foreground: #1A1A1A;
  
  --radius: 0.75rem;              /* 12px - Nasneh standard */
}
```

### Font Enforcement
**Vazirmatn MUST remain the only font**, as defined in:
- `packages/ui/src/styles/globals.css`

**NO importing other fonts** (Google Fonts, CDN fonts, etc.)

---

## CI Enforcement (3 Checks Only)

### Check #1: Hex Color Scan
**Fail if:** `#([0-9a-fA-F]{3,8})` exists anywhere **except** `packages/ui/src/styles/tokens.css`

**Output:** File path + matched hex color

```bash
# Example violation
apps/customer-web/src/app/page.tsx:45: style={{ color: '#fff' }}
```

### Check #2: Tailwind Palette Scan
**Fail if:** Any of these patterns exist:
```regex
\b(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b
```

**Output:** File path + matched class

```bash
# Example violation
apps/customer-web/src/components/Button.tsx:12: className="bg-blue-500"
```

### Check #3: No Localhost in Staging/Prod
**Fail if:** Any `NEXT_PUBLIC_*` contains `localhost` in staging/prod build context

**Output:** File path + matched env var

```bash
# Example violation
apps/customer-web/.env.production:1: NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Examples

### ✅ CORRECT: Shadcn Component As-Is
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle className="text-foreground">Welcome</CardTitle>
  </CardHeader>
  <CardContent className="bg-muted">
    <p className="text-muted-foreground">Description</p>
    <Button variant="default" className="bg-primary text-primary-foreground">
      Click Me
    </Button>
  </CardContent>
</Card>
```

### ✅ CORRECT: Layout with Tailwind
```tsx
<div className="flex flex-col gap-4 p-6 rounded-xl shadow-lg">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
  <p className="text-muted-foreground">Subtitle</p>
  <div className="grid grid-cols-2 gap-2">
    <Button className="bg-primary">Action 1</Button>
    <Button className="bg-secondary">Action 2</Button>
  </div>
</div>
```

### ❌ WRONG: Hex Colors
```tsx
<div style={{ backgroundColor: '#f5f5f5' }}>  {/* CI FAIL */}
  <p style={{ color: '#666' }}>Text</p>       {/* CI FAIL */}
</div>
```

### ❌ WRONG: Tailwind Palette Colors
```tsx
<div className="bg-gray-100">                 {/* CI FAIL */}
  <p className="text-slate-700">Text</p>      {/* CI FAIL */}
  <Button className="bg-blue-500">Click</Button>  {/* CI FAIL */}
</div>
```

---

## Migration Guide (From Old UI Law)

### Old Law #1 (NO BORDERS) → **REMOVED**
- **Before:** Borders forbidden
- **Now:** Use `border-border` freely (mapped to Nasneh color in tokens.css)

### Old Law #2 (ONLY rounded-xl) → **RELAXED**
- **Before:** Only `rounded-xl` or `rounded-full`
- **Now:** All `rounded-*` variants allowed

### Old Law #3 (ONLY MONO COLORS) → **REPLACED**
- **Before:** Only mono colors except semantic status
- **Now:** Use shadcn semantic classes (`bg-primary`, `text-foreground`, etc.)

### Old Law #4 (ONLY Vazirmatn) → **KEPT**
- **Before:** Only Vazirmatn font
- **Now:** Still only Vazirmatn (enforced in tokens.css)

### Old Law #5 (ONLY @nasneh/ui) → **RELAXED**
- **Before:** Only components from `@nasneh/ui`
- **Now:** Shadcn components allowed as-is

---

## Quick Reference

### Allowed Patterns
| Pattern | Example |
|---------|---------|
| Shadcn semantic classes | `bg-background`, `text-foreground`, `border-border` |
| Tailwind layout | `flex`, `grid`, `gap-4`, `p-6`, `rounded-xl` |
| CSS Modules (no colors) | `className={styles.container}` |

### Forbidden Patterns
| Pattern | Example | CI Check |
|---------|---------|----------|
| Hex colors | `#fff`, `#111827` | Check #1 |
| Tailwind palette | `bg-slate-100`, `text-gray-700` | Check #2 |
| Inline color styles | `style={{ color: 'red' }}` | Check #1 |
| Localhost in prod | `NEXT_PUBLIC_API_URL=http://localhost:3000` | Check #3 |

---

## Related Documentation
- **Design Tokens:** `packages/ui/src/styles/tokens.css` - Single Source of Truth for all colors
- **Brand Voice:** `docs/SPECS/BRAND_VOICE.md` - Copy and terminology rules
- **Component Specs:** `docs/SPECS/COMPONENT_SPECS.md` - Component implementation details

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release - 5 strict laws |
| 1.1 | Jan 2026 | Added Known False Positives section |
| 2.0 | Jan 2026 | **MANDATE: Relaxed to shadcn-first approach** |

---

**Remember:** The goal is to reduce friction while preserving brand consistency. Use shadcn freely, but ALL colors MUST come from `tokens.css`.

**Document End**
