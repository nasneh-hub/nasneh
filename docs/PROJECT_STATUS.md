# Project Status

**Current release/tag:** v0.2.0 (AI Governance System)

---

## 🟢 Current State (Now) — 2026-01-08 05:00 UTC+3

- **🎉 Sprint 4 Frontend Foundation COMPLETE!** — All 4 tasks done (24/24 SP)
- **✅ [S4-01] Design System & Shared UI COMPLETE** — 12/12 core components built
- **✅ [S4-02] Customer Phone + OTP Login Flow COMPLETE** — Full auth flow implemented
- **✅ [S4-03] Customer Profile & Address Management COMPLETE** — Profile + Addresses pages
- **✅ [S4-04] Dashboard Login & Role Switching COMPLETE** — Multi-role auth flow
- **✅ UI Law CI Enforcement** — 12 checks, all passing
- **Status:** Ready for Sprint 5 (Frontend Core Features)

**Sprint 4 Progress: 24/24 SP (100%) ✅**

**Sprint 4 PRs:**
- #210: Dashboard Login & Role Switching (6 SP)
- #208: Customer Profile & Address Management (5 SP)
- #207: Remove localStorage workaround
- #204: Customer Phone + OTP Login Flow (5 SP)
- #203: Add remaining 6 core components (4 SP)
- #201: Add modification rules to tokens.css
- #199: First 6 components (4 SP)

**UI Law CI Fixes:**
- #214: Fix href pattern for optional spaces
- #213: Restore proper workflow structure
- #212: Improve forbidden terminology exclusions
- #211: Exclude route paths and TypeScript keys
- #209: Exclude Arabic punctuation
- #206: Add word boundaries to regex patterns

**Sprint 3.9 PRs (Infrastructure):**
- #194: Redis sidecar + OTP verify-otp + CD gating fixes
- #193: OTP mock mode - return 400 for invalid OTP
- #192: Add missing getBookingById function
- #191: Use ENVIRONMENT variable for OTP mock safety
- #190: Add OTP mock mode for staging
- #189: Remove waitForDelivery to prevent OTP timeout
- #188: API route inventory and reference documentation

---

## 🎉 Sprint 3 Complete (2026-01-05)

- **🎉 Sprint 3 COMPLETE!** — All 6 tasks done (24/24 Story Points)
- **✅ 15 New Endpoints Added** — Categories, Applications, Admin, Drivers
- **✅ 4 New Database Models** — VendorApplication, ProviderApplication, Driver, DeliveryAssignment
- **✅ 4 New Modules** — categories, applications, admin, drivers

**Sprint 3 PRs:**
- #172: Driver & Delivery APIs (6 SP)
- #171: Admin Dashboard Stats API (3 SP)
- #170: Admin Application Review APIs (3 SP)
- #169: Vendor & Provider Application APIs (6 SP)
- #168: Onboarding & Delivery DB Models (2 SP)
- #167: Categories API (2 SP)

---

## 🔧 Sprint 3.9 Infrastructure Stabilization (2026-01-07)

### Redis Sidecar Preservation Fix

**Problem:** CD workflow was overwriting Redis container with API image during deployment, causing 500 errors on Redis-dependent endpoints like `/api/v1/bookings/:id`.

**Root Cause:** The task definition update logic in `.github/workflows/cd.yml` was only specifying the API container in the `containers` array. AWS ECS interprets this as "replace ALL containers with this list", effectively removing the Redis sidecar:

```yaml
# OLD (broken)
containers: |
  [
    {
      "name": "api",
      "image": "${{ steps.login-ecr.outputs.registry }}/nasneh-staging-api:${{ github.sha }}"
    }
  ]
```

**Solution:** Updated the workflow to explicitly include both containers in the task definition update:

```yaml
# NEW (working)
containers: |
  [
    {
      "name": "api",
      "image": "${{ steps.login-ecr.outputs.registry }}/nasneh-staging-api:${{ github.sha }}"
    },
    {
      "name": "redis",
      "image": "redis:7-alpine",
      "essential": false,
      "portMappings": [{"containerPort": 6379, "protocol": "tcp"}],
      "healthCheck": {
        "command": ["CMD-SHELL", "redis-cli ping || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
```

**Verification:**
- GET `/api/v1/bookings/:id` now returns 404 (not found) instead of 500 (Redis error)
- Redis health checks passing in ECS task definition revision 24
- Both containers running successfully in staging environment

**Impact:** Redis-dependent endpoints now work correctly across deployments.

**PR:** #194

---

### OTP verify-otp 500 Error Fix

**Problem:** POST `/api/v1/auth/verify-otp` returned 500 error even with correct OTP.

**Root Cause:** ESM vs CommonJS conflict in `apps/api/src/modules/auth/token.repository.ts`. The file used `require('crypto')` which is a CommonJS construct, but TypeScript's `NodeNext` module resolution treats `.ts` files as ESM modules:

```typescript
// OLD (broken in ESM)
const crypto = require('crypto');
```

**Solution:** Changed to proper ESM import:

```typescript
// NEW (working)
import crypto from 'crypto';
```

**Verification:**
- POST `/api/v1/auth/verify-otp` with correct OTP returns 200 + tokens ✅
- POST `/api/v1/auth/verify-otp` with wrong OTP returns 400 + error message ✅
- Token generation and validation working correctly ✅

**Testing Results:**
```bash
# Correct OTP
curl -X POST .../auth/verify-otp -d '{"phone": "+97336000000", "otp": "123456"}'
# Response: {"success":true,"data":{"accessToken":"eyJ...","refreshToken":"a1b..."}}

# Wrong OTP
curl -X POST .../auth/verify-otp -d '{"phone": "+97336000000", "otp": "999999"}'
# Response: {"success":false,"error":"Invalid OTP. 4 attempt(s) remaining.","attemptsRemaining":4}
```

**Impact:** OTP authentication flow now works end-to-end.

**PR:** #194

---

### CD Workflow Gating Enhancement

**Problem:** Deployment could fail if ACTIVE task definition doesn't exist yet (first deployment scenario).

**Solution:** Added fallback logic in `.github/workflows/cd.yml` to use the latest task definition if ACTIVE not found:

```bash
# Get ACTIVE task definition, fallback to latest if not found
ACTIVE_TASK_DEF=$(aws ecs describe-services ... | jq -r '.services[0].taskDefinition // empty')
if [ -z "$ACTIVE_TASK_DEF" ]; then
  echo "No ACTIVE task definition found, using latest..."
  ACTIVE_TASK_DEF=$(aws ecs list-task-definitions ... | jq -r '.taskDefinitionArns[-1]')
fi
```

**Impact:** More robust deployment process that handles edge cases gracefully.

**PR:** #194

---

### OTP Mock Mode Verification

**Status:** ✅ Confirmed working in staging environment

**Configuration:**
- `OTP_MOCK_ENABLED=true` (staging only)
- `ENVIRONMENT=staging` (safety check)
- Test number: `+97336000000`
- Fixed OTP: `123456`

**Behavior:**
- Test number `+97336000000` receives fixed OTP `123456` ✅
- Non-test numbers receive random OTP (hidden in logs for security) ✅
- Mock mode only enabled when both env vars are set ✅
- Rate limiting working (5 requests per 45 min per phone) ✅

**CloudWatch Logs Evidence:**
```
[STAGING OTP MOCK] phone=+973170****0000 otp=123456
[OTP Delivery Log] {"phone":"+973170****","channel":"mock","status":"delivered"}
```

**Testing Results:**

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/api/v1/auth/request-otp` | POST | 200 | Mock channel indicator |
| `/api/v1/auth/verify-otp` (correct) | POST | 200 | Returns tokens |
| `/api/v1/auth/verify-otp` (wrong) | POST | 400 | Returns error + attempts remaining |

**PRs:** #190, #191, #193 (already merged)

---

## 🎉 Database Migration Complete (2026-01-03)

### The Problem
After deploying infrastructure and fixing CD pipeline, API returned 500 errors on database endpoints:
```
The table `public.products` does not exist in the current database.
```

### The Journey

| Issue | Root Cause | Solution | PR |
|-------|------------|----------|-----|
| **Provider Mismatch** | `schema.prisma` had `mysql`, infrastructure had PostgreSQL | Changed provider to `postgresql` | #120 |
| **Missing Tables** | Migrations never ran, no migration files existed | Created initial schema migration | #121 |
| **prisma CLI Missing** | `pnpm deploy --prod` excludes CLI binaries even from dependencies | Moved prisma to dependencies | #124 |
| **Still Missing** | `--prod` flag excludes ALL CLI tools regardless of dependency type | Removed `--prod` flag from Dockerfile | #125 |
| **Wrong Path** | Prisma binary path changed after removing `--prod` | Updated script to use `./node_modules/.bin/prisma` | #126 |

### Statistics
- **Total Time:** ~5 hours
- **Failed Attempts:** 9 ECS migration tasks
- **PRs Created:** 6 (#120-#126, excluding #122-#123 intermediates)
- **Root Causes Found:** 3 distinct issues
- **Final Status:** ✅ **SUCCESS** — exitCode=0, all migrations applied

### Migration Logs (Final Success)
```
🔄 Running database migrations...
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "nasneh"

1 migration found in prisma/migrations
Applying migration `20260103_initial_schema`

All migrations have been successfully applied.
✅ Migrations completed successfully!
```

### API Verification
```bash
# Health endpoint
curl /health
{"status":"ok","timestamp":"2026-01-03T17:13:53.735Z","version":"v1"}

# Products endpoint (no more 500!)
curl /api/v1/products
{
  "success": true,
  "data": [],
  "pagination": {"page": 1, "limit": 20, "total": 0, ...}
}
```

---

## CD Stabilization Timeline (Postmortem)

**The Problem:** After deploying infrastructure with Terraform, the CD pipeline consistently failed at the Docker build stage.

**The Journey:**

| PR | Date | Goal | Outcome |
|----|------|------|---------|
| #111 | Jan 2 | Initial attempt to fix Dockerfile | ❌ Failed (ENOENT chdir) |
| #112 | Jan 2 | Fix working directory | ❌ Failed (JWT_SECRET) |
| #114 | Jan 2 | Add dummy env vars | ❌ Failed (Prisma client not initialized) |
| #115 | Jan 3 | Fix Prisma named imports (partial) | ❌ Failed (more named imports) |
| #116 | Jan 3 | Fix remaining named imports | ❌ Failed (still more named imports) |
| #117 | Jan 3 | Comprehensive import fix | ❌ Failed (merged, but CI still failed) |
| - | Jan 3 | **Codespaces Testing** | **Root Cause Identified** |
| #118 | Jan 3 | **Complete Solution** | ✅ **Success!** |
| #119 | Jan 3 | Deploy to staging | ✅ **API Live** |

**Root Cause (Verified):** A combination of three core issues:
1. **TypeScript ESM vs. Prisma CJS:** Strict `NodeNext` module resolution required a specific import pattern for Prisma that was not used consistently.
2. **pnpm + Docker Complexity:** `pnpm deploy` creates a pruned production `node_modules` with broken symlinks to the `.pnpm` store, which is not included in the final image.
3. **Prisma Client Location:** Prisma's runtime expects the generated `.prisma` directory to be at the **root** of `node_modules`, not inside `@prisma/client/`.

**The Solution (PR #118):**
- A complete Dockerfile rewrite that correctly handles the pnpm/Prisma/Docker interaction.
- Manually copies the generated Prisma client files from the `.pnpm` store to the correct location in the final production `node_modules`.

---
## ⭐ Current Roadmap

**See:** [SPECS/MASTER_ROADMAP.md](SPECS/MASTER_ROADMAP.md) for the active sprint plan.

| Metric | Value |
|--------|-------|
| **MVP Readiness** | 85% |
| **Current Phase** | Sprint 3 ✅ Complete |
| **Next Sprint** | Sprint 4 (Frontend Foundation) |
| **Target Launch** | Feb 2, 2026 |

---

## Next Steps

### Sprint 3.8: UI Foundation (Jan 6-8) - 🚧 IN PROGRESS

- [ ] [S3.8-01] Design Tokens (3 SP)
- [ ] [S3.8-02] Copy Tokens (4 SP)
- [ ] [S3.8-03] Vazirmatn Fonts (1 SP)
- [ ] [S3.8-04] UI Law Document (2 SP)
- [ ] [S3.8-05] BRAND_VOICE.md (1 SP)
- [ ] [S3.8-06] Component Specs (3 SP)
- [ ] [S3.8-07] CI Lint Rules (3 SP)
- [ ] [S3.8-08] Docs + CODEOWNERS (2 SP)
- [ ] [S3.8-09] Audit & Gap Analysis (2 SP)

## Sprint 3: Core API Completion (Jan 5) — ✅ COMPLETE
- [x] [S3-01] Categories API (2 SP) — PR #167
- [x] [S3-02] Onboarding & Delivery DB Models (2 SP) — PR #168
- [x] [S3-03] Vendor/Provider Application APIs (6 SP) — PR #169
- [x] [S3-04] Admin Application Review APIs (3 SP) — PR #170
- [x] [S3-05] Admin Dashboard Stats API (3 SP) — PR #171
- [x] [S3-06] Driver & Delivery APIs (6 SP) — PR #172

**Total:** 24/24 Story Points (100%)

### Sprint 4: Frontend Foundation & Auth (Jan 12-18)
- [ ] [S4-01] Design System & Shared UI (8 SP)
- [ ] [S4-02] Customer OTP Login (5 SP)
- [ ] [S4-03] Profile & Address Management (5 SP)
- [ ] [S4-04] Dashboard Login & Role Switching (6 SP)

**Full details:** [SPECS/MASTER_ROADMAP.md](SPECS/MASTER_ROADMAP.md)

---

## ✅ DevOps Gate (Sprint 2.5) — Complete 🎉

**Status:** ✅ **COMPLETE**

All infrastructure deployed to staging:
- ✅ VPC, subnets, security groups
- ✅ RDS PostgreSQL database
- ✅ ECS Fargate cluster + service
- ✅ Application Load Balancer
- ✅ ECR repository
- ✅ Secrets Manager
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Database migrations

**Live Endpoints:**
- Health: http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com/health
- API: http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com/api/v1/products

---

## Sprint 2 Summary (Complete)

All 17 tasks completed and merged. Core API structure, authentication, and product management implemented.


---

## 🎉 Sprint 4 Summary (Complete) — 2026-01-08

**Duration:** 3 days (Jan 6-8, 2026)  
**Story Points:** 24/24 (100%)  
**PRs Merged:** 12+ (#199-#210, plus CI fixes)

### Achievements

#### Design System & Shared UI (S4-01) — 8 SP
- Built 12 core components in `@nasneh/ui` package
- All components follow strict UI Laws
- Components: Button, Input, Card, Badge, Skeleton, Dialog, Avatar, SegmentedControl, Tabs, Toast, Select, Table

#### Customer Phone + OTP Login Flow (S4-02) — 5 SP
- Login page with phone input (RTL, Vazirmatn font)
- OTP verification page with 6-digit input
- AuthContext with JWT token management
- Protected routes with automatic redirect

#### Customer Profile & Address Management (S4-03) — 5 SP
- Profile page with user info display
- Address list with CRUD operations
- Add/Edit address form with validation

#### Dashboard Login & Role Switching (S4-04) — 6 SP
- Dashboard login page with phone input
- OTP verification for dashboard users
- Role selection page for multi-role users
- Role-based navigation (ADMIN, VENDOR, PROVIDER, DRIVER)
- RoleGuard component for access control

### UI Law CI Enforcement

| Check | Rule | Status |
|-------|------|--------|
| Hex Colors | No #FFFFFF, #000 | ✅ |
| Tailwind Colors | No bg-white, text-black | ✅ |
| Inline Styles | No style={{...}} | ✅ |
| Border Classes | No border-* | ✅ |
| Border Radius | Only rounded-xl, rounded-full | ✅ |
| Forbidden Terms | No زبون، بائع in UI | ✅ |
| Hardcoded Arabic | Must use copy tokens | ✅ |
| Font Family | Only Vazirmatn | ✅ |
| External UI Libs | No @mui, antd | ✅ |
| className Prop | No className on @nasneh/ui | ✅ |

### Statistics

| Metric | Value |
|--------|-------|
| **Total Lines Added** | ~3,500 |
| **New Components** | 12 |
| **New Pages** | 10 |
| **PRs Merged** | 12+ |
| **Story Points** | 24 |
| **MVP Progress** | 85% → 95% |

### Next: Sprint 5

**Focus:** Frontend Core Features  
**Story Points:** 24  
**Goal:** Product browsing, cart, checkout, booking flow

---

## 🎉 Sprint 3 Summary (Complete) — 2026-01-05

**Duration:** 1 day (Jan 5, 2026)  
**Story Points:** 24/24 (100%)  
**PRs Merged:** 6 (#167-#172)

### Achievements

#### New Database Models (4)
- `VendorApplication` - Vendor onboarding applications
- `ProviderApplication` - Service provider onboarding applications
- `Driver` - Driver profiles with vehicle information
- `DeliveryAssignment` - Order-to-driver delivery tracking

#### New API Modules (4)
| Module | Files | Lines | Purpose |
|--------|-------|-------|---------|
| `categories` | 4 | 180 | Category management |
| `applications` | 7 | 658 | Vendor/Provider onboarding |
| `admin` | 4 | 232 | Platform statistics |
| `drivers` | 5 | 924 | Driver & delivery management |

#### New Endpoints (15)

**Categories (1)**
- `GET /api/v1/categories` - List categories (tree/flat, filter by type)

**Applications (4)**
- `POST /api/v1/vendor-applications` - Submit vendor application
- `GET /api/v1/vendor-applications/me` - Check vendor application status
- `POST /api/v1/provider-applications` - Submit provider application
- `GET /api/v1/provider-applications/me` - Check provider application status

**Admin - Applications (4)**
- `GET /api/v1/admin/vendor-applications` - List all vendor applications
- `PATCH /api/v1/admin/vendor-applications/:id` - Approve/reject vendor
- `GET /api/v1/admin/provider-applications` - List all provider applications
- `PATCH /api/v1/admin/provider-applications/:id` - Approve/reject provider

**Admin - Platform (1)**
- `GET /api/v1/admin/stats` - Platform statistics dashboard

**Admin - Drivers (2)**
- `POST /api/v1/admin/drivers` - Create driver profile
- `GET /api/v1/admin/drivers` - List all drivers

**Admin - Deliveries (1)**
- `POST /api/v1/admin/deliveries` - Assign delivery to driver

**Driver Operations (2)**
- `GET /api/v1/driver/deliveries` - Get my assigned deliveries
- `PATCH /api/v1/driver/deliveries/:id` - Update delivery status

### Technical Highlights

- ✅ **Transaction Safety:** All role-changing operations use Prisma transactions
- ✅ **Role-based Access:** Admin, Driver, and authenticated user endpoints
- ✅ **Auto-timestamps:** Delivery pickup/delivery times set automatically
- ✅ **Validation:** Zod schemas for all inputs
- ✅ **Error Handling:** Consistent 400/404/409/403 responses
- ✅ **TypeScript:** 100% type-safe, 0 compilation errors

### Statistics

| Metric | Value |
|--------|-------|
| **Total Lines Added** | ~2,000 |
| **New Database Models** | 4 |
| **New API Modules** | 4 |
| **New Endpoints** | 15 |
| **PRs Merged** | 6 |
| **Story Points** | 24 |
| **Duration** | 1 day |
| **MVP Progress** | 65% → 85% |

### Next: Sprint 4

**Focus:** Frontend Foundation & Authentication  
**Start Date:** Jan 12, 2026  
**Story Points:** 24  
**Goal:** Customer web app with login + Admin dashboard foundation

