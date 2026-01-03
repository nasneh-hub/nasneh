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
| Database | PostgreSQL + Prisma ORM | TECHNICAL_SPEC.md |
| Authentication | Phone + OTP (WhatsApp → SMS fallback), JWT | PRD_MASTER.md |
| Payments | Amazon Payment Services (APS) | PRD_MASTER.md |
| Infrastructure | AWS Bahrain (me-south-1) | TECHNICAL_SPEC.md |
| Frontend | Next.js 14+, TypeScript, Tailwind, Shadcn UI | TECHNICAL_SPEC.md |
| UI Components | Shared package `@nasneh/ui` only | DESIGN_SYSTEM.md |
| Design | No borders, 12px radius, Vazirmatn font, mono colors | DESIGN_SYSTEM.md |

---

## Files to Read First (Every Task)

1. `/docs/00_START_HERE.md` — Quick facts and rules
2. `/docs/PRD_MASTER.md` — What to build (MVP scope)
3. `/docs/TECHNICAL_SPEC.md` — How to build (architecture)
4. `/docs/DESIGN_SYSTEM.md` — How it looks (UI rules)

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
