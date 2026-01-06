# Nasneh UI Law

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** ENFORCED — Violations will cause PR rejection

---

## Purpose

This document defines **5 STRICT LAWS** that govern all UI development in the Nasneh platform. These laws are **NON-NEGOTIABLE** and enforced through automated CI checks.

**Source:** `docs/SPECS/DESIGN_SYSTEM.md`

---

## The 5 Laws

### Law #1: NO BORDERS ANYWHERE

**Rule:** Borders are forbidden. Use backgrounds, shadows, or spacing instead.

#### ❌ CANNOT
```tsx
// Borders for containers
<div className="border border-gray-300">...</div>
<div style={{ border: '1px solid #ccc' }}>...</div>

// Borders for inputs
<input className="border-2 border-black" />

// Borders for validation
<input className="border-red-500" />  // Error state
<input className="border-green-500" />  // Success state

// Borders for focus
<button className="focus:border-blue-500">...</button>
```

#### ✅ CAN
```tsx
// Use backgrounds for containers
<div className="bg-tertiary shadow-sm">...</div>
<div style={{ background: 'var(--bg-tertiary)' }}>...</div>

// Use backgrounds for inputs
<input style={{ background: 'var(--input-bg)' }} />

// Use backgrounds for validation
<input style={{ background: 'var(--input-bg-error)' }} />  // Error
<input style={{ background: 'var(--input-bg-success)' }} />  // Success

// Use ring for focus
<button className="focus:ring-2">...</button>
<button style={{ boxShadow: '0 0 0 2px var(--ring-color)' }}>...</button>
```

#### Why?
Borders create visual clutter and conflict with our mono design system. Backgrounds and shadows provide cleaner separation.

#### Exceptions
**NONE.** This law has no exceptions.

---

### Law #2: ONLY rounded-xl (12px) OR rounded-full

**Rule:** All components use `rounded-xl` (12px). Icon buttons use `rounded-full`. Nothing else.

#### ❌ CANNOT
```tsx
// Other radius values
<div className="rounded-sm">...</div>   // 2px - FORBIDDEN
<div className="rounded-md">...</div>   // 6px - FORBIDDEN
<div className="rounded-lg">...</div>   // 8px - FORBIDDEN
<div className="rounded-2xl">...</div>  // 16px - FORBIDDEN
<div className="rounded-3xl">...</div>  // 24px - FORBIDDEN

// Custom radius
<div style={{ borderRadius: '8px' }}>...</div>
<div style={{ borderRadius: '16px' }}>...</div>

// Mixed radius
<div className="rounded-t-lg rounded-b-xl">...</div>
```

#### ✅ CAN
```tsx
// Standard radius for ALL components
<div className="rounded-xl">...</div>
<button className="rounded-xl">...</button>
<input className="rounded-xl" />
<div style={{ borderRadius: 'var(--radius-standard)' }}>...</div>

// Full radius ONLY for icon buttons
<button className="rounded-full">
  <Icon />
</button>
<button style={{ borderRadius: 'var(--radius-full)' }}>
  <Icon />
</button>
```

#### Why?
Consistent radius creates visual harmony. 12px is the perfect balance between modern and friendly.

#### Exceptions
**ONLY** icon buttons can use `rounded-full`. Everything else MUST use `rounded-xl`.

---

### Law #3: ONLY MONO COLORS (Except Semantic Status)

**Rule:** 95% of UI uses mono colors (black/white/gray). Color is ONLY for semantic status indicators.

#### ❌ CANNOT
```tsx
// Colored backgrounds for decoration
<div className="bg-blue-500">...</div>
<div className="bg-purple-600">...</div>
<button className="bg-gradient-to-r from-pink-500 to-purple-500">...</button>

// Colored text for decoration
<h1 className="text-blue-600">Welcome</h1>
<p className="text-purple-500">Description</p>

// Colored borders (already forbidden by Law #1)
<div className="border-blue-500">...</div>

// Multiple colors in one component
<button className="bg-blue-500 text-white hover:bg-purple-600">...</button>
```

#### ✅ CAN
```tsx
// Mono backgrounds
<div style={{ background: 'var(--bg-primary)' }}>...</div>
<div style={{ background: 'var(--bg-secondary)' }}>...</div>
<div style={{ background: 'var(--bg-tertiary)' }}>...</div>

// Mono text
<h1 style={{ color: 'var(--text-primary)' }}>Welcome</h1>
<p style={{ color: 'var(--text-secondary)' }}>Description</p>

// Semantic colors ONLY for status
<Badge variant="success">Approved</Badge>  // Green
<Badge variant="warning">Pending</Badge>   // Yellow
<Badge variant="danger">Rejected</Badge>   // Red
<Badge variant="info">New</Badge>          // Blue

// Semantic backgrounds for validation
<input style={{ background: 'var(--input-bg-error)' }} />
<div style={{ background: 'var(--color-success)' }}>✓ Success</div>
```

#### Why?
Mono colors create a professional, premium feel. Color becomes meaningful when reserved for status.

#### Exceptions
**ONLY** semantic status indicators can use color:
- Success (green)
- Warning (yellow)
- Danger (red)
- Info (blue)

---

### Law #4: ONLY Vazirmatn Font

**Rule:** The entire platform uses ONE font: Vazirmatn. No exceptions.

#### ❌ CANNOT
```tsx
// Other fonts
<h1 style={{ fontFamily: 'Arial' }}>...</h1>
<p style={{ fontFamily: 'Helvetica' }}>...</p>
<div style={{ fontFamily: 'Roboto, sans-serif' }}>...</div>

// Multiple fonts
<h1 style={{ fontFamily: 'Montserrat' }}>Heading</h1>
<p style={{ fontFamily: 'Open Sans' }}>Body</p>

// CDN font loading
<link href="https://fonts.googleapis.com/css2?family=Roboto" />

// System fonts override
<div style={{ fontFamily: 'system-ui' }}>...</div>
```

#### ✅ CAN
```tsx
// Vazirmatn via CSS variable
<h1 style={{ fontFamily: 'var(--font-family-primary)' }}>...</h1>
<p style={{ fontFamily: 'var(--font-family-primary)' }}>...</p>

// Vazirmatn directly (if needed)
<div style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif' }}>...</div>

// Different weights (same font)
<h1 style={{ fontWeight: 'var(--font-weight-bold)' }}>Bold</h1>
<p style={{ fontWeight: 'var(--font-weight-regular)' }}>Regular</p>
<span style={{ fontWeight: 'var(--font-weight-medium)' }}>Medium</span>
```

#### Why?
Single font creates consistency and reduces page weight. Vazirmatn supports both Arabic and English perfectly.

#### Exceptions
**NONE.** Vazirmatn is the ONLY font allowed.

---

### Law #5: ONLY Components from @nasneh/ui

**Rule:** All UI components MUST come from the `@nasneh/ui` package. No custom components outside the package.

#### ❌ CANNOT
```tsx
// Custom components in apps
// apps/vendor-portal/components/Button.tsx
export function Button() { ... }  // FORBIDDEN

// Inline component definitions
function MyCustomButton() {
  return <button className="...">...</button>;
}

// Third-party UI libraries
import { Button } from 'shadcn/ui';
import { Input } from 'antd';
import { Card } from 'material-ui';

// Overriding core styles
<Button className="!bg-blue-500 !rounded-lg">...</Button>
<Input style={{ borderRadius: '8px' }} />  // Override
```

#### ✅ CAN
```tsx
// Import from @nasneh/ui
import { Button, Input, Card, Badge } from '@nasneh/ui';

// Use components as-is
<Button variant="primary">Click me</Button>
<Input placeholder="Enter text" />
<Card>Content</Card>

// Use approved props
<Button size="lg" variant="secondary">Large Button</Button>
<Badge variant="success">Approved</Badge>

// Compose components
<Card>
  <h2>Title</h2>
  <p>Description</p>
  <Button>Action</Button>
</Card>
```

#### Why?
Centralized components ensure consistency, enforce design system rules, and make updates easier.

#### Exceptions
**NONE.** All UI components MUST come from `@nasneh/ui`.

---

## Enforcement

### Automated CI Checks

All PRs are automatically checked for violations:

1. **Border Detection** - Fails if `border`, `border-*` classes found
2. **Radius Detection** - Fails if `rounded-sm`, `rounded-md`, `rounded-lg` found
3. **Color Detection** - Fails if Tailwind color classes found (`bg-blue-500`, etc.)
4. **Font Detection** - Fails if `fontFamily` set to anything other than Vazirmatn
5. **Component Detection** - Fails if UI components defined outside `packages/ui/`

### Manual Review

Code reviewers MUST verify:
- [ ] No borders anywhere
- [ ] Only `rounded-xl` or `rounded-full`
- [ ] Only mono colors (except semantic status)
- [ ] Only Vazirmatn font
- [ ] Only components from `@nasneh/ui`

### Violation Consequences

| Severity | Action |
|----------|--------|
| **Critical** (Law violation) | PR rejected immediately |
| **Major** (Multiple violations) | PR blocked until fixed |
| **Minor** (Single violation) | Warning + required fix |

---

## Quick Reference

### The 5 Laws (Summary)

| Law | Rule | Exception |
|-----|------|-----------|
| **#1** | NO borders | None |
| **#2** | ONLY rounded-xl (12px) | Icon buttons: rounded-full |
| **#3** | ONLY mono colors | Semantic status indicators |
| **#4** | ONLY Vazirmatn font | None |
| **#5** | ONLY @nasneh/ui components | None |

### Approved Patterns

```tsx
// ✅ CORRECT: Following all 5 laws
import { Button, Input, Card } from '@nasneh/ui';

<Card>  {/* Law #5: From @nasneh/ui */}
  <h1 style={{ 
    fontFamily: 'var(--font-family-primary)',  // Law #4: Vazirmatn
    color: 'var(--text-primary)'               // Law #3: Mono color
  }}>
    Welcome
  </h1>
  
  <Input   {/* Law #5: From @nasneh/ui */}
    style={{
      background: 'var(--input-bg)',           // Law #1: No border
      borderRadius: 'var(--radius-standard)'   // Law #2: rounded-xl
    }}
  />
  
  <Button variant="primary">  {/* Law #5: From @nasneh/ui */}
    Submit
  </Button>
</Card>
```

---

## Related Documentation

- **Component Specs:** `COMPONENT_SPECS.md` - Detailed specs for all 12 core components

- **Design System:** `docs/SPECS/DESIGN_SYSTEM.md` - Full design specifications
- **Brand Voice:** `docs/SPECS/BRAND_VOICE.md` - Copy and terminology rules
- **Component Specs:** `docs/SPECS/COMPONENT_SPECS.md` - Component implementation details
- **Design Tokens:** `packages/ui/src/styles/tokens.css` - CSS variables
- **Copy Tokens:** `packages/ui/src/copy/` - UI text strings

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release - 5 laws defined |

---

**Remember:** These laws exist to create a consistent, premium, and maintainable UI. When in doubt, ask before breaking a law.

**Document End**
