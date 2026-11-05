# Spec 004 — Google Drive File and Folder Explorer
Status: implemented

## Context and Goal
The central workspace canvas in Prydrive currently displays static placeholder panels ("Prydrive Workspace" and "Google Drive Connected"). Now that authentication, desktop shell architecture, and project metadata are in place, the application needs its core file exploration capability. The central area must display the real-time contents of the user's Google Drive in a compact desktop list view, enabling navigation through folder hierarchies, incremental scroll pagination, status bar telemetry, and manual refresh without relying on an external web browser.

## Users
- **Authenticated Desktop User:** Any user who has connected their Google Drive account and needs to view, inspect, and navigate cloud files and folders in a clear, high-density desktop listing.

## User Stories
- **US-1 (File & Folder List Presentation):** As an authenticated user, I want to see all active files and folders in my current Google Drive directory in a compact table list with clear columns (type icon, name, creation date in local time `DD/MM/YYYY HH:mm:ss`, size) so that I can easily scan and inspect my cloud assets.
- **US-2 (Folder Navigation & Parent Directory Navigation):** As an authenticated user, I want to open folders by double-clicking on them and return to parent folders by double-clicking a top "..." directory entry so that I can fluidly explore nested directory structures.
- **US-3 (Interactive Selection & Unified Navigation Rail Access):** As an authenticated user, I want to click an item to visually highlight it, and have both the Prydrive and Google Drive navigation rail buttons display this unified cloud file explorer so that access is always consistent.
- **US-4 (Central Canvas Status Bar & Refresh Control):** As an authenticated user, I want a bottom status bar inside the central workspace displaying the total counts of folders and files, the combined file size of the folder, and a manual refresh action so that I have immediate visibility over folder metrics and can synchronize changes on demand.
- **US-5 (Empty State & Error Resilience):** As an authenticated user, I want clear feedback when a folder contains no items ("Carpeta vacía") while retaining the "..." parent navigation entry in subfolders, and resilient error notifications with retry capability when network issues occur so that I am never left in an ambiguous state.
- **US-6 (Bilingual Localization Parity):** As a user, I want all explorer column headers, status bar metrics, empty folder messages, and tooltips to be presented in my active language (English or Spanish) so that the interface remains natural and consistent.

## Definitions
- **Parent Navigation Entry ("..."):** A virtual navigation row rendered at the very top of the item list representing the parent directory, featuring a folder icon and `"..."` as its name, available only when viewing subfolders. It is activated via double-click and is **never** included in the status bar folder count.
- **Bottom Status Bar:** A persistent horizontal bar anchored to the bottom of the central canvas presenting real folder and file counts, aggregate file size, and the manual refresh trigger.
- **Compact List View:** A tabular layout prioritizing information density, displaying type icon, name, creation date (`DD/MM/YYYY HH:mm:ss` local time), and human-readable file size in distinct columns.
- **Storage Item Sizes:** All files (including Google Workspace documents such as Docs, Sheets, and Slides) report their storage usage (`quotaBytesUsed` or `size`), which is formatted in human-readable units (e.g., `1 KB`, `339 KB`, `1.8 MB`) and incorporated into the aggregate folder size.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL render the contents of the user's active Google Drive directory in the central workspace canvas as a compact list displaying columns for:
  1. Item Type Icon
  2. Name
  3. Creation Date (formatted in local timezone as `DD/MM/YYYY HH:mm:ss`)
  4. File Size (formatted in human-readable units: B, KB, MB, GB).
- **FR-2:** THE SYSTEM SHALL query and display exclusively active items, filtering out all trashed files and folders (`trashed = false`).
- **FR-3:** THE SYSTEM SHALL display the user's root directory ("My Drive") upon initial presentation.
- **FR-4:** WHEN the user selects either the "Prydrive" button or the "Google Drive" button in the left navigation rail, THE SYSTEM SHALL display the active Google Drive file explorer in the central canvas.
- **FR-5:** THE SYSTEM SHALL sort directory items listing all real folders ahead of files, ordered alphabetically by name within each group.
- **FR-6:** WHEN the user double-clicks on a folder row, THE SYSTEM SHALL navigate inside that folder, load its immediate contents, and clear any previous item selection.
- **FR-7:** WHEN the user double-clicks on a regular file row or shortcut, THE SYSTEM SHALL perform a no-op (no action in this iteration).
- **FR-8:** WHILE the user is navigating within any subfolder, THE SYSTEM SHALL render a parent directory navigation row at the very top of the list displaying a folder icon and the label `"..."`.
- **FR-9:** WHEN the user double-clicks the `"..."` parent directory row, THE SYSTEM SHALL navigate up one level to the immediate parent folder and clear any previous item selection.
- **FR-10:** IF the user is at the root directory level ("My Drive"), THEN THE SYSTEM SHALL NOT display the `"..."` parent directory row.
- **FR-11:** WHEN the user single-clicks any file or folder row, THE SYSTEM SHALL visually highlight that row as the selected item.
- **FR-12:** THE SYSTEM SHALL display a persistent status bar at the bottom of the central workspace canvas containing:
  - A manual refresh action ("Actualizar" / "Refresh").
  - A breakdown metric displaying the count of real folders and count of files in the current view (e.g., "3 carpetas, 12 archivos" / "3 folders, 12 files"), strictly excluding the `"..."` navigation row from the folder count.
  - The aggregate file size of all files present in the current folder, formatted in human-readable units (e.g., "14.2 MB").
- **FR-13:** WHEN the user activates the manual refresh action in the status bar, THE SYSTEM SHALL re-fetch and update the current directory's contents from Google Drive.
- **FR-14:** IF the active folder contains zero files and zero folders:
  - WHEN at root directory, THE SYSTEM SHALL display a centered empty state message indicating "Carpeta vacía" (or "Empty folder").
  - WHEN in a subfolder, THE SYSTEM SHALL display the `"..."` parent navigation row at the top of the table and display the "Carpeta vacía" (or "Empty folder") state message in the content area below it.
- **FR-15:** WHILE fetching directory contents from Google Drive, THE SYSTEM SHALL display a loading indicator or skeleton list in the central canvas.
- **FR-16:** THE SYSTEM SHALL support incremental scroll pagination, requesting items in batches (e.g. 50 items per page) and automatically fetching and appending subsequent pages as the user scrolls toward the bottom of the list.
- **FR-17:** IF retrieving folder contents fails due to network disconnection or API error, THEN THE SYSTEM SHALL display an error banner with a retry action without clearing navigation history.
- **FR-18:** THE SYSTEM SHALL localize all explorer column headers, status bar metrics, empty states, and action tooltips symmetrically in English and Spanish according to the active application language.

## Non-Functional Requirements
- **NFR-1 (Performance & Incremental Loading):** Initial directory view must render within 300ms for cached folders; scroll pagination must fetch and append subsequent batches seamlessly without full-list re-renders or frame stutter.
- **NFR-2 (Information Density & Design Craftsmanship):** Row height and typographic scale must adhere to desktop utility conventions (compact row height ~32-36px, clear column alignment, subtle hover and selection states matching the dark theme palette `#0D1117` and `#161B22`).
- **NFR-3 (Read-Only Safety):** This iteration must not perform destructive operations (deletion, moving, or renaming) or automatic file downloads upon clicking.

## Edge Cases
- **EC-1:** Files with missing or zero-byte size $\rightarrow$ Render `--` or `0 B` cleanly without throwing formatting errors.
- **EC-2:** Google Workspace native files (Docs, Sheets, Slides) $\rightarrow$ Display appropriate document type icons; storage usage reported by Google Drive (`quotaBytesUsed` / `size`) is formatted in human-readable units and included in total sum.
- **EC-3:** Very long file or folder names $\rightarrow$ Truncate with ellipsis with full name visible on hover tooltip.
- **EC-4:** Navigating rapidly into deeply nested subfolders $\rightarrow$ Folder navigation history stack tracks parent IDs accurately, and double-clicking `"..."` always pops the immediate parent ID.
- **EC-5:** Shortcuts (`application/vnd.google-apps.shortcut`) $\rightarrow$ Displayed in list with shortcut icon; double-clicking is a no-op.
- **EC-6:** Offline state during navigation $\rightarrow$ If cached, render cached folder; if not cached, display offline warning with retry button when connection returns.

## Out of Scope
- File downloads or local filesystem streaming (deferred to next spec).
- File and folder uploads via Drag & Drop or file picker dialogs.
- File renaming, trashing, permanent deletion, or metadata editing.
- Right-click contextual menus (ContextMenu).
- Multi-selection (marquee drag select or Shift/Ctrl multi-row selection).
- Grid view / thumbnail visual mode (deferred to a subsequent spec).
- Search and filter input box.
- Resolving shortcuts to external destinations.

## Completion Criteria
- Verified rendering of real Google Drive files and folders in a compact list in the central canvas with local creation dates (`DD/MM/YYYY HH:mm:ss`).
- Verified folder navigation on double-click and upward navigation via `"..."` top row on double-click.
- Verified absence of `"..."` at root level, and presence of `"..."` in empty subfolders without counting toward folder totals.
- Verified exclusion of trashed items (`trashed = false`).
- Verified row selection highlight on single click and selection reset on navigation.
- Verified scroll pagination loading items incrementally on scroll.
- Functional bottom status bar showing real folder count, file count, total size, and working refresh action.
- Clear empty folder state ("Carpeta vacía") when navigating to an empty folder.
- Loading skeleton state during fetch and resilient error handling on network failure.
- 100% bilingual localization parity (English and Spanish) across all explorer headers, metrics, and empty states.
- 100% automated test coverage passing for folder listing, navigation stack, sorting, pagination, and size formatting logic.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All ambiguities, edge cases, and QA audit points have been resolved.*

## Decisions / Clarifications (Changelog)
- **2026-11-04 (Initial Spec Interview):**
  - **Question 1 (Rail buttons & view differentiation):** Both the "Prydrive" button and the "Google Drive" button display the Google Drive files and folders (root 'My Drive'), keeping the same synchronized list.
  - **Question 2 (View mode):** Exclusively compact list view (columns: Type icon, Name, Creation date, Size). Grid mode deferred to future specs.
  - **Question 3 (Navigation pattern):** Double-click to open folders. The back/up navigation control is a top list item with a folder icon and `"..."` as its name, hidden at root.
  - **Question 4 (Status bar & empty state):** Central canvas includes a bottom status bar with a refresh button, counts for folders and files, and aggregate file size. Empty folders display `"Carpeta vacía"`.
  - **Question 5 (Item interaction scope):** Single click selects and highlights an item. Actions such as download, delete, or rename are deferred to future specs.
- **2026-11-04 (QA Audit Resolution):**
  - **Question 1 (Date formatting):** Creation date must be formatted in the OS local timezone as `DD/MM/YYYY HH:mm:ss`.
  - **Question 2 (Activation of "..."):** Activating `"..."` requires double-click, matching normal folder navigation.
  - **Question 3 (DoubleClick on files):** Double-clicking files is a no-op in this iteration (reserved for future download feature).
  - **Question 4 (Workspace files & size calculation):** Google Workspace files report their size/quota usage and are included in the status bar aggregate sum.
  - **Question 5 (Selection state on navigation):** Navigating into any folder or ascending via `"..."` clears the active selection.
  - **Question 6 (Empty subfolder & "..."):** In empty subfolders, `"..."` is displayed at the top so the user can navigate back up, but `"..."` is NEVER counted in the folder counter.
  - **Question 7 (Trash filtering):** All items in trash (`trashed = true`) are strictly filtered out (`trashed = false`).
  - **Question 8 (Scroll pagination):** Items are fetched in batches (e.g., 50 items) and incrementally appended as the user scrolls.
  - **Question 9 (Shortcuts):** Displayed in the list, but double-clicking them is a no-op.
