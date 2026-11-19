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

- [ ] **T3. Implement Google Workspace export format selection menu.** US-3 (FR-5, FR-12)
  - Depends on: T1
  - Done when: `resolveWorkspaceExportOptions` in `src/shared/download-helpers.ts` maps Google Docs, Sheets, and Slides MIME types to their standard export formats (PDF/DOCX, XLSX/PDF, PPTX/PDF); and clicking download on a Google Workspace row opens an anchored Swiss Archive `WorkspaceExportMenu.tsx` popover displaying format choices, which enqueues the item in the selected binary export format upon click; verified via automated unit tests in `tests/unit/download-helpers.test.ts` and integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T4. Implement Floating Transfer Trigger with resting Drive emblem and hover expansion.** US-4 (FR-6, NFR-1, EC-7)
  - Depends on: T1
  - Done when: `FloatingTransferTrigger.tsx` is rendered at `bottom-3 right-3` of the `FileExplorer` canvas strictly when one or more transfers are active or queued; in resting state, renders as a `40px × 40px` card with Google Drive emblem and a download indicator badge; on mouse hover, expands smoothly to the left to exactly `260px` displaying the actively downloading item's name, animated progress bar, percentage, and queue counter (e.g. `1 de 3`); and automatically hides after a 4-second grace period when all transfers finish or cancel; verified via automated integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T5. Implement centered Download Queue Modal with full lifecycle controls.** US-5 (FR-7, FR-8, FR-9, EC-3, EC-4, EC-8, EC-12)
  - Depends on: T4
  - Done when: Clicking the floating transfer trigger opens `DownloadQueueModal.tsx` in a centered Swiss Archive dialog with technical strip `[ESC]`, displaying active, queued, completed, and failed transfers with live progress indicators; provides individual action buttons to Cancel active downloads, Retry failed downloads, and Open containing folder (`Mostrar en carpeta`) via `shell.showItemInFolder`; provides a global Clear Completed action; freezes the 4-second auto-hide grace period while open; and closes upon `Escape`, clicking `[ESC]`, or clicking outside; verified via automated integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T6. Implement configurable default download directory in MenuBar settings.** US-6 (FR-10, NFR-3, EC-11)
  - Depends on: T5
  - Done when: `MenuBar.tsx` renders a Settings button (`Settings` icon) between Theme and About in the top utility cluster; clicking it opens `DownloadSettingsModal.tsx` displaying the current default download path in monospace text; allows users to examine and change the destination directory via native OS folder picker (`dialog.showOpenDialog`) or reset to system `Downloads`; persisted via `download-settings-storage.ts` in `userData`; verified via automated integration tests in `tests/integration/download-flow.test.ts`.

- [ ] **T7. Implement complete bilingual localization parity for all download and transfer controls.** US-7 (FR-12)
  - Depends on: T6
  - Done when: `src/shared/i18n/translations.ts` defines 100% matched keys across English (`en`) and Spanish (`es`) for all download button tooltips, floating trigger labels, modal headers, progress status strings, export menu options, and settings dialog controls, returning correct localized strings according to active language; verified via automated unit tests in `tests/unit/translations.test.ts`.
