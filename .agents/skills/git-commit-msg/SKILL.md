---
name: git-commit-msg
description: Generate a structured Conventional Commit message based on current git diff and status (usage: /git-commit-msg [optional hints]).
---

# Git Commit Message Generator

## Role and Operating Mode
Operate as a senior software engineer in **Planning & Assessment Mode** (agent: plan).
CRITICAL RULES:
- **DO NOT execute `git commit` automatically**.
- **DO NOT output a ready-to-run command** (e.g., `git commit -m ...`). Never include commands to execute.
- Your task is exclusively to inspect changes, draft a high-quality commit message, and return ONLY the proposed commit message.

## Required Context
Before generating the commit message:
1. Read `AGENTS.md` and `MEMORY.md` to ensure alignment with active project conventions (100% English code/comments).
2. Inspect the current working tree state:
   - Check staged changes: `git diff --cached`
   - Check unstaged changes: `git diff`
   - Check overall status: `git status -s`
   - Check recent commit history for style reference: `git log -5 --oneline`

## Safety Verification
Prior to drafting:
- Verify that **NO sensitive files or secrets** are staged or exposed (`.env`, `.env.local`, `credentials/*`, private keys, or tokens).
- If any sensitive file is detected in git status, **STOP IMMEDIATELY AND WARN THE USER** to add them to `.gitignore` or unstage them (`git reset HEAD <file>`).

## Invocation Parameters
- **Optional Context or Hints:** $ARGUMENTS (e.g. issue ID, specific scope, or emphasis requested by the user)

## Commit Message Format (Conventional Commits)
Draft the message following the **Conventional Commits v1.0.0** specification:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### 1. Types
- `feat`: A new user-facing feature or capability.
- `fix`: A bug fix or error resolution.
- `chore`: Maintenance tasks, dependencies, build scripts, or tooling setup.
- `docs`: Documentation only changes (`README.md`, `AGENTS.md`, `MEMORY.md`, specs).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding or correcting automated tests.
- `perf`: Performance optimizations.
- `style`: Formatting, whitespace, semicolon corrections (no code logic changes).

### 2. Subject Line
- Imperative mood, lowercase start, no trailing period (e.g., `add google oauth loopback server`).
- Maximum 72 characters.
- Specific and descriptive.

### 3. Body (Required for non-trivial changes)
- Bulleted list explaining **WHAT** changed and **WHY** (motivation).
- Group related file changes logically.

### 4. Footer (Optional)
- Note breaking changes (`BREAKING CHANGE: <explanation>`).
- Reference issues or spec numbers (e.g., `Ref: specs/001-desktop-shell`).

## Output Format
Present exclusively the drafted commit message inside a clean markdown block. Never output a ready-to-run command or shell snippet:

```markdown
### Proposed Commit Message

```gitcommit
<type>(<scope>): <subject>

- <bullet point 1>
- <bullet point 2>
```
```

CRITICAL RULE: Under NO circumstances should you output a "Ready-to-run Command" or bash/git command block. Return ONLY the "### Proposed Commit Message" block above.

---
Arguments received:
$ARGUMENTS
