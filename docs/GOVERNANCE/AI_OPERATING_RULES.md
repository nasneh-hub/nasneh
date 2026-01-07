# AI Operating Rules

> These rules apply to ALL AI agents working on the Nasneh project.

## The Five Golden Rules

### 1. Read Before You Act
- Always read `docs/00_START_HERE.md` at session start
- Read relevant MEMORY files before making changes
- Never assume - verify in documentation first

### 2. Update Before You Finish
- Every session must end with documentation updates
- Create PR for any documentation changes
- Update MEMORY/PROJECT_TIMELINE.md with session summary

### 3. Never Assume
- If something is not documented, say "Not documented"
- Do not guess or make assumptions
- Ask for clarification when unclear

### 4. Evidence Required
- Every statement needs a source
- Cite PR numbers, commit hashes, or file paths
- Mark unverified information as "⚠️ Unverified"

### 5. Append-Only History
- Never delete from PROJECT_TIMELINE.md
- Only add new entries
- Preserve complete history

---

## Session Protocol

### At Session Start:
1. [ ] Read docs/00_START_HERE.md
2. [ ] Read docs/MEMORY/PROJECT_TIMELINE.md (last 10 entries)
3. [ ] Read docs/MEMORY/MANUS_MEMORY.md (if you are Manus)
4. [ ] Check assigned tasks in ClickUp
5. [ ] Confirm: "Read updates. Ready to work on [task]."

### At Session End:
1. [ ] Update relevant documentation
2. [ ] Add entry to PROJECT_TIMELINE.md
3. [ ] Create PR with all changes
4. [ ] Post session summary on ClickUp task

---

## Documentation Standards

### Language
- All documentation in English
- No Arabic in GitHub files
- Arabic allowed only in chat conversations

### File Naming
- Use UPPER_CASE for main docs (e.g., RUNBOOK.md)
- Use kebab-case for dated files (e.g., audit-2026-01-03.md)
- Include dates in audit/report files

### Commit Messages

type(scope): description

Types: feat, fix, docs, refactor, test, chore
Scope: auth, api, ui, infra, docs, etc.


---

## Prohibited Actions

- ❌ Delete existing documentation without approval
- ❌ Modify historical records (only append)
- ❌ Make assumptions about undocumented features
- ❌ Skip reading required files at session start
- ❌ End session without updating documentation
- ❌ Use Arabic in documentation files

---

## Enforcement

Violations of these rules will be documented in MEMORY/LESSONS_LEARNED.md to prevent recurrence.

---

## API Endpoint Documentation

### Rule: API Inventory and Reference Sync

**When:** When implementing a new API endpoint or completing a sprint.

**Requirements:**
1.  **Evidence-Based Testing:** Test all endpoints on staging environment using `curl` and document actual HTTP status codes.
2.  **Update Inventory:** Document all findings in `docs/AUDITS/API_ROUTE_INVENTORY.md` with evidence (status codes, error messages).
3.  **Update Reference:** Update `docs/SPECS/API_REFERENCE.md` to reflect implemented vs planned endpoints.
4.  **Provide Examples:** Include request/response examples for all new endpoints.
5.  **Verify Against Roadmap:** Cross-check with `docs/SPECS/MASTER_ROADMAP.md` to ensure alignment.

**Rationale:** Ensures API documentation is always accurate, up-to-date, and reflects the actual deployed state. Prevents discrepancies between code and documentation.

---

**Last Updated:** 2026-01-07
**Approved By:** Owner (Sayed Mustafa)
