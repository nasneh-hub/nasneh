# Documentation Automation

This folder contains GitHub Actions workflows and templates for automatic documentation updates.

## Installation

After merging this PR, manually move the files to their correct locations:

```bash
# Move PR template
cp docs/automation/PULL_REQUEST_TEMPLATE.md .github/

# Move workflows
cp docs/automation/workflows/*.yml .github/workflows/

# Commit the changes
git add .github/
git commit -m "ci(automation): install documentation automation workflows"
git push
```

## Components

### 1. PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)

Provides a structured format for PR descriptions with checkboxes for type, scope, and testing.

### 2. PR Title Validator (`.github/workflows/pr-title-check.yml`)

Validates that PR titles follow conventional commit format.

**Format:** `type(scope): description`

**Valid Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `refactor` — Code refactoring
- `test` — Tests
- `chore` — Maintenance
- `ci` — CI/CD
- `perf` — Performance

**Valid Scopes:**
- `auth`, `api`, `payments`, `orders`, `bookings`, `services`
- `users`, `cart`, `reviews`, `ui`, `infra`, `docs`
- `governance`, `deps`, `db`, `docker`, `cd`, `ci`, `memory`, `automation`

### 3. Auto Changelog (`.github/workflows/auto-changelog.yml`)

Automatically updates `docs/CHANGELOG.md` when PRs are merged.

**Trigger:** PR merge to main  
**Action:** Adds entry under `[Unreleased]` section, categorized by type

### 4. Auto Timeline (`.github/workflows/auto-timeline.yml`)

Automatically updates `docs/MEMORY/PROJECT_TIMELINE.md` when PRs are merged.

**Trigger:** PR merge to main  
**Action:** Adds entry with timestamp, event, PR link, and author

## After Installation

Once installed, the automation will:

1. **Validate PR titles** — Reject PRs with invalid titles
2. **Auto-update CHANGELOG** — Add entries on merge
3. **Auto-update TIMELINE** — Add entries on merge

No more manual documentation updates required!

## Troubleshooting

If workflows don't trigger:
1. Check that files are in `.github/workflows/` (not `docs/automation/workflows/`)
2. Verify workflow syntax with `act` or GitHub's workflow editor
3. Check Actions tab for error logs

## Why This Folder?

GitHub App tokens don't have permission to create workflow files directly. This folder serves as a staging area for the automation files, which must be manually moved to `.github/` after the PR is merged.
