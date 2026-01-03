# 00 - START HERE

**Read this document FIRST before any work.**

---

## Project: Nasneh

**What:** Multi-category marketplace for Bahrain  
**Who:** Customers + Vendors + Service Providers + Drivers  
**Philosophy:** "From me to you, from you to me"

---

## Quick Facts

| Item | Value |
|------|-------|
| **Region** | Bahrain |
| **Currency** | BHD (3 decimals: 1.500) |
| **Language** | Arabic + English |
| **Direction** | RTL primary |

---

## URLs

| App | URL |
|-----|-----|
| Customer Web | nasneh.com |
| Dashboard | dashboard.nasneh.com |
| API | api.nasneh.com |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, TypeScript, Tailwind, Shadcn UI |
| Backend | Node.js, Express, Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Infrastructure | AWS (Bahrain - me-south-1) |
| Payments | Amazon Payment Services (APS) |

---

## Design Rules (CRITICAL)

| Rule | Value |
|------|-------|
| **Font** | Vazirmatn ONLY |
| **Colors** | Black + White + Gray (mono) |
| **Borders** | NEVER use borders |
| **Radius** | 12px (rounded-xl) everywhere |
| **Heights** | 32px / 40px / 48px / 56px |
| **Components** | From @nasneh/ui (packages/ui) ONLY |

---

## User Roles

1. **Customer** - Browse, order, book (default role)
2. **Vendor** - Sell products (home kitchens, crafts)
3. **Service Provider** - Offer services
4. **Driver** - Deliver orders
5. **Admin** - Manage platform

---

## Documentation Structure

| Folder | Purpose |
|--------|---------|
| `SPECS/` | Product requirements, technical specs, design system |
| `OPS/` | Runbook, deployment, security |
| `GOVERNANCE/` | AI rules, contribution guidelines |
| `MEMORY/` | Project history, lessons learned |
| `AUDITS/` | Audit reports, postmortems |

---

## Documents to Read

| Document | Contains |
|----------|----------|
| `SPECS/PRD_MASTER.md` | What to build |
| `SPECS/TECHNICAL_SPEC.md` | How to build |
| `SPECS/DESIGN_SYSTEM.md` | How it looks |
| `OPS/RUNBOOK.md` | How to run |
| `GOVERNANCE/AI_OPERATING_RULES.md` | Rules for AI agents |

---

## For AI Agents

**Session Start Protocol:**
1. Read this file (00_START_HERE.md)
2. Read MEMORY/PROJECT_TIMELINE.md (last 10 entries)
3. Read MEMORY/MANUS_MEMORY.md (if you are Manus)
4. Check assigned tasks in ClickUp
5. Confirm: "Read updates. Ready to work on [task]."

**Session End Protocol:**
1. Update relevant documentation
2. Add entry to MEMORY/PROJECT_TIMELINE.md
3. Create PR with all changes
4. Post session summary on ClickUp task

---

## Working Rules

1. **Read docs before coding**
2. **Follow Design System exactly**
3. **Ask if unclear - don't assume**
4. **Update status in ClickUp**
5. **Commit frequently to GitHub**

---

## What NOT to Do

- Do not use borders
- Do not use different fonts
- Do not create components outside @nasneh/ui
- Do not change scope without approval
- Do not skip testing
- Do not commit sensitive data

---

## Need Help?

1. Check the docs first
2. If not found, ask Owner via ClickUp task
3. Create task with [QUESTION] or [DECISION NEEDED] prefix

---

**Ready? Start by reading SPECS/PRD_MASTER.md**
