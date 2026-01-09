# Nasneh Project Snapshot Report - 2026-01-08

**Evidence-Only Report - No Changes Made**

---

## 1) Git Snapshot

### Current Branch and Commit

```bash
$ git rev-parse --abbrev-ref HEAD
main

$ git log -1 --oneline
5eab417 (HEAD -> main, origin/main, origin/HEAD) fix(docker): remove non-existent shared package and add missing packages
```

### Git Status

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### Changed Files

```bash
$ git diff --name-only
(no output - working tree is clean)

$ git diff
(no output - working tree is clean)
```

### Open PRs and Branches

**Open PRs**: 17 open PRs (mostly Dependabot updates)

**Branches related to frontend hosting**:
- `remotes/origin/docs/incident-ecs-deployment-jan2026`
- `remotes/origin/docs/post-deploy-updates`
- `remotes/origin/feat/amplify-build-configs`
- `remotes/origin/feature/infra-ecs-alb`
- `remotes/origin/fix/cd-ecs-service-name`
- `remotes/origin/infra/amplify-module`

### Last Commit Details

```bash
$ git log -1 --stat
commit 5eab4170f42609327d07ddcf25152353754809c2 (HEAD -> main, origin/main, origin/HEAD)
Author: nasneh-hub <251050898+nasneh-hub@users.noreply.github.com>
Date:   Thu Jan 8 12:36:47 2026 -0500

    fix(docker): remove non-existent shared package and add missing packages

 apps/customer-web/Dockerfile | 74 ++++++++++++--------------------------------
 apps/dashboard/Dockerfile    | 74 ++++++++++++--------------------------------
 2 files changed, 40 insertions(+), 108 deletions(-)
```

**Function**: This commit updated the Dockerfiles for `customer-web` and `dashboard` to remove references to a non-existent `packages/shared` directory and added `packages/types` and `packages/utils`.

---

## 2) AWS Snapshot

### ECS Services

| Service | Desired | Running | Pending | Task Definition | Status |
|---------|---------|---------|---------|-----------------|--------|
| `nasneh-staging-customer-web` | 1 | 0 | 0 | `customer-web:1` | ACTIVE |
| `nasneh-staging-dashboard` | 1 | 0 | 0 | `dashboard:1` | ACTIVE |

**Key Finding**: Both services have **0 running tasks** despite desiredCount=1.

### ECS Service Events (Last Error)

**customer-web**:
```
(service nasneh-staging-customer-web) was unable to place a task. 
Reason: ResourceInitializationError: failed to validate logger args: 
create stream has been retried 1 times: failed to create Cloudwatch log group: 
operation error CloudWatch Logs: CreateLogGroup, https response error StatusCode: 400, 
RequestID: xxx, api error AccessDeniedException: 
User: arn:aws:sts::277225104996:assumed-role/nasneh-staging-ecs-task-execution/xxx 
is not authorized to perform: logs:CreateLogGroup on resource: 
arn:aws:logs:me-south-1:277225104996:log-group:/ecs/nasneh-staging/customer-web:log-stream: 
because no identity-based policy allows the logs:CreateLogGroup action : exit status 1.
```

**dashboard**: Same error as customer-web, but for `/ecs/nasneh-staging/dashboard` log group.

### ALB Configuration

**Load Balancer**: `nasneh-staging-api-alb`
- DNS: `nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com`
- Status: `active`

**Target Groups**:

| Target Group | Port | Health Check Path | Registered Targets |
|--------------|------|-------------------|-------------------|
| `nasneh-staging-customer-web-tg` | 3000 | `/` | 0 |
| `nasneh-staging-dashboard-tg` | 3000 | `/` | 0 |
| `nasneh-staging-api-tg` | 3000 | `/health` | (has targets) |

**Listener Rules** (HTTPS:443):

| Priority | Host Header | Target Group |
|----------|-------------|--------------|
| 10 | `staging.nasneh.com` | `nasneh-staging-customer-web-tg` |
| 20 | `staging-dashboard.nasneh.com` | `nasneh-staging-dashboard-tg` |
| default | * | `nasneh-staging-api-tg` |

### ECR Images

| Repository | Image Count |
|------------|-------------|
| `nasneh-staging-customer-web` | 0 |
| `nasneh-staging-dashboard` | 0 |

**Key Finding**: No Docker images have been successfully pushed to ECR.

### CloudWatch Logs

**Existing Log Groups**:
- `/ecs/nasneh-staging/api` ✅
- `/ecs/nasneh-staging/redis` ✅
- `/ecs/nasneh-staging/customer-web` ❌ (missing)
- `/ecs/nasneh-staging/dashboard` ❌ (missing)

---

## 3) Docker Snapshot

### customer-web Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy root files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy package.json files for all workspace members
COPY apps/customer-web/package.json ./apps/customer-web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm in builder stage too
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Build the application
RUN pnpm turbo run build --filter=@nasneh/customer-web

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/customer-web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-web/.next/static ./apps/customer-web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/customer-web/server.js"]
```

### Build Command

```bash
RUN pnpm turbo run build --filter=@nasneh/customer-web
```

### Last 80 Lines of Docker Build Logs (from GitHub Actions)

```
@nasneh/customer-web:build: sh: next: not found
@nasneh/customer-web:build:  ELIFECYCLE  Command failed.
@nasneh/customer-web:build:  WARN   Local package.json exists, but node_modules missing, did you mean to install?
@nasneh/customer-web:build: ERROR: command finished with error: command (/app/apps/customer-web) /usr/local/bin/pnpm run build exited (1)
@nasneh/customer-web#build: command (/app/apps/customer-web) /usr/local/bin/pnpm run build exited (1)

 Tasks:    0 successful, 1 total
Cached:    0 cached, 1 total
  Time:    556ms 
Failed:    @nasneh/customer-web#build

 ERROR  run failed: command  exited (1)
------

 3 warnings found (use docker --debug to expand):
 - LegacyKeyValueFormat: "ENV key=value" should be used instead of legacy "ENV key value" format (line 40)
 - LegacyKeyValueFormat: "ENV key=value" should be used instead of legacy "ENV key value" format (line 41)
 - LegacyKeyValueFormat: "ENV key=value" should be used instead of legacy "ENV key value" format (line 39)
Dockerfile:33
--------------------
  31 |     
  32 |     # Build the application
  33 | >>> RUN pnpm turbo run build --filter=@nasneh/customer-web
  34 |     
  35 |     # Stage 3: Runner
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c pnpm turbo run build --filter=@nasneh/customer-web" did not complete successfully: exit code 1
##[error]Process completed with exit code 1.
```

---

## 4) Root Cause Analysis

### Problem 1: Docker Build Failure (`sh: next: not found`)

**Error**: `sh: next: not found`

**Warning**: `Local package.json exists, but node_modules missing, did you mean to install?`

**Root Cause**: The `node_modules` directory is **not accessible** in the `builder` stage when running `pnpm turbo run build`. This is because:

1. In the `deps` stage, `pnpm install --frozen-lockfile` installs dependencies at `/app/node_modules`.
2. In the `builder` stage, we copy `COPY --from=deps /app/node_modules ./node_modules`, which should copy `/app/node_modules` to `/app/node_modules` in the builder stage.
3. However, when `pnpm turbo run build --filter=@nasneh/customer-web` runs, it changes directory to `/app/apps/customer-web` and tries to run `pnpm run build`.
4. The `next` executable is located at `/app/node_modules/.bin/next`, but the current working directory is `/app/apps/customer-web`, so `next` is not in the `PATH`.

**Why it fails**: In a pnpm workspace, when you run `pnpm run build` from a workspace package directory (`/app/apps/customer-web`), pnpm expects to find `node_modules` either in that directory or in the workspace root. The current Dockerfile copies `node_modules` to the root, but the workspace structure might not be preserved correctly.

### Problem 2: ECS Task Placement Failure (CloudWatch Permissions)

**Error**: `AccessDeniedException: User: arn:aws:sts::277225104996:assumed-role/nasneh-staging-ecs-task-execution/xxx is not authorized to perform: logs:CreateLogGroup`

**Root Cause**: The ECS task execution role (`nasneh-staging-ecs-task-execution`) does not have the `logs:CreateLogGroup` permission. This prevents ECS from creating the CloudWatch log groups `/ecs/nasneh-staging/customer-web` and `/ecs/nasneh-staging/dashboard`.

**Impact**: Even if we fix the Docker build issue, the ECS tasks will not start because they cannot create their log groups.

---

## 5) Decision Scope Confirmation

✅ **Confirmed**: We are on **ECS Fargate**, NOT Amplify.

✅ **Confirmed**: No Amplify files have been modified in the current working directory.

---

## 6) Summary

| Component | Status | Issue |
|-----------|--------|-------|
| Git | ✅ Clean | No uncommitted changes |
| Docker Build | ❌ Failing | `sh: next: not found` - node_modules not accessible |
| ECR Images | ❌ Empty | No images pushed (build fails before push) |
| ECS Services | ❌ Not Running | 0/1 tasks running |
| ECS Task Placement | ❌ Failing | CloudWatch log group creation permission denied |
| ALB | ✅ Configured | Rules and target groups exist |
| Target Groups | ⚠️ Empty | No targets registered (no running tasks) |

---

## Next Steps (Awaiting Approval)

1. **Fix Docker Build Issue**: Modify Dockerfile to ensure `node_modules` is accessible during build.
2. **Fix CloudWatch Permissions**: Add `logs:CreateLogGroup` permission to ECS task execution role.
3. **Test Local Docker Build**: Build locally to verify fix before pushing.
4. **Push to GitHub**: Trigger GitHub Actions workflow.
5. **Verify ECS Deployment**: Ensure tasks start and register with target groups.
6. **Test Endpoints**: Verify `staging.nasneh.com` and `staging-dashboard.nasneh.com` are accessible.

---

**Report Generated**: 2026-01-08  
**Author**: Manus AI  
**Status**: Awaiting user approval for fixes
