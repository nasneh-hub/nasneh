# Local Build Analysis — Next.js Standalone Output

**Date:** Jan 8, 2026  
**Purpose:** Understand actual Next.js build output structure before fixing Amplify deployment

---

## ✅ Build Status: SUCCESS

```bash
cd /home/ubuntu/nasneh/apps/customer-web
pnpm build
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages (8/8)
# ✓ Collecting build traces
```

---

## 📁 Actual .next/ Structure

### Root Level (.next/)
```
.next/
├── BUILD_ID
├── app-build-manifest.json
├── app-path-routes-manifest.json
├── build-manifest.json
├── cache/
├── export-marker.json
├── images-manifest.json
├── next-minimal-server.js.nft.json
├── next-server.js.nft.json
├── package.json
├── prerender-manifest.json
├── react-loadable-manifest.json
├── required-server-files.json ← ✅ EXISTS HERE
├── routes-manifest.json
├── server/ ← ✅ EXISTS HERE
├── standalone/ ← ✅ EXISTS HERE
└── static/ ← ✅ EXISTS HERE
```

### Standalone Structure (.next/standalone/)
```
.next/standalone/
├── node_modules/ ← ✅ pnpm structure with symlinks
│   └── .pnpm/
│       ├── next@14.2.35_react-dom@18.3.1_react@18.3.1/
│       ├── react@18.3.1/
│       ├── react-dom@18.3.1_react@18.3.1/
│       └── ... (all runtime dependencies)
└── apps/
    └── customer-web/
        ├── server.js ← ✅ Entry point
        ├── package.json
        ├── node_modules/ ← ✅ Symlinks to ../../node_modules/.pnpm/
        │   ├── next -> ../../../node_modules/.pnpm/next@.../node_modules/next
        │   └── react -> ../../../node_modules/.pnpm/react@.../node_modules/react
        └── .next/
            └── server/ ← ⚠️ ONLY server folder, NO static!
```

**Key Finding:** `.next/standalone/apps/customer-web/` contains:
- ✅ `server.js`
- ✅ `node_modules/` (symlinks to pnpm store)
- ✅ `.next/server/` (server-side code)
- ❌ NO `.next/static/` (must copy from root .next/)
- ❌ NO `required-server-files.json` (must copy from root .next/)

---

## 🧪 Deploy Folder Assembly Test

### Commands Used:
```bash
rm -rf deploy && mkdir -p deploy/.next
cp -R .next/standalone/apps/customer-web/* deploy/
cp -R .next/static deploy/.next/static
cp -R .next/server deploy/.next/server
cp .next/required-server-files.json deploy/
cp -R public deploy/ 2>/dev/null || true
```

### Results:
```
✅ server.js
✅ .next/server/
✅ .next/static/
✅ required-server-files.json
❌ node_modules/next MISSING (symlinks broken!)
```

---

## 🔍 Root Cause Analysis

### Problem: Symlinks Break When Copied

**In standalone:**
```bash
.next/standalone/apps/customer-web/node_modules/next 
  -> ../../../node_modules/.pnpm/next@14.2.35.../node_modules/next
```

**After copying to deploy/:**
```bash
deploy/node_modules/next 
  -> ../../../node_modules/.pnpm/next@... (BROKEN! Path doesn't exist)
```

**Why?** The symlinks point to `../../../node_modules/.pnpm/` which exists in `.next/standalone/` but NOT in `deploy/`.

---

## ✅ Solution: Copy Entire Standalone Folder

Instead of copying only `apps/customer-web/*`, we need to copy the ENTIRE standalone structure to preserve symlinks.

### Correct Approach:

```yaml
build:
  commands:
    - cd $CODEBUILD_SRC_DIR/nasneh && pnpm turbo run build --filter=@nasneh/customer-web
    - cd $CODEBUILD_SRC_DIR/nasneh/apps/customer-web
    
    # Copy entire standalone (preserves pnpm symlinks)
    - cp -R .next/standalone deploy
    
    # Copy static assets into the app folder
    - cp -R .next/static deploy/apps/customer-web/.next/static
    
    # Copy required-server-files.json
    - cp .next/required-server-files.json deploy/apps/customer-web/
    
    # Copy public folder if exists
    - cp -R public deploy/apps/customer-web/ 2>/dev/null || true

artifacts:
  baseDirectory: deploy/apps/customer-web
  files:
    - '**/*'
```

**Why this works:**
1. Copies entire `.next/standalone/` → preserves `node_modules/.pnpm/` structure
2. Symlinks in `deploy/apps/customer-web/node_modules/next` now point to valid paths
3. Static assets copied to correct location
4. Amplify serves from `deploy/apps/customer-web/` which has everything

---

## 📊 Final Deploy Structure (Correct)

```
deploy/
├── node_modules/ ← ✅ pnpm store with actual packages
│   └── .pnpm/
│       └── next@14.2.35.../node_modules/next ← ✅ Real package
└── apps/
    └── customer-web/ ← ✅ Amplify serves from here
        ├── server.js
        ├── package.json
        ├── node_modules/ ← ✅ Symlinks work!
        │   └── next -> ../../../node_modules/.pnpm/.../next ← ✅ Valid!
        ├── .next/
        │   ├── server/ ← ✅ From standalone
        │   └── static/ ← ✅ Copied from root .next/
        ├── required-server-files.json ← ✅ Copied
        └── public/ ← ✅ Copied
```

---

## 🎯 Action Items

1. ✅ Local build tested and analyzed
2. ✅ Root cause identified (broken symlinks)
3. ⏭️ Update amplify.yml with correct approach
4. ⏭️ Test deployment with new configuration

---

## 📝 Notes

- **pnpm workspaces** use symlinks for efficiency
- **Standalone output** preserves this structure
- **Partial copying** breaks symlink references
- **Full standalone copy** is the only reliable approach

---

**Next Step:** Update amplify.yml and deploy!
