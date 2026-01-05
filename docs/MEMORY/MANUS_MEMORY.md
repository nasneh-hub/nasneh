# Manus Memory — Nasneh Project

**Purpose:** Persistent context for AI agents working on this project.  
**Edit only when:** Decisions change or new principles are established.

---

## Project Principles

1. **MVP-first** — Ship minimal viable features before enhancements
2. **No assumptions** — If not in repo/docs, ask or mark as unknown
3. **PR-only deliverables** — All code/docs changes via Pull Request
4. **Concise & actionable** — Avoid verbose outputs; respect line limits
5. **No feature creep** — Stick to defined scope unless explicitly approved

---

## Key Technical Decisions

| Decision | Choice | Source |
|----------|--------|--------|
| Database | PostgreSQL + Prisma ORM | SPECS/TECHNICAL_SPEC.md |
| Authentication | Phone + OTP (WhatsApp → SMS fallback), JWT | SPECS/PRD_MASTER.md |
| Payments | Amazon Payment Services (APS) | SPECS/PRD_MASTER.md |
| Infrastructure | AWS Bahrain (me-south-1) | SPECS/TECHNICAL_SPEC.md |
| Frontend | Next.js 14+, TypeScript, Tailwind, Shadcn UI | SPECS/TECHNICAL_SPEC.md |
| UI Components | Shared package `@nasneh/ui` only | SPECS/DESIGN_SYSTEM.md |
| Design | No borders, 12px radius, Vazirmatn font, mono colors | SPECS/DESIGN_SYSTEM.md |

---

## Key Documents

| Document | Purpose | Priority |
|----------|---------|----------|
| **Master Roadmap** | Sprint plan & timeline to MVP | **Check FIRST** |
| PRD | Product requirements | Reference |
| Technical Spec | Architecture & APIs | Reference |
| Design System | UI/UX guidelines | Reference |

**Path:** `docs/SPECS/MASTER_ROADMAP.md` — Check this FIRST for sprint tasks.

---

## Files to Read First (Every Task)

1. `/docs/00_START_HERE.md` — Quick facts and rules
2. `/docs/SPECS/MASTER_ROADMAP.md` — **Current sprint tasks (START HERE)**
3. `/docs/SPECS/PRD_MASTER.md` — What to build (MVP scope)
4. `/docs/SPECS/TECHNICAL_SPEC.md` — How to build (architecture)
5. `/docs/SPECS/DESIGN_SYSTEM.md` — How it looks (UI rules)
6. `/docs/GOVERNANCE/AI_OPERATING_RULES.md` — Rules for AI agents
7. `/docs/MEMORY/PROJECT_TIMELINE.md` — Project history (read last 10 entries)

---

## User Preferences

- Keep outputs **concise** and **actionable**
- Respect **line limits** when specified
- **No feature creep** — do not add unrequested features
- Commit to GitHub via **PR with clear commits**
- Update docs when relevant changes are made


---

## PR Quality Gate

A PR is **NOT "Ready for Review"** unless:

1. **Mergeable** ✅ — No conflicts with base branch
2. **CI Green** ✅ — All GitHub Actions checks pass

**Rule:** Fix/re-run until both conditions are met BEFORE reporting PR as ready.


---

## Post-Merge Verification

After merging any PR to main:

1. **Check CI** — Verify GitHub Actions → CI workflow passes on main
2. **Check CD** — Verify GitHub Actions → CD workflow passes on main (if triggered)
3. **Report status** — Confirm both are green before marking task complete

---

## Secrets Policy

**No secrets in repo / tfvars / plaintext Terraform state.**

| Rule | Description |
|------|-------------|
| Storage | All secrets live in **AWS Secrets Manager** |
| Naming | `nasneh/{env}/api`, `nasneh/{env}/database`, `nasneh/{env}/external` |
| ECS Access | Secrets injected via ARN references in task definition |
| Terraform | Initial placeholders only; real values set via AWS CLI/Console |
| GitHub | Only AWS credentials (IAM) in GitHub Secrets; no app secrets |

### Secret Categories

| Secret | Contents |
|--------|----------|
| `nasneh/{env}/api` | JWT_SECRET, JWT_REFRESH_SECRET, OTP_SECRET, REDIS_URL |
| `nasneh/{env}/database` | DB_USERNAME, DB_PASSWORD, DATABASE_URL |
| `nasneh/{env}/external` | WHATSAPP_API_URL, WHATSAPP_API_TOKEN, SMS_API_URL, SMS_API_KEY |

---

## Deploy Policy

| Rule | Description |
|------|-------------|
| Auto-deploy | **Disabled by default** |
| Manual deploy | Via `workflow_dispatch` only |
| Approval | Explicit approval required before enabling auto-deploy |

**Rationale:** Staging infrastructure is not yet fully provisioned. Auto-deploy could fail or cause issues until all modules are deployed and secrets are configured.


---

## Deployment Incident Timeline — Jan 2026

### Chronological Events

| Timestamp (UTC+3) | Event | Evidence |
|-------------------|-------|----------|
| 2026-01-02 ~10:00 | First CD deploy attempt fails | Run 20658102400 |
| 2026-01-02 ~10:30 | PR #83: Fix ECS service name | [PR #83](https://github.com/nasneh-hub/nasneh/pull/83) |
| 2026-01-02 ~11:00 | PR #84: Add curl for health checks | [PR #84](https://github.com/nasneh-hub/nasneh/pull/84) |
| 2026-01-02 ~11:30 | PR #86: Update task definition with new image | [PR #86](https://github.com/nasneh-hub/nasneh/pull/86) |
| 2026-01-02 ~12:00 | Container crashes: `Cannot find module 'express'` | CloudWatch logs |
| 2026-01-02 12:00-18:00 | PRs #88-#100: Various Dockerfile fixes | All failed |
| 2026-01-02 18:30 | Memory Freeze initiated | User request |
| 2026-01-02 18:45 | Evidence Inventory compiled | This document |

### Decisions Made

1. **deploy=false verification rule** — Always run CD with deploy=false first to verify image builds
2. **Memory freeze protocol** — After 3+ failed attempts, stop PRs and document
3. **One PR at a time** — No parallel experiments
4. **Log-first rule** — Check CloudWatch/GHA logs before proposing fixes

### Active Constraints

- **STOP PRs** — No new PRs until fix plan approved
- **Log-first** — Must provide log evidence before any theory
- **Single-PR policy** — One focused fix per PR
- **Update PROJECT_STATUS** — After every deployment run

---

## CD & Database Stabilization Lessons (Jan 2026)

### Problems We Faced & Solutions

| Problem | Root Cause | Solution | PR |
|---------|------------|----------|-----|
| **Provider mismatch** | `schema.prisma` had `mysql`, infrastructure had PostgreSQL | Changed provider to `postgresql` | #120 |
| **Missing tables** | Migrations never ran, no migration files existed | Created initial schema migration | #121 |
| **prisma CLI missing (1st attempt)** | `prisma` was in `devDependencies` | Moved to `dependencies` | #124 |
| **prisma CLI still missing** | `pnpm deploy --prod` excludes CLI binaries even from `dependencies` | Removed `--prod` flag from Dockerfile | #125 |
| **Wrong script path** | Prisma binary path changed after removing `--prod` flag | Updated to `./node_modules/.bin/prisma` | #126 |

### Key Learnings

#### 1. pnpm `--prod` Flag Behavior
**Problem:** `pnpm deploy --prod` excludes CLI binaries even when they are in `dependencies` (not `devDependencies`).

**Why:** The `--prod` flag is designed to create the smallest possible production bundle by excluding:
- All `devDependencies`
- CLI binaries and scripts
- Development tools

**Solution:** Remove `--prod` flag when CLI tools (like `prisma`) are needed in production for migrations.

**Trade-off:** Slightly larger image size (~10MB) vs. ability to run migrations.

#### 2. Prisma Schema Provider Must Match Infrastructure
**Problem:** `schema.prisma` had `provider = "mysql"` but Terraform deployed PostgreSQL.

**Root Cause:** Initial schema was created with MySQL provider, but infrastructure decision was PostgreSQL.

**Lesson:** Always verify `schema.prisma` provider matches deployed database type **before** running migrations.

**Validation Command:**
```bash
# Check schema provider
grep "provider" apps/api/prisma/schema.prisma

# Check RDS engine
aws rds describe-db-instances --query 'DBInstances[*].Engine'
```

#### 3. Prisma Client vs. Prisma CLI
**Problem:** `@prisma/client` (library) ≠ `prisma` (CLI tool).

**Key Distinction:**
- `@prisma/client`: Runtime library for database queries (always needed)
- `prisma`: CLI tool for migrations, schema management (only needed for migrations)

**Lesson:** Both packages are required in production if migrations run in production containers.

#### 4. Migration Script Path Depends on Build Configuration
**Problem:** Prisma binary path changed after removing `--prod` flag.

**Paths:**
```bash
# With --prod flag (nested in @prisma/client)
./node_modules/@prisma/client/node_modules/.bin/prisma

# Without --prod flag (standard location)
./node_modules/.bin/prisma
```

**Lesson:** Migration scripts must be updated when Dockerfile build configuration changes.

#### 5. Always Test Docker Builds in Codespaces
**Problem:** Multiple failed deployments due to untested Docker builds.

**Lesson:** Before merging Dockerfile changes:
1. Open GitHub Codespaces on the PR branch
2. Run `docker build -f apps/api/Dockerfile -t test .`
3. Run `docker run -p 4000:4000 -e DATABASE_URL=... test`
4. Test `/health` and one DB endpoint

**Quality Gate:** Docker build + local run must pass before merge.

#### 6. Migration Files Must Exist Before Running Migrations
**Problem:** `prisma migrate deploy` failed because no migration files existed in the repo.

**Root Cause:** Prisma schema was created but `prisma migrate dev` was never run to generate migration files.

**Lesson:** After creating/modifying `schema.prisma`:
1. Run `prisma migrate dev --name description` locally
2. Commit generated files in `prisma/migrations/`
3. Deploy with `prisma migrate deploy` in production

**Migration Files Structure:**
```
apps/api/prisma/
├── schema.prisma
├── migrations/
│   ├── migration_lock.toml
│   └── 20260103_initial_schema/
│       └── migration.sql
```

#### 7. ECS Task Run-Task for One-Time Operations
**Pattern:** Use `aws ecs run-task` with command overrides for one-time operations like migrations.

**Example:**
```bash
aws ecs run-task \
  --cluster nasneh-staging-cluster \
  --task-definition nasneh-staging-api:11 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={...}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["sh","./scripts/run-migrations.sh"]}]}'
```

**Benefits:**
- Same network/security configuration as service
- Same Docker image as deployed service
- Isolated from running service (no downtime)
- Exit code verification (0 = success)

#### 8. CloudWatch Logs Are Essential for Debugging
**Lesson:** Always check CloudWatch logs before proposing fixes.

**Log Groups:**
```
/ecs/nasneh-staging/api
```

**Log Stream Pattern:**
```
api/api/{task-id}
```

**Command:**
```bash
aws logs get-log-events \
  --log-group-name "/ecs/nasneh-staging/api" \
  --log-stream-name "api/api/{task-id}" \
  --limit 50
```

---

## Migration Automation (Future)

### Current State (Manual)
1. Merge PR with schema changes
2. Run CD to build new image
3. Manually run ECS task for migrations
4. Verify API endpoints

### Future State (Automated)
Add migration step to CD pipeline:
```yaml
- name: Run Migrations
  run: |
    aws ecs run-task \
      --cluster ${{ env.CLUSTER }} \
      --task-definition ${{ env.TASK_DEF }} \
      --overrides '{"containerOverrides":[{"name":"api","command":["sh","./scripts/run-migrations.sh"]}]}'
    # Wait for task completion
    # Verify exit code = 0
```

**Blocker:** Requires ECS task wait/poll logic in GitHub Actions.

**Priority:** Medium (manual process works, automation is enhancement).

---


---

## Complete API Inventory (Updated Jan 5, 2026 - Sprint 3 Complete)

**Total Endpoints:** 101 (86 from Sprint 1-2 + 15 from Sprint 3)

**Status:** Source of Truth for all existing API endpoints as of Sprint 2 completion.

| Module | Endpoint | Method | Sprint | PR | Staging Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/request-otp` | POST | 1 | #20 | ✅ **Working (Public)** |
| | `/api/v1/auth/verify-otp` | POST | 1 | #23 | ✅ **Working (Public)** |
| | `/api/v1/auth/refresh` | POST | 1 | #24 | ✅ **Working (Public)** |
| | `/api/v1/auth/logout` | POST | 1 | #24 | ✅ **Working (Public)** |
| | `/api/v1/auth/logout-all` | POST | 1 | #24 | ✅ **Working (Protected)** |
| | `/api/v1/auth/sessions` | GET | 1 | #24 | ✅ **Working (Protected)** |
| | `/api/v1/auth/me` | GET | 1 | #24 | ✅ **Working (Protected)** |
| **Products** | `/api/v1/products` | GET | 1 | #35 | ✅ **Working (Public)** |
| | `/api/v1/products/featured` | GET | 1 | #35 | ✅ **Working (Public)** |
| | `/api/v1/products/:id` | GET | 1 | #35 | ✅ **Working (Public)** |
| | `/api/v1/vendor/products` | GET | 1 | #35 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/products` | POST | 1 | #35 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/products/:id` | PATCH | 1 | #35 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/products/:id` | DELETE | 1 | #35 | ✅ **Working (Protected)** |
| **Orders** | `/api/v1/orders` | POST | 1 | #39 | ✅ **Working (Protected)** |
| | `/api/v1/orders` | GET | 1 | #39 | ✅ **Working (Protected)** |
| | `/api/v1/orders/:id` | GET | 1 | #39 | ✅ **Working (Protected)** |
| | `/api/v1/orders/:id/cancel` | PATCH | 1 | #39 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/orders` | GET | 1 | #38 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/orders/:id` | GET | 1 | #38 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/orders/:id/status` | PATCH | 1 | #38 | ✅ **Working (Protected)** |
| | `/api/v1/vendor/orders/:id/history` | GET | 1 | #38 | ✅ **Working (Protected)** |
| **Payments** | `/api/v1/payments/initiate` | POST | 1 | #41 | ❌ **Not Mounted (404)** |
| | `/api/v1/payments` | GET | 1 | #41 | ❌ **Not Mounted (404)** |
| | `/api/v1/payments/:id` | GET | 1 | #41 | ❌ **Not Mounted (404)** |
| | `/api/v1/payments/webhook` | POST | 1 | #42 | ❌ **Not Mounted (404)** |
| | `/api/v1/payments/return` | GET | 1 | #42 | ❌ **Not Mounted (404)** |
| **Services** | `/api/v1/services` | GET | 2 | #50 | ✅ **Working (Public)** |
| | `/api/v1/services/search` | GET | 2 | #50 | ✅ **Working (Public)** |
| | `/api/v1/services/featured` | GET | 2 | #50 | ✅ **Working (Public)** |
| | `/api/v1/services/category/:categoryId` | GET | 2 | #50 | ✅ **Working (Public)** |
| | `/api/v1/services/provider/:providerId` | GET | 2 | #50 | ✅ **Working (Public)** |
| | `/api/v1/services/:id` | GET | 2 | #48 | ✅ **Working (Public)** |
| | `/api/v1/services/:id/slots` | GET | 2 | #52 | ✅ **Working (Public)** |
| | `/api/v1/provider/services` | POST | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services` | GET | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services/stats` | GET | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services/:id` | GET | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services/:id` | PATCH | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services/:id` | DELETE | 2 | #48 | ✅ **Working (Protected)** |
| | `/api/v1/provider/services/:id/toggle` | PATCH | 2 | #48 | ✅ **Working (Protected)** |
| **Bookings** | `/api/v1/bookings` | POST | 2 | #57 | ✅ **Working (Protected)** |
| | `/api/v1/bookings` | GET | 2 | #61 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id` | GET | 2 | #61 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id/confirm` | POST | 2 | #60 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id/start` | POST | 2 | #60 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id/complete` | POST | 2 | #60 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id/cancel` | POST | 2 | #60 | ✅ **Working (Protected)** |
| | `/api/v1/bookings/:id/no-show` | POST | 2 | #60 | ✅ **Working (Protected)** |
| | `/api/v1/customer/bookings` | GET | 2 | #61 | ✅ **Working (Protected)** |
| | `/api/v1/provider/bookings` | GET | 2 | #61 | ✅ **Working (Protected)** |
| **Users** | `/api/v1/users/me` | GET | 2 | #62 | ✅ **Working (Protected)** |
| | `/api/v1/users/me` | PATCH | 2 | #62 | ✅ **Working (Protected)** |
| | `/api/v1/users` | GET | 2 | #62 | ✅ **Working (Protected)** |
| | `/api/v1/users/:id` | GET | 2 | #62 | ✅ **Working (Protected)** |
| | `/api/v1/users/:id` | PATCH | 2 | #62 | ✅ **Working (Protected)** |
| **Addresses** | `/api/v1/users/me/addresses` | GET | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/addresses` | POST | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/addresses/:id` | GET | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/addresses/:id` | PATCH | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/addresses/:id` | DELETE | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/addresses/:id/default`| POST | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/:userId/addresses` | GET | 2 | #63 | ✅ **Working (Protected)** |
| | `/api/v1/users/:userId/addresses` | POST | 2 | #63 | ✅ **Working (Protected)** |
| **Cart** | `/api/v1/cart` | GET | 2 | #64 | ✅ **Working (Protected)** |
| | `/api/v1/cart/items` | POST | 2 | #64 | ✅ **Working (Protected)** |
| | `/api/v1/cart/items/:id` | PATCH | 2 | #64 | ✅ **Working (Protected)** |
| | `/api/v1/cart/items/:id` | DELETE | 2 | #64 | ✅ **Working (Protected)** |
| | `/api/v1/cart` | DELETE | 2 | #64 | ✅ **Working (Protected)** |
| **Reviews** | `/api/v1/reviews` | GET | 2 | #66 | ✅ **Working (Public)** |
| | `/api/v1/reviews/:id` | GET | 2 | #66 | ✅ **Working (Public)** |
| | `/api/v1/reviews` | POST | 2 | #66 | ✅ **Working (Protected)** |
| | `/api/v1/reviews/:id` | PATCH | 2 | #66 | ✅ **Working (Protected)** |
| | `/api/v1/reviews/:id` | DELETE | 2 | #66 | ✅ **Working (Protected)** |
| | `/api/v1/admin/reviews/:id/approve` | POST | 2 | #66 | ✅ **Working (Protected)** |
| | `/api/v1/admin/reviews/:id/reject` | POST | 2 | #66 | ✅ **Working (Protected)** |
| | `/api/v1/users/me/reviews` | GET | 2 | #66 | ✅ **Working (Protected)** |
| **Upload** | `/api/v1/upload` | POST | 1 | #36 | ✅ **Working (Protected)** |
| **Categories** | `/api/v1/categories` | GET | 3 | #167 | ⏳ **Pending Deploy** |
| **Applications** | `/api/v1/vendor-applications` | POST | 3 | #169 | ⏳ **Pending Deploy** |
| | `/api/v1/vendor-applications/me` | GET | 3 | #169 | ⏳ **Pending Deploy** |
| | `/api/v1/provider-applications` | POST | 3 | #169 | ⏳ **Pending Deploy** |
| | `/api/v1/provider-applications/me` | GET | 3 | #169 | ⏳ **Pending Deploy** |
| **Admin - Applications** | `/api/v1/admin/vendor-applications` | GET | 3 | #170 | ⏳ **Pending Deploy** |
| | `/api/v1/admin/vendor-applications/:id` | PATCH | 3 | #170 | ⏳ **Pending Deploy** |
| | `/api/v1/admin/provider-applications` | GET | 3 | #170 | ⏳ **Pending Deploy** |
| | `/api/v1/admin/provider-applications/:id` | PATCH | 3 | #170 | ⏳ **Pending Deploy** |
| **Admin - Platform** | `/api/v1/admin/stats` | GET | 3 | #171 | ⏳ **Pending Deploy** |
| **Admin - Drivers** | `/api/v1/admin/drivers` | POST | 3 | #172 | ⏳ **Pending Deploy** |
| | `/api/v1/admin/drivers` | GET | 3 | #172 | ⏳ **Pending Deploy** |
| **Admin - Deliveries** | `/api/v1/admin/deliveries` | POST | 3 | #172 | ⏳ **Pending Deploy** |
| **Driver Operations** | `/api/v1/driver/deliveries` | GET | 3 | #172 | ⏳ **Pending Deploy** |
| | `/api/v1/driver/deliveries/:id` | PATCH | 3 | #172 | ⏳ **Pending Deploy** |


---

## Repository Automation (Phase 5 & 6 — Jan 2026)

**Status:** All automation workflows are installed and active.

### Active Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **PR Title Check** | `pr-title-check.yml` | PR open/edit | Validates conventional commit format |
| **Auto Docs** | `auto-docs.yml` | PR merge | Updates CHANGELOG.md + PROJECT_TIMELINE.md |
| **Auto Labels** | `labeler.yml` | PR open/sync | Labels PRs by files changed |
| **PR Size Check** | `pr-size.yml` | PR open/sync | Warns about large PRs |
| **Stale Bot** | `stale.yml` | Daily 9AM | Marks/closes inactive issues/PRs |
| **Release Notes** | `release-notes.yml` | Tag push (v*) | Generates GitHub Release notes |
| **Dependabot** | `dependabot.yml` | Weekly Monday | Creates PRs for dependency updates |

### PR Title Format (Required)

```
type(scope): description
```

**Valid Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`

**Valid Scopes:** `auth`, `api`, `payments`, `orders`, `bookings`, `services`, `users`, `cart`, `reviews`, `ui`, `infra`, `docs`, `governance`, `deps`

**Examples:**
- ✅ `feat(auth): add password reset`
- ✅ `fix(payments): resolve timeout issue`
- ✅ `docs(api): update endpoint documentation`
- ❌ `fixed stuff`
- ❌ `Update file`

### What Happens Automatically

1. **On PR Open:**
   - Title validated against conventional commit format
   - Labels added based on files changed
   - Size label added (XS/S/M/L/XL)
   - Warning comment if PR is too large (>1000 lines)

2. **On PR Merge:**
   - CHANGELOG.md updated with PR entry
   - PROJECT_TIMELINE.md updated with timestamp

3. **On Tag Push (v*.*.*):**
   - GitHub Release created with auto-generated notes
   - Commits grouped by type (features, fixes, etc.)

4. **Daily:**
   - Stale issues marked after 30 days
   - Stale PRs marked after 21 days
   - Closed after additional 7/14 days

5. **Weekly (Monday 9AM):**
   - Dependabot creates PRs for outdated dependencies

### GitHub App

Automation uses `nasneh-automation` GitHub App for:
- Bypassing branch protection rules
- Creating commits attributed to the App
- Scoped permissions (Contents: Read/Write only)

**App ID:** 2591137 (stored in `vars.APP_ID`)
**Private Key:** Stored in `secrets.APP_PRIVATE_KEY`


---

## Pending Dependabot Updates (2026-01-04)

**Status:** 16 Dependabot PRs created with failing CI. Need review later.

### Safe (CI Actions) — Priority 1
| PR | Package | Update |
|----|---------|--------|
| #146 | stale | 9 → 10 |
| #147 | action-gh-release | 1 → 2 |
| #148 | labeler | 5 → 6 |
| #149 | cache | 4 → 5 |
| #150 | docker/build-push-action | 5 → 6 |
| #151 | upload-artifact | 4 → 6 |

### Breaking Changes Risk — Priority 2 ⚠️
| PR | Package | Update | Risk |
|----|---------|--------|------|
| #155 | prisma | 5.22 → 7.2 | Major version |
| #161 | @prisma/client | 5.22 → 7.2 | Major version |
| #153 | zod | 3.25 → 4.3 | Major version |
| #154 | vitest | 1.6 → 4.0 | Major version |

### Other Updates — Priority 3
| PR | Package |
|----|---------|
| #152 | @aws-sdk/client-s3 |
| #156 | dotenv |
| #157 | body-parser |
| #158 | @types/node |
| #159 | react-dom |
| #160 | express |

### Action Required
- [ ] Schedule "Dependency Update Sprint" when appropriate
- [ ] Check CI failures before merging
- [ ] Handle breaking changes (prisma, zod, vitest) carefully
- [ ] Test thoroughly after major version updates

**Link:** https://github.com/nasneh-hub/nasneh/pulls?q=is%3Aopen+is%3Apr+author%3Aapp%2Fdependabot
