# Project Status

**Current release/tag:** v0.3.0-sprint2

---

## 🔴 Current State (Now) — 2026-01-02 18:45 UTC+3

- **ECS staging deployment FAILING** — Container crashes on startup
- **18 PRs attempted** (#83-#100) to fix Dockerfile/CD issues
- **Memory Freeze active** — No new PRs until fix plan approved

---

## What is Broken

**Exact Error (GitHub Actions — Run 20660793380):**
```
Error: Cannot find module 'express'
Require stack:
- /app/[eval]
code: 'MODULE_NOT_FOUND'
```

**Where:** CD workflow → `Verify - Check express dependency` step

**Root Cause (Verified):** pnpm uses symlinks in `node_modules/`. Docker `COPY` copies symlinks as files, not targets. Result: `express` and other deps not found at runtime.

---

## Last Known Good State

**NONE** — First deployment attempt. Infrastructure (VPC, RDS, ECS, ALB) is healthy. Container image is the blocker.

---

## Current Hypothesis (Verified)

**Backed by logs (Run 20660601237):**
```
apps/api/node_modules/@prisma/client -> symlink to .pnpm store
/app/node_modules/.pnpm/@prisma+client@5.22.0.../node_modules/.prisma ← actual location
```

pnpm stores all packages in `.pnpm/` and creates symlinks. Docker COPY doesn't dereference symlinks.

---

## Next Allowed Action

**Wait for user approval to implement fix plan.**

---

## ✅ Sprint 2 Complete

Sprint 2 completed with all 17 tasks merged. Services, Availability, Bookings, Cart, Reviews, and comprehensive tests implemented.

---

## ✅ DevOps Gate (Sprint 2.5) — Complete 🎉

DevOps Gate sprint completed! All 8 tasks merged. **Infrastructure deployed to staging!**

**Source of Truth:** [ClickUp DevOps Gate List](https://app.clickup.com/90182234772/v/l/li/901814719216)

### Tasks

| # | Task | Status | PR |
|---|------|--------|----|
| 1 | [DEVOPS] IaC Setup | ✅ Merged | #70 |
| 2 | [DEVOPS] VPC + Networking | ✅ Merged | #71 |
| 3 | [DEVOPS] RDS PostgreSQL | ✅ Merged | #73 |
| 4 | [DEVOPS] ECS Fargate + ALB | ✅ Merged | #74 |
| 5 | [DEVOPS] S3 + CloudFront | ✅ Merged | #75 |
| 6 | [DEVOPS] CI/CD Pipeline | ✅ Merged | #76, #77 |
| 7 | [DEVOPS] Secrets Management | ✅ Merged | #78 |
| 8 | [DEVOPS] Monitoring + Alerts | ✅ Merged | #79 |

### Key Decisions

- **IaC Tool:** Terraform (chosen over CDK for separation of concerns)
- **Region:** AWS Bahrain (me-south-1)
- **Staging First:** All infrastructure deployed to staging before production
- **Documentation:** See [docs/DEVOPS_GATE.md](./DEVOPS_GATE.md)

### Staging Deployment Status

**Deployed:** 2026-01-02

| Resource | Status | Endpoint/ARN |
|----------|--------|-------------|
| VPC | ✅ Active | vpc-05321b414c66b92a7 |
| RDS PostgreSQL | ✅ Available | nasneh-staging-postgres |
| ECS Cluster | ✅ Active | nasneh-staging-cluster |
| ALB | ✅ Active | http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com |
| CloudFront | ✅ Active | https://dmuz0tskgwik1.cloudfront.net |
| ECR | ✅ Ready | 277225104996.dkr.ecr.me-south-1.amazonaws.com/nasneh-staging-api |
| Secrets Manager | ✅ Created | 3 secrets (api, database, external) |
| CloudWatch | ✅ Active | 4 alarms + dashboard |
| SNS | ✅ Active | nasneh-staging-alerts |

**Estimated Monthly Cost:** ~$87

### Pending Actions

- [ ] Fix Dockerfile to handle pnpm symlinks
- [ ] Deploy real app image via CD workflow
- [ ] Confirm SNS email subscription (nasneh.com@gmail.com)
- [ ] Update secrets with real values
- [ ] Migrate Terraform state to S3 backend

---

## Sprint 2 Summary (Complete)

**All 17 tasks completed and merged to main. Tag v0.3.0-sprint2 created.**

### Merged PRs

| PR | Title | Phase |
|----|-------|-------|
| #45 | [SVC] Create services table migration | Phase 1 |
| #46 | [BOOK] Create bookings table migration | Phase 1 |
| #48 | [SVC] Implement service CRUD API | Phase 2 |
| #50 | [SVC] Implement service listing API | Phase 2 |
| #52 | [SVC] Availability schema + rules | Phase 2 |
| #54 | refactor: availability config defaults | Phase 2 |
| #55 | [SVC] Availability API + conflict checks | Phase 3 |
| #57 | [BOOK] Implement create booking endpoint | Phase 3 |
| #59 | [BOOK] Prevent double-booking (atomic) | Phase 3 |
| #60 | [BOOK] Implement booking status flow | Phase 4 |
| #61 | [BOOK] Implement booking listing APIs | Phase 4 |
| #62 | [USER] Implement user profile CRUD | Phase 4 |
| #63 | [USER] Implement address management | Phase 4 |
| #64 | [CART] Implement cart API (single-vendor) | Phase 5 |
| #65 | [REV] Create reviews table migration | Phase 5 |
| #66 | [REV] Implement review CRUD API | Phase 5 |
| #67 | [BOOK] Booking API tests | Phase 6 |
| #68 | [SVC] Service API tests | Phase 6 |

### Phase Breakdown
| Phase | Description | Tasks |
|-------|-------------|-------|
| Phase 1 | Migrations | 2/2 ✅ |
| Phase 2 | Services Core | 3/3 ✅ |
| Phase 3 | Availability + Bookings | 3/3 ✅ |
| Phase 4 | Bookings Flow + User | 4/4 ✅ |
| Phase 5 | Cart + Reviews | 3/3 ✅ |
| Phase 6 | Tests | 2/2 ✅ |
