# Documentation Automation

This folder contains GitHub Actions workflows for automatic documentation updates.

## Prerequisites

Before installing these workflows, you need:

1. **GitHub App** with `Contents: Read and write` permission
2. **Repository Variable:** `APP_ID` (the App's ID)
3. **Repository Secret:** `APP_PRIVATE_KEY` (the App's private key)
4. **Ruleset Bypass:** Add the GitHub App to the bypass list for the `main` branch

## Files

| File | Purpose |
|------|---------|
| `PULL_REQUEST_TEMPLATE.md` | Structured PR descriptions |
| `workflows/pr-title-check.yml` | Validates PR titles follow conventional commits |
| `workflows/auto-docs.yml` | Auto-updates both `docs/CHANGELOG.md` and `docs/MEMORY/PROJECT_TIMELINE.md` on PR merge |
| `workflows/auto-changelog.yml` | (Legacy) Separate changelog workflow |
| `workflows/auto-timeline.yml` | (Legacy) Separate timeline workflow |

## Installation

After merging this PR, manually copy the files to `.github/`:

```bash
# Copy unified workflow (recommended)
cp docs/automation/workflows/auto-docs.yml .github/workflows/

# Remove old separate workflows
rm -f .github/workflows/auto-changelog.yml
rm -f .github/workflows/auto-timeline.yml

# Commit and push
git add .github/
git commit -m "ci(automation): update workflows to use GitHub App token"
git push
```

## How It Works

### Auto Changelog
- Runs when PR is merged to `main`
- Uses GitHub App token to bypass branch protection
- Parses PR title to determine type and description
- Adds entry under `[Unreleased]` section in `docs/CHANGELOG.md`
- Commits with `[skip ci]` to avoid infinite loops

### Auto Timeline
- Runs when PR is merged to `main`
- Uses GitHub App token to bypass branch protection
- Creates date-based entries in `docs/MEMORY/PROJECT_TIMELINE.md`
- Includes timestamp, action, PR link, and author

## GitHub App Token

These workflows use `actions/create-github-app-token@v2` to generate tokens that:
- Have scoped permissions (only what's needed)
- Can bypass branch protection rules
- Create commits attributed to the App bot user
