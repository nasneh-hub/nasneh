# Step 3 Evidence: Remove Permanent Error Toast

## PR Link
**https://github.com/nasneh-hub/nasneh/pull/250**

## Problem Statement

Home page displayed a permanent red "1 error" toast in the bottom left corner, making staging appear broken.

## Investigation Process

### 1. Error Discovery
- Visible on home page load: Red toast showing "1 error"
- Clicked toast to view details
- Error overlay showed: **"Unhandled Runtime Error"**

### 2. Error Details
**Type:** React Hydration Error

**Message:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Specific Issue:**
```
In HTML, <p> cannot be a descendant of <p>.
This will cause a hydration error.
```

**Learn More:** https://nextjs.org/docs/messages/react-hydration-error

### 3. Root Cause Analysis

**File:** `apps/customer-web/src/components/layout/footer.tsx`

**Lines:** 246-262

**Invalid HTML Structure:**
```tsx
<p
  style={{
    color: 'var(--text-tertiary)',
    fontSize: 'var(--font-size-small)',
    margin: 0,
  }}
>
  <p
    style={{
      color: 'var(--text-tertiary)',
      fontSize: 'var(--font-size-small)',
      margin: 0,
    }}
  >
    {en.footer.madeIn} {en.footer.bahrain}
  </p>
</p>
```

**Problem:** Nested `<p>` tags
- Outer `<p>` tag starts at line 246
- Inner `<p>` tag starts at line 253
- Both have identical styling
- This is invalid HTML (paragraph cannot contain paragraph)
- Causes hydration mismatch between server and client rendering

## Fix Applied

### Code Change

**Removed:** Lines 246-252 (outer `<p>` tag and its opening)

**Result:** Single `<p>` tag with content

**Fixed Structure:**
```tsx
<p
  style={{
    color: 'var(--text-tertiary)',
    fontSize: 'var(--font-size-small)',
    margin: 0,
  }}
>
  {en.footer.madeIn} {en.footer.bahrain}
</p>
```

### Files Changed
- `apps/customer-web/src/components/layout/footer.tsx` (8 lines removed)

### Commit
```
fix(footer): remove nested p tag causing hydration error
```

## Verification

### 1. TypeCheck
**Command:** `pnpm run typecheck`

**Result:** ✅ PASSED
```
Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
Time:    3.192s
```

### 2. Home Page Load
**URL:** http://localhost:3000

**Result:** ✅ NO ERROR TOAST
- Page loads cleanly
- No red toast in bottom left corner
- All content renders correctly:
  - Header with theme toggle
  - Hero section with search
  - Featured categories grid
  - Footer

### 3. Console Check
**Result:** ✅ CLEAN
- No console errors
- No warnings
- No hydration errors

## Evidence Screenshots

### Screenshot 1: Home Page (No Error Toast)
**File:** `evidence-step3/01-home-no-error-toast.webp`

**Shows:**
- Clean home page load
- NO red error toast
- Header, hero, categories, footer all visible
- Light mode with theme toggle working

## Impact

### Before Fix
- ❌ Permanent "1 error" toast on home page
- ❌ React hydration error in console
- ❌ Staging looks broken to users
- ❌ Invalid HTML structure

### After Fix
- ✅ NO error toast on home page
- ✅ Clean console (no errors)
- ✅ Staging looks professional
- ✅ Valid HTML structure
- ✅ Hydration works correctly

## Constraints Met

### ✅ No New Dependencies
- No packages added
- Pure HTML structure fix

### ✅ Single Source
- Still uses `en.footer.madeIn` and `en.footer.bahrain` copy tokens
- No hardcoded strings

### ✅ tokens.css
- Still uses `var(--text-tertiary)` and `var(--font-size-small)`
- No hardcoded colors

### ✅ Small PR
- Only 1 file changed
- Only 8 lines removed
- Surgical fix (no refactoring)

## CI Status

**GitHub Actions:** 🔄 IN PROGRESS
- PR created: https://github.com/nasneh-hub/nasneh/pull/250
- Checks running...

## Next Steps

**PR3:** Replace language/currency modal with shadcn dropdowns
- Remove large modal
- Add small dropdown menus
- Correct defaults: English, BHD
- Use shadcn DropdownMenu component

## Status: ✅ READY FOR REVIEW

Error toast removed, home page loads cleanly, console is clean.
