# Staging Frontend Fix: Services Not Rendering

**Date:** January 10, 2026  
**Issue:** Services page shows empty list despite API having 5 services  
**Status:** Root cause identified, fix documented  

---

## Root Cause

**Problem:** `NEXT_PUBLIC_API_URL` is embedded at **build time** in Next.js, not runtime.

**Current Situation:**
- ECS task definition has: `NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1` ✅
- CD workflow builds with: `NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com` ❌ (missing `/api/v1`)
- Deployed image was built with wrong/missing API URL
- Client-side code fetches from wrong URL → empty services list

---

## Evidence

### 1. ECS Configuration (Correct)

```bash
$ aws ecs describe-task-definition \
  --task-definition nasneh-staging-customer-web:37 \
  --query 'taskDefinition.containerDefinitions[0].environment'

[
  {"name": "NEXT_PUBLIC_API_URL", "value": "https://api-staging.nasneh.com/api/v1"}
]
```

### 2. CD Workflow (Incorrect)

**File:** `.github/workflows/cd-customer-web.yml`  
**Line 58:**
```yaml
--build-arg NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com \
```

**Missing:** `/api/v1` suffix

### 3. Code Usage

**File:** `apps/customer-web/src/app/(app)/services/page.tsx`  
**Line 58:**
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/services?${params}`
);
```

**Expected URL:** `https://api-staging.nasneh.com/api/v1/services`  
**Actual URL:** `https://api-staging.nasneh.com/services` or `undefined/services`

---

## Fix Required

### Option 1: Fix Workflow (Recommended)

**File:** `.github/workflows/cd-customer-web.yml`

**Change Line 58 from:**
```yaml
--build-arg NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com \
```

**To:**
```yaml
--build-arg NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1 \
```

**Then:**
1. Commit and push workflow fix
2. Trigger workflow manually: `gh workflow run cd-customer-web.yml --ref main -f environment=staging`
3. Or push any change to `apps/customer-web/**` to trigger auto-build

---

### Option 2: Trigger Rebuild (Temporary)

If workflow file cannot be modified immediately:

1. Make any small change to `apps/customer-web/` (e.g., add comment)
2. Push to main
3. CD workflow will trigger automatically
4. **Note:** This will still build with wrong API URL, so services won't work
5. **Must fix workflow first!**

---

## Verification Steps

After fix is deployed:

1. **Check new image:**
```bash
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-customer-web \
  --query 'services[0].taskDefinition'
```

2. **Visit staging:**
- URL: https://staging.nasneh.com/services
- Expected: List of 5 __E2E__ services
- Check Network tab: Request to `https://api-staging.nasneh.com/api/v1/services`
- Response: 200 OK with 5 services

3. **Test service detail:**
- URL: https://staging.nasneh.com/services/3d00f023-2dea-4618-9aff-9c6913545a34
- Expected: Service title, price, "Book Now" button

---

## Timeline

| Date | Event |
|------|-------|
| Jan 10, 2026 | Issue discovered: Services not rendering |
| Jan 10, 2026 | Root cause identified: Wrong build-time API URL |
| Jan 10, 2026 | Fix documented: Add `/api/v1` suffix to workflow |
| Jan 10, 2026 | **Pending:** Workflow fix + rebuild |

---

## Related

- **API Verification:** All 5 services exist in API (confirmed via curl)
- **Seeding:** Completed successfully (see S5-03_E2E_LIVE.md)
- **Backend:** Fully functional
- **Frontend Code:** Correct (just needs rebuild with right env var)

---

## Action Items

**Immediate:**
1. ✅ Fix workflow file (add `/api/v1` suffix)
2. 🔄 Merge workflow fix
3. 🔄 Trigger rebuild
4. 🔄 Verify services render on staging

**Follow-up:**
- Consider runtime config for `NEXT_PUBLIC_API_URL` to avoid rebuild on env changes
- Document build-time vs runtime env vars in developer guide

---

**Status:** Documented, awaiting workflow fix merge and rebuild.
