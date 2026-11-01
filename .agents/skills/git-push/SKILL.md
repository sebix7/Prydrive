---
name: git-push
description: Safely verify unpushed commits, run pre-push quality checks, and push to remote (usage: /git-push [remote] [branch]).
---

# Git Safe Push

## Role and Operating Mode
Operate as a software engineer in **Planning & Assessment Mode** (agent: plan).
CRITICAL RULES:
- **DO NOT execute `git push` automatically without user review**.
- Always verify that all pre-push quality checks (`typecheck`, `test`) pass before proposing a push.
- Verify that **NO sensitive files or secrets** (`.env`, private keys, credential files) are contained in the unpushed commits.
- If there are no unpushed commits, inform the user cleanly and stop.

## Required Context
Before proposing the push:
1. Identify the current active branch: `git branch --show-current`.
2. Determine target remote and branch:
   - Remote: `$1` if provided, otherwise `origin`.
   - Branch: `$2` if provided, otherwise current active branch.
3. Fetch latest remote state: `git fetch <remote> <branch> --quiet`.
4. Inspect unpushed commits:
   - `git log <remote>/<branch>..HEAD --oneline`
   - If the output is empty, report that the branch is up to date with remote and exit.
5. Inspect changed files for sensitive data:
   - `git diff <remote>/<branch>..HEAD --name-only`
   - If any sensitive file (`.env`, `.env.local`, `credentials/*`) is detected, **STOP IMMEDIATELY AND WARN THE USER**.
6. Run quality verification gates:
   - `npm run typecheck`
   - `npm test`
   - If any check fails, **STOP AND ALERT THE USER** to fix issues before pushing.

## Invocation Parameters
- **Remote (Optional):** $1 (defaults to `origin`)
- **Branch (Optional):** $2 (defaults to active branch)

## Working Procedure

### 1. Verification & Inspection
Execute:
```bash
git branch --show-current
git log origin/<current-branch>..HEAD --oneline
npm run typecheck
npm test
```

### 2. Presentation & Confirmation Gate
If checks pass and there are unpushed commits, present the summary to the user:

```markdown
### Push Summary

- **Target:** `<remote>/<branch>`
- **Unpushed Commits (<count>):**
  - `<hash>` <commit subject>
  - `<hash>` <commit subject>

- **Quality Checks:**
  - TypeScript Typecheck: Passed (0 errors)
  - Vitest Test Suite: Passed (45 tests)
  - Security check: No sensitive files detected

#### Command to execute upon confirmation:
```bash
git push <remote> <branch>
```
```

Ask the user:
> *"Would you like to execute `git push <remote> <branch>` now?"*

### 3. Execution (Only After Explicit Approval)
Once the user confirms:
1. Execute: `git push <remote> <branch>`
2. Confirm the push result to the user.
3. Inform the user that GitHub Actions CI (`.github/workflows/ci.yml`) has been triggered on GitHub.

---
Arguments received:
$ARGUMENTS
