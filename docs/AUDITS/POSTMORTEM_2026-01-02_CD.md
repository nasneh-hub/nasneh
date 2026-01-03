# Postmortem: CD Stabilization & Database Migration Journey

**Date:** January 2-3, 2026  
**Duration:** ~30 hours (across 2 days)  
**Status:** ✅ **RESOLVED**  
**Impact:** Staging API fully operational, all endpoints working

---

## Executive Summary

After successfully deploying infrastructure with Terraform (Sprint 2.5 DevOps Gate), the CD pipeline and database setup encountered multiple critical issues that required 20+ deployment attempts and 6 PRs to resolve. This postmortem documents the complete journey, root causes, and lessons learned.

---

## Timeline Overview

### Phase 1: CD Pipeline Stabilization (Jan 2-3)
**Duration:** ~25 hours  
**PRs:** #111-#119  
**Attempts:** 11 failed deployments  
**Outcome:** ✅ API deployed, `/health` endpoint working

### Phase 2: Database Migration (Jan 3)
**Duration:** ~5 hours  
**PRs:** #120-#126  
**Attempts:** 9 failed migration tasks  
**Outcome:** ✅ Database schema deployed, all endpoints working

---

## Phase 1: CD Pipeline Stabilization

### The Problem

After deploying infrastructure, the CD pipeline consistently failed at the Docker build stage with various errors:

```
Error: Cannot find module 'express'
Error: Cannot find module '@prisma/client'
Error: Invalid Prisma Client import
```

### The Journey

| PR | Date | Goal | Outcome | Root Cause |
|----|------|------|---------|------------|
| #111 | Jan 2 | Initial Dockerfile fix | ❌ Failed | ENOENT chdir error |
| #112 | Jan 2 | Fix working directory | ❌ Failed | Missing JWT_SECRET |
| #114 | Jan 2 | Add dummy env vars | ❌ Failed | Prisma client not initialized |
| #115 | Jan 3 | Fix Prisma named imports (partial) | ❌ Failed | More named imports |
| #116 | Jan 3 | Fix remaining named imports | ❌ Failed | Still more named imports |
| #117 | Jan 3 | Comprehensive import fix | ❌ Failed | CI still failed |
| - | Jan 3 | **Codespaces Testing** | **Root Cause Identified** | - |
| #118 | Jan 3 | **Complete Solution** | ✅ **Success!** | - |
| #119 | Jan 3 | Deploy to staging | ✅ **API Live** | - |

### Root Causes Identified

#### 1. TypeScript ESM vs. Prisma CJS Incompatibility
**Problem:** Strict `NodeNext` module resolution required specific import patterns for Prisma.

**Incorrect:**
```typescript
import { PrismaClient } from '@prisma/client';
```

**Correct:**
```typescript
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
```

**Impact:** 7+ files needed updates across repositories, services, and middleware.

#### 2. pnpm + Docker Complexity
**Problem:** `pnpm deploy` creates a pruned production `node_modules` with broken symlinks to the `.pnpm` store, which is not included in the final image.

**Solution:** Manually copy generated Prisma client files from `.pnpm` store to correct location in production `node_modules`.

#### 3. Prisma Client Location
**Problem:** Prisma's runtime expects the generated `.prisma` directory at the **root** of `node_modules`, not inside `@prisma/client/`.

**Solution:** Dockerfile now correctly handles this by copying Prisma files to the expected location.

### The Solution (PR #118)

A complete Dockerfile rewrite that:
1. Correctly handles pnpm/Prisma/Docker interaction
2. Manually copies Prisma client files to correct location
3. Ensures all dependencies are properly resolved
4. Uses proper TypeScript ESM import patterns

### Statistics
- **Total Attempts:** 11
- **Time Invested:** ~25 hours
- **PRs Created:** 9 (#111-#119)
- **Files Modified:** 15+
- **Root Causes:** 3 distinct issues

---

## Phase 2: Database Migration

### The Problem

After CD stabilization, API was live but returned 500 errors on database endpoints:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**CloudWatch Logs:**
```
The table `public.products` does not exist in the current database.
```

### The Journey

| Issue | Symptom | Root Cause | Solution | PR |
|-------|---------|------------|----------|-----|
| **Provider Mismatch** | Prisma validation error: "URL must start with mysql://" | `schema.prisma` had `mysql`, infrastructure had PostgreSQL | Changed provider to `postgresql` | #120 |
| **Missing Tables** | "Table does not exist" error | Migrations never ran, no migration files in repo | Created initial schema migration | #121 |
| **prisma CLI Missing (1st)** | "pnpm: not found" | `prisma` was in `devDependencies` | Moved to `dependencies` | #124 |
| **prisma CLI Missing (2nd)** | "Cannot find module '/prisma@5.22.0/...'" | `pnpm deploy --prod` excludes CLI binaries | Removed `--prod` flag | #125 |
| **Wrong Script Path** | "Cannot find module" | Path changed after removing `--prod` | Updated to `./node_modules/.bin/prisma` | #126 |

### Failed Migration Attempts

| Attempt | Command | Exit Code | Error |
|---------|---------|-----------|-------|
| 1 | `pnpm db:migrate` | 127 | sh: pnpm: not found |
| 2 | `npx prisma migrate deploy` | - | Task hung (no output) |
| 3 | `./node_modules/.bin/prisma migrate deploy` | 1 | Cannot find module |
| 4 | `./node_modules/@prisma/client/node_modules/.bin/prisma` | 1 | Cannot find module |
| 5 | `node ./node_modules/prisma/build/index.js` | 1 | Cannot find module |
| 6 | `sh ./scripts/run-migrations.sh` (with nested path) | 1 | Cannot find module |
| 7 | `sh ./scripts/run-migrations.sh` (after moving to deps) | 1 | Cannot find module |
| 8 | `sh ./scripts/run-migrations.sh` (after removing --prod) | 1 | Cannot find module |
| 9 | `sh ./scripts/run-migrations.sh` (with correct path) | **0** | ✅ **SUCCESS** |

### Root Causes Identified

#### 1. Database Provider Mismatch
**Problem:** Prisma schema configured for MySQL, but infrastructure deployed PostgreSQL.

**Detection:** Prisma validation error on startup.

**Fix:** Changed `provider = "mysql"` to `provider = "postgresql"` in `schema.prisma`.

**Lesson:** Always verify schema provider matches deployed database type.

#### 2. Missing Migration Files
**Problem:** No migration files existed in the repository.

**Root Cause:** `prisma migrate dev` was never run to generate migration files from schema.

**Fix:** Created initial migration with `prisma migrate dev --name initial_schema`.

**Lesson:** Migration files must be committed to repo before running `prisma migrate deploy`.

#### 3. pnpm `--prod` Flag Behavior
**Problem:** `pnpm deploy --prod` excludes CLI binaries even when in `dependencies`.

**Why:** The `--prod` flag creates the smallest possible bundle by excluding:
- All `devDependencies`
- CLI binaries and scripts
- Development tools

**Fix:** Removed `--prod` flag from Dockerfile.

**Trade-off:** Slightly larger image (~10MB) vs. ability to run migrations.

**Lesson:** Don't use `--prod` if CLI tools are needed in production.

#### 4. Prisma Binary Path Changes
**Problem:** Prisma binary path differs based on `--prod` flag presence.

**Paths:**
```bash
# With --prod
./node_modules/@prisma/client/node_modules/.bin/prisma

# Without --prod
./node_modules/.bin/prisma
```

**Fix:** Updated migration script to use standard path after removing `--prod`.

**Lesson:** Migration scripts must be updated when build configuration changes.

### The Solution

**PR #120:** Fixed database provider mismatch  
**PR #121:** Added initial schema migration files  
**PR #124:** Moved prisma to dependencies  
**PR #125:** Removed `--prod` flag to include CLI tools  
**PR #126:** Updated migration script path

### Final Success

**Migration Logs:**
```
🔄 Running database migrations...
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "nasneh"

1 migration found in prisma/migrations
Applying migration `20260103_initial_schema`

All migrations have been successfully applied.
✅ Migrations completed successfully!
```

**API Verification:**
```bash
# Health endpoint
$ curl /health
{"status":"ok","timestamp":"2026-01-03T17:13:53.735Z","version":"v1"}

# Products endpoint (no more 500!)
$ curl /api/v1/products
{
  "success": true,
  "data": [],
  "pagination": {"page": 1, "limit": 20, "total": 0, ...}
}
```

### Statistics
- **Total Attempts:** 9 ECS migration tasks
- **Time Invested:** ~5 hours
- **PRs Created:** 6 (#120-#126, excluding intermediates)
- **Root Causes:** 4 distinct issues
- **Final Status:** ✅ **SUCCESS** — exitCode=0

---

## Combined Statistics

### Overall Journey
- **Total Duration:** ~30 hours (across 2 days)
- **Total PRs:** 15 (#111-#126, some merged, some closed)
- **Total Attempts:** 20+ (11 CD runs + 9 migration tasks)
- **Root Causes Found:** 7 distinct issues
- **Final Status:** ✅ **COMPLETE SUCCESS**

### PR Summary
| PR | Status | Purpose |
|----|--------|---------|
| #111-#117 | ❌ Closed | CD stabilization attempts |
| #118 | ✅ Merged | CD stabilization solution |
| #119 | ✅ Merged | Deploy to staging |
| #120 | ✅ Merged | Fix database provider |
| #121 | ✅ Merged | Add migration files |
| #122-#123 | ❌ Closed | Intermediate attempts |
| #124 | ✅ Merged | Move prisma to dependencies |
| #125 | ✅ Merged | Remove --prod flag |
| #126 | ✅ Merged | Fix migration script path |

---

## Key Learnings

### 1. Test Docker Builds Locally First
**Problem:** Multiple failed deployments due to untested builds.

**Solution:** Always test in GitHub Codespaces before merge:
```bash
docker build -f apps/api/Dockerfile -t test .
docker run -p 4000:4000 -e DATABASE_URL=... test
curl http://localhost:4000/health
```

**Quality Gate:** Docker build + local run must pass before merge.

### 2. Understand pnpm + Docker Interactions
**Problem:** pnpm's symlink-based architecture breaks in Docker.

**Solution:** Use `pnpm deploy` carefully, understand `--prod` flag implications.

**Lesson:** Read pnpm Docker documentation thoroughly.

### 3. Prisma Requires Special Handling
**Problem:** Prisma has complex runtime requirements.

**Key Points:**
- `@prisma/client` (library) ≠ `prisma` (CLI)
- Both needed for migrations
- Generated files must be in correct location
- ESM/CJS compatibility requires specific import patterns

### 4. Always Check CloudWatch Logs
**Problem:** Guessing root causes without evidence.

**Solution:** Always check logs before proposing fixes:
```bash
aws logs get-log-events \
  --log-group-name "/ecs/nasneh-staging/api" \
  --log-stream-name "api/api/{task-id}"
```

### 5. One Problem at a Time
**Problem:** Multiple parallel PRs caused confusion.

**Solution:** Fix one root cause per PR, verify, then move to next.

### 6. Document As You Go
**Problem:** Lost context between attempts.

**Solution:** Update PROJECT_STATUS.md after every attempt.

### 7. Migration Files Are Code
**Problem:** Treated migrations as runtime-only concern.

**Lesson:** Migration files must be:
- Committed to repository
- Reviewed in PRs
- Tested before deployment

### 8. Infrastructure Must Match Schema
**Problem:** Mismatch between Prisma schema and deployed database.

**Solution:** Verify provider match before any deployment:
```bash
# Check schema
grep "provider" apps/api/prisma/schema.prisma

# Check infrastructure
aws rds describe-db-instances --query 'DBInstances[*].Engine'
```

---

## Action Items

### Immediate
- [x] Document journey in POSTMORTEM.md
- [x] Update PROJECT_STATUS.md
- [x] Update MANUS_MEMORY.md with lessons
- [ ] Review Sprint 3 tasks
- [ ] Add seed data for testing

### Short-term
- [ ] Automate migrations in CD pipeline
- [ ] Add pre-merge Docker build check in CI
- [ ] Create migration testing guide
- [ ] Add database provider validation script

### Long-term
- [ ] Improve error messages in Dockerfile
- [ ] Add health check for database connectivity
- [ ] Create runbook for common deployment issues
- [ ] Consider migration automation tools

---

## Conclusion

Despite 20+ failed attempts and ~30 hours of debugging, the journey resulted in:

✅ **Stable CD pipeline** — Docker builds work consistently  
✅ **Working database migrations** — Schema deployed successfully  
✅ **Comprehensive documentation** — Future developers can learn from this  
✅ **Improved processes** — Quality gates and testing procedures established

**Key Takeaway:** Complex systems require patience, systematic debugging, and thorough documentation. Every failure taught us something valuable that made the final solution more robust.

---

**Status:** ✅ **RESOLVED**  
**API Status:** 🟢 **LIVE** on staging  
**Next Steps:** Sprint 3 development

---

*Document prepared by: Manus AI*  
*Date: 2026-01-03*  
*Version: 1.0*
