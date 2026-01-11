# Sprint 6 Evidence Pack Template

**Version:** 1.0  
**Date:** January 11, 2026  
**Sprint:** Sprint 6 - Foundation + PRD Reality Audit (Functional Only)

---

## Sprint 6 Rules (Non-Negotiable)

### ✅ ALLOWED

- Fix code violations (mono classes, inline styles)
- Add test data for staging
- Fix functional blockers
- Make flows work end-to-end
- Fix broken buttons/links
- Add missing API integrations

### ❌ NOT ALLOWED

- UI polish or redesign
- Aesthetic improvements
- Responsive tweaks (goes to Sprint 7)
- Dead UI (fake buttons that don't work)
- Color scheme changes
- Font adjustments
- Layout redesigns
- Animation improvements

---

## Evidence Pack Template

**Every Sprint 6 task MUST include ALL of the following:**

### 1) Screenshots

**Required:**
- Desktop view (1920x1080 or similar)
- Mobile view (if relevant to the task)
- Before/After comparison (if fixing a bug or changing UI)

**States to Capture:**
- Loading state
- Empty state
- Normal state (with data)
- Error state (if applicable)

**Format:**
- PNG or JPEG
- Clear, readable text
- Annotated if necessary (arrows, highlights)

**Example:**
```
screenshots/
├── before-desktop.png
├── after-desktop.png
├── before-mobile.png
└── after-mobile.png
```

---

### 2) curl Proof (if API-related)

**Purpose:** Verify API endpoints work correctly

**Template:**
```bash
# Test endpoint
curl -s "https://api-staging.nasneh.com/api/v1/endpoint" | jq

# Expected response
{
  "success": true,
  "data": [...]
}

# With auth (if required)
curl -s -H "Authorization: Bearer <token>" \
  "https://api-staging.nasneh.com/api/v1/endpoint" | jq
```

**What to Include:**
- Endpoint URL
- Request method (GET, POST, PATCH, DELETE)
- Request body (if applicable)
- Expected response
- Actual response
- HTTP status code

---

### 3) rg Proof (Code Quality)

**Purpose:** Verify code compliance with UI Laws and standards

**Required Checks:**

#### a) No Inline Styles
```bash
rg "style={{" apps/customer-web/src --type tsx | wc -l
# Expected: 0
```

#### b) No Mono Classes
```bash
rg "bg-mono-|text-mono-|border-mono-" apps/customer-web/src | wc -l
# Expected: 0
```

#### c) No Hex Colors
```bash
rg "#[0-9a-fA-F]{3,6}" apps/customer-web/src --type tsx | wc -l
# Expected: 0
```

#### d) No Tailwind Palette Colors
```bash
rg "bg-(red|blue|green|yellow|purple|pink|indigo|gray)-[0-9]" apps/customer-web/src | wc -l
# Expected: 0
```

#### e) No Border Classes (except border-0)
```bash
rg "border-[0-9]|border-t-|border-b-|border-l-|border-r-" apps/customer-web/src | grep -v "border-0" | wc -l
# Expected: 0
```

**Format:**
```bash
# Run all checks
cd /home/ubuntu/nasneh

echo "=== Inline Styles ==="
rg "style={{" apps/customer-web/src --type tsx | wc -l

echo "=== Mono Classes ==="
rg "bg-mono-|text-mono-|border-mono-" apps/customer-web/src | wc -l

echo "=== Hex Colors ==="
rg "#[0-9a-fA-F]{3,6}" apps/customer-web/src --type tsx | wc -l

echo "=== Tailwind Palette ==="
rg "bg-(red|blue|green|yellow|purple)" apps/customer-web/src | wc -l

echo "=== Border Classes ==="
rg "border-[0-9]|border-t-" apps/customer-web/src | grep -v "border-0" | wc -l
```

---

### 4) CI Green

**Purpose:** Ensure all automated checks pass

**Required:**
- ✅ All GitHub Actions workflows pass
- ✅ No failing tests
- ✅ Build succeeds
- ✅ Typecheck passes
- ✅ Linting passes (if enabled)

**How to Verify:**
1. Check PR page on GitHub
2. Look for green checkmarks next to all workflows
3. If any checks fail, fix before marking task as done

**Screenshot:**
Include a screenshot of the PR showing all green checks.

---

### 5) Short Notes

**Purpose:** Document what changed and why

**Template:**
```markdown
## What Changed
- [List specific changes made]
- [Be concise but complete]

## Why It Changed
- [Explain the reason for the change]
- [Reference PRD requirement or bug report if applicable]

## Risks or Follow-ups
- [Any potential issues to watch for]
- [Any follow-up tasks needed]
- [Any dependencies on other tasks]

## Testing Notes
- [How to test the change]
- [Any special setup required]
- [Expected behavior]
```

---

## Runbooks

### How to Verify Bundle Points to Correct API Base

**Problem:** UI shows empty lists or "Network Error" despite API being up

**Steps:**
1. Check environment variables in build:
   ```bash
   # In customer-web or dashboard
   cat .env.local
   # Should have:
   NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com
   ```

2. Verify build output:
   ```bash
   pnpm build --filter=@nasneh/customer-web
   # Check for NEXT_PUBLIC_API_URL in output
   ```

3. Check runtime API calls:
   ```bash
   # Open browser DevTools → Network tab
   # Look for API calls
   # Verify they go to correct base URL
   ```

4. Common Issues:
   - ❌ `/api/v1/api/v1` duplication (fix: use `getApiUrl()` helper)
   - ❌ `http://` instead of `https://` (fix: update env var)
   - ❌ Missing `NEXT_PUBLIC_` prefix (fix: rename env var)
   - ❌ Hardcoded `localhost:3001` (fix: use env var)

---

### What to Do If UI Shows Empty Lists

**Problem:** Browse pages show "No items found" despite data existing in database

**Diagnosis Steps:**

1. **Check API Response:**
   ```bash
   curl -s "https://api-staging.nasneh.com/api/v1/categories" | jq
   # Should return {"success": true, "data": [...]}
   ```

2. **Check Browser Network Tab:**
   - Open DevTools → Network
   - Reload page
   - Look for API call to `/categories`
   - Check response status (200 OK?)
   - Check response body (empty array?)

3. **Check Database:**
   ```bash
   # SSH to staging API server
   # Run Prisma Studio or query directly
   npx prisma studio
   # Check if data exists in database
   ```

4. **Common Causes:**
   - ❌ No data in staging database → Run seed script (see S6-03)
   - ❌ Wrong API base URL → Check env vars
   - ❌ Auth required but not provided → Check if endpoint needs auth
   - ❌ Filtering too strict → Check query params

---

### How to Run Seed Script on Staging

**Purpose:** Populate staging database with test data

**Prerequisites:**
- Access to staging API server
- Prisma CLI installed
- Database connection string

**Steps:**

1. **Navigate to API directory:**
   ```bash
   cd /home/ubuntu/nasneh/apps/api
   ```

2. **Set environment:**
   ```bash
   export APP_ENVIRONMENT=staging
   export DATABASE_URL="<staging-db-connection-string>"
   ```

3. **Run seed script:**
   ```bash
   pnpm seed:staging
   ```

4. **Verify data:**
   ```bash
   # Check categories
   curl -s "https://api-staging.nasneh.com/api/v1/categories" | jq '.data | length'
   # Should return 10+

   # Check products
   curl -s "https://api-staging.nasneh.com/api/v1/products" | jq '.data | length'
   # Should return 50+

   # Check services
   curl -s "https://api-staging.nasneh.com/api/v1/services" | jq '.data | length'
   # Should return 20+
   ```

5. **Troubleshooting:**
   - If script fails with "Not staging environment" → Check `APP_ENVIRONMENT` var
   - If script fails with database error → Check `DATABASE_URL`
   - If data doesn't appear → Check API server is running
   - If data appears but UI still empty → Check frontend API base URL

---

## Definition of Done (Sprint 6 Tasks)

**A task is considered DONE when:**

- [ ] All code changes committed and pushed
- [ ] PR created and linked in ClickUp task
- [ ] All 5 evidence items provided:
  - [ ] Screenshots (desktop + mobile if relevant)
  - [ ] curl proof (if API-related)
  - [ ] rg proof (code quality checks)
  - [ ] CI green (all checks pass)
  - [ ] Short notes (what/why/risks)
- [ ] PR reviewed and approved
- [ ] PR merged to main
- [ ] Task status updated to "Complete" in ClickUp
- [ ] Evidence Pack attached to ClickUp task

**Additional Criteria:**
- [ ] No new violations introduced
- [ ] No dead UI (all buttons/links work)
- [ ] Functional requirement met (not just code written)
- [ ] Tested on staging (if applicable)

---

## Example Evidence Pack

### Task: [S6-01] Fix Mono Class Violations - Cart Components

#### 1) Screenshots

**Before:**
![Cart Before](screenshots/cart-before.png)
- 50 mono class violations
- `bg-mono-50`, `text-mono-700`, `border-mono-200`

**After:**
![Cart After](screenshots/cart-after.png)
- 0 mono class violations
- Uses `var(--surface-secondary)`, `var(--text-primary)`, `var(--border)`

---

#### 2) curl Proof

Not applicable (no API changes)

---

#### 3) rg Proof

```bash
$ cd /home/ubuntu/nasneh

$ echo "=== Mono Classes in Cart Components ==="
$ rg "bg-mono-|text-mono-|border-mono-" apps/customer-web/src/components/cart | wc -l
0

$ echo "=== Inline Styles ==="
$ rg "style={{" apps/customer-web/src/components/cart | wc -l
0

$ echo "=== Hex Colors ==="
$ rg "#[0-9a-fA-F]{3,6}" apps/customer-web/src/components/cart --type tsx | wc -l
0
```

✅ All checks pass

---

#### 4) CI Green

![CI Green](screenshots/ci-green.png)

All GitHub Actions checks passed:
- ✅ Build
- ✅ Typecheck
- ✅ Lint (if enabled)

---

#### 5) Short Notes

**What Changed:**
- Replaced 50 mono class instances in cart components
- Updated `cart-item.tsx`, `cart-summary.tsx`, `cart.tsx`
- All mono classes replaced with CSS tokens from `tokens.css`

**Why It Changed:**
- Violates UI Law #3 (ONLY MONO COLORS)
- Blocks CI enforcement
- Part of Sprint 6 foundation cleanup

**Risks or Follow-ups:**
- None
- Visual appearance unchanged (tokens match mono colors)
- No functional changes

**Testing Notes:**
- Tested on staging with sample products
- Cart displays correctly
- Add to cart, remove from cart, update quantity all work

---

## Quick Reference

### File Locations
- Evidence Template: `/home/ubuntu/nasneh/docs/SPRINT_6_EVIDENCE_TEMPLATE.md`
- Sprint 6 Tasks: https://app.clickup.com/90182234772/v/li/901815020707
- PRD: `/home/ubuntu/nasneh/docs/SPECS/PRD_MASTER.md`

### Commands
```bash
# Check violations
cd /home/ubuntu/nasneh
rg "bg-mono-|text-mono-|border-mono-" apps/customer-web/src | wc -l
rg "style={{" apps/customer-web/src --type tsx | wc -l

# Build and test
pnpm typecheck --filter=@nasneh/customer-web
pnpm build --filter=@nasneh/customer-web

# Test API
curl -s "https://api-staging.nasneh.com/api/v1/categories" | jq
```

### Links
- Staging: https://staging.nasneh.com
- API: https://api-staging.nasneh.com/api/v1
- Dashboard: https://dashboard-staging.nasneh.com
- GitHub: https://github.com/nasneh-hub/nasneh
- ClickUp Sprint 6: https://app.clickup.com/90182234772/v/li/901815020707

---

**End of Evidence Pack Template**

---

**Generated:** January 11, 2026  
**By:** Manus AI Agent  
**For:** Sprint 6 - Foundation + PRD Reality Audit
