# Nasneh Component Specifications

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** THE SOURCE OF TRUTH for component implementation  
**Location:** `docs/SPECS/COMPONENT_SPECS.md`

---

## Purpose

This document provides **complete specifications** for the 12 core UI components that form the foundation of the Nasneh platform. These specs will be used to implement components in Sprint 4.

**Source Documents:**
- `docs/SPECS/DESIGN_SYSTEM.md` - Visual rules and design principles
- `packages/ui/src/styles/tokens.css` - Actual token values
- `docs/SPECS/UI_LAW.md` - The 5 strict laws
- `docs/SPECS/BRAND_VOICE.md` - Copy and terminology

---

## ⚠️ CRITICAL RULES (Apply to ALL Components)

### Rule 1: REFERENCE TOKENS
✅ `var(--height-md)`  
❌ `height: 48px`

### Rule 2: NO BORDERS
Use shadows and backgrounds instead.

### Rule 3: ROUNDED-XL ONLY
✅ `var(--radius-standard)` (12px) for all components  
✅ `var(--radius-full)` ONLY for Avatar and icon buttons  
❌ `rounded-sm`, `rounded-md`, `rounded-lg`

### Rule 4: COPY FROM TOKENS
✅ `{ar.ui.save}`  
❌ `"حفظ"` or `"Save"`

### Rule 5: NO className PROP
Components do NOT accept `className` to prevent style overrides.

---

## General Requirements

### Accessibility
- All interactive components: keyboard accessible
- Focus visible: `ring-2` (no border!)
- Screen reader: proper ARIA labels
- Color contrast: WCAG AA minimum
- Touch targets: minimum 44px

### RTL Support
- All components: bidirectional
- Icons: flip horizontally in RTL
- Spacing: logical properties (`margin-inline-start`)

### Responsive
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)

### Dark Mode
- All colors from `tokens.css`
- No hardcoded colors
- Test in both light and dark modes

---

## The 12 Core Components

| # | Component | Priority | Use Case |
|---|-----------|----------|----------|
| 1 | Button | 🔴 Critical | Actions, CTAs |
| 2 | Input | 🔴 Critical | Text entry, forms |
| 3 | Card | 🔴 Critical | Content containers |
| 4 | Badge | 🔴 Critical | Status, labels |
| 5 | Dialog | 🔴 Critical | Modals, confirmations |
| 6 | SegmentedControl | 🔴 Critical | 2-6 option selection |
| 7 | Table | 🔴 Critical | Data lists |
| 8 | Select | 🟡 High | Dropdown for 7+ options |
| 9 | Tabs | 🟡 High | Page navigation |
| 10 | Avatar | 🟡 High | User/vendor photos |
| 11 | Toast | 🟡 High | Notifications |
| 12 | Skeleton | 🟡 High | Loading states |

---

# 1. Button

## Purpose
Primary interactive element for actions and CTAs across the platform.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Height (sm)** | 40px | `var(--height-sm)` |
| **Height (md)** | 48px | `var(--height-md)` |
| **Height (lg)** | 56px | `var(--height-lg)` |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Border Radius (icon)** | 9999px | `var(--radius-full)` |
| **Padding (horizontal)** | 16px | `var(--spacing-lg)` |
| **Font Size (sm)** | 14px | `var(--font-size-small)` |
| **Font Size (md)** | 16px | `var(--font-size-body)` |
| **Font Size (lg)** | 18px | `var(--font-size-h4)` |
| **Font Weight** | 500 | `var(--font-weight-medium)` |

## Variants

| Variant | Background | Text Color | Use Case |
|---------|------------|------------|----------|
| **default** | `var(--text-primary)` | `var(--bg-primary)` | Primary actions |
| **secondary** | `var(--bg-tertiary)` | `var(--text-primary)` | Secondary actions |
| **ghost** | `transparent` | `var(--text-primary)` | Tertiary actions |
| **destructive** | `var(--color-danger)` | `#FFFFFF` | Delete, cancel |

## Sizes

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| **sm** | 40px | 12px | 14px | Compact areas, tables |
| **md** | 48px | 16px | 16px | Default |
| **lg** | 56px | 24px | 18px | Prominent CTAs |

## States

### Default
- Background: variant color
- Text: variant text color
- Cursor: pointer

### Hover
- Background: slightly lighter/darker (10% opacity change)
- NO border
- Transition: 150ms ease

### Active/Pressed
- Background: slightly darker (20% opacity change)
- Scale: 0.98 (subtle press effect)

### Disabled
- Background: `var(--bg-tertiary)`
- Text: `var(--text-tertiary)`
- Cursor: not-allowed
- Opacity: 0.5

### Loading
- Background: variant color
- Text: hidden
- Spinner: centered, size 20px
- Cursor: not-allowed
- Disabled: true

## Props Interface

```typescript
import { ReactNode } from 'react';

interface ButtonProps {
  /**
   * Visual variant of the button
   * @default 'default'
   */
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the button is in loading state
   * Shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display in the button
   * Can be positioned left or right
   */
  icon?: ReactNode;
  
  /**
   * Position of the icon
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Whether this is an icon-only button
   * Uses rounded-full instead of rounded-xl
   * @default false
   */
  iconOnly?: boolean;
  
  /**
   * Whether the button should take full width
   * Useful for mobile forms
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * Button content (text from copy tokens)
   */
  children: ReactNode;
  
  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * ARIA label for accessibility
   * Required for icon-only buttons
   */
  'aria-label'?: string;
}
```

## Usage Example

```tsx
import { Button } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Default button
<Button variant="default" onClick={handleSubmit}>
  {ar.ui.save}
</Button>

// ✅ CORRECT: Secondary with icon
<Button variant="secondary" icon={<PlusIcon />}>
  {ar.ui.add}
</Button>

// ✅ CORRECT: Loading state
<Button variant="default" loading={isSubmitting}>
  {ar.ui.submit}
</Button>

// ✅ CORRECT: Icon-only button
<Button iconOnly icon={<SearchIcon />} aria-label={ar.ui.search} />

// ✅ CORRECT: Full width on mobile
<Button fullWidth variant="default">
  {ar.cta.shopNow}
</Button>

// ❌ WRONG: Hardcoded text
<Button>Save</Button>

// ❌ WRONG: Inline styles
<Button style={{ background: '#FF0000' }}>Delete</Button>

// ❌ WRONG: Custom className
<Button className="my-custom-button">Click</Button>
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO hardcoded text (Arabic or English)
- NO custom colors outside variants
- NO `className` prop
- NO rounded values other than `rounded-xl` (except icon-only: `rounded-full`)

## Component-Specific Notes

1. **Icon-only buttons** MUST use `rounded-full` (exception to rounded-xl rule)
2. **Loading state** automatically disables `onClick`
3. **Destructive variant** should be used with confirmation dialog
4. **Full width option** for mobile form layouts
5. **Icon-only buttons** MUST have `aria-label` for accessibility
6. **Touch target** minimum 44px (enforced by size='sm' minimum)

---

# 2. Input

## Purpose
Text entry field for forms, search, and user input across the platform.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Height (sm)** | 40px | `var(--height-sm)` |
| **Height (md)** | 48px | `var(--height-md)` |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding (horizontal)** | 16px | `var(--spacing-lg)` |
| **Font Size** | 16px | `var(--font-size-body)` |
| **Font Weight** | 400 | `var(--font-weight-regular)` |
| **Background (default)** | #F5F5F5 | `var(--input-bg)` |
| **Background (error)** | #FEE2E2 | `var(--input-bg-error)` |
| **Background (success)** | #D1FAE5 | `var(--input-bg-success)` |
| **Text Color** | #000000 | `var(--text-primary)` |
| **Placeholder Color** | #9CA3AF | `var(--text-tertiary)` |

## Variants

| Variant | Use Case |
|---------|----------|
| **text** | General text input |
| **email** | Email addresses |
| **password** | Passwords (with show/hide toggle) |
| **number** | Numeric input |
| **tel** | Phone numbers |
| **search** | Search fields |

## Sizes

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| **sm** | 40px | 12px | 14px | Compact forms |
| **md** | 48px | 16px | 16px | Default |

## States

### Default
- Background: `var(--input-bg)`
- Border: none
- Text: `var(--text-primary)`
- Placeholder: `var(--text-tertiary)`

### Focus
- Background: `var(--input-bg)`
- Ring: 2px `var(--ring-color)`
- Ring offset: 2px
- NO border

### Error
- Background: `var(--input-bg-error)`
- Text: `var(--text-primary)`
- Error message below input

### Success
- Background: `var(--input-bg-success)`
- Text: `var(--text-primary)`
- Auto-clear after 3 seconds

### Disabled
- Background: `var(--bg-tertiary)`
- Text: `var(--text-tertiary)`
- Cursor: not-allowed
- Opacity: 0.5

## Props Interface

```typescript
import { ReactNode, ChangeEvent } from 'react';

interface InputProps {
  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  
  /**
   * Size of the input
   * @default 'md'
   */
  size?: 'sm' | 'md';
  
  /**
   * Placeholder text (from copy tokens)
   */
  placeholder?: string;
  
  /**
   * Current value
   */
  value?: string;
  
  /**
   * Change handler
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Error message to display below input
   * When set, input shows error state
   */
  error?: string;
  
  /**
   * Success message to display below input
   * When set, input shows success state (auto-clears after 3s)
   */
  success?: string;
  
  /**
   * Icon to display as prefix (left side)
   */
  prefixIcon?: ReactNode;
  
  /**
   * Icon to display as suffix (right side)
   */
  suffixIcon?: ReactNode;
  
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  
  /**
   * Auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * Maximum length
   */
  maxLength?: number;
  
  /**
   * Input name for forms
   */
  name?: string;
  
  /**
   * Input ID
   */
  id?: string;
}
```

## Usage Example

```tsx
import { Input } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic input
<Input 
  type="text"
  placeholder={ar.ui.enterName}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// ✅ CORRECT: Input with error
<Input 
  type="email"
  placeholder={ar.ui.enterEmail}
  value={email}
  error={ar.errors.invalidEmail}
/>

// ✅ CORRECT: Input with prefix icon
<Input 
  type="search"
  placeholder={ar.ui.search}
  prefixIcon={<SearchIcon />}
/>

// ✅ CORRECT: Password with toggle
<Input 
  type="password"
  placeholder={ar.auth.password}
  suffixIcon={<EyeIcon />}
/>

// ❌ WRONG: Hardcoded placeholder
<Input placeholder="Enter your name" />

// ❌ WRONG: Inline styles
<Input style={{ border: '1px solid red' }} />
```

## ❌ Forbidden

- NO borders (use background colors for states)
- NO inline styles
- NO hardcoded text
- NO custom colors
- NO `className` prop

## Component-Specific Notes

1. **Error message** appears below input (not inside)
2. **Success state** is temporary (auto-clears after 3 seconds)
3. **RTL support:** prefix/suffix icons swap positions
4. **Numeric input** shows number pad on mobile
5. **Password type** includes show/hide toggle icon
6. **Focus ring** instead of border for focus state
7. **Minimum font size** 16px to prevent iOS zoom on focus

---

# 3. Card

## Purpose
Container component for grouping related content with consistent styling.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding** | 24px | `var(--spacing-xl)` |
| **Background** | #F5F5F5 | `var(--bg-tertiary)` |
| **Shadow (default)** | subtle | `var(--shadow-sm)` |
| **Shadow (hover)** | medium | `var(--shadow-md)` |
| **Max Width** | 600px | - |

## Variants

| Variant | Shadow | Hover | Use Case |
|---------|--------|-------|----------|
| **default** | sm | none | Static content |
| **interactive** | sm | md + cursor | Clickable cards |

## States

### Default
- Background: `var(--bg-tertiary)`
- Shadow: `var(--shadow-sm)`
- Border: none

### Hover (interactive only)
- Background: `var(--bg-tertiary)`
- Shadow: `var(--shadow-md)`
- Cursor: pointer
- Transition: 150ms ease

### Active (interactive only)
- Scale: 0.99 (subtle press effect)

## Props Interface

```typescript
import { ReactNode } from 'react';

interface CardProps {
  /**
   * Card content
   */
  children: ReactNode;
  
  /**
   * Whether the card is clickable
   * Adds hover effects and cursor pointer
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Click handler (only works if interactive=true)
   */
  onClick?: () => void;
  
  /**
   * Optional header section
   */
  header?: ReactNode;
  
  /**
   * Optional footer section
   */
  footer?: ReactNode;
  
  /**
   * Custom padding
   * @default 'xl' (24px)
   */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## Usage Example

```tsx
import { Card } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic card
<Card>
  <h3>{ar.ui.title}</h3>
  <p>{ar.ui.description}</p>
</Card>

// ✅ CORRECT: Interactive card
<Card interactive onClick={handleCardClick}>
  <h3>{ar.products.name}</h3>
  <p>{ar.products.price}</p>
</Card>

// ✅ CORRECT: Card with header and footer
<Card 
  header={<h2>{ar.ui.orderDetails}</h2>}
  footer={<Button>{ar.ui.viewMore}</Button>}
>
  <p>{ar.ui.content}</p>
</Card>

// ❌ WRONG: Nested cards
<Card>
  <Card>Content</Card>  {/* Use sections instead */}
</Card>

// ❌ WRONG: Inline styles
<Card style={{ border: '1px solid black' }}>Content</Card>
```

## ❌ Forbidden

- NO borders (use shadow for depth)
- NO inline styles
- NO nested cards (use sections instead)
- NO custom colors
- NO `className` prop

## Component-Specific Notes

1. **NO borders** - use `shadow-sm` for depth
2. **Consistent padding** `var(--spacing-xl)` (24px)
3. **Optional header/footer** sections
4. **Clickable cards** must have `interactive={true}`
5. **Max-width: 600px** for readability
6. **Nested cards not allowed** - use sections or dividers

---

# 4. Badge

## Purpose
Small label for status indicators, categories, and tags.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Height** | 24px | - |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding (horizontal)** | 8px | `var(--spacing-sm)` |
| **Font Size** | 12px | `var(--font-size-caption)` |
| **Font Weight** | 500 | `var(--font-weight-medium)` |

## Variants

| Variant | Background | Text Color | Use Case |
|---------|------------|------------|----------|
| **default** | `var(--bg-tertiary)` | `var(--text-primary)` | General labels |
| **success** | `var(--color-success)` | `#FFFFFF` | Completed, approved |
| **warning** | `var(--color-warning)` | `#000000` | Pending, attention |
| **danger** | `var(--color-danger)` | `#FFFFFF` | Error, cancelled |
| **info** | `var(--color-info)` | `#FFFFFF` | Information |
| **dot** | transparent | `var(--text-primary)` | Notification indicator |

## States

### Default
- Background: variant color
- Text: variant text color
- Border: none

### Dot Variant
- Width: 8px
- Height: 8px
- Border-radius: full
- Background: variant color
- No text

## Props Interface

```typescript
import { ReactNode } from 'react';

interface BadgeProps {
  /**
   * Visual variant of the badge
   * @default 'default'
   */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'dot';
  
  /**
   * Badge content (text from copy tokens)
   * Not used for dot variant
   */
  children?: ReactNode;
  
  /**
   * Maximum text length (truncate with ...)
   * @default 20
   */
  maxLength?: number;
}
```

## Usage Example

```tsx
import { Badge } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Status badge
<Badge variant="success">{ar.status.completed}</Badge>

// ✅ CORRECT: Warning badge
<Badge variant="warning">{ar.status.pending}</Badge>

// ✅ CORRECT: Dot indicator
<Badge variant="dot" />

// ✅ CORRECT: With pluralization
<Badge variant="default">
  {ar.ui.items} ({count})
</Badge>

// ❌ WRONG: Hardcoded text
<Badge variant="success">Completed</Badge>

// ❌ WRONG: Long text (max 20 chars)
<Badge>This is a very long badge text that should be truncated</Badge>
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO hardcoded text
- NO decorative colors (only semantic)
- NO `className` prop
- NO text longer than 20 characters

## Component-Specific Notes

1. **Semantic variants only** - use color for meaning, not decoration
2. **Small size only** - badges are always compact
3. **NO borders** - solid backgrounds only
4. **Dot variant** for notification indicators (8px circle)
5. **Max text length: 20 characters** (truncate with ...)
6. **Pluralization:** use copy tokens (`ar.ui.items`)

---

# 5. Dialog

## Purpose
Modal overlay for confirmations, forms, and important messages.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Max Width** | 600px | - |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding** | 24px | `var(--spacing-xl)` |
| **Background** | `var(--bg-primary)` | - |
| **Shadow** | large | `var(--shadow-lg)` |
| **Backdrop** | rgba(0,0,0,0.5) | - |

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | General dialogs |
| **destructive** | Delete confirmations |

## States

### Open
- Backdrop: visible with blur
- Dialog: centered, visible
- Body scroll: locked
- Focus: trapped inside dialog

### Closed
- Backdrop: hidden
- Dialog: hidden
- Body scroll: restored

## Props Interface

```typescript
import { ReactNode } from 'react';

interface DialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Dialog title (from copy tokens)
   */
  title: string;
  
  /**
   * Dialog content
   */
  children: ReactNode;
  
  /**
   * Optional footer with actions
   */
  footer?: ReactNode;
  
  /**
   * Whether clicking backdrop closes dialog
   * @default true
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Whether pressing Escape closes dialog
   * @default true
   */
  closeOnEscape?: boolean;
  
  /**
   * Variant for destructive actions
   * @default 'default'
   */
  variant?: 'default' | 'destructive';
}
```

## Usage Example

```tsx
import { Dialog, Button } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Confirmation dialog
<Dialog
  open={isOpen}
  onClose={handleClose}
  title={ar.ui.confirmDelete}
  footer={
    <>
      <Button variant="ghost" onClick={handleClose}>
        {ar.ui.cancel}
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        {ar.ui.delete}
      </Button>
    </>
  }
>
  <p>{ar.ui.deleteConfirmMessage}</p>
</Dialog>

// ✅ CORRECT: Form dialog
<Dialog
  open={isOpen}
  onClose={handleClose}
  title={ar.ui.addProduct}
>
  <form onSubmit={handleSubmit}>
    <Input placeholder={ar.products.name} />
    <Button type="submit">{ar.ui.save}</Button>
  </form>
</Dialog>

// ❌ WRONG: Hardcoded title
<Dialog title="Delete Item">...</Dialog>
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO hardcoded text
- NO `className` prop
- NO nested dialogs

## Component-Specific Notes

1. **Overlay with backdrop** (blur effect)
2. **Close button (X)** in top-right corner
3. **Header, content, footer** sections
4. **Trap focus** for accessibility
5. **Max width: 600px** (mobile: 90vw)
6. **Destructive actions** use red button in footer
7. **Close on backdrop click** (optional, default: true)
8. **Escape key closes** dialog (optional, default: true)
9. **Mobile: full screen** on small screens (<640px)
10. **Body scroll locked** when dialog is open

---

# 6. SegmentedControl

## Purpose
Compact selection control for 2-6 mutually exclusive options.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Height** | 40px | `var(--height-sm)` |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Background (container)** | `var(--bg-tertiary)` | - |
| **Background (active)** | `var(--bg-primary)` | - |
| **Padding (container)** | 4px | `var(--spacing-xs)` |
| **Font Size** | 14px | `var(--font-size-small)` |
| **Font Weight** | 500 | `var(--font-weight-medium)` |

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | Standard selection |

## States

### Segment (inactive)
- Background: transparent
- Text: `var(--text-secondary)`
- Cursor: pointer

### Segment (active)
- Background: `var(--bg-primary)`
- Text: `var(--text-primary)`
- Shadow: `var(--shadow-sm)`
- Transition: 150ms ease

### Segment (hover)
- Background: `var(--bg-hover)`
- Text: `var(--text-primary)`

## Props Interface

```typescript
interface SegmentedControlOption {
  /**
   * Option value
   */
  value: string;
  
  /**
   * Option label (from copy tokens)
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
}

interface SegmentedControlProps {
  /**
   * Available options (2-6 only)
   */
  options: SegmentedControlOption[];
  
  /**
   * Currently selected value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  
  /**
   * Whether the control is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Full width on mobile
   * @default true
   */
  fullWidth?: boolean;
}
```

## Usage Example

```tsx
import { SegmentedControl } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic segmented control
<SegmentedControl
  options={[
    { value: 'all', label: ar.ui.all },
    { value: 'active', label: ar.status.active },
    { value: 'completed', label: ar.status.completed },
  ]}
  value={filter}
  onChange={setFilter}
/>

// ✅ CORRECT: With icons
<SegmentedControl
  options={[
    { value: 'grid', label: ar.ui.grid, icon: <GridIcon /> },
    { value: 'list', label: ar.ui.list, icon: <ListIcon /> },
  ]}
  value={view}
  onChange={setView}
/>

// ❌ WRONG: Too many options (use Select instead)
<SegmentedControl
  options={[...10 options]}  // Max 6!
/>

// ❌ WRONG: Hardcoded labels
<SegmentedControl
  options={[
    { value: 'all', label: 'All' },
  ]}
/>
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO hardcoded text
- NO more than 6 options (use Select instead)
- NO less than 2 options
- NO `className` prop

## Component-Specific Notes

1. **Use for 2-6 options ONLY** - 7+ options = use Select instead
2. **Equal width segments** (not auto-width)
3. **Active segment** uses `var(--bg-primary)` with shadow
4. **Keyboard navigation:** Arrow keys to switch
5. **Mobile: full width** by default
6. **Smooth transition** when switching segments (150ms)

---

# 7. Table

## Purpose
Display structured data in rows and columns with sorting and actions.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Border Radius (container)** | 12px | `var(--radius-standard)` |
| **Cell Padding** | 12px 16px | `var(--spacing-md)` `var(--spacing-lg)` |
| **Header Font Weight** | 600 | `var(--font-weight-semibold)` |
| **Header Background** | `var(--bg-secondary)` | - |
| **Row Background (even)** | `var(--bg-primary)` | - |
| **Row Background (odd)** | `var(--bg-secondary)` | - |
| **Row Background (hover)** | `var(--bg-hover)` | - |
| **Font Size** | 14px | `var(--font-size-small)` |

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | Standard data tables |
| **compact** | Dense data (reduced padding) |

## States

### Header
- Background: `var(--bg-secondary)`
- Text: `var(--text-primary)`
- Font weight: semibold
- Sticky on scroll

### Row (default)
- Background: alternating (zebra stripes)
- Text: `var(--text-primary)`
- Border: none

### Row (hover)
- Background: `var(--bg-hover)`
- Cursor: pointer (if clickable)
- Transition: 150ms ease

### Empty State
- Message: from copy tokens
- Icon: optional
- Centered in table

### Loading State
- Skeleton rows (5 rows)
- Pulse animation

## Props Interface

```typescript
interface TableColumn<T> {
  /**
   * Column key (matches data property)
   */
  key: string;
  
  /**
   * Column header (from copy tokens)
   */
  label: string;
  
  /**
   * Whether the column is sortable
   * @default false
   */
  sortable?: boolean;
  
  /**
   * Custom render function
   */
  render?: (value: any, row: T) => ReactNode;
  
  /**
   * Column width
   */
  width?: string;
}

interface TableProps<T> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];
  
  /**
   * Table data
   */
  data: T[];
  
  /**
   * Row click handler
   */
  onRowClick?: (row: T) => void;
  
  /**
   * Whether the table is loading
   * @default false
   */
  loading?: boolean;
  
  /**
   * Empty state message (from copy tokens)
   */
  emptyMessage?: string;
  
  /**
   * Variant
   * @default 'default'
   */
  variant?: 'default' | 'compact';
  
  /**
   * Pagination configuration
   */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}
```

## Usage Example

```tsx
import { Table } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic table
<Table
  columns={[
    { key: 'id', label: ar.ui.id, sortable: true },
    { key: 'name', label: ar.ui.name },
    { key: 'status', label: ar.ui.status, render: (value) => (
      <Badge variant={value === 'active' ? 'success' : 'default'}>
        {ar.status[value]}
      </Badge>
    )},
  ]}
  data={orders}
  onRowClick={handleRowClick}
  emptyMessage={ar.ui.noResults}
/>

// ✅ CORRECT: With pagination
<Table
  columns={columns}
  data={products}
  pagination={{
    page: currentPage,
    pageSize: 25,
    total: totalProducts,
    onPageChange: setCurrentPage,
  }}
/>

// ❌ WRONG: Hardcoded column labels
<Table
  columns={[
    { key: 'name', label: 'Name' },
  ]}
/>
```

## ❌ Forbidden

- NO row borders (use hover:bg or alternating backgrounds)
- NO inline styles
- NO hardcoded text
- NO `className` prop
- NO borders between cells

## Component-Specific Notes

1. **NO row borders** - use `hover:bg` or alternating backgrounds
2. **Sortable headers** (optional) with ↑ ↓ icons
3. **Responsive behavior:** horizontal scroll on mobile OR card view
4. **Consistent cell padding:** 12px 16px
5. **Sticky header** on scroll
6. **Empty state message** (not just blank)
7. **Loading state** uses Skeleton rows (5 rows)
8. **Mobile: card view** recommended (not horizontal scroll)
9. **Pagination:** 10, 25, 50, 100 per page options
10. **Sort indicator:** ↑ ↓ icons in header

---

# 8. Select

## Purpose
Dropdown selection for 7 or more options with search support.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Height** | 48px | `var(--height-md)` |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding** | 16px | `var(--spacing-lg)` |
| **Background** | `var(--input-bg)` | - |
| **Font Size** | 16px | `var(--font-size-body)` |
| **Dropdown Shadow** | medium | `var(--shadow-md)` |
| **Dropdown Max Height** | 300px | - |

## Variants

| Variant | Use Case |
|---------|----------|
| **single** | Single selection |
| **multiple** | Multiple selections |

## States

### Closed
- Background: `var(--input-bg)`
- Text: selected value or placeholder
- Icon: chevron down

### Open
- Background: `var(--input-bg)`
- Dropdown: visible below
- Icon: chevron up
- Focus ring: 2px

### Option (hover)
- Background: `var(--bg-hover)`
- Cursor: pointer

### Option (selected)
- Background: `var(--bg-tertiary)`
- Checkmark icon

## Props Interface

```typescript
interface SelectOption {
  /**
   * Option value
   */
  value: string;
  
  /**
   * Option label (from copy tokens)
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
  
  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean;
}

interface SelectProps {
  /**
   * Available options (7+ recommended)
   */
  options: SelectOption[];
  
  /**
   * Currently selected value(s)
   */
  value: string | string[];
  
  /**
   * Change handler
   */
  onChange: (value: string | string[]) => void;
  
  /**
   * Placeholder text (from copy tokens)
   */
  placeholder?: string;
  
  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether search is enabled
   * Auto-enabled when 10+ options
   * @default false
   */
  searchable?: boolean;
  
  /**
   * Search placeholder (from copy tokens)
   */
  searchPlaceholder?: string;
  
  /**
   * Empty state message (from copy tokens)
   */
  emptyMessage?: string;
  
  /**
   * Variant
   * @default 'single'
   */
  variant?: 'single' | 'multiple';
}
```

## Usage Example

```tsx
import { Select } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic select
<Select
  options={categories.map(cat => ({
    value: cat.id,
    label: ar.categories[cat.name],
  }))}
  value={selectedCategory}
  onChange={setSelectedCategory}
  placeholder={ar.ui.selectCategory}
/>

// ✅ CORRECT: With search (10+ options)
<Select
  options={cities}
  value={selectedCity}
  onChange={setSelectedCity}
  searchable
  searchPlaceholder={ar.ui.searchCity}
  emptyMessage={ar.ui.noResults}
/>

// ✅ CORRECT: Multiple selection
<Select
  variant="multiple"
  options={tags}
  value={selectedTags}
  onChange={setSelectedTags}
/>

// ❌ WRONG: Few options (use SegmentedControl)
<Select
  options={[...3 options]}  // Use SegmentedControl!
/>
```

## ❌ Forbidden

- NO borders (use background)
- NO inline styles
- NO hardcoded text
- NO `className` prop
- NO use for 2-6 options (use SegmentedControl)

## Component-Specific Notes

1. **For 7+ options** - 2-6 options = use SegmentedControl
2. **Search appears when 10+ options** (or manually enabled)
3. **Keyboard:** Type to filter options
4. **Mobile: native select** (`<select>`) for better UX
5. **Empty state:** "لا توجد نتائج" from copy tokens
6. **Multi-select variant** available
7. **Dropdown uses shadow-md** for depth
8. **Max height: 300px** with scroll

---

# 9. Tabs

## Purpose
Navigate between different sections of content on the same page.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Tab Height** | 48px | `var(--height-md)` |
| **Tab Padding** | 16px | `var(--spacing-lg)` |
| **Font Size** | 16px | `var(--font-size-body)` |
| **Font Weight** | 500 | `var(--font-weight-medium)` |
| **Active Indicator** | 2px bottom line | - |
| **Active Color** | `var(--text-primary)` | - |

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | Standard tabs |

## States

### Tab (inactive)
- Background: transparent
- Text: `var(--text-secondary)`
- Border bottom: none
- Cursor: pointer

### Tab (active)
- Background: transparent
- Text: `var(--text-primary)`
- Border bottom: 2px `var(--text-primary)`
- Font weight: semibold

### Tab (hover)
- Background: `var(--bg-hover)`
- Text: `var(--text-primary)`

## Props Interface

```typescript
interface TabItem {
  /**
   * Tab value (unique identifier)
   */
  value: string;
  
  /**
   * Tab label (from copy tokens)
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
  
  /**
   * Tab content
   */
  content: ReactNode;
}

interface TabsProps {
  /**
   * Available tabs
   */
  tabs: TabItem[];
  
  /**
   * Currently active tab value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  
  /**
   * Whether tabs are scrollable on mobile
   * @default true
   */
  scrollable?: boolean;
}
```

## Usage Example

```tsx
import { Tabs } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Basic tabs
<Tabs
  tabs={[
    {
      value: 'details',
      label: ar.ui.details,
      content: <ProductDetails />,
    },
    {
      value: 'reviews',
      label: ar.ui.reviews,
      content: <ProductReviews />,
    },
    {
      value: 'related',
      label: ar.ui.related,
      content: <RelatedProducts />,
    },
  ]}
  value={activeTab}
  onChange={setActiveTab}
/>

// ✅ CORRECT: With icons
<Tabs
  tabs={[
    {
      value: 'orders',
      label: ar.ui.orders,
      icon: <OrderIcon />,
      content: <OrdersList />,
    },
  ]}
  value={activeTab}
  onChange={setActiveTab}
/>

// ❌ WRONG: Hardcoded labels
<Tabs
  tabs={[
    { value: 'tab1', label: 'Tab 1', content: <div /> },
  ]}
/>
```

## ❌ Forbidden

- NO borders on tabs
- NO inline styles
- NO hardcoded text
- NO `className` prop

## Component-Specific Notes

1. **Mobile: scrollable** (not wrapped) by default
2. **Active indicator:** 2px bottom line
3. **Keyboard:** Arrow keys + Home/End navigation
4. **Tab content** uses fade transition (150ms)
5. **NO borders** on tabs - only bottom indicator for active
6. **Horizontal layout** only (no vertical tabs)

---

# 10. Avatar

## Purpose
Display user or vendor profile photos with fallback to initials.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Size (sm)** | 32px | - |
| **Size (md)** | 40px | - |
| **Size (lg)** | 56px | - |
| **Border Radius** | 9999px | `var(--radius-full)` |
| **Font Size (sm)** | 12px | `var(--font-size-caption)` |
| **Font Size (md)** | 14px | `var(--font-size-small)` |
| **Font Size (lg)** | 18px | `var(--font-size-h4)` |
| **Font Weight** | 600 | `var(--font-weight-semibold)` |

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | User/vendor avatar |

## Sizes

| Size | Dimensions | Font Size | Use Case |
|------|------------|-----------|----------|
| **sm** | 32px | 12px | Comments, small lists |
| **md** | 40px | 14px | Default |
| **lg** | 56px | 18px | Profile pages |

## States

### With Image
- Image: cover, centered
- Border radius: full
- Alt text: user name

### Without Image (initials)
- Background: generated from name hash
- Text: first 2 letters (English) or first letter (Arabic)
- Text color: white or black (based on bg brightness)

### With Status Indicator
- Indicator: 8px circle
- Position: bottom-right
- Border: 2px white
- Colors:
  - Online: `var(--color-success)`
  - Offline: `var(--text-tertiary)`
  - Busy: `var(--color-danger)`
  - Away: `var(--color-warning)`

## Props Interface

```typescript
interface AvatarProps {
  /**
   * User/vendor name (for initials and alt text)
   */
  name: string;
  
  /**
   * Image URL
   */
  src?: string;
  
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional status indicator
   */
  status?: 'online' | 'offline' | 'busy' | 'away';
  
  /**
   * Whether the avatar is clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Click handler (only works if clickable=true)
   */
  onClick?: () => void;
}
```

## Usage Example

```tsx
import { Avatar } from '@nasneh/ui';

// ✅ CORRECT: With image
<Avatar
  name="أحمد محمد"
  src="/avatars/ahmed.jpg"
  size="md"
/>

// ✅ CORRECT: Initials fallback
<Avatar
  name="سارة علي"
  size="lg"
/>

// ✅ CORRECT: With status
<Avatar
  name="Mohammed Ali"
  src="/avatars/mohammed.jpg"
  status="online"
/>

// ✅ CORRECT: Clickable
<Avatar
  name="Fatima Hassan"
  clickable
  onClick={handleProfileClick}
/>

// ❌ WRONG: Hardcoded initials
<Avatar>AH</Avatar>
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO square avatars (always rounded-full)
- NO `className` prop

## Component-Specific Notes

1. **Initials logic:**
   - English: first 2 letters (e.g., "Ahmed" → "AH")
   - Arabic: first letter only (e.g., "أحمد" → "أ")
2. **Background color:** hash from name (consistent per user)
3. **Status indicator:** 4 states (online, offline, busy, away)
4. **Fallback icon:** User icon from copy tokens if no name
5. **rounded-full always** - no exceptions
6. **Alt text:** user name for accessibility

---

# 11. Toast

## Purpose
Temporary notification for user feedback and system messages.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Min Width** | 300px | - |
| **Max Width** | 400px | - |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Padding** | 16px | `var(--spacing-lg)` |
| **Shadow** | large | `var(--shadow-lg)` |
| **Font Size** | 14px | `var(--font-size-small)` |
| **Auto-dismiss** | 5 seconds | - |

## Variants

| Variant | Background | Icon Color | Use Case |
|---------|------------|------------|----------|
| **success** | `var(--color-success)` | white | Completed actions |
| **error** | `var(--color-danger)` | white | Errors, failures |
| **warning** | `var(--color-warning)` | black | Warnings |
| **info** | `var(--color-info)` | white | Information |

## States

### Visible
- Opacity: 1
- Transform: translateY(0)
- Transition: slide in from top

### Hidden
- Opacity: 0
- Transform: translateY(-100%)

## Props Interface

```typescript
interface ToastProps {
  /**
   * Toast variant
   */
  variant: 'success' | 'error' | 'warning' | 'info';
  
  /**
   * Toast message (from copy tokens)
   */
  message: string;
  
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Auto-dismiss duration in milliseconds
   * @default 5000
   */
  duration?: number;
  
  /**
   * Whether the toast can be manually closed
   * @default true
   */
  closable?: boolean;
  
  /**
   * Close handler
   */
  onClose?: () => void;
}
```

## Usage Example

```tsx
import { toast } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

// ✅ CORRECT: Success toast
toast.success(ar.success.orderPlaced);

// ✅ CORRECT: Error toast
toast.error(ar.errors.paymentFailed);

// ✅ CORRECT: With action
toast.info(ar.ui.newUpdate, {
  action: {
    label: ar.ui.viewNow,
    onClick: handleViewUpdate,
  },
});

// ✅ CORRECT: Custom duration
toast.warning(ar.ui.sessionExpiring, {
  duration: 10000,
});

// ❌ WRONG: Hardcoded message
toast.success('Order placed successfully');
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO hardcoded text
- NO more than 3 toasts stacked
- NO `className` prop

## Component-Specific Notes

1. **Position:** top-right (desktop), top-center (mobile)
2. **Auto-dismiss:** 5 seconds default
3. **Stack limit: 3** (oldest dismissed automatically)
4. **Swipe to dismiss** on mobile
5. **Pause auto-dismiss on hover**
6. **Action button** optional (max 1 per toast)
7. **Close button** (X) optional
8. **Slide in/out** animation (150ms)

---

# 12. Skeleton

## Purpose
Loading placeholder that matches component dimensions during data fetch.

## Visual Specs

| Property | Value | Token |
|----------|-------|-------|
| **Background** | `var(--bg-tertiary)` | - |
| **Animation** | pulse | - |
| **Animation Duration** | 1.5s | - |
| **Border Radius** | 12px | `var(--radius-standard)` |
| **Border Radius (circle)** | 9999px | `var(--radius-full)` |

## Variants

| Variant | Shape | Use Case |
|---------|-------|----------|
| **text** | Rectangle (lines) | Text content |
| **circle** | Circle | Avatars |
| **rectangle** | Rectangle | Images, cards |
| **card** | Card layout | Full cards |

## States

### Loading
- Background: `var(--bg-tertiary)`
- Animation: pulse (1.5s infinite)
- Opacity: 0.6 → 1 → 0.6

## Props Interface

```typescript
interface SkeletonProps {
  /**
   * Skeleton variant
   * @default 'text'
   */
  variant?: 'text' | 'circle' | 'rectangle' | 'card';
  
  /**
   * Width (CSS value)
   */
  width?: string | number;
  
  /**
   * Height (CSS value)
   */
  height?: string | number;
  
  /**
   * Number of lines (for text variant)
   * @default 1
   */
  lines?: number;
  
  /**
   * Whether to animate
   * @default true
   */
  animate?: boolean;
}
```

## Usage Example

```tsx
import { Skeleton } from '@nasneh/ui';

// ✅ CORRECT: Text skeleton
<Skeleton variant="text" width="200px" />

// ✅ CORRECT: Multiple text lines
<Skeleton variant="text" lines={3} />

// ✅ CORRECT: Circle (avatar)
<Skeleton variant="circle" width={40} height={40} />

// ✅ CORRECT: Rectangle (image)
<Skeleton variant="rectangle" width="100%" height="200px" />

// ✅ CORRECT: Card skeleton
<Skeleton variant="card" />

// ✅ CORRECT: Table skeleton
{loading && (
  <>
    <Skeleton variant="text" lines={5} />
  </>
)}
```

## ❌ Forbidden

- NO borders
- NO inline styles
- NO `className` prop

## Component-Specific Notes

1. **Pulse animation:** 1.5s duration
2. **Match exact component dimensions**
3. **Variants:** text (lines), circle, rectangle, card
4. **Accessibility:** `aria-busy="true"` on container
5. **Text variant:** multiple lines supported
6. **Circle variant:** for avatars (rounded-full)
7. **Card variant:** includes padding and shadow
8. **Animation can be disabled** for static placeholders

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release - 12 components specified |

---

**Document End**


---

## Related Documentation

- **Design Tokens:** `../../packages/ui/src/styles/tokens.css` - The actual CSS variable values
