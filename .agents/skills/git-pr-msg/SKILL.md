---
name: git-pr-msg
description: Generate a structured Pull Request title and description based on branch diff and commits (usage: /git-pr-msg [target-base-branch]).
---

# Pull Request Message Generator

## Role and Operating Mode
Operate as a lead engineer in **Planning & Assessment Mode** (agent: plan).
CRITICAL RULE: **DO NOT submit or create the PR automatically**. Your task is exclusively to inspect branch changes against the base branch, formulate a complete, structured PR description, and present it for user review.

## Required Context
Before generating the PR description:
1. Identify current active branch: `git rev-parse --abbrev-ref HEAD`.
2. Determine target base branch:
   - Use `$1` if provided (e.g. `main`, `master`, `develop`).
   - Otherwise check for `origin/main` or `origin/master` (or local `main`/`master`).
3. Inspect commits on the current branch not present in the base branch:
   - `git log <base>..HEAD --oneline`
4. Inspect diff summary and impacted files:
   - `git diff <base>...HEAD --stat`
5. Check if any SDD spec in `specs/` corresponds to this work.

## Invocation Parameters
- **Target Base Branch (Optional):** $1 (defaults to `main` or `master`)
- **Additional Hints or PR Notes:** $ARGUMENTS (text following base branch)

## Standard PR Template
Synthesize the branch changes into the following structured format:

```markdown
## Title
<type>(<scope>): <concise high-level summary of the PR>

## Summary & Context
A concise paragraph explaining the motivation, problem solved, and overall design of the changes.

## Key Changes
Grouped by component or architectural layer:
- **Component / Module A**:
  - Detailed bullet point of what was added, modified, or removed.
- **Component / Module B**:
  - Detailed bullet point of architectural changes or integrations.

## Traceability
- **Spec / Feature**: Ref to `specs/NNN-feature-name/` or related issue/ticket.

## Verification & Testing
- [x] Unit / automated tests executed and passing.
- [x] Typecheck passed (`pnpm run typecheck`).
- [x] Linter passed (`pnpm run lint`).
- Manual verification steps performed:
  - Step 1: <Description of manual check>
  - Step 2: <Observed expected behavior>

## Checklist
- [x] Code and comments are 100% in English.
- [x] No sensitive files, credentials, or tokens are committed.
- [x] Documentation (`AGENTS.md`, `MEMORY.md`, specs) updated accordingly.
```

## Presentation & Review Gate
1. Present the complete PR draft inside a markdown preview block.
2. Provide the ready-to-run GitHub CLI command (if the user has `gh` CLI installed):
   ```bash
   gh pr create --title "<title>" --body "<body-text>"
   ```
3. Ask the user:
   > *"Would you like to refine any section of this Pull Request description, or is it ready to publish?"*

---
Arguments received:
$ARGUMENTS
