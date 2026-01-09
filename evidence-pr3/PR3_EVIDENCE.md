# PR3 Evidence: Globe Dropdown for Language/Currency/Country Settings

## PR Link
**https://github.com/nasneh-hub/nasneh/pull/251**

## Goal

Replace the large language/currency/country modal with a small, clean shadcn dropdown menu.

## Requirements Met

### 1. No Modal ✅
- Removed large popup/modal completely (was removed in PR1)
- Replaced with small shadcn DropdownMenu component
- Same UX style as Avatar dropdown

### 2. Placement ✅
- Globe icon in header (between Sell CTA and Theme toggle)
- Clicking opens shadcn DropdownMenu (small, clean)

### 3. Dropdown Content (Bahrain-first, English-first) ✅

**Language Section:**
- ✅ Default: English (active, normal color)
- ✅ Arabic: disabled, labeled "Coming soon"
- ✅ NO fake "Selected Arabic" while UI is English

**Currency Section:**
- ✅ Default: BHD (Bahraini Dinar)
- ✅ Other currencies: not listed (can be added later as disabled)
- ✅ NO fake "saved" selections

**Country Section:**
- ✅ Default: Bahrain (active, normal color)
- ✅ GCC: disabled, labeled "Coming soon"

### 4. Rules ✅

**shadcn-only components:**
- ✅ Using `DropdownMenu` from @nasneh/ui (shadcn-based)
- ✅ Using `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`

**No hardcoded strings:**
- ✅ All text from copy tokens (`en.settings.*`)
- ✅ Added new section in `en.ts`:
  ```typescript
  settings: {
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    currency: 'Currency',
    bahrainDinar: 'Bahraini Dinar (BHD)',
    country: 'Country',
    bahrain: 'Bahrain',
    gcc: 'GCC',
    comingSoon: 'Coming soon',
  }
  ```

**No hardcoded colors/radius:**
- ✅ All colors from tokens.css:
  - `var(--text-primary)` for active items
  - `var(--text-tertiary)` for disabled items and section headers
- ✅ All spacing from tokens.css:
  - `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
- ✅ All font sizes from tokens.css:
  - `var(--font-size-xs)` for section headers
- ✅ All font weights from tokens.css:
  - `var(--font-weight-semibold)` for section headers

**Keep changes minimal:**
- ✅ No header rewrite
- ✅ Only added Globe icon and dropdown (68 lines)
- ✅ Added Globe import from lucide-react

## Implementation Details

### Files Changed

**1. packages/ui/src/copy/en.ts**
- Added `settings` section with 9 tokens
- All language/currency/country options
- "Coming soon" status text

**2. apps/customer-web/src/components/layout/header.tsx**
- Added `Globe` import from lucide-react
- Added Globe dropdown between Sell CTA and Theme toggle
- 3 sections with separators:
  - Language (English active, Arabic disabled)
  - Currency (BHD active)
  - Country (Bahrain active, GCC disabled)

### Code Structure

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>
      <Globe size={20} />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" style={{ minWidth: '200px' }}>
    {/* Language Section */}
    <div>{en.settings.language}</div>
    <DropdownMenuItem>{en.settings.english}</DropdownMenuItem>
    <DropdownMenuItem disabled>{en.settings.arabic} ({en.settings.comingSoon})</DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    {/* Currency Section */}
    <div>{en.settings.currency}</div>
    <DropdownMenuItem>{en.settings.bahrainDinar}</DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    {/* Country Section */}
    <div>{en.settings.country}</div>
    <DropdownMenuItem>{en.settings.bahrain}</DropdownMenuItem>
    <DropdownMenuItem disabled>{en.settings.gcc} ({en.settings.comingSoon})</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Evidence

### Screenshot 1: Globe Dropdown Open
**File:** `evidence-pr3/01-globe-dropdown-open.webp`

**Shows:**
- ✅ Globe icon in header (between Sell CTA and Theme toggle)
- ✅ Small, clean dropdown menu (not large modal)
- ✅ 3 sections with separators:
  - Language: English (active), Arabic (Coming soon)
  - Currency: Bahraini Dinar (BHD) (active)
  - Country: Bahrain (active), GCC (Coming soon)
- ✅ Disabled items grayed out with "Coming soon" label
- ✅ Active items in normal color
- ✅ Section headers in smaller, tertiary color

### Visual Inspection
- ✅ Dropdown aligns to the right (align="end")
- ✅ Minimum width of 200px for readability
- ✅ Proper spacing between sections (separators)
- ✅ Consistent with Avatar dropdown style
- ✅ Proper hover states (shadcn default)

## Verification

### TypeCheck ✅
**Command:** `pnpm run typecheck`

**Result:** PASSED
```
Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
Time:    4.133s
```

### Browser Test ✅
**URL:** http://localhost:3000

**Steps:**
1. Click Globe icon in header
2. Dropdown opens with 3 sections
3. English, BHD, Bahrain shown as active (normal color)
4. Arabic, GCC shown as disabled with "Coming soon" (grayed out)
5. Click outside to close dropdown

**Result:** ✅ ALL WORKING

### Copy Tokens Verification ✅
**Command:** `grep -A 10 "settings:" packages/ui/src/copy/en.ts`

**Result:** All tokens present
```typescript
settings: {
  language: 'Language',
  english: 'English',
  arabic: 'Arabic',
  currency: 'Currency',
  bahrainDinar: 'Bahraini Dinar (BHD)',
  country: 'Country',
  bahrain: 'Bahrain',
  gcc: 'GCC',
  comingSoon: 'Coming soon',
}
```

## Constraints Checklist

- ✅ **No modal** - Using small dropdown instead
- ✅ **shadcn-only** - DropdownMenu from @nasneh/ui
- ✅ **Copy tokens** - All text from en.settings.*
- ✅ **tokens.css** - All colors/spacing from CSS variables
- ✅ **Minimal changes** - No header rewrite (68 lines added)
- ✅ **Bahrain-first** - English, BHD, Bahrain as defaults
- ✅ **No fake states** - Only showing actual defaults
- ✅ **Clean UI** - Small, consistent with other dropdowns

## Impact

### Before (PR1)
- ❌ Large modal with misleading state
- ❌ Showed "Arabic selected" while UI was English
- ❌ Showed "SAR" instead of "BHD"
- ❌ Confusing UX

### After (PR3)
- ✅ Small, clean dropdown
- ✅ Shows correct defaults: English, BHD, Bahrain
- ✅ Disabled items clearly marked "Coming soon"
- ✅ No misleading states
- ✅ Consistent with Avatar dropdown style
- ✅ Professional UX

## CI Status

**GitHub Actions:** 🔄 IN PROGRESS
- PR created: https://github.com/nasneh-hub/nasneh/pull/251
- Checks running...

## Next Steps

**PR4:** Implement centered NavigationMenu with shadcn component
- Add shadcn NavigationMenu component to @nasneh/ui
- Replace current tab navigation with NavigationMenu
- Ensure visible on desktop, responsive on mobile
- Implement mobile menu (Sheet) or remove hamburger

## Status: ✅ READY FOR REVIEW

Globe dropdown implemented, all requirements met, TypeCheck passed.
