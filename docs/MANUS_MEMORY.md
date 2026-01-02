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
