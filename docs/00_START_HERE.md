# 00 - START HERE

**Read this document FIRST before any work.**

---

## Project: Nasneh

**What:** Multi-category marketplace for Bahrain  
**Who:** Customers + Vendors + Service Providers + Drivers  
**Philosophy:** "مني الك ومنك الي" (From me to you, from you to me)

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
| **Borders** | ❌ NEVER use borders |
| **Radius** | 12px (rounded-xl) everywhere |
| **Heights** | 32px / 40px / 48px / 56px |
| **Components** | From /core/ui/ ONLY |

---

## User Roles

1. **Customer** - Browse, order, book (default role)
2. **Vendor** - Sell products (home kitchens, crafts)
3. **Service Provider** - Offer services
4. **Driver** - Deliver orders
5. **Admin** - Manage platform

---

## Documents to Read

| Document | Contains |
|----------|----------|
| `PRD_MASTER.md` | What to build |
| `TECHNICAL_SPEC.md` | How to build |
| `DESIGN_SYSTEM.md` | How it looks |

---

## Working Rules

1. **Read docs before coding**
2. **Follow Design System exactly**
3. **Ask if unclear - don't assume**
4. **Update status in ClickUp**
5. **Commit frequently to GitHub**

---

## What NOT to Do

- ❌ Use borders
- ❌ Use different fonts
- ❌ Create components outside /core/ui/
- ❌ Change scope without approval
- ❌ Skip testing
- ❌ Commit sensitive data

---

## Need Help?

1. Check the docs first
2. If not found, ask Owner via ClickUp task
3. Create task with [QUESTION] or [DECISION NEEDED] prefix

---

**Ready? Start by reading PRD_MASTER.md →**
