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
