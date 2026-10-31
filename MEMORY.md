# MEMORY.md

Project memory across sessions. Maximum ~50 lines: summarize or prune obsolete info.

## Current Status
- General architecture and standards consolidated in `AGENTS.md`.
- Project Constitution defined and approved in `docs/constitution.md` (6 non-negotiable principles).
- SDD methodology and Git workflow skills (`git-commit-msg`, `git-pr-msg`) active in `.agents/skills/`.
- `specs/001-auth-google/` T1, T2 & T3 completed (US-1: login/safeStorage, US-2: modal/cancel/timeout, US-3: silent restore & offline handling).
- Next step: Implement T4 via `/sdd-implement 001-auth-google T4`.

## Decisions (and why)
- **Multi-provider decoupled architecture (`StorageProvider`)**: Unified adapter pattern allowing future cloud hosting providers beyond Google Drive without refactoring UI or core controllers.
- **Electron + React + Tailwind + Vite**: Native performance, stream handling, and visual UI with Drag & Drop.
- **Exclusive Google Sign-In (OAuth 2.0 Desktop / RFC 8252 Loopback)**: Replaces Service Accounts with a single "Sign in with Google" button. Opens OS default browser, receives token via local loopback, and refreshes silently.
- **Git workflow skills (`git-commit-msg`, `git-pr-msg`)**: Standardizes Conventional Commits and PR templates with human review gates.
- **Zero cost and scalability**: Google Drive API and OAuth are free ($0). Each user uses their own Google quota and storage.
- **Local encryption with `safeStorage`**: Refresh tokens are stored encrypted using the OS keychain (DPAPI / Keychain), never in plain text.
- **Electron security**: `contextIsolation: true`, `nodeIntegration: false`, strongly typed IPC channels.
- **100% English for code and comments**: Variables, functions, types, commits, and comments are strictly written in English.
- **SDD methodology**: Nothing is coded without an approved spec, technical plan, and atomic TDD tasks.
- **1:1 User Story to Task mapping & dependencies (`sdd-tasks`)**: In `tasks.md`, each task fulfills exactly one User Story ($N$ stories = $N$ tasks) as a vertical slice, declaring `Depends on:` to enforce execution order.

## Learnings and errors to avoid
- Do not use embedded WebViews for Google login; Google blocks them for security. Always use the system default browser with an ephemeral loopback server.
- For mass production distribution, request free Google OAuth Consent Screen verification to eliminate the "Unverified App" warning.
- Never import Node.js modules (`fs`, `googleapis`) directly into React renderer code.
