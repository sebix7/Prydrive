# Tasks: Spec 004 — Google Drive File and Folder Explorer

- [x] **T1. Implement Google Drive directory listing IPC, pure formatting/sorting helpers, and compact file table presentation.** US-1 (FR-1, FR-2, FR-3, FR-5, NFR-1, NFR-2, EC-1, EC-2, EC-3)
  - Depends on: None
  - Done when: The system fetches active root directory items (`trashed = false`) via `storage:list-directory` IPC, maps them to provider-agnostic `StorageItem` models, sorts folders ahead of files alphabetically, formats creation dates in local time (`DD/MM/YYYY HH:mm:ss`) and sizes in human-readable units (including Workspace document quota sizes), and renders them in a compact table list with Type Icon, Name, Creation Date, and Size columns. Verified via unit tests in `tests/unit/explorer-helpers.test.ts` and IPC integration tests in `tests/integration/explorer-flow.test.ts`.

- [x] **T2. Implement interactive folder navigation on double-click and parent directory ascension via the top "..." entry.** US-2 (FR-6, FR-8, FR-9, FR-10, EC-4)
  - Depends on: T1
  - Done when: Double-clicking a folder navigates inside it and pushes it onto the folder history stack; while inside any subfolder, a virtual `"..."` row with a folder icon is rendered at the very top of the table (hidden at root `"My Drive"`), and double-clicking `"..."` ascends one level to the immediate parent folder. Verified via unit tests in `tests/unit/explorer-helpers.test.ts` and integration tests in `tests/integration/explorer-flow.test.ts`.

- [x] **T3. Implement single-click row selection highlighting, no-op file double-click safety, and unified navigation rail access across Prydrive and Google Drive buttons.** US-3 (FR-4, FR-7, FR-11, EC-5)
  - Depends on: T1, T2
  - Done when: Single-clicking any file or folder row highlights it as the selected item; navigating into a folder or ascending via `"..."` clears the active selection; double-clicking regular files or shortcuts performs a safe no-op; and selecting either the "Prydrive" or "Google Drive" button in the left navigation rail displays the synchronized Google Drive file explorer in the central canvas. Verified via automated unit tests in `tests/unit/use-drive-explorer.test.ts`.

- [x] **T4. Implement the persistent bottom status bar displaying real folder/file counts, aggregate file size, and manual directory refresh.** US-4 (FR-12, FR-13, NFR-3)
  - Depends on: T1, T2
  - Done when: A persistent bottom status bar is rendered inside the central workspace displaying the exact count of real folders and files (strictly excluding the virtual `"..."` parent row), the formatted aggregate file size of all files in the current directory, and a functional refresh button that re-fetches and updates the current folder's contents on demand. Verified via unit tests in `tests/unit/explorer-helpers.test.ts` and integration tests in `tests/integration/explorer-flow.test.ts`.

- [x] **T5. Implement empty directory states ("Carpeta vacía"), loading skeletons, incremental scroll pagination, and error resilience with retry.** US-5 (FR-14, FR-15, FR-16, FR-17, EC-6)
  - Depends on: T1, T2, T4
  - Done when: Empty directories render the centered "Carpeta vacía" / "Empty folder" state while preserving the top `"..."` row in subfolders; initial fetches render loading skeletons; scrolling toward the bottom automatically fetches and appends subsequent pages via `pageToken`; and network/API errors render a resilient error banner with a functional retry action without losing navigation history. Verified via integration tests in `tests/integration/explorer-flow.test.ts`.

- [ ] **T6. Implement full bilingual localization parity (English and Spanish) for all explorer headers, status bar metrics, empty states, and tooltips.** US-6 (FR-18)
  - Depends on: T1, T2, T4, T5
  - Done when: All explorer translation keys (`explorer_col_type`, `explorer_col_name`, `explorer_col_created`, `explorer_col_size`, `explorer_parent_folder`, `explorer_empty_folder`, `explorer_refresh`, `explorer_status_counts`, `explorer_status_total_size`, `explorer_loading`, `explorer_error_title`, `explorer_retry`) are defined in both English and Spanish with 100% key parity and dynamically update all visible UI strings when toggling languages. Verified via unit tests in `tests/unit/translations.test.ts`.
