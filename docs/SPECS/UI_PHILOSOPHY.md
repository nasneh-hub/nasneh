# UI Philosophy — Nasneh Customer Web

**Version:** 1.0.0  
**Last Updated:** January 9, 2026  
**Status:** ✅ Approved Standard

---

## Purpose

This document defines the **Single Source of Truth** for all UI/UX decisions in Nasneh Customer Web. Every page, component, and interaction must follow these principles to ensure a **unified, professional, and accessible** platform.

**Core Principle:** *One platform, one style, zero exceptions.*

---

## 1. Layout Principles

### 1.1 Header Structure (Airbnb-Style)

**Pattern:** Sticky header with left-center-right layout

```
┌──────────────────────────────────────────────────────────┐
│  [LOGO]     Tab1  Tab2  Tab3     [Utils] 🌐 ☀ ♥ 🛒 👤   │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
- **Left:** Logo (clickable, returns to home)
- **Center:** Hero tabs for primary navigation (Desktop only)
- **Right:** Utility controls (Globe, Theme, Favorites, Cart, Avatar)
- **Height:** 80px (5rem) desktop, 64px (4rem) mobile
- **Background:** `var(--bg-primary)` (white)
- **Shadow:** `var(--shadow-sm)` on scroll
- **Sticky:** Always visible (position: sticky, top: 0, z-index: 50)

**Mobile Behavior:**
- Hide center tabs
- Show hamburger menu (right side)
- Keep logo (left) and essential utilities (Globe, Avatar)

---

### 1.2 Spacing Rhythm

**Vertical Rhythm:** Use consistent spacing between sections

| Size | Token | Value | Usage |
|------|-------|-------|-------|
| **XS** | `var(--spacing-xs)` | 4px | Tight gaps (badges, icons) |
| **SM** | `var(--spacing-sm)` | 8px | Small gaps (buttons, form fields) |
| **MD** | `var(--spacing-md)` | 16px | Default gaps (cards, lists) |
| **LG** | `var(--spacing-lg)` | 24px | Section padding |
| **XL** | `var(--spacing-xl)` | 32px | Page padding, hero sections |
| **2XL** | `var(--spacing-2xl)` | 48px | Major section breaks |

**Rule:** Never hardcode pixel values. Always use tokens.

---

### 1.3 Grid Rules

**Container:**
- **Max width:** 1440px
- **Padding:** `var(--spacing-xl)` (32px) on all sides
- **Centering:** `margin: 0 auto`

**Grid Layout:**
- Use Tailwind grid classes: `grid`, `grid-cols-*`, `gap-*`
- **Default gap:** `gap-6` (24px)
- **Responsive breakpoints:**
  - Mobile: 1 column
  - Tablet (md): 2 columns
  - Desktop (lg): 3-4 columns

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## 2. Navigation Rules

### 2.1 Top Hero Menu (Desktop)

**Pattern:** Centered tabs in header

**Tabs:**
1. **التصنيفات** (Categories) - `/categories`
2. **المميزة** (Featured) - `/featured`
3. **العروض** (Deals) - `/deals`

**Active State:**
- Bold font weight (`var(--font-weight-semibold)`)
- Primary color (`var(--text-primary)`)
- Bottom border (`2px solid var(--primary)`)

**Hover State:**
- Color changes to `var(--text-primary)`
- Smooth transition (0.2s)

**Implementation:**
```tsx
<button
  style={{
    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
  }}
>
  {tab.name}
</button>
```

---

### 2.2 Mobile Sheet Behavior

**Pattern:** Hamburger menu opens full-screen sheet

**Sheet Content:**
- Logo at top
- Primary navigation links
- Secondary links (Sell, Help, About)
- Language/Currency selector
- Theme toggle
- Account section (if logged in)

**Behavior:**
- Slides in from right (RTL) or left (LTR)
- Backdrop overlay (rgba(0, 0, 0, 0.5))
- Close on backdrop click or X button
- Smooth animation (0.3s ease-in-out)

**Implementation:** Use shadcn/ui `Sheet` component

---

### 2.3 Avatar Dropdown Menu

**Pattern:** Click avatar → dropdown menu appears

**Menu Items:**
1. **ملفي الشخصي** (My Profile) - `/profile` - Icon: `User`
2. **طلباتي** (My Orders) - `/orders` - Icon: `Package`
3. **حجوزاتي** (My Bookings) - `/bookings` - Icon: `Calendar`
4. **تقييماتي** (My Reviews) - `/reviews` - Icon: `Star`
5. **عناويني** (My Addresses) - `/profile/addresses` - Icon: `MapPin`
6. **الإعدادات** (Settings) - `/settings` - Icon: `Settings`
7. **تسجيل الخروج** (Logout) - Action - Icon: `LogOut`

**Separator:** Between "Addresses" and "Settings"

**Implementation:** Use shadcn/ui `DropdownMenu` component

---

## 3. Component Usage Rules

### 3.1 Allowed Components (shadcn/ui + @nasneh/ui)

| Component | Source | Usage |
|-----------|--------|-------|
| **Button** | @nasneh/ui | Primary actions, CTAs |
| **Input** | @nasneh/ui | Text entry fields |
| **Card** | @nasneh/ui | Content containers |
| **Badge** | @nasneh/ui | Status indicators |
| **Dialog** | @nasneh/ui | Modals, confirmations |
| **Avatar** | @nasneh/ui | User photos |
| **Skeleton** | @nasneh/ui | Loading placeholders |
| **DropdownMenu** | @nasneh/ui | Dropdown menus |
| **Sheet** | shadcn/ui | Mobile menus, side panels |
| **Tabs** | shadcn/ui | Tabbed interfaces |
| **Select** | @nasneh/ui | Dropdowns (7+ options) |
| **Toast** | @nasneh/ui | Notifications |

**Rule:** Use ONLY these components. No custom alternatives.

---

### 3.2 Component Patterns

#### Button Variants

| Variant | Usage | Example |
|---------|-------|---------|
| **primary** | Main actions | "حفظ", "إضافة", "شراء" |
| **secondary** | Secondary actions | "إلغاء", "رجوع" |
| **ghost** | Subtle actions | "تعديل", "حذف" |
| **destructive** | Dangerous actions | "حذف الحساب" |

**Rule:** Never use more than one `primary` button per section.

---

#### Card Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
    <CardDescription>وصف قصير</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Rule:** Always include `CardHeader` with `CardTitle`. `CardDescription` is optional.

---

#### Dialog Pattern

```tsx
<Dialog open={open} onClose={() => setOpen(false)} title="عنوان الحوار">
  <p>محتوى الحوار...</p>
  <Button onClick={() => setOpen(false)}>إغلاق</Button>
</Dialog>
```

**Rule:** Always provide a close mechanism (X button + backdrop click).

---

### 3.3 Forbidden Patterns

❌ **DO NOT:**
- Mix UI libraries (e.g., Material-UI, Ant Design, Chakra)
- Create custom components that duplicate shadcn patterns
- Use inline styles for colors (use tokens.css)
- Use emojis as icons (use lucide-react)
- Hardcode text (use copy tokens from @nasneh/ui/copy)

---

## 4. Page Structure Patterns

### 4.1 Standard Page Layout

```
┌─────────────────────────────────────────┐
│ Header (Sticky)                         │
├─────────────────────────────────────────┤
│                                         │
│ Hero Section (Optional)                 │
│ - Large title                           │
│ - Subtitle                              │
│ - CTA button                            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Section 1                               │
│ - Title                                 │
│ - Content (Grid/List)                   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Section 2                               │
│ - Title                                 │
│ - Content (Grid/List)                   │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

**Spacing:**
- Hero to Section 1: `var(--spacing-2xl)` (48px)
- Between sections: `var(--spacing-2xl)` (48px)
- Section padding: `var(--spacing-xl)` (32px)

---

### 4.2 Home Page Pattern

**Structure:**
1. **Header** (Sticky)
2. **Hero Section**
   - Welcome message
   - Search bar (large, prominent)
   - Featured categories (horizontal scroll)
3. **Featured Products** (Grid)
4. **Featured Services** (Grid)
5. **How It Works** (3-column cards)
6. **Footer**

**Example:**
```tsx
<AppShell>
  <HeroSection />
  <FeaturedCategories />
  <FeaturedProducts />
  <FeaturedServices />
  <HowItWorks />
</AppShell>
```

---

### 4.3 List Page Pattern (Categories, Products, Services)

**Structure:**
1. **Header** (Sticky)
2. **Page Title** + **Filters** (Horizontal)
3. **Grid of Cards** (3-4 columns)
4. **Pagination** (Bottom)
5. **Footer**

**Example:**
```tsx
<AppShell>
  <div className="flex items-center justify-between mb-6">
    <h1>التصنيفات</h1>
    <Button variant="ghost">تصفية</Button>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((item) => (
      <Card key={item.id}>...</Card>
    ))}
  </div>
</AppShell>
```

---

### 4.4 Detail Page Pattern (Product, Service, Profile)

**Structure:**
1. **Header** (Sticky)
2. **Breadcrumbs** (Optional)
3. **Main Content** (2-column: Image + Details)
4. **Tabs** (Description, Reviews, Related)
5. **Footer**

**Example:**
```tsx
<AppShell>
  <Breadcrumbs />
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>{/* Image gallery */}</div>
    <div>{/* Product details */}</div>
  </div>
  <Tabs>
    <TabsContent value="description">...</TabsContent>
    <TabsContent value="reviews">...</TabsContent>
  </Tabs>
</AppShell>
```

---

## 5. Empty States + Loading Patterns

### 5.1 Empty State Pattern

**Structure:**
- Icon (lucide-react, 48px)
- Title (h3)
- Description (p)
- CTA Button (optional)

**Example:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <PackageOpen size={48} style={{ color: 'var(--text-tertiary)' }} />
  <h3 style={{ marginTop: 'var(--spacing-md)' }}>لا توجد طلبات</h3>
  <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
    لم تقم بأي طلبات بعد
  </p>
  <Button variant="primary" style={{ marginTop: 'var(--spacing-lg)' }}>
    تصفح المنتجات
  </Button>
</div>
```

**Rule:** Always provide a CTA to help users take action.

---

### 5.2 Loading Pattern

**Pattern:** Use `Skeleton` component from @nasneh/ui

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {[1, 2, 3].map((i) => (
    <Card key={i}>
      <CardHeader>
        <Skeleton width="60%" height="24px" />
        <Skeleton width="80%" height="16px" />
      </CardHeader>
      <CardContent>
        <Skeleton width="100%" height="200px" />
      </CardContent>
    </Card>
  ))}
</div>
```

**Rule:** Match skeleton structure to actual content layout.

---

## 6. Icon Rules

### 6.1 Icon System (lucide-react ONLY)

**Library:** `lucide-react`  
**Installation:** `pnpm add lucide-react`

**Usage:**
```tsx
import { Heart, ShoppingBag, User } from 'lucide-react';

<Heart size={20} style={{ color: 'var(--text-primary)' }} />
```

**Standard Sizes:**
- **Small:** 16px (form icons)
- **Medium:** 20px (buttons, nav)
- **Large:** 24px (headers, hero)
- **XL:** 48px (empty states)

**Rule:** Never use emojis (🏠, 📦, 👤) in production. Use lucide icons.

---

### 6.2 Common Icons Mapping

| Context | Icon | Component |
|---------|------|-----------|
| Home | `Home` | Navigation |
| Categories | `Grid3x3` | Navigation |
| Profile | `User` | Navigation |
| Cart | `ShoppingBag` | Header |
| Favorites | `Heart` | Header |
| Search | `Search` | Search bar |
| Settings | `Settings` | Dropdown |
| Logout | `LogOut` | Dropdown |
| Orders | `Package` | Dropdown |
| Bookings | `Calendar` | Dropdown |
| Reviews | `Star` | Dropdown |
| Addresses | `MapPin` | Dropdown |
| Language | `Globe` | Header |
| Theme | `Sun` / `Moon` | Header |
| Menu | `Menu` | Mobile |
| Close | `X` | Dialogs |

---

## 7. Accessibility Basics

### 7.1 Focus States

**Rule:** All interactive elements MUST have visible focus states.

**Implementation:**
```tsx
<button
  className="focus:outline-none focus:ring-[length:var(--ring-width)] focus:ring-[color:var(--ring-color)]"
>
  Click me
</button>
```

**Tokens:**
- `--ring-width`: 2px
- `--ring-color`: `var(--primary)`

---

### 7.2 Keyboard Navigation

**Rules:**
- **Tab:** Move forward through interactive elements
- **Shift+Tab:** Move backward
- **Enter/Space:** Activate buttons/links
- **Escape:** Close dialogs/dropdowns
- **Arrow keys:** Navigate within dropdowns/tabs

**Implementation:** Use semantic HTML (`<button>`, `<a>`, `<input>`) for automatic keyboard support.

---

### 7.3 ARIA Labels

**Rule:** Provide `aria-label` for icon-only buttons.

**Example:**
```tsx
<button aria-label="Open cart">
  <ShoppingBag size={20} />
</button>
```

---

## 8. Do / Don't Examples

### 8.1 Layout

#### ✅ DO: Use tokens for spacing
```tsx
<div style={{ padding: 'var(--spacing-lg)' }}>
  Content
</div>
```

#### ❌ DON'T: Hardcode pixel values
```tsx
<div style={{ padding: '24px' }}>
  Content
</div>
```

---

### 8.2 Colors

#### ✅ DO: Use tokens.css variables
```tsx
<div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
  Content
</div>
```

#### ❌ DON'T: Use hex colors or Tailwind palette
```tsx
<div style={{ background: '#FFFFFF', color: '#000000' }}>
  Content
</div>

<div className="bg-white text-black">
  Content
</div>
```

---

### 8.3 Icons

#### ✅ DO: Use lucide-react
```tsx
import { Heart } from 'lucide-react';

<Heart size={20} style={{ color: 'var(--text-primary)' }} />
```

#### ❌ DON'T: Use emojis
```tsx
<span>❤️</span>
```

---

### 8.4 Components

#### ✅ DO: Use @nasneh/ui components
```tsx
import { Button } from '@nasneh/ui';

<Button variant="primary">حفظ</Button>
```

#### ❌ DON'T: Create custom button components
```tsx
<button className="custom-button">حفظ</button>
```

---

### 8.5 Text

#### ✅ DO: Use copy tokens
```tsx
import { ar } from '@nasneh/ui/copy';

<h1>{ar.profile.myProfile}</h1>
```

#### ❌ DON'T: Hardcode text
```tsx
<h1>ملفي الشخصي</h1>
```

---

## 9. Design System Constraints

### 9.1 Colors (tokens.css ONLY)

**Rule:** All colors MUST come from `packages/ui/src/styles/tokens.css`.

**Available Variables:**
- `--bg-primary`: White background
- `--bg-secondary`: Light gray background
- `--bg-tertiary`: Lighter gray background
- `--bg-hover`: Hover state background
- `--text-primary`: Black text
- `--text-secondary`: Gray text
- `--text-tertiary`: Light gray text
- `--primary`: Nature Green (#2D5016)
- `--primary-hover`: Darker green
- `--accent`: Nature Light Green (#E8F0E3)
- `--border-primary`: Light gray border
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow

**Enforcement:** CI will fail if hex colors or Tailwind palette colors are detected.

---

### 9.2 Font (Vazirmatn ONLY)

**Rule:** All text MUST use Vazirmatn font.

**Implementation:** Font is automatically applied via `globals.css`:
```css
body {
  font-family: var(--font-family-primary);
}
```

**Enforcement:** CI will fail if other fonts are detected.

---

### 9.3 Icons (lucide-react ONLY)

**Rule:** All icons MUST come from `lucide-react`.

**Enforcement:** Manual code review (no CI check for this).

---

### 9.4 CI Checks (ui-lint.yml)

**3 Checks:**
1. **Hex Colors:** Fail if `#[0-9A-Fa-f]{3,8}` found (except in tokens.css)
2. **Tailwind Palette:** Fail if `bg-slate-*`, `text-gray-*`, etc. found
3. **Localhost:** Fail if `localhost` in `NEXT_PUBLIC_*` env vars

**Rule:** All checks MUST pass before merge.

---

## 10. Enforcement

### 10.1 Code Review Checklist

Before approving any PR:
- [ ] Follows Airbnb-style header pattern
- [ ] Uses shadcn/ui + @nasneh/ui components only
- [ ] Uses tokens.css for all colors
- [ ] Uses Vazirmatn font
- [ ] Uses lucide-react icons (no emojis)
- [ ] Uses copy tokens for text
- [ ] Has visible focus states
- [ ] Passes all 3 CI checks (ui-lint.yml)
- [ ] Includes screenshots showing consistency

---

### 10.2 Breaking Changes

**Rule:** Any deviation from this document requires:
1. Discussion with @nasneh-hub
2. Update to this document
3. Migration plan for existing code

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial release (Airbnb-style pattern) |

---

## 12. References

- **UI Law v2.0:** `/docs/SPECS/UI_LAW.md`
- **Design System:** `/docs/SPECS/DESIGN_SYSTEM.md`
- **Component Specs:** `/docs/SPECS/COMPONENT_SPECS.md`
- **Brand Voice:** `/docs/SPECS/BRAND_VOICE.md`
- **tokens.css:** `/packages/ui/src/styles/tokens.css`
- **Copy Tokens:** `/packages/ui/src/copy/`

---

**This is the approved standard for all UI work in Nasneh Customer Web.**  
**No exceptions. One platform, one style.**
