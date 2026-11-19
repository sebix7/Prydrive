# Spec 012 — Download Transfers Manager and Row Action Controls
Status: approved

## Context and Goal
While users can explore Google Drive cloud assets and inspect detailed metadata, downloading files and folders to local disk currently requires manual actions or lacks native streaming visibility. Furthermore, users cannot easily monitor concurrent transfer progress, cancel active downloads, or open downloaded files without navigating away from the workspace.

This specification defines a comprehensive **Download Transfers Manager** for Prydrive. Every real file and folder row receives a dedicated `26px × 26px` **Download Action Button** at its trailing end (alongside the Details button). When downloading begins, a persistent **Floating Transfer Trigger** appears in the bottom-right corner of the explorer canvas: in resting state, it displays a compact Drive icon with a download arrow badge; upon hovering, it expands horizontally to the left as an archival `260px` progress pill displaying the active file name and live progress bar; upon clicking, it opens a centered **Download Queue Modal** with full lifecycle controls (cancel, retry, open containing folder, clear completed). Additionally, a new **Settings Action Button** in the top navigation bar enables users to configure their default local download folder, Google Workspace files provide standard export format choices, and folder downloads automatically stream all contents into an on-the-fly compressed archive.

## Users
- **Desktop File Manager:** An authenticated user who frequently retrieves individual files, workspace documents, and complete directory structures from Google Drive directly to local disk with immediate feedback.
- **Power Downloader:** A user initiating batch or multi-item downloads who requires a centralized queue to inspect progress, cancel stalled operations, or access finished downloads in their local file explorer.

## User Stories
- **US-1 (Row Download Action Button & Clearance):** As an authenticated user, I want every file and folder row in the explorer table to display a compact, accessible download button at its trailing end (alongside the details button with adequate right clearance) so that I can initiate downloads with a single click without selecting rows or opening context menus.
- **US-2 (Folder Archive Streaming Download):** As an authenticated user, I want clicking download on a folder row to recursively retrieve all nested files and subdirectories and save them locally as a compressed archive (`.zip`) with resilience against individual file errors so that directory structures are preserved.
- **US-3 (Google Workspace Export Formats):** As an authenticated user, I want clicking download on a Google Docs, Sheets, or Slides file to open a format menu so that I can choose whether to download it as PDF, Word, Excel, or PowerPoint.
- **US-4 (Floating Transfer Trigger & Hover Expansion):** As an authenticated user, I want a floating widget in the bottom-right corner of the explorer canvas that only appears when downloads are active or in queue, shows a compact Drive icon in resting state, and expands horizontally to the left on hover (`260px`) showing the active item's name and progress bar so that I have subtle, non-intrusive transfer awareness.
- **US-5 (Centered Download Queue Modal):** As a user, I want clicking the floating transfer widget to open a Swiss Archive modal listing all active, queued, completed, and failed downloads with individual control actions (cancel, retry, open folder) and a clear completed action, pausing any auto-hide timers while open.
- **US-6 (Configurable Default Download Directory):** As a user, I want a settings button in the top bar to inspect and modify my default download directory so that files land in my preferred folder without prompting on every download.
- **US-7 (Bilingual Localization Parity):** As an international user, I want all download button tooltips, transfer state badges, progress indicators, modal controls, export menus, and settings dialogs to be fully localized in English (`en`) and Spanish (`es`).

## Definitions
- **Download Action Button:** A `26px × 26px` square button with visible 1px structural border and download icon (`Download`) positioned at the trailing end of every real file and folder row immediately preceding the details button.
- **Floating Transfer Trigger:** A floating UI control anchored to the bottom-right corner of the explorer canvas (`bottom-3 right-3`), visible strictly when one or more transfers are active or queued.
- **Transfer Hover Pill:** An expanded horizontal state of the floating trigger (`260px` width) that slides open to the left on mouse hover, presenting the active filename, percentage, and visual progress bar.
- **Download Queue Modal:** An elevated Swiss Archive modal dialog opened by clicking the floating trigger, providing granular visibility and lifecycle management for all current and recent transfers.
- **Folder Archive Streaming:** The automated process of recursively fetching a cloud directory's hierarchy and streaming its contents into a standard `.zip` file on disk.
- **Sequential Queue:** Execution mode where downloads run strictly one at a time (FIFO); subsequent requests remain in queued status until the active item completes or cancels.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL render a persistent `26px × 26px` Download Action Button with a 1px structural border (`border-[#C9C6BD] dark:border-[#2C323D]`) and surface background (`bg-[#FFFFFF] dark:bg-[#181C23]`) matching top utility controls at the trailing end of each real file and folder row, placed immediately to the left of the Details Action Button, maintaining a combined trailing clearance (`pr-16`, 64px) from the right edge to avoid obstruction by lateral panel toggle chevrons.
- **FR-2:** WHILE hovering over the Download Action Button of any row, THE SYSTEM SHALL visually emphasize the button with Swiss Archive hover border and accent color transitions (`hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#1B44E8] dark:hover:text-[#3B66FF]`) displaying a localized native tooltip (`Descargar` in `es` / `Download` in `en`).
- **FR-3:** WHEN the user clicks or activates the Download Action Button (via `Enter` or `Space` key), THE SYSTEM SHALL:
  1. Prevent event propagation (`stopPropagation`) so that table row selection and double-click navigation states are not altered.
  2. For standard binary files: immediately enqueue the item into the download queue.
  3. Execute transfers strictly sequentially (one active download at a time, without parallel concurrency); subsequent items remain in `queued` status and start automatically when the active transfer completes or is cancelled.
  4. Emit real-time progress events tracking transferred bytes, total size, and completion status.
- **FR-4:** IF the item initiated for download is a folder, THEN THE SYSTEM SHALL recursively traverse all nested subdirectories and files, streaming them into a compressed `.zip` archive named after the folder, saved directly to the user's default download directory.
- **FR-5:** IF the item initiated for download is a Google Workspace proprietary file (Google Docs, Sheets, Slides), THEN clicking the download button SHALL open a compact format export menu anchored to the button:
  1. For Google Docs: options to download as `PDF (.pdf)` or `Word (.docx)`.
  2. For Google Sheets: options to download as `Excel (.xlsx)` or `PDF (.pdf)`.
  3. For Google Slides: options to download as `PowerPoint (.pptx)` or `PDF (.pdf)`.
  4. Upon selecting an export format, the system enqueues the item and exports it in the chosen binary format.
- **FR-6:** WHILE one or more downloads are active or in queue, THE SYSTEM SHALL display a Floating Transfer Trigger in the bottom-right corner of the explorer canvas (`bottom-3 right-3`):
  1. In resting state, THE SYSTEM SHALL render the trigger as a compact geometric card (`40px × 40px`, `rounded-[6px]`) displaying the Google Drive emblem accompanied by a download indicator badge in its bottom-right corner.
  2. WHILE the user hovers over the Floating Transfer Trigger, THE SYSTEM SHALL expand the trigger smoothly to the left into a horizontal transfer pill of exactly `260px` width displaying the actively downloading item's name, visual progress bar, and queue index (e.g. `1 de 3` / `1 of 3`).
  3. WHEN all downloads complete or are cancelled, THE SYSTEM SHALL hide the Floating Transfer Trigger after a 4-second completion grace period, UNLESS the Download Queue Modal is open.
- **FR-7:** WHEN the user clicks the Floating Transfer Trigger, THE SYSTEM SHALL open the centered **Download Queue Modal** displaying:
  1. A technical index header strip (`TRANSFERENCIAS // DESCARGAS` in `es` / `TRANSFERS // DOWNLOADS` in `en`) with a close action `[ESC]`.
  2. A scrollable transfer items list separated into active, queued, completed, and failed entries.
  3. For the active item: filename, localized category, live transfer progress bar, transferred bytes vs total bytes, and a **Cancel** action button.
  4. For queued items: filename, localized category, formatted file size, queue position, and a **Cancel** action button.
  5. For completed items: filename, formatted file size, completion timestamp, and an **Open Containing Folder** action button (`Mostrar en carpeta`).
  6. For failed items: filename, failure error summary, and a **Retry** action button.
  7. A global action to **Clear Completed** transfers from the list.
- **FR-8:** WHILE the Download Queue Modal is open, THE SYSTEM SHALL freeze the 4-second auto-hide grace period, keeping the floating trigger and modal visible until the user closes the modal.
- **FR-9:** THE SYSTEM SHALL close the Download Queue Modal upon pressing `Escape`, clicking the close button in the header strip, or clicking anywhere outside the modal dialog.
- **FR-10:** THE SYSTEM SHALL render a dedicated **Settings Action Button** within the top menu bar utility cluster positioned between Theme and About (`[Refresh] -> [Language] -> [Theme] -> [Settings] -> [About] -> [Disconnect]`) using a `Settings` gear icon (`w-3.5 h-3.5`):
  1. Clicking Settings opens a centered Swiss Archive `DownloadSettingsModal` dialog.
  2. The dialog displays the current default download directory in a selectable monospace input.
  3. The dialog provides an **Examine / Change Folder** button (`Examinar...` / `Browse...`) that opens the native OS directory picker dialog (`dialog.showOpenDialog`) to select a new destination path.
  4. The dialog provides a **Restore Default** button (`Restablecer` / `Reset`) to revert to the system `Downloads` folder.
- **FR-11:** WHILE the user is viewing the virtual parent directory row (`"..."`), THE SYSTEM SHALL NOT render any Download Action Button.
- **FR-12:** THE SYSTEM SHALL ensure all button tooltips, status badges, modal titles, progress text, export menu labels, and folder selection dialogs maintain 100% bilingual parity across English (`en`) and Spanish (`es`).

## Non-Functional Requirements
- **NFR-1 (Archival Visual Alignment):** All newly introduced controls (row download button, floating trigger, expanded hover pill, export menu, queue modal, and settings modal) must strictly adhere to Swiss Archive design tokens (`1px` structural borders, `4px` button radius, `6px` modal/trigger card radius, `#C9C6BD`/`#2C323D` borders, `#FFFFFF`/`#181C23` surfaces, and monospace data typography).
- **NFR-2 (High-Performance Streaming):** File and folder downloads must use native Node.js streams directly writing to local storage (`fs.createWriteStream`) without buffering entire file contents into memory (RAM), preserving responsiveness and 60 FPS table rendering.
- **NFR-3 (Process Isolation & IPC Security):** The renderer process must never perform direct local filesystem I/O. All download orchestration, path management, folder picking, and stream pipelines must execute strictly in the Electron Main process via strongly typed IPC channels.

## Edge Cases
- **EC-1:** Double-clicking the row Download Action Button $\rightarrow$ Event propagation is stopped (`stopPropagation`), preventing accidental folder navigation or selection disruption.
- **EC-2:** Downloading a zero-byte file $\rightarrow$ The download stream creates an empty local file of 0 bytes, immediately flags status as completed, and displays `0 B` in the queue.
- **EC-3:** User cancels an active download $\rightarrow$ The download stream is immediately aborted, open file descriptors are closed, partial files on disk are cleaned up, and status is updated to cancelled.
- **EC-4:** Network disconnection during a download stream $\rightarrow$ The item transitions to error state, emits an error status to the renderer, and offers a Retry action button in the queue modal.
- **EC-5:** Downloading an empty Google Drive folder $\rightarrow$ An empty `.zip` archive containing the folder name is created and marked complete.
- **EC-6:** Downloading a file with identical name to an existing local file $\rightarrow$ The system automatically appends an incremental counter (e.g., `archivo (1).txt`) to avoid overwriting existing user data without confirmation.
- **EC-7:** Rapid clicking of row download buttons across multiple items $\rightarrow$ Items are sequentially queued without UI freezing or race conditions, updating the queue counter cleanly.
- **EC-8:** Toggling Theme Mode (`light` $\leftrightarrow$ `dark`) while downloads are in flight or queue modal is open $\rightarrow$ Colors, borders, progress bars, and surfaces update instantaneously without interrupting streams or resetting transfer state.
- **EC-9:** Closing the application window while transfers are in flight $\rightarrow$ The system prompts a native confirmation warning if active downloads exist, or cleanly aborts streams on exit.
- **EC-10:** Partial failure during recursive folder zipping $\rightarrow$ If an individual file fails (e.g. permission error 403), it is skipped, a log entry is written into `_descarga_advertencias.txt` inside the `.zip`, and the archive completes with a warning notice in the queue.
- **EC-11:** Destination directory unavailable or disk full (`ENOSPC`) $\rightarrow$ If destination folder is non-writable or disk runs out of space, the stream halts cleanly, partial files are deleted, and the queue flags the item as failed with an action to modify destination folder.
- **EC-12:** Queue state lifecycle $\rightarrow$ Transfer queue entries are maintained in-memory for the active session and cleanly reset upon application restart.

## Out of Scope
- File upload transfers (deferred to a subsequent dedicated specification).
- Pausing and resuming interrupted download streams across application restarts.
- Bandwidth throttling or rate-limiting download speeds.
- Peer-to-peer or LAN transfer sharing.

## Completion Criteria
- Each real file and folder row displays a `26px × 26px` Download Action Button with 1px structural borders and localized tooltip.
- Row action container maintains `pr-16` clearance from the right edge, ensuring both Download and Details buttons are fully visible without obstruction.
- Clicking download on a regular file streams the file directly to the configured local download directory.
- Clicking download on a folder recursively streams all nested contents into an on-the-fly compressed `.zip` archive.
- Clicking download on a Google Workspace document opens a format menu offering PDF/DOCX, XLSX/PDF, or PPTX/PDF exports.
- Downloads run strictly sequentially (1 active, others queued).
- Floating Transfer Trigger appears in the bottom-right corner when downloads are active or queued, displaying the Drive icon with a download arrow badge.
- Hovering over the floating trigger expands it to the left (`260px`) showing active item name, progress bar, and queue count.
- Clicking the floating trigger opens the centered Swiss Archive Download Queue Modal with granular item statuses and actions (cancel, retry, open in folder, clear completed).
- Opening the queue modal freezes the 4-second completion auto-hide grace period.
- Top menu bar features a settings button opening `DownloadSettingsModal` to view and change default download directory via native directory picker.
- Virtual parent row (`"..."`) has no download button.
- 100% bilingual parity for all download-related labels and dialogs in `en` and `es`.
- 100% of automated unit and integration tests passing with zero TypeScript errors.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All ambiguities and edge cases were reviewed and agreed upon during QA clarification.*

## Decisions / Clarifications (Changelog)
- **2026-11-19 (Initial Spec Interview):**
  - **Decision 1 (Default Download Destination & Settings Control):**
    - *Question*: Where should files be saved when clicking download on a row?
    - *Agreement*: Save directly to the operating system's default `Downloads` folder without prompting on each item, and add a Settings button to the top menu bar utility cluster allowing users to view and modify their default download folder via native OS folder picker.
    - *Why*: Provides frictionless one-click desktop downloads while giving users full control over destination preferences.
  - **Decision 2 (Floating Trigger Visibility & Resting Visuals):**
    - *Question*: When is the floating widget visible and what is its resting appearance?
    - *Agreement*: The floating button is visible only when one or more downloads are active or in queue (with a 4-second completion grace period). In resting state, it renders as a compact `40px × 40px` card displaying the Google Drive icon with a subtle download arrow badge in its bottom-right corner.
    - *Why*: Eliminates unnecessary canvas clutter when idle while providing an unmistakable, branded anchor when transfers are underway.
  - **Decision 3 (Hover Expansion Behavior):**
    - *Question*: What does the floating button show when expanded on hover with multiple active or queued items?
    - *Agreement*: It expands horizontally to the left into an archival progress pill displaying the active item's name, visual progress bar, and queue index (e.g. `1 de 3` / `1 of 3`). Clicking opens the full queue window.
    - *Why*: Gives instant ambient progress visibility without blocking the user's workspace, reserving detailed multi-item management for the modal.
  - **Decision 4 (Queue Window Format & Action Set):**
    - *Question*: How should the download queue window look and what actions should it support?
    - *Agreement*: Centered Swiss Archive modal dialog displaying all active, queued, completed, and failed downloads with individual actions (Cancel, Retry, Open Containing Folder) and a global Clear Completed action.
    - *Why*: Consistent with Swiss Archive desktop modal conventions (like About modal), ensuring accessible and spacious transfer management.
  - **Decision 5 (Row Action Scope & Folder Handling):**
    - *Question*: Which rows render the download button and how are folders handled?
    - *Agreement*: Every real file and folder row renders the `26px × 26px` download button immediately to the left of the details button. If a folder is downloaded, the system recursively zips all nested files and subdirectories on the fly, streaming a `.zip` archive to local disk.
    - *Why*: Fulfills desktop expectations where users can download entire directories without having to manually traverse and download files one by one.
- **2026-11-19 (QA Audit Clarification Resolution — `/sdd-clarify`):**
  - **Decision 6 (Floating Widget Geometry & Anchoring):**
    - *Question*: What is the expanded width of the hover pill and where is it anchored?
    - *Agreement*: Expanded width is exactly `260px`. It is anchored at `bottom-3 right-3` within the `FileExplorer` canvas container (superpuesto en la esquina inferior derecha), so expanding/collapsing the lateral sidebar moves it naturally with the explorer area.
    - *Why*: `260px` provides balanced width for filename and progress while avoiding horizontal overflow in compact windows.
  - **Decision 7 (Strict Sequential Queue Without Concurrency):**
    - *Question*: How many downloads run concurrently?
    - *Agreement*: Exactly one download at a time (sequential FIFO queue). Additional clicks enqueue items with `queued` status, starting automatically when the active download ends.
    - *Why*: Maximizes download reliability, avoids bandwidth contention, and protects against Google Drive API rate-limiting spikes.
  - **Decision 8 (Hover Active Item Selection):**
    - *Question*: Which item is shown in the hover pill when multiple items are queued?
    - *Agreement*: The actively downloading item is shown with its live progress bar and total queue counter (`1 de 3`).
    - *Why*: Immediate visual clarity on what is actively consuming bandwidth.
  - **Decision 9 (Google Workspace Format Selection Menu):**
    - *Question*: What export format is downloaded for Google Docs, Sheets, and Slides?
    - *Agreement*: The row download button opens a compact anchored menu offering standard choices: Docs (`PDF` / `DOCX`), Sheets (`XLSX` / `PDF`), Slides (`PPTX` / `PDF`).
    - *Why*: Gives users intentional control over document export formats without cluttering the main table row.
  - **Decision 10 (Grace Period & Modal Interaction):**
    - *Question*: Does the floating trigger hide if the queue modal is open when the 4-second grace period ends?
    - *Agreement*: Opening the modal freezes the auto-hide timer; the trigger and modal remain visible until the user closes the modal.
    - *Why*: Prevents modal controls or trigger from disappearing while the user is actively managing or reviewing completed files.
  - **Decision 11 (Row Clearance & Button Sizing):**
    - *Question*: What clearance and spacing are required with two action buttons in each row?
    - *Agreement*: Download button is `26px × 26px`, separated by `6px` (`gap-1.5`) from the details button. Trailing padding on row and header is set to `pr-16` (64px clearance from the right edge), guaranteeing at least 12px clearance from the lateral sidebar toggle chevron button.
    - *Why*: Eliminates visual overlap and ensures both buttons have clear, unobstructed click targets.
