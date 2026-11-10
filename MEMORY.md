# MEMORY.md

Project memory across sessions. Maximum ~75 lines: summarize or prune obsolete info.

## Current Status
- General architecture and standards consolidated in `AGENTS.md`.
- Project Constitution defined and approved in `docs/constitution.md` (6 non-negotiable principles).
- SDD methodology, Git workflow skills, `frontend-design` skill, and `pnpm` manager active.
- `specs/001-auth-google/` fully implemented (T1-T6 completed: US-1 through US-6).
- GitHub Actions CI (`ci.yml`) and automated SemVer release pipeline (`commit-and-tag-version`, `release.yml`) implemented.
- Baseline release `v0.1.0` published to remote with automated changelog (`CHANGELOG.md`).
- `specs/002-app-shell/` completed and validated (T1-T5: US-1 through US-5).
- Minor release `v0.2.0` published to remote with automated changelog (`CHANGELOG.md`).
- `specs/003-about-links/` released in `v0.2.1`.
- `specs/004-drive-explorer/` completed, validated (`FULFILLED`), and released in `v0.3.0`.
- `specs/005-theme-mode/` completed, validated (`FULFILLED`), and released in `v0.4.0`.
- `specs/006-swiss-archive-ui/` completed, validated (`FULFILLED`), and released in `v0.5.0`.
- `specs/007-folder-tree/` completed (T1-T4: US-1 through US-4 fully implemented). Next phase: `/sdd-validate 007-folder-tree`.

## Decisions (and why)
- **Tailwind content scan of shared code**: `tailwind.config.js` includes `./src/shared/**` so utility classes in shared state reducers (e.g. `.w-0`, `.min-w-0`) are compiled into CSS.
- **Desktop root overflow & fluid canvas**: `html, body, #root` enforce `overflow: hidden` with `min-w-0 flex-1` on canvas to eliminate scrollbars and clipping on window resize.
- **Multi-provider decoupled architecture (`StorageProvider`)**: Unified adapter pattern allowing future cloud hosting providers beyond Google Drive without refactoring UI or core controllers.
- **Electron + React + Tailwind + Vite**: Native performance, stream handling, and visual UI with Drag & Drop.
- **Exclusive Google Sign-In (OAuth 2.0 Desktop / RFC 8252 Loopback)**: Replaces Service Accounts with a single "Sign in with Google" button. Opens OS default browser, receives token via local loopback, and refreshes silently.
- **Git workflow skills (`git-commit-msg`, `git-push`, `git-release`, `git-pr-msg`)**: Standardizes Conventional Commits, pre-push quality checks, PR templates, and SemVer releases with human review gates.
- **CI/CD & SemVer Automation (`commit-and-tag-version` + GitHub Actions)**: Multi-platform verification (Ubuntu/Windows) for PRs/pushes and automated changelog/release generation based on Conventional Commits.
- **Zero cost and scalability**: Google Drive API and OAuth are free ($0). Each user uses their own Google quota and storage.
- **Local encryption with `safeStorage`**: Refresh tokens are stored encrypted using the OS keychain (DPAPI / Keychain), never in plain text.
- **Electron security**: `contextIsolation: true`, `nodeIntegration: false`, strongly typed IPC channels.
- **100% English for code and comments**: Variables, functions, types, commits, and comments are strictly written in English.
- **SDD methodology**: Nothing is coded without an approved spec, technical plan, and atomic TDD tasks.
- **1:1 User Story to Task mapping & dependencies (`sdd-tasks`)**: In `tasks.md`, each task fulfills exactly one User Story ($N$ stories = $N$ tasks) as a vertical slice, declaring `Depends on:` to enforce execution order.
- **pnpm package manager**: Replaced npm across the project for ultra-fast installs, content-addressable store deduplication, and deterministic lockfile, with `.npmrc` (`shamefully-hoist=true`) for Electron compatibility.
- **Direct interaction protocol (No skills/commands)**: Explicit instructions/orders permit code modifications; questions/inquiries strictly prohibit code changes (text-only response).

## Learnings and errors to avoid
- Do not use embedded WebViews for Google login; Google blocks them for security. Always use the system default browser with an ephemeral loopback server.
- For mass production distribution, request free Google OAuth Consent Screen verification to eliminate the "Unverified App" warning.
- Never import Node.js modules (`fs`, `googleapis`) directly into React renderer code.
- Spec `Status:` in `spec.md` only uses `draft` or `approved` (remains `approved` after completion; never use `implemented`).
