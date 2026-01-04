# Documentation & Repository Automation

This folder contains GitHub Actions workflows and configurations for automatic repository management.

## Prerequisites

Before installing these workflows, you need:

1. **GitHub App** with `Contents: Read and write` permission
2. **Repository Variable:** `APP_ID` (the App's ID)
3. **Repository Secret:** `APP_PRIVATE_KEY` (the App's private key)
4. **Ruleset Bypass:** Add the GitHub App to the bypass list for the `main` branch

## Files Overview

### Core Automation

| File | Purpose | Trigger |
|------|---------|---------|
| `PULL_REQUEST_TEMPLATE.md` | Structured PR descriptions | On PR creation |
| `workflows/pr-title-check.yml` | Validates PR titles follow conventional commits | On PR open/edit |
| `workflows/auto-docs.yml` | Auto-updates CHANGELOG.md and PROJECT_TIMELINE.md | On PR merge |

### Phase 6 Automation

| File | Purpose | Trigger |
|------|---------|---------|
| `dependabot.yml` | Auto-creates PRs for dependency updates | Weekly (Monday 9AM) |
| `workflows/release-notes.yml` | Generates release notes on new tags | On tag push (v*.*.*) |
| `labeler.yml` | Configuration for auto-labeling PRs | Used by labeler.yml workflow |
| `workflows/labeler.yml` | Auto-labels PRs based on files changed | On PR open/sync |
| `workflows/stale.yml` | Marks and closes stale issues/PRs | Daily (9AM) |
| `workflows/pr-size.yml` | Warns about large PRs | On PR open/sync |

## Installation

After merging this PR, manually copy the files to `.github/`:

```bash
# Pull latest changes
git checkout main && git pull

# Copy all configuration files
cp docs/automation/dependabot.yml .github/
cp docs/automation/labeler.yml .github/
cp docs/automation/PULL_REQUEST_TEMPLATE.md .github/

# Copy all workflows
cp docs/automation/workflows/*.yml .github/workflows/

# Commit and push
git add .github/
git commit -m "ci(automation): install Phase 6 automation (dependabot, labels, stale, size check)"
git push
```

## Workflow Details

### 1. Dependabot (`dependabot.yml`)

Automatically creates PRs to update dependencies:

| Ecosystem | Schedule | Limit |
|-----------|----------|-------|
| npm | Weekly (Monday 9AM) | 10 PRs |
| GitHub Actions | Weekly (Monday 9AM) | 5 PRs |
| Docker | Weekly (Monday 9AM) | 3 PRs |

Dependencies are grouped to reduce PR noise:
- Production dependencies (minor/patch)
- Dev dependencies (minor/patch)

### 2. Auto Release Notes (`release-notes.yml`)

Generates release notes when you create a new tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will:
- Parse commits since last tag
- Group by type (features, fixes, docs, etc.)
- List contributors
- Create GitHub Release with notes

### 3. Auto Label PRs (`labeler.yml`)

Automatically adds labels based on files changed:

| Label | Files |
|-------|-------|
| `api` | `apps/api/**` |
| `web` | `apps/web/**` |
| `documentation` | `docs/**`, `*.md` |
| `ci/cd` | `.github/**`, `Dockerfile*` |
| `database` | `**/prisma/**`, `**/migrations/**` |
| `auth` | `**/auth/**` |
| `payments` | `**/payments/**` |
| `tests` | `**/*.test.ts`, `**/*.spec.ts` |

Also adds size labels: `size/XS`, `size/S`, `size/M`, `size/L`, `size/XL`

### 4. Stale Bot (`stale.yml`)

Marks and closes inactive issues/PRs:

| Type | Stale After | Close After | Exempt Labels |
|------|-------------|-------------|---------------|
| Issues | 30 days | 7 days | pinned, security, bug, P0, P1 |
| PRs | 21 days | 14 days | pinned, security, P0, P1, blocked |

### 5. PR Size Check (`pr-size.yml`)

Warns when PRs are too large:

| Size | Lines | Status |
|------|-------|--------|
| XS | ≤10 | 🟢 Great |
| S | ≤100 | 🟢 Great |
| M | ≤500 | 🟡 Good |
| L | ≤1000 | 🟠 Consider splitting |
| XL | >1000 | 🔴 Warning comment |

Lock files (pnpm-lock.yaml, etc.) are excluded from the count.

## GitHub App Token

Workflows that need to push to `main` use `actions/create-github-app-token@v2` to generate tokens that:
- Have scoped permissions (only what's needed)
- Can bypass branch protection rules
- Create commits attributed to the App bot user
