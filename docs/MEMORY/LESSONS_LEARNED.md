# Lessons Learned

> Document mistakes and how to avoid them in the future.

---

## CD Pipeline Issues (2026-01-02)

### Problem
CD pipeline failed repeatedly due to multiple issues.

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
- Always verify database provider matches infrastructure
- Test Docker builds locally before pushing
- Check pnpm deploy output for missing files

**Reference:** AUDITS/POSTMORTEM_2026-01-02_CD.md

---

## Manus Memory Loss (2026-01-03)

### Problem
Manus recommended tasks that were already completed (Auth, OTP, etc).

### Root Cause
No persistent memory between sessions. Manus starts fresh each time.

### Solution
Created AI Governance System with:
- Structured /docs folder
- PROJECT_TIMELINE.md for history
- Session start/end protocols
- Required reading before each session

### Prevention
- Always read MEMORY files at session start
- Always update MEMORY files at session end
- Never skip the session protocol

**Reference:** AUDITS/AUDIT_2026-01-03_DOCS.md

---

**Template for New Entries:**

[Title] (YYYY-MM-DD)

Problem

[What went wrong]

Root Cause

[Why it happened]

Solution

[How it was fixed]

Prevention

[How to avoid in future]

Reference: [Link to related docs]
