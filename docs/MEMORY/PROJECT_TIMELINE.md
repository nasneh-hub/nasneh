# Project Timeline

> Append-only chronological history of the Nasneh project.
> **Rule:** Never delete entries. Only add new ones.

---

## 2026-01-09

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 06:56:25 | Fixed (customer-web): map verify-otp API response to frontend format | PR #237 | @nasneh-hub |
| 06:02:23 | Fixed (api): configure CORS for staging frontends | PR #235 | @nasneh-hub |
| 05:05:22 | Fixed (customer-web): add build args for NEXT_PUBLIC environment variables | PR #234 | @nasneh-hub |
| 04:39:24 | Fixed (infra): correct API URL for ECS customer-web to include /api/v1 | PR #232 | @nasneh-hub |
| 04:34:22 | Fixed (customer-web): correct API URL in staging to include /api/v1 path | PR #231 | @nasneh-hub |
| 03:48:14 | Changed: use config.environment instead of config.env | PR #230 | @nasneh-hub |
| 03:43:48 | Added (api): bypass rate limit for test numbers in staging | PR #229 | @nasneh-hub |
| 03:36:59 | Changed: add logging to diagnose OTP test number issue | PR #228 | @nasneh-hub |
| 03:30:47 | Fixed (auth): update staging test phone number to valid Bahrain mobile | PR #227 | @nasneh-hub |

---

## 2026-01-08

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 19:52:22 | Added (infra): add DNS and TLS for frontend apps with SNI | PR #226 | @nasneh-hub |
| 19:09:20 | Fixed (nextjs): add public directories for Docker build | PR #225 | @nasneh-hub |
| 19:05:43 | Fixed (nextjs): add standalone output mode for Docker deployment | PR #224 | @nasneh-hub |
| 19:01:12 | Fixed (docker): copy entire deps stage to preserve all node_modules | PR #223 | @nasneh-hub |
| 18:57:12 | Fixed (docker): copy per-package node_modules from deps stage | PR #222 | @nasneh-hub |
| 18:50:20 | Fixed (docker): preserve workspace structure in builder stage | PR #221 | @nasneh-hub |
| 10:33:34 | Added (infra): add Terraform Amplify module for frontend apps | PR #219 | @nasneh-hub |
| 10:27:41 | Added (ci): add amplify.yml build configs for frontend apps | PR #218 | @nasneh-hub |
| 10:20:28 | Added (infra): enable HTTPS on ALB and add dashboard next.config.js | PR #217 | @nasneh-hub |
| 10:14:21 | Added (infra): add ACM certificate and Route53 for api-staging.nasneh.com | PR #216 | @nasneh-hub |
| 09:54:46 | Documented (ops): add environment variables contract | PR #215 | @nasneh-hub |
| 05:53:17 | Documented (memory): update documentation for Sprint 4 completion | PR #214 | @nasneh-hub |

---

## 2026-01-07

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 22:13:06 | Added (dashboard): add login and role switching flow | PR #210 | @nasneh-hub |
| 21:59:25 | Fixed (ci): restore proper workflow structure with comment exclusions | PR #213 | @nasneh-hub |
| 21:48:05 | Fixed (ci): improve forbidden terminology exclusions for comments and ro… | PR #212 | @nasneh-hub |
| 21:33:20 | Fixed (ci): exclude route paths and TypeScript keys from forbidden termi… | PR #211 | @nasneh-hub |
| 21:08:38 | Fixed (ci): exclude Arabic punctuation from hardcoded text check | PR #209 | @nasneh-hub |
| 21:00:23 | Added (customer-web): add profile and address management pages | PR #208 | @nasneh-hub |
| 20:46:00 | Refactored (auth): remove localStorage workaround | PR #207 | @nasneh-hub |
| 20:41:44 | Fixed (ci): add word boundaries to UI Law regex patterns | PR #206 | @nasneh-hub |
| 20:16:14 | Added (customer-web): implement phone + OTP login flow | PR #204 | @nasneh-hub |
| 19:39:33 | Added (ui): add remaining 6 core components | PR #203 | @nasneh-hub |
| 19:04:33 | Documented (ui): add modification rules to tokens.css | PR #201 | @nasneh-hub |
| 18:57:40 | Added (ui): add 6 core components (Button, Input, Card, Badge, Skeleton, Dialog) | PR #199 | @nasneh-hub |
| 18:50:06 | Fixed (ci): scope ui-lint to frontend files only, eliminate false positives | PR #200 | @nasneh-hub |
| 17:46:56 | Documented (audit): complete API inventory with all 78 endpoints tested | PR #198 | @nasneh-hub |
| 17:25:10 | Fixed (api): add authMiddleware to 4 modules (addresses, bookings, cart, reviews) | PR #197 | @nasneh-hub |
| 16:38:00 | Fixed (users): add authMiddleware to users routes | PR #196 | @nasneh-hub |
| 15:59:39 | Documented (audit): document Sprint 3.9 infrastructure fixes and lessons learned | PR #195 | @nasneh-hub |
| 16:30:00 | Documented (audit): Sprint 3.9 infrastructure fixes and lessons learned | PR #195 | @nasneh-hub |
| 16:00:00 | Fixed (cd): add fallback logic for ACTIVE task definition | PR #194 | @nasneh-hub |
| 15:45:00 | Fixed (cd): preserve Redis sidecar container in task definition updates | PR #194 | @nasneh-hub |
| 15:11:55 | Fixed (auth): use ESM import for crypto in token repository | PR #194 | @nasneh-hub |
| 14:07:23 | Fixed (auth): return 400 for invalid OTP and use fixed OTP for test number in staging | PR #193 | @nasneh-hub |
| 11:42:25 | Fixed (bookings): add missing getBookingById function | PR #192 | @nasneh-hub |
| 11:00:14 | Fixed (auth): use ENVIRONMENT variable for OTP mock mode safety check | PR #191 | @nasneh-hub |
| 10:04:42 | Added (auth): add OTP mock mode for staging | PR #190 | @nasneh-hub |
| 08:43:19 | Fixed (auth): remove waitForDelivery to prevent OTP timeout | PR #189 | @nasneh-hub |
| 08:20:00 | Documented (api): add API route inventory and update API reference | PR #188 | @nasneh-hub |
| 05:39:56 | Fixed (ci): remove accidental bash command from ui-lint.yml | PR #187 | @nasneh-hub |

---

## 2026-01-06

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 14:31:24 | Documented (readme): update project status and add missing links | PR #186 | @nasneh-hub |
| 13:56:13 | Maintained (cleanup): remove temporary files from root | PR #184 | @nasneh-hub |
| 12:27:54 | Documented (governance): comprehensive documentation audit and gap fixes | PR #182 | @nasneh-hub |
| 11:21:15 | Updated CI/CD: add UI Law enforcement workflow | PR #181 | @nasneh-hub |
| 10:46:10 | Documented: add Component Specifications for 12 core components | PR #180 | @nasneh-hub |
| 10:10:37 | Documented (brand): Brand Voice Document - S3.8-05 | PR #179 | @nasneh-hub |
| 10:05:00 | Documented (ui): UI Law Document - S3.8-04 | PR #178 | @nasneh-hub |
| 09:59:52 | Added (ui): Vazirmatn Font Files - S3.8-03 | PR #177 | @nasneh-hub |
| 09:46:03 | Added (ui): Copy Tokens (ar/en/terminology) - S3.8-02 | PR #176 | @nasneh-hub |
| 08:52:18 | Added (ui): Design Tokens (tokens.css) - S3.8-01 | PR #175 | @nasneh-hub |

---

## 2026-01-05

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 15:45:13 | Documented (sprint3): Sprint 3 completion report and AWS permissions | PR #174 | @nasneh-hub |
| 12:49:22 | Documented (sprint3): complete Sprint 3 verification and documentation | PR #173 | @nasneh-hub |
| 12:40:00 | **Sprint 3 COMPLETE** - All 6 tasks done (24/24 SP) | PRs #167-#172 | Manus |
| 12:36:07 | Added (api): implement driver and delivery APIs | PR #172 | @nasneh-hub |
| 12:24:48 | Added (api): implement admin dashboard stats API | PR #171 | @nasneh-hub |
| 12:15:20 | Added (api): implement admin application review APIs | PR #170 | @nasneh-hub |
| 12:02:59 | Added (api): implement vendor and provider application APIs | PR #169 | @nasneh-hub |
| 11:54:00 | Added (db): add onboarding and delivery models | PR #168 | @nasneh-hub |
| 11:38:18 | Added (api): implement categories API | PR #167 | @nasneh-hub |
| 11:34:00 | Documented: add Master Roadmap links across all documentation | PR #166 | @nasneh-hub |

---

## 2026-01-04

| Time | Event | Evidence | Author |
|------|-------|----------|--------|
| 18:06:06 | Documented (specs): add master roadmap with complete sprint specifications | PR #165 | @nasneh-hub |
| 16:12:05 | Documented (audit): comprehensive pre-sprint 3 project audit | PR #164 | @nasneh-hub |
| 16:11:01 | Documented (memory): add pending Dependabot updates to memory | PR #163 | @nasneh-hub |
| 15:21:36 | Documented (cleanup): phase 7 cleanup and verification | PR #162 | @nasneh-hub |
| 11:15:54 | Updated CI/CD (automation): install Phase 6 automation | PR #145 | @nasneh-hub |
| 11:13:03 | Updated CI/CD (automation): add dependabot, release notes, labels, stale bot, and PR size check | PR #144 | @nasneh-hub |
| 10:34:40 | Tested (ci): verify unified auto-docs workflow | PR #143 | @nasneh-hub |
| 10:32:05 | Updated CI/CD (automation): switch to unified auto-docs workflow | PR #142 | @nasneh-hub |
| 10:22:21 | Fixed (ci): merge changelog and timeline into unified auto-docs workflow | PR #141 | @nasneh-hub |

---

## 2026-01-03

### Session: Final Manual Memory Update (Phase 4)
**Agent:** Manus
**Summary:** Last manual update of memory files before automation implementation.

**Events:**
- Updated all file paths in MANUS_MEMORY.md to new structure
- Added complete PR history to PROJECT_TIMELINE.md
- Updated CHANGELOG.md with all PRs categorized
- Extracted lessons from POSTMORTEM to LESSONS_LEARNED.md

**Evidence:**
- PR: #132 (pending)

---

### Session: AI Governance System Setup (Phase 2)
**Agent:** Manus
**Summary:** Established AI governance system with folder structure and operating rules.

**Events:**
- Completed comprehensive /docs audit (13 files, 5,330 lines)
- Created new folder structure (SPECS, OPS, GOVERNANCE, MEMORY, AUDITS)
- Established AI Operating Rules (Five Golden Rules)
- Reorganized all documentation (30 files affected)

**Evidence:**
- Audit Report: AUDITS/AUDIT_2026-01-03_DOCS.md
- PR: #130 (Phase 1 Audit)
- PR: #131 (Phase 2 Reorganization)

---

### Session: API Audit & Payment Fix
**Agent:** Manus
**Summary:** Audited all 86 API endpoints and fixed payment routes.

**Events:**
- Audited all Sprint 1 & 2 endpoints (86 total)
- Found 81 working endpoints (94%)
- Discovered payment routes not mounted (5 endpoints returning 404)
- Fixed by uncommenting payment routes in index.ts
- Deployed fix to staging

**Evidence:**
- Audit Report: AUDITS/AUDIT_2026-01-03_API.md
- PR: #128 (API Audit Documentation)
- PR: #129 (Payment Routes Fix)

---

### Session: CD Stabilization Documentation
**Agent:** Manus
**Summary:** Documented the 30-hour CD stabilization journey.

**Events:**
- Created comprehensive POSTMORTEM.md
- Updated MANUS_MEMORY.md with CD lessons
- Updated PROJECT_STATUS.md with migration status

**Evidence:**
- PR: #127 (Documentation)

---

### Session: Database Migration Success
**Agent:** Manus
**Summary:** Successfully deployed database schema to staging.

**Events:**
- Fixed Prisma path after removing --prod flag
- Ran initial schema migration via ECS run-task
- Verified all 19 tables created
- Confirmed API endpoints working

**Evidence:**
- PR: #126 (Prisma path hotfix)
- PR: #125 (Remove --prod flag)
- PR: #124 (Move prisma to dependencies)
- PR: #123 (Correct prisma binary path)
- PR: #122 (Fix migration script)
- PR: #121 (Add database migrations)
- PR: #120 (Change MySQL to PostgreSQL)

---

## 2026-01-02

### Session: CD Pipeline Stabilization
**Agent:** Manus
**Summary:** Fixed critical CD pipeline issues blocking deployment.

**Events:**
- Fixed pnpm symlinks issue (PRs #102-#111)
- Fixed Prisma ESM/CJS compatibility (PRs #106-#118)
- Discovered database provider mismatch
- Multiple Docker build iterations

**Evidence:**
- Postmortem: AUDITS/POSTMORTEM_2026-01-02_CD.md
- PRs: #102-#119 (Various fixes)

---

### Session: Sprint 2 Completion
**Agent:** Manus
**Summary:** Completed Sprint 2 with all service modules.

**Events:**
- Implemented Services module (14 endpoints)
- Implemented Bookings module (10 endpoints)
- Implemented Cart module (5 endpoints)
- Implemented Reviews module (8 endpoints)
- Added comprehensive tests

**Evidence:**
- PR: #69 (Sprint 2 closure docs)
- PR: #68 (Service tests)
- PR: #67 (Booking tests)
- PR: #66 (Reviews CRUD)
- PR: #65 (Reviews table)
- PR: #64 (Cart API)
- PR: #63 (Addresses CRUD)
- PR: #62 (User profile)
- PR: #61 (Booking listing)
- PR: #60 (Booking status flow)
- PR: #59 (Double-booking prevention)
- PR: #57 (Create booking)
- PR: #55 (Availability conflicts)
- PR: #52 (Availability schema)
- PR: #50 (Service listing)
- PR: #48 (Service CRUD)
- PR: #46 (Bookings table)
- PR: #45 (Services table)

---

## 2026-01-01

### Session: Sprint 1 Completion
**Agent:** Manus
**Summary:** Completed Sprint 1 with core modules.

**Events:**
- Implemented Auth module (7 endpoints)
- Implemented Products module (7 endpoints)
- Implemented Orders module (8 endpoints)
- Implemented Payments module (5 endpoints)
- Implemented Upload module (1 endpoint)

**Evidence:**
- PR: #44 (Sprint 1 closure docs)
- PR: #42 (APS webhook)
- PR: #41 (APS payment initiation)
- PR: #40 (Payments table)
- PR: #39 (Create order)
- PR: #38 (Order status flow)
- PR: #37 (Orders table)
- PR: #36 (Image upload)
- PR: #35 (Product CRUD)
- PR: #25 (Products schema)
- PR: #24 (Refresh token)
- PR: #23 (OTP verify tests)
- PR: #22 (SMS fallback)

---

### Session: Infrastructure Setup
**Agent:** Manus
**Summary:** Set up AWS infrastructure with Terraform.

**Events:**
- Created IaC base structure
- Deployed VPC, RDS, ECS, ALB
- Set up CI/CD pipelines

**Evidence:**
- PR: #70 (IaC base structure)

---

### Session: Project Initialization
**Agent:** Owner + Claude
**Summary:** Initial project setup and documentation.

**Events:**
- Created monorepo structure
- Wrote PRD, Technical Spec, Design System
- Set up AWS infrastructure plan

**Evidence:**
- Initial commit: 8cd6f01

---

## Template for New Entries

```
## YYYY-MM-DD

### Session: [Title]
**Agent:** [Who worked on this]
**Summary:** [One sentence]

**Events:**
- [Event 1]
- [Event 2]

**Evidence:**
- PR: #[number]
- Commit: [hash]
- Doc: [path]
```
