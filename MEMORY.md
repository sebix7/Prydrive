# MEMORY.md

Project memory across sessions. Maximum ~50 lines: summarize or prune obsolete info.

## Current Status
- General architecture and standards consolidated in `AGENTS.md`.
- Project Constitution defined and approved in `docs/constitution.md` (6 non-negotiable principles).
- SDD methodology and Git workflow skills (`git-commit-msg`, `git-pr-msg`) active in `.agents/skills/`.
- Next step: Draft the first spec via `/sdd-spec 001-desktop-shell` (or storage explorer).

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

## Learnings and errors to avoid
- Do not use embedded WebViews for Google login; Google blocks them for security. Always use the system default browser with an ephemeral loopback server.
- For mass production distribution, request free Google OAuth Consent Screen verification to eliminate the "Unverified App" warning.
- Never import Node.js modules (`fs`, `googleapis`) directly into React renderer code.
