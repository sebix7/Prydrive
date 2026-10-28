# Project Constitution — Prydrive

1. **The spec rules:** No code is written without an approved spec in `specs/NNN-name/`. The spec is the single source of truth; never assume, invent, or overengineer (YAGNI).
2. **Multi-provider decoupled architecture:** Storage integrations must implement a unified provider interface (`StorageProvider`). Provider SDKs and native I/O run strictly in the Main Process; the Renderer communicates solely via typed IPC using provider-agnostic contracts.
3. **Stack simplicity:** Confined strictly to Electron, Vite, React, Tailwind CSS, and approved provider SDKs. No additional heavy frameworks or dependencies without prior technical justification and approval.
4. **Testing policy (Zero Red Tests):** Strict TDD cycle (test first in red, minimal code in green). Forbidden to advance to the next task with failing tests in the test suite.
5. **Security and streaming integrity:** Provider credentials and session tokens must be encrypted on disk via OS `safeStorage`. File transfers must stream directly to disk without loading files into memory buffers.
6. **Language and conventions:** 100% English across all code, comments, commits, and technical documentation. User-facing GUI strings adhere to the spec language.
