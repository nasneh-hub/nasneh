# Manus Prompt Template

Copy and use this prompt at the start of every new conversation with Manus.

---

## Standard Prompt (Copy This)

```
## Project: Nasneh v2 - Bahrain Marketplace

## Your Memory (READ FIRST):
GitHub Repo: https://github.com/[username]/nasneh/tree/main/docs

Start by reading in this order:
1. docs/00_START_HERE.md
2. docs/PRD_MASTER.md
3. docs/TECHNICAL_SPEC.md
4. docs/DESIGN_SYSTEM.md

## Project Context:
- Multi-category marketplace (Products + Services)
- Region: Bahrain
- Currency: BHD (3 decimals)
- Language: Arabic + English (RTL)

## Tech Stack:
- Frontend: Next.js 14+, TypeScript, Tailwind, Shadcn UI
- Backend: Node.js, Express, Prisma, PostgreSQL
- Infrastructure: AWS (Bahrain region)
- Payments: Amazon Payment Services (APS)

## Design Rules (CRITICAL):
- Font: Vazirmatn ONLY
- Colors: Mono (Black/White/Gray) + semantic for status
- Borders: NEVER use borders
- Radius: 12px (rounded-xl) everywhere
- Components: From /core/ui/ ONLY

## Rules:
- Follow documentation exactly
- Don't assume anything not written
- Ask if unclear
- Update ClickUp task status
- Commit code to GitHub

## Current Task:
[Describe your specific task here]

## Expected Output:
[Describe what you expect Manus to deliver]
```

---

## Example: Starting Sprint 1

```
## Project: Nasneh v2 - Bahrain Marketplace

## Your Memory (READ FIRST):
GitHub Repo: https://github.com/sayedmustafa/nasneh/tree/main/docs

Start by reading:
1. docs/00_START_HERE.md
2. docs/PRD_MASTER.md
3. docs/TECHNICAL_SPEC.md
4. docs/DESIGN_SYSTEM.md

## Current Sprint: Sprint 1 - Foundation

## Current Task:
Set up the Monorepo structure with all folders and initial configuration.

## Expected Output:
1. GitHub repo with Monorepo structure
2. All folders created (apps/, packages/, docs/)
3. Basic Next.js setup in apps/web-customer
4. Basic Express setup in apps/api
5. Shared UI package initialized
6. README with setup instructions

## Acceptance Criteria:
- [ ] Monorepo structure matches TECHNICAL_SPEC.md
- [ ] pnpm install works without errors
- [ ] pnpm dev starts both frontend and backend
- [ ] TypeScript configured properly
- [ ] ESLint and Prettier configured
```

---

## Example: Building a Component

```
## Project: Nasneh v2 - Bahrain Marketplace

## Your Memory (READ FIRST):
GitHub Repo: https://github.com/sayedmustafa/nasneh/tree/main/docs

Read: docs/DESIGN_SYSTEM.md (focus on Section 8: Components)

## Current Task:
Build the Button component for /core/ui/

## Requirements:
- Variants: default, secondary, ghost, destructive
- Sizes: xs (32px), sm (40px), md (48px), lg (56px)
- Border radius: rounded-xl (12px)
- NO borders
- Hover: background color change
- Focus: ring-2 ring-black

## Expected Output:
- File: packages/ui/button.tsx
- Follows Design System exactly
- TypeScript with proper types
- Exported from packages/ui/index.ts

## Acceptance Criteria:
- [ ] All variants work correctly
- [ ] All sizes work correctly
- [ ] No borders used
- [ ] rounded-xl applied
- [ ] Hover states work
- [ ] Focus states use ring (not border)
```

---

## Tips for Better Results

1. **Be specific** - Don't say "build the UI", say "build the Login page"
2. **Include acceptance criteria** - Clear checklist of what success looks like
3. **Reference documents** - Point to specific sections in docs
4. **One task at a time** - Don't ask for multiple unrelated things
5. **Check before proceeding** - Ask Manus to confirm understanding

---

## When Manus Delivers

After Manus completes a task:

1. **Review the output** against acceptance criteria
2. **Test the code** if applicable
3. **Provide feedback** if changes needed
4. **Approve** if everything is correct
5. **Move to next task**

---

**Remember:** Good prompts = Good results


---

## Hard Rules for Deployment/DevOps Tasks

These rules are **MANDATORY** for any deployment, infrastructure, or CI/CD work.

### 1. Log-First Rule

**Before proposing ANY fix:**
1. Check CloudWatch logs for the failing ECS task
2. Check GitHub Actions logs for the failing step
3. Extract the **exact error message** (copy/paste, not paraphrase)
4. Only then propose a fix based on evidence

**Violation:** Proposing fixes based on assumptions without log evidence.

### 2. One PR at a Time

- Create ONE PR with ONE focused fix
- Wait for CI to pass
- Wait for user to trigger deployment
- Verify result before proposing next fix

**Violation:** Creating multiple PRs or "trying different approaches" in parallel.

### 3. No "Try Multiple Strategies"

- Do NOT propose "let's try A, if that fails we'll try B"
- Each fix must be based on verified evidence
- If unsure, ask user for guidance

**Violation:** Experimental PRs without clear evidence-based rationale.

### 4. No Claims Without Output

- Do NOT say "monitoring..." unless you can paste actual output
- Do NOT say "checking..." unless you show the command and result
- Always provide evidence for claims

**Violation:** Vague status updates without concrete evidence.

### 5. Always Update PROJECT_STATUS

After EVERY deployment run (success or failure):
1. Update `docs/PROJECT_STATUS.md` with current state
2. Include: run ID, status, error (if any), next action

**Violation:** Leaving PROJECT_STATUS outdated after runs.

### 6. deploy=false First

- Always run CD with `deploy=false` first
- Verify image builds and passes verification tests
- Only then request `deploy=true`

**Violation:** Running `deploy=true` without prior verification.

### 7. Memory Freeze Protocol

When deployment is stuck after multiple failed attempts:
1. STOP all PRs
2. Update docs with verified facts only
3. Wait for user-approved fix plan
4. Do NOT propose fixes until approved

**Violation:** Continuing to create PRs after being asked to stop.

---

**Last updated:** 2026-01-02 18:45 UTC+3
