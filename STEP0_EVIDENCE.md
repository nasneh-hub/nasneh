# Step 0: Unblock pnpm install - Evidence Report

## Problem Identified

**Command:**
```bash
cd /home/ubuntu/nasneh-ui-fixes && pnpm install
```

**What was hanging:**
- Package: `@prisma/engines@5.22.0`
- Step: `postinstall` script (`node scripts/postinstall.js`)
- Duration: Failed after 5 minutes timeout

**Root Cause:**
Prisma engines postinstall script attempts to download/compile native binaries, which can hang in sandbox environments due to:
- Limited resources
- Network latency
- Binary compilation issues

**Output Snippet:**
```
node_modules/.pnpm/@prisma+engines@5.22.0/node_modules/@prisma/engines: Running postinstall script...
node_modules/.pnpm/@prisma+engines@5.22.0/node_modules/@prisma/engines: Running postinstall script, failed in 5m 0.9s
.../node_modules/@prisma/engines postinstall$ node scripts/postinstall.js
└─ Failed in 5m 0.9s
 ELIFECYCLE  Command failed.
```

## Fix Applied

**Solution:**
Skip postinstall scripts during installation, then manually generate Prisma client:

```bash
# Install with --ignore-scripts flag
pnpm install --ignore-scripts

# Manually generate Prisma client
pnpm --filter @nasneh/api exec prisma generate
```

**Result:**
```
✅ Packages: +641
✅ Done in 1.7s (vs 5+ minutes hanging)
✅ Prisma Client generated successfully in 358ms
```

## Verification

**Test build:**
```bash
pnpm run build
```

All dependencies now installed correctly and project can build successfully.

## Status: ✅ RESOLVED

pnpm install is now healthy and unblocked. Ready to proceed with PR1.

## ⚠️ Important Note

**This is a sandbox/local-only workaround.**

- `--ignore-scripts` should **NOT** be applied to production or CI/CD pipelines
- If CI needs this later, we'll solve Prisma engines properly (binary caching, pre-built images, etc.)
- This workaround is only for local development to unblock the task
