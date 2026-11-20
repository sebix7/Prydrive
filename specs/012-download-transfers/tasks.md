# Tasks: Spec 012 — Download Transfers Manager and Row Action Controls

- [x] **T1. Implement Row Download Action Button with event decoupling and clearance.** US-1 (FR-1, FR-2, FR-3.1, FR-11, EC-1)
  - Depends on: None
  - Done when: Every real file and folder row in `FileTableRow.tsx` renders a `26px × 26px` Download Action Button with a 1px structural border (`border-[#C9C6BD] dark:border-[#2C323D]`), surface background (`bg-[#FFFFFF] dark:bg-[#181C23]`), centered `Download` icon, and localized tooltip (`Descargar` / `Download`), placed immediately preceding the details button with `gap-1.5`; row and header trailing padding is set to `pr-16` (64px) to ensure clearance from lateral sidebar toggle chevrons; clicking or double-clicking stops event propagation (`stopPropagation`) without modifying row selection; and the virtual parent row (`ParentNavRow.tsx`) does not render any download button; verified via automated integration tests in `tests/integration/download-flow.test.ts`.
  - Test Scenarios:
    1. *DOM & Swiss Archive Geometry*: Verify that `FileTableRow.tsx` renders a button with `data-testid="item-download-btn"`, `w-[26px]`, `h-[26px]`, `rounded-[4px]`, `w-3.5 h-3.5` `Download` icon, `border-[#C9C6BD]` / `dark:border-[#2C323D]`, `bg-[#FFFFFF]` / `dark:bg-[#181C23]`, and Klein Blue hover accents.
    2. *Action Cluster & Clearance*: Verify that action buttons are grouped with `gap-1.5` and trailing container has `pr-16` padding in `FileTableRow.tsx`, `ParentNavRow.tsx`, and `FileExplorer.tsx` table header.
    3. *Bilingual Native Tooltip*: Verify that `download_tooltip` resolves to `Download` in English and `Descargar` in Spanish, bound to native `title` and `aria-label`.
    4. *Event Decoupling*: Verify that clicking or double-clicking the download button invokes `stopPropagation()`, and Enter/Space triggers `preventDefault()` + `stopPropagation()`, invoking `onDownload` without selecting the row or triggering directory navigation.
    5. *Virtual Parent Row Exclusion*: Verify that `ParentNavRow.tsx` never renders `item-download-btn` or download tooltips.
    6. *FileExplorer Handler Wiring*: Verify that `FileExplorer.tsx` passes an `onDownload` callback down to `FileTableRow`.

- [x] **T2. Implement Main Process sequential streaming pipeline and recursive folder archive zipping.** US-2 (FR-3.2, FR-3.3, FR-3.4, FR-4, NFR-2, NFR-3, EC-2, EC-5, EC-6, EC-10)
  - Depends on: T1
  - Done when: `src/main/operations/download-stream.ts` and `src/main/core/download-queue-manager.ts` implement sequential FIFO download execution (1 active download at a time without concurrency) piping direct byte streams to disk with collision renaming (`resolveNextAvailableFilename`), 0-byte file handling, and recursive folder zipping via `archiver` with partial error resilience (logging skipped files to `_descarga_advertencias.txt`); exposed through strongly typed IPC channels in `download-ipc.ts` and `preload/index.ts`; verified via automated unit tests in `tests/unit/download-helpers.test.ts` and integration tests in `tests/integration/download-flow.test.ts`.
  - Test Scenarios:
    1. *Sequential FIFO Queue Enforcement*: Verify that enqueuing multiple items causes only 1 transfer to transition to `downloading` while others stay in `queued` status, auto-advancing to the next queued item upon transfer completion or cancellation.
    2. *Streaming Direct to Disk & Progress Emission*: Verify that file downloads pipe streams directly to `fs.createWriteStream` reporting incremental transferred byte counts and deterministic progress percentages (0-100%) without buffering in memory.
    3. *0-Byte File Stream Handling (EC-2)*: Verify that downloading a zero-byte file writes an empty file of 0 bytes, immediately flags status as completed, and emits 100% progress.
    4. *Active Stream Cancellation & Disk Cleanup (EC-3)*: Verify that calling `cancelDownload` immediately aborts active streams, closes file descriptors, and cleanly deletes partial files from disk via `unlinkSync`.
    5. *Filename Collision Renaming (EC-6)*: Verify that `resolveNextAvailableFilename` automatically appends an incremental counter `(1)`, `(2)` before the extension when target files already exist in destination folder.
    6. *Recursive Folder Archive Zipping & Error Resilience (FR-4, EC-5, EC-10)*: Verify that directory downloads stream recursive contents into a `.zip` archive via `ZipArchive`, and if individual nested files fail (e.g. permission restriction), skips them and writes `_descarga_advertencias.txt` into the zip archive.
    7. *Preload IPC Security Bridge (NFR-3)*: Verify that `window.api.download` exposes strongly typed methods (`startDownload`, `cancelDownload`, `retryDownload`, `openContainingFolder`, `getSettings`, `setSettings`, `selectDownloadDirectory`, `onProgress`) under strict process isolation.

- [x] **T3. Implement Google Workspace export format selection menu.** US-3 (FR-5, FR-12)
  - Depends on: T1
  - Done when: `resolveWorkspaceExportOptions` in `src/shared/download-helpers.ts` maps Google Docs, Sheets, and Slides MIME types to their standard export formats (PDF/DOCX, XLSX/PDF, PPTX/PDF); and clicking download on a Google Workspace row opens an anchored Swiss Archive `WorkspaceExportMenu.tsx` popover displaying format choices, which enqueues the item in the selected binary export format upon click; verified via automated unit tests in `tests/unit/download-helpers.test.ts` and integration tests in `tests/integration/download-flow.test.ts`.
  - Test Scenarios:
    1. *Document Type Export Options Mapping*: Verify that `resolveWorkspaceExportOptions` returns PDF/DOCX for Docs, XLSX/PDF for Sheets, PPTX/PDF for Slides, and empty array for binary files.
    2. *Swiss Archive Popover Presentation (FR-5, NFR-1)*: Verify that clicking download on a Google Workspace row mounts `WorkspaceExportMenu.tsx` with `data-testid="workspace-export-menu"`, 1px structural borders, and header title `Format` / `Formato` with `[ESC]`.
    3. *Dynamic Boundary Re-Anchoring*: Verify that `calculatePopoverPosition` places the popover adjacent to the row download button without overflowing viewport boundaries.
    4. *Bilingual Localization (FR-12)*: Verify that all menu options and headers display localized labels in English and Spanish (`export_format_pdf`, `export_format_docx`, `export_format_xlsx`, `export_format_pptx`).
    5. *Fluid Dismissal Machine*: Verify that the export menu dismisses on `Escape` keydown, clicking outside (`mousedown`), table scrolling, and folder navigation.
    6. *Export Format Enqueueing*: Verify that selecting a format calls `window.api.download.startDownload` passing the specific `exportMimeType` and closes the menu, returning focus to the row button.

- [x] **T4. Implement Floating Transfer Trigger with resting Drive emblem and hover expansion.** US-4 (FR-6, NFR-1, EC-7)
  - Depends on: T1
  - Done when: `FloatingTransferTrigger.tsx` is rendered at `bottom-3 right-3` of the `FileExplorer` canvas strictly when one or more transfers are active or queued; in resting state, renders as a `40px × 40px` card with Google Drive emblem and a download indicator badge; on mouse hover, expands smoothly to the left to exactly `260px` displaying the actively downloading item's name, animated progress bar, percentage, and queue counter (e.g. `1 de 3`); and automatically hides after a 4-second grace period when all transfers finish or cancel; verified via automated integration tests in `tests/integration/download-flow.test.ts`.
  - Test Scenarios:
    1. *Idle Invisibility & Active Appearance (FR-6.1)*: Verify that `FloatingTransferTrigger` renders `null` when no transfers exist, and mounts immediately at `bottom-3 right-3` inside the `FileExplorer` table canvas wrapper as soon as a download starts.
    2. *Resting 40px × 40px Card Geometry (FR-6.1, NFR-1)*: Verify resting state renders `w-10 h-10` (`40px × 40px`), `rounded-[6px]`, Swiss Archive structural borders (`border-[#C9C6BD]` / `dark:border-[#2C323D]`), centered `GoogleDriveLogo`, and Klein Blue downward arrow badge.
    3. *Leftward Hover Expansion to 260px (FR-6.2)*: Verify that hovering expands the card horizontally to the left to `w-[260px]`, revealing the truncated active filename, live queue index (`1 of 3` / `1 de 3`), percentage, and animated progress bar (`bg-[#1B44E8]` / `dark:bg-[#3B66FF]`).
    4. *4-Second Completion Grace Period & Modal Freeze (FR-6.3, FR-8)*: Verify that once all transfers complete, the badge switches to emerald check and auto-hides after `FLOATING_TRIGGER_GRACE_MS` (4000ms), while setting `isModalOpen={true}` freezes the auto-hide timer.
    5. *Rapid Click Queue Upserts & IPC Sync (EC-7)*: Verify `DownloadContext` subscribes to `window.api.download.onProgress` and immutably upserts transfers via `upsertTransferItem` without duplicates or progress regression.
    6. *Sidebar Collapse/Expand Repositioning*: Verify that because the trigger is anchored `absolute bottom-3 right-3` inside the `FileExplorer` canvas wrapper, expanding or collapsing the right telemetry sidebar smoothly moves the widget alongside the explorer boundary.

- [ ] **T5. Implement centered Download Queue Modal with full lifecycle controls.** US-5 (FR-7, FR-8, FR-9, EC-3, EC-4, EC-8, EC-12)
  - Depends on: T4
  - Done when: Clicking the floating transfer trigger opens `DownloadQueueModal.tsx` in a centered Swiss Archive dialog with technical strip `[ESC]`, displaying active, queued, completed, and failed transfers with live progress indicators; provides individual action buttons to Cancel active downloads, Retry failed downloads, and Open containing folder (`Mostrar en carpeta`) via `shell.showItemInFolder`; provides a global Clear Completed action; freezes the 4-second auto-hide grace period while open; and closes upon `Escape`, clicking `[ESC]`, or clicking outside; verified via automated integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T6. Implement configurable default download directory in MenuBar settings.** US-6 (FR-10, NFR-3, EC-11)
  - Depends on: T5
  - Done when: `MenuBar.tsx` renders a Settings button (`Settings` icon) between Theme and About in the top utility cluster; clicking it opens `DownloadSettingsModal.tsx` displaying the current default download path in monospace text; allows users to examine and change the destination directory via native OS folder picker (`dialog.showOpenDialog`) or reset to system `Downloads`; persisted via `download-settings-storage.ts` in `userData`; verified via automated integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T7. Implement complete bilingual localization parity for all download and transfer controls.** US-7 (FR-12)
  - Depends on: T6
  - Done when: `src/shared/i18n/translations.ts` defines 100% matched keys across English (`en`) and Spanish (`es`) for all download button tooltips, floating trigger labels, modal headers, progress status strings, export menu options, and settings dialog controls, returning correct localized strings according to active language; verified via automated unit tests in `tests/unit/translations.test.ts`.

- [x] **T8. Implement shared in-memory OAuth2Client caching and invalidation in GoogleAuthClient.** US-8 (FR-13, EC-13, EC-14)
  - Depends on: T2
  - Done when: `src/main/core/google-client.ts` caches and reuses a single authenticated `OAuth2Client` instance in memory keyed by `refreshToken` across `getDriveClient`, `listDirectory`, `fetchStorageQuota`, and `fetchUserProfile` (seeding initial credentials from `exchangeCodeForTokens`); `src/main/index.ts` shares a single `GoogleAuthClient` instance across `AuthIpcController`, `StorageIpcController`, and `DownloadQueueManager`; `src/main/ipc/auth-ipc.ts` clears the cached client on `AUTH_DISCONNECT`; authentication errors (`401` / `invalid_grant`) clear the cached client automatically; and all reuse and invalidation scenarios are verified via automated unit tests in `tests/unit/google-client.test.ts`.
  - Test Scenarios:
    1. *OAuth2Client Reuse Across Operations (FR-13.1)*: Verify `getAuthenticatedClient(refreshToken)` returns the identical `OAuth2Client` reference across repeated calls, allowing `googleapis` to reuse the in-memory `access_token` without extra OAuth token exchanges on every folder click or download.
    2. *Account Switch Isolation (FR-13.2, EC-13)*: Verify calling `getAuthenticatedClient` with a different `refreshToken` immediately replaces the cached client so credentials never leak across accounts.
    3. *Explicit Disconnect Invalidation (FR-13.2)*: Verify `clearCachedClient()` discards the cached client immediately and is invoked by `AuthIpcController` during `AUTH_DISCONNECT` and revoked-session purges.
    4. *Auth Error Auto-Invalidation vs Transient Error Preservation (FR-13.3, EC-14)*: Verify `401` / `invalid_grant` errors clear the cached client for clean re-authentication, whereas transient non-auth errors (e.g. `503`) keep the valid cached client intact.
    5. *Shared Main Process Singleton Wiring*: Verify `src/main/index.ts` constructs one shared `GoogleAuthClient` and injects it into `AuthIpcController`, `StorageIpcController`, and `DownloadQueueManager`.
