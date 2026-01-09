# PR1 Evidence: Remove Dead UI + Fix Routing

## PR Link
**https://github.com/nasneh-hub/nasneh/pull/248**

## Changes Made

### 1. Removed Dead UI Elements

**Globe Button (Language/Currency)**
- **Before:** Button that opened a large modal with misleading state (showed Arabic selected when UI is English, SAR currency when app is BHD-first)
- **After:** Removed completely
- **Reason:** Non-functional, misleading UX
- **Next:** Will be replaced with proper dropdowns in PR3

**Theme Toggle**
- **Before:** Sun/Moon icon that toggled state but didn't actually change theme
- **After:** Removed completely
- **Reason:** Dead UI - just toggled local state, no actual theme switching
- **Next:** Will be implemented properly with next-themes in PR2

**Hamburger Menu**
- **Before:** Menu icon (3 lines) that did nothing (TODO comment)
- **After:** Removed completely
- **Reason:** Dead UI - no functionality
- **Next:** Will be implemented with proper Sheet component in PR4

**Globe Modal**
- **Before:** Large modal with Arabic text, showing Arabic/SAR options
- **After:** Removed completely (entire Dialog component)
- **Reason:** Misleading state, wrong UX pattern
- **Next:** Will be replaced with small dropdowns in PR3

### 2. Code Cleanup

**Removed State Variables:**
```typescript
- globeModalOpen
- theme
- language (was defaulting to 'ar' incorrectly)
- currency (was defaulting to 'SAR' incorrectly)
```

**Removed Functions:**
```typescript
- toggleTheme() // Did nothing useful
```

**Removed Imports:**
```typescript
- Globe, Sun, Moon, Menu (lucide-react icons)
- Dialog (from @nasneh/ui)
```

### 3. Routing Verification

**Avatar Dropdown Routes - All Valid:**
- ✅ `/profile` → `apps/customer-web/src/app/(app)/profile/page.tsx`
- ✅ `/orders` → `apps/customer-web/src/app/(app)/orders/page.tsx`
- ✅ `/bookings` → `apps/customer-web/src/app/(app)/bookings/page.tsx`
- ✅ `/reviews` → `apps/customer-web/src/app/(app)/reviews/page.tsx`
- ✅ `/profile/addresses` → `apps/customer-web/src/app/(app)/profile/addresses/page.tsx`
- ✅ `/wishlist` → `apps/customer-web/src/app/(app)/wishlist/page.tsx`
- ✅ `/support` → `apps/customer-web/src/app/(app)/support/page.tsx`

**No Middleware Redirects:**
- No middleware.ts found that could cause bouncing
- Routes should navigate correctly

### 4. Single Source Compliance

**Header Component:**
- ✅ Remains single shared component
- ✅ Used via `(app)/layout.tsx`
- ✅ No duplication
- ✅ No hardcoded colors (only `var(--*)` tokens)
- ✅ No hardcoded strings (uses copy tokens where applicable)

## CI Status

**Typecheck:** ✅ PASSED
```
Tasks:    3 successful, 3 total
Time:    10.939s
```

**GitHub Actions:** 🔄 IN PROGRESS
- ✅ Validate PR Title: SUCCESS
- ✅ UI Law Compliance: SUCCESS
- 🔄 Lint: PENDING
- 🔄 Type Check: PENDING
- 🔄 Test: PENDING

## Diff Summary

**Files Changed:** 1
- `apps/customer-web/src/components/layout/header.tsx`

**Lines Changed:**
- Removed: ~161 lines (dead UI code)
- Added: ~74 lines (comments explaining removal)
- Net: -87 lines

**No New Dependencies:** ✅

## Next Steps

1. **PR2:** Implement theme toggle with next-themes
2. **PR3:** Replace language/currency modal with shadcn dropdowns
3. **PR4:** Implement centered NavigationMenu with shadcn component

## Status: ✅ READY FOR REVIEW

All dead UI removed, routing verified, typecheck passed, no new dependencies.
