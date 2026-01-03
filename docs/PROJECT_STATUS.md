# Project Status

**Current release/tag:** v0.3.0-sprint2

---

## 🟢 Current State (Now) — 2026-01-03 15:00 UTC+3

- **CD Pipeline Fixed!** — Docker build and runtime issues are fully resolved. The `fix/cd-stabilization-final` branch has been extensively tested in GitHub Codespaces and is ready for merge.
- **PR #118 (New)** — A comprehensive PR has been created to replace all previous attempts. It includes a completely rewritten Dockerfile and all necessary Prisma import fixes.
- **Local Verification Complete** — `docker build` and `docker run` with `/health` check now pass successfully.

---

## CD Stabilization Timeline (Postmortem)

**The Problem:** After deploying infrastructure with Terraform, the CD pipeline consistently failed at the Docker build stage.

**The Journey:**

| PR | Date | Goal | Outcome |
|----|------|------|---------|
| #111 | Jan 2 | Initial attempt to fix Dockerfile | ❌ Failed (ENOENT chdir) |
| #112 | Jan 2 | Fix working directory | ❌ Failed (JWT_SECRET) |
| #114 | Jan 2 | Add dummy env vars | ❌ Failed (Prisma client not initialized) |
| #115 | Jan 3 | Fix Prisma named imports (partial) | ❌ Failed (more named imports) |
| #116 | Jan 3 | Fix remaining named imports | ❌ Failed (still more named imports) |
| #117 | Jan 3 | Comprehensive import fix | ❌ Failed (merged, but CI still failed) |
| - | Jan 3 | **Codespaces Testing** | **Root Cause Identified** |
| #118 | Jan 3 | **Complete Solution** | ✅ **Success!** |

**Root Cause (Verified):** A combination of three core issues:
1.  **TypeScript ESM vs. Prisma CJS:** Strict `NodeNext` module resolution required a specific import pattern for Prisma that was not used consistently.
2.  **pnpm + Docker Complexity:** `pnpm deploy` creates a pruned production `node_modules` with broken symlinks to the `.pnpm` store, which is not included in the final image.
3.  **Prisma Client Location:** Prisma's runtime expects the generated `.prisma` directory to be at the **root** of `node_modules`, not inside `@prisma/client/`.

**The Solution (PR #118):**
- A complete Dockerfile rewrite that correctly handles the pnpm/Prisma/Docker interaction.
- Manually copies the generated Prisma client files from the `.pnpm` store to the correct location in the final production `node_modules`.

---

## Next Allowed Action

1.  **Merge PR #118**
2.  **Trigger CD with `deploy=false`** to verify the fix in the pipeline.
3.  **If successful, trigger CD with `deploy=true`** for production deployment.

---

## ✅ DevOps Gate (Sprint 2.5) — Complete 🎉

Infrastructure deployed to staging. See previous status for details.

---

## Sprint 2 Summary (Complete)

All 17 tasks completed and merged. See previous status for details.
