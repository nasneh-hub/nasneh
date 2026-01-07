# Lessons Learned

> Document mistakes and how to avoid them in the future.

---

## CD Workflow Container Preservation (2026-01-07)

### Problem
After deploying infrastructure with Redis sidecar, the CD workflow was overwriting the Redis container with the API image during deployments, causing 500 errors on Redis-dependent endpoints like `/api/v1/bookings/:id`.

### Root Cause
The task definition update logic in `.github/workflows/cd.yml` was only specifying the API container in the `containers` array. AWS ECS interprets this as "replace ALL containers with this list", effectively removing the Redis sidecar from the task definition.

### Solution
Updated the workflow to explicitly include both containers in the task definition update:
```yaml
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

### Prevention
When updating ECS task definitions with multiple containers:
1. Always specify ALL containers in the update, not just the ones being changed
2. Test deployment workflow after infrastructure changes that add/modify containers
3. Verify all containers are running after deployment: `aws ecs describe-tasks`
4. Check container logs for both containers: `aws logs tail /ecs/{service}/{container}`
5. Monitor ECS task health checks to catch missing containers early

**Reference:** PR #194

---

## ESM vs CommonJS in TypeScript NodeNext (2026-01-07)

### Problem
POST `/api/v1/auth/verify-otp` returned 500 error with message "Cannot use require() in ESM module" even though the code compiled successfully.

### Root Cause
The file `apps/api/src/modules/auth/token.repository.ts` used `require('crypto')` which is a CommonJS construct. TypeScript's `NodeNext` module resolution treats `.ts` files as ESM modules by default, and `require()` is not available in ESM.

### Solution
Changed to proper ESM import:
```typescript
// Before (broken)
const crypto = require('crypto');

// After (working)
import crypto from 'crypto';
```

### Prevention
When using TypeScript with `"module": "NodeNext"` or `"moduleResolution": "NodeNext"`:
1. Always use `import` statements, never `require()`
2. Use `import type` for type-only imports to avoid runtime overhead
3. For CommonJS modules, use: `import pkg from 'package'; const { fn } = pkg;`
4. Enable `esModuleInterop: true` in `tsconfig.json` for better compatibility
5. Test all endpoints after TypeScript configuration changes
6. Watch for "Cannot use require()" errors in CloudWatch logs

**Reference:** PR #194, POSTMORTEM_2026-01-02_CD.md

---

## ECS Task Definition Gating (2026-01-07)

### Problem
CD workflow could fail if ACTIVE task definition doesn't exist yet (first deployment scenario or after service recreation).

### Root Cause
The workflow assumed an ACTIVE task definition always exists by querying the running service's task definition. However, on first deployment or after service recreation, there may be no running tasks yet, causing the query to return empty.

### Solution
Added fallback logic to use the latest task definition if ACTIVE not found:
```bash
ACTIVE_TASK_DEF=$(aws ecs describe-services ... | jq -r '.services[0].taskDefinition // empty')
if [ -z "$ACTIVE_TASK_DEF" ]; then
  echo "No ACTIVE task definition found, using latest..."
  ACTIVE_TASK_DEF=$(aws ecs list-task-definitions ... | jq -r '.taskDefinitionArns[-1]')
fi
```

### Prevention
When writing deployment scripts that reference running resources:
1. Always handle the case where the resource doesn't exist yet
2. Provide sensible fallbacks (e.g., latest version, default configuration)
3. Log which fallback was used for debugging and audit purposes
4. Test deployment on a clean environment with no existing resources
5. Consider idempotent deployment patterns that work regardless of current state

**Reference:** PR #194

---

## pnpm deploy --prod Behavior (2026-01-03)

### Problem
Migration tasks failed because the `prisma` CLI binary was not found in the production container, even though `prisma` was listed in `dependencies` (not `devDependencies`).

### Root Cause
The `pnpm deploy --prod` flag creates the smallest possible production bundle by excluding CLI binaries and scripts, even when they are in `dependencies`. This is by design to reduce image size, but it breaks tools that need CLI access in production.

### Solution
Removed the `--prod` flag from the Dockerfile's `pnpm deploy` command. This includes CLI binaries in the production bundle at the cost of a slightly larger image (~10MB).

### Prevention
When CLI tools are needed in production (like `prisma` for migrations), do not use the `--prod` flag with `pnpm deploy`. Document this trade-off in the Dockerfile comments.

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md, PR #125

---

## Database Provider Mismatch (2026-01-03)

### Problem
Prisma validation failed with error "URL must start with mysql://" even though the infrastructure deployed PostgreSQL.

### Root Cause
The `schema.prisma` file was created with `provider = "mysql"` but the Terraform infrastructure deployed PostgreSQL. This mismatch was never caught during development because local testing used a different setup.

### Solution
Changed `provider = "mysql"` to `provider = "postgresql"` in `schema.prisma` and regenerated the Prisma client.

### Prevention
Before any deployment, always verify that the Prisma schema provider matches the deployed database type:
```bash
grep "provider" apps/api/prisma/schema.prisma
aws rds describe-db-instances --query 'DBInstances[*].Engine'
```

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md, PR #120

---

## Migration Files Must Exist (2026-01-03)

### Problem
`prisma migrate deploy` failed because no migration files existed in the repository, even though `schema.prisma` was complete.

### Root Cause
The Prisma schema was created and modified, but `prisma migrate dev` was never run locally to generate the migration SQL files. The `prisma migrate deploy` command only applies existing migrations; it does not create them.

### Solution
Ran `prisma migrate dev --name initial_schema` locally to generate migration files, then committed them to the repository.

### Prevention
After creating or modifying `schema.prisma`, always run `prisma migrate dev --name description` locally and commit the generated files in `prisma/migrations/` before deploying.

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md, PR #121

---

## Prisma Binary Path Changes (2026-01-03)

### Problem
Migration script failed with "Cannot find module" after removing the `--prod` flag from Dockerfile.

### Root Cause
The Prisma binary path differs based on build configuration. With `--prod`, it's nested inside `@prisma/client/node_modules/.bin/prisma`. Without `--prod`, it's at the standard `./node_modules/.bin/prisma` location.

### Solution
Updated the migration script to use the standard path `./node_modules/.bin/prisma` after removing the `--prod` flag.

### Prevention
When changing Dockerfile build configuration, always verify and update any scripts that reference binary paths.

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md, PR #126

---

## CD Pipeline Issues (2026-01-02)

### Problem
CD pipeline failed repeatedly due to multiple issues over 11 deployment attempts.

### Root Causes
1. pnpm symlinks not compatible with Docker COPY
2. Prisma client ESM/CJS mismatch
3. Database was set to MySQL but infrastructure uses PostgreSQL
4. `pnpm deploy --prod` excludes CLI binaries needed for migrations

### Solutions
1. Manual copy of .prisma to node_modules after pnpm deploy
2. Explicit Prisma generate in Dockerfile
3. Changed schema.prisma to postgresql
4. Removed --prod flag for migration container

### Prevention
Always verify database provider matches infrastructure. Test Docker builds locally before pushing. Check pnpm deploy output for missing files.

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md

---

## Manus Memory Loss (2026-01-03)

### Problem
Manus recommended tasks that were already completed (Auth, OTP, etc).

### Root Cause
No persistent memory between sessions. Manus starts fresh each time.

### Solution
Created AI Governance System with structured /docs folder, PROJECT_TIMELINE.md for history, session start/end protocols, and required reading before each session.

### Prevention
Always read MEMORY files at session start. Always update MEMORY files at session end. Never skip the session protocol.

**Reference:** AUDITS/AUDIT_2026-01-03_DOCS.md

---

## Sprint 3: API Development Velocity (2026-01-05)

### What Worked Well

**1. Clear Task Breakdown**
- 6 tasks with clear acceptance criteria
- Each task had specific deliverables
- Dependencies were well-defined (S3-02 → S3-03, S3-06)

**2. Consistent Patterns**
- Repository → Service → Controller → Routes pattern
- Zod validation for all inputs
- Transaction safety for role-changing operations
- Error handling with custom error classes

**3. Rapid Iteration**
- All 6 tasks completed in 1 day
- 24 story points delivered
- 2,000+ lines of code added
- 15 new endpoints implemented

### Lessons Learned

**1. Prisma Client Generation**
- After schema changes, must run `prisma generate` before TypeScript compilation
- **Action:** Add to PR checklist for any schema changes

**2. Staging Deployment Lag**
- New endpoints show 404 until CD pipeline completes
- **Action:** Wait for CD before testing staging endpoints

**3. Transaction Patterns**
- Role-changing operations (vendor/provider/driver creation) require transactions
- Pattern: Update application → Create entity → Update user role
- **Action:** Document transaction patterns in TECHNICAL_SPEC.md

**4. Module Organization**
- Consistent file structure makes development faster
- `repository.ts`, `service.ts`, `controller.ts`, `routes.ts`, `index.ts`
- **Action:** Use this pattern for all future modules

### Metrics

| Metric | Value |
|--------|-------|
| **Duration** | 1 day |
| **Story Points** | 24 |
| **PRs Merged** | 6 |
| **Lines Added** | ~2,000 |
| **New Endpoints** | 15 |
| **New Models** | 4 |
| **New Modules** | 4 |
| **Velocity** | 24 SP/day |

### Recommendations for Sprint 4

1. **Frontend Setup:** Use similar module structure for Next.js apps
2. **Design System:** Create shared components before app-specific features
3. **Testing:** Add integration tests for new endpoints
4. **Documentation:** Update API docs with examples
5. **Deployment:** Monitor CD pipeline for schema migrations

**Reference:** Sprint 3 PRs #167-#172, SPECS/MASTER_ROADMAP.md

---

## Template for New Entries

```
## [Title] (YYYY-MM-DD)

### Problem
[What went wrong]

### Root Cause
[Why it happened]

### Solution
[How it was fixed]

### Prevention
[How to avoid in future]

**Reference:** [Link to related docs]
```


---

## Git Branch Conflicts (2026-01-05)

### Problem
PR #174 had merge conflicts because it was created from an outdated branch.

### Root Cause
Created new PR without pulling latest changes from main after PR #173 was merged.

### Prevention
Before creating any new PR:
```bash
git checkout main
git pull origin main
git checkout -b new-branch
```

---

## Smoke Test Path Accuracy (2026-01-05)

### Problem
Smoke tests returned 404 for endpoints that actually exist.

### Root Cause
Tested wrong paths:
- ❌ `/api/v1/admin/applications/vendors`
- ✅ `/api/v1/admin/vendor-applications`

### Prevention
Always verify endpoint paths from route files before testing. Keep an official "Route Map" document updated.
