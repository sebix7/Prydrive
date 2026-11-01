---
name: git-release
description: Automate SemVer release lifecycle: dry-run inspection, version bump, changelog update, and tagged push (usage: /git-release [first|patch|minor|major|dry-run]).
---

# Git Release Manager

## Role and Operating Mode
Operate as a release manager in **Planning & Assessment Mode** (agent: plan).
CRITICAL RULES:
- **DO NOT execute the real release command or `git push --follow-tags` automatically**.
- Always run and present a **`--dry-run` preview first** showing the version bump and `CHANGELOG.md` changes.
- Never trigger a release if there are uncommitted changes or if `typecheck` / `test` fail.
- Always require explicit user confirmation before executing the real release.

## Required Context
Before generating the release preview:
1. Verify active branch: `git branch --show-current`. Releases should normally be performed on `main`.
2. Inspect working tree status: `git status --porcelain`.
   - If there are uncommitted changes, **STOP IMMEDIATELY AND WARN THE USER** to commit them first (suggesting `/git-commit-msg`).
3. Check existing git tags: `git tag`.
   - If no tags exist in the repository, default to the baseline release (`pnpm run release:first`) to establish `v0.1.0`.
4. Verify code quality gates:
   - Run `pnpm run typecheck`
   - Run `pnpm test`
   - If any test or typecheck fails, **STOP AND REPORT THE ERRORS**.

## Invocation Parameters
- **Target Release Type (Optional):** $1 (`first`, `patch`, `minor`, `major`, or `dry-run`)
  - If omitted:
    - Uses `pnpm run release:first` if no git tags exist.
    - Uses `pnpm run release` (automatic SemVer calculation based on Conventional Commits) if tags exist.
  - If `first`: forces `pnpm run release:first`.
  - If `patch`: forces `pnpm run release:patch`.
  - If `minor`: forces `pnpm run release:minor`.
  - If `major`: forces `pnpm run release:major`.
  - If `dry-run`: runs simulation without proposing execution.

## Working Procedure

### 1. Pre-flight Checks
Run the following checks:
```bash
git branch --show-current
git status --porcelain
git tag
pnpm run typecheck
pnpm test
```

### 2. Dry-Run Simulation
Execute the dry-run command:
```bash
pnpm run <chosen-release-script> -- --dry-run
```
Capture the simulated output:
- Previous version $\rightarrow$ New version
- Generated release notes / CHANGELOG diff
- Proposed git tag name (e.g. `v0.1.0` or `v0.2.0`)

### 3. Presentation & Confirmation Gate
Present the release preview clearly to the user:

```markdown
### Release Preview

- **Current Version:** `<current-version>`
- **Target Version:** `<new-version>`
- **Tag:** `<tag-name>`
- **Release Command:** `pnpm run <chosen-release-script>`

#### Changelog Preview
```markdown
<simulated-changelog-content>
```

#### Commands to be executed upon confirmation:
1. `pnpm run <chosen-release-script>`
2. `git push --follow-tags origin <current-branch>`
```

Ask the user:
> *"Would you like to execute this release and push tags to remote now?"*

### 4. Execution (Only After Explicit Approval)
Once the user confirms:
1. Execute the release script: `pnpm run <chosen-release-script>`
2. Execute the tagged push: `git push --follow-tags origin <current-branch>`
3. Confirm completion and inform the user that GitHub Actions will automatically publish the GitHub Release via `.github/workflows/release.yml`.

---
Arguments received:
$ARGUMENTS
