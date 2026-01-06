# Sprint 3.8 - Complete Understanding & Verification

## ✅ Documentation Read

### 1. DESIGN_SYSTEM.md ✅
**Read:** Complete (560 lines)
**Key Takeaways:**
- Mono colors (Black/White/Gray) - 95% of UI
- No borders anywhere (use backgrounds/shadows)
- Single font: Vazirmatn (Arabic + English)
- Consistent radius: 12px (rounded-xl) everywhere
- Exception: Icon buttons use rounded-full
- Component heights: 32/40/48/56px
- CSS Variables in tokens.css
- All components from @nasneh/ui package

### 2. Brand Voice Doc ✅
**Read:** Complete (307 lines)
**Key Takeaways:**
- Nasneh = Local (never say "local")
- Sellers are "Nasneh" not vendors
- 5 categories: Fresh Food, Food Products, Crafts, Food Trucks, Services
- Customers = "Supporters" (داعمين) not زبون
- Tagline: منّا وفينا (From us, for us)
- Copy tokens location: packages/ui/src/copy/

---

## 📋 Sprint 3.8 Overview

| Item | Value |
|------|-------|
| **Sprint** | 3.8: Pre-Frontend Foundation |
| **Tasks** | 9 |
| **Story Points** | 21 |
| **Duration** | 3 days |
| **Goal** | Build Single Source of Truth for UI |

---

## 🎯 Deliverables & File Paths

### Phase A: Foundation Files (Day 1 - 8 SP)

#### S3.8-01: Design Tokens (3 SP)
**File:** `packages/ui/src/styles/tokens.css`
**Content:**
- CSS variables for all colors (light + dark mode)
- Font family variable
- Border radius variable
- Spacing scale
- Component heights
**Source:** DESIGN_SYSTEM.md Section 3, 11

#### S3.8-02: Copy Tokens (4 SP)
**Files:**
```
packages/ui/src/copy/
├── ar.ts          ← Arabic strings
├── en.ts          ← English strings
├── terminology.ts ← Brand term mappings
└── index.ts       ← Exports
```
**Content:**
- All UI copy from Brand Voice Doc
- Terminology replacements (Nasneh, Supporters, etc.)
- System messages, CTAs, errors
- Milestone messages
**Source:** Brand Voice Doc Sections 3-11

#### S3.8-03: Vazirmatn Font Files (1 SP)
**Location:** `packages/ui/src/fonts/vazirmatn/`
**Files:**
```
vazirmatn/
├── Vazirmatn-Regular.woff2
├── Vazirmatn-Medium.woff2
├── Vazirmatn-SemiBold.woff2
├── Vazirmatn-Bold.woff2
└── font.css
```
**Source:** Google Fonts (self-hosted)

### Phase B: Law & Documentation (Day 2 - 6 SP)

#### S3.8-04: UI Law Document (2 SP)
**File:** `docs/SPECS/UI_LAW.md`
**Content:** 5 strict rules
1. NO borders anywhere
2. ONLY rounded-xl (12px) or rounded-full
3. ONLY mono colors (except semantic status)
4. ONLY Vazirmatn font
5. ONLY components from @nasneh/ui
**Source:** DESIGN_SYSTEM.md Sections 1, 7, 13, 14

#### S3.8-05: BRAND_VOICE.md (1 SP)
**File:** `docs/SPECS/BRAND_VOICE.md`
**Content:** Brand Voice Doc + Section 6 (Taglines)
**Source:** Brand Voice Doc (complete)

#### S3.8-06: Component Specs (3 SP)
**File:** `docs/SPECS/COMPONENT_SPECS.md`
**Content:** 6 core components specs
1. Button (4 variants + sizes)
2. Input (with validation states)
3. Card (with shadow, no border)
4. Badge (4 semantic variants)
5. Table (no borders, hover states)
6. Modal/Dialog (rounded-xl, shadow)
**Source:** DESIGN_SYSTEM.md Section 9

### Phase C: Enforcement & Validation (Day 3 - 7 SP)

#### S3.8-07: CI Lint Rules (3 SP)
**File:** `.github/workflows/ui-lint.yml`
**Content:** 8 automated checks
1. Hex colors outside tokens.css → FAIL
2. Tailwind color classes (bg-white, text-black) → FAIL
3. Inline styles (style={{...}}) → FAIL
4. Border classes (border-*) → FAIL
5. Invalid rounded (not rounded-xl or rounded-full) → FAIL
6. Forbidden terms (زبون، بائع، customer, seller) → FAIL
7. Hardcoded Arabic outside /copy/ → FAIL
8. Hardcoded English → WARNING

#### S3.8-08: Update Docs + CODEOWNERS (2 SP)
**Files:**
- `.github/CODEOWNERS` - Require owner approval for UI changes
- `.github/PULL_REQUEST_TEMPLATE.md` - Add UI checklist
- Update relevant docs with links to UI_LAW.md

#### S3.8-09: Audit & Gap Analysis (2 SP)
**Deliverable:** Audit report document
**Content:**
- Verify all design tokens match DESIGN_SYSTEM.md
- Verify all copy tokens match Brand Voice Doc
- Check for missing values
- Document any gaps or ambiguities

---

## 🔒 Scope Lock (CRITICAL)

### ✅ ALLOWED:
```
packages/ui/**
docs/**
.github/**
```

### ❌ FORBIDDEN:
```
apps/**          (NO UI code in apps yet)
prisma/**
Any other files
```

**Rule:** If I need to touch ANY file outside allowed scope → STOP and ask

---

## 🚨 Critical Rules

### 1. NO INVENTING
```
❌ "I think this color looks good"
✅ "DESIGN_SYSTEM.md Section 3.1 says #FFFFFF"
```

### 2. ASK IF UNCLEAR
```
If doc doesn't have a value I need:
→ DO NOT invent
→ Comment here
→ Wait for Owner
```

### 3. ONE PR PER TASK
```
Each task = separate PR
Title format: feat(ui): [description]
Branch format: ui/s3.8-01-tokens
```

### 4. EXACT VALUES ONLY
```
All colors from DESIGN_SYSTEM.md Section 3
All copy from Brand Voice Doc Sections 3-11
All sizes from DESIGN_SYSTEM.md Sections 4, 5, 8
```

---

## ✅ Verification Checklist

### Documentation Understanding
- [x] Read DESIGN_SYSTEM.md completely
- [x] Read Brand Voice Doc completely
- [x] Understand mono color system
- [x] Understand no-border design
- [x] Understand Nasneh terminology
- [x] Understand copy token structure

### File Paths Confirmed
- [x] tokens.css → `packages/ui/src/styles/tokens.css`
- [x] Copy tokens → `packages/ui/src/copy/*.ts`
- [x] Fonts → `packages/ui/src/fonts/vazirmatn/`
- [x] UI_LAW.md → `docs/SPECS/UI_LAW.md`
- [x] BRAND_VOICE.md → `docs/SPECS/BRAND_VOICE.md`
- [x] COMPONENT_SPECS.md → `docs/SPECS/COMPONENT_SPECS.md`
- [x] CI lint → `.github/workflows/ui-lint.yml`

### Scope Lock Understanding
- [x] Only touch packages/ui/**, docs/**, .github/**
- [x] NO changes to apps/** or prisma/**
- [x] Stop and ask if need to touch other files

### Rules Understanding
- [x] No inventing values
- [x] Ask if unclear
- [x] One PR per task
- [x] Use exact values from docs

---

## 🔍 Gaps & Questions

### No Gaps Found ✅

All required information is present in:
- DESIGN_SYSTEM.md (colors, fonts, spacing, components)
- Brand Voice Doc (copy, terminology, messaging)

**Ready to start S3.8-01 (tokens.css)**

---

## 📝 Execution Plan

### Day 1 (8 SP)
1. S3.8-01: tokens.css (3 SP) - PR #1
2. S3.8-02: Copy tokens (4 SP) - PR #2
3. S3.8-03: Vazirmatn fonts (1 SP) - PR #3

### Day 2 (6 SP)
4. S3.8-04: UI_LAW.md (2 SP) - PR #4
5. S3.8-05: BRAND_VOICE.md (1 SP) - PR #5
6. S3.8-06: COMPONENT_SPECS.md (3 SP) - PR #6

### Day 3 (7 SP)
7. S3.8-07: CI lint rules (3 SP) - PR #7
8. S3.8-08: Docs + CODEOWNERS (2 SP) - PR #8
9. S3.8-09: Audit & Gap Analysis (2 SP) - PR #9

**Total:** 9 PRs, 21 SP

---

## ✅ Ready to Execute

All documentation read ✅
All file paths confirmed ✅
All rules understood ✅
No gaps or conflicts ✅

**Awaiting approval to start S3.8-01**
