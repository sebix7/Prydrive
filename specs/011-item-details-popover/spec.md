# Spec 011 — Item Details Popover and Table Column Optimization
Status: approved

## Context and Goal
In the Google Drive file explorer table, the file list currently displays dedicated fixed-width columns for creation timestamp (`176px`) and file size (`96px`). In high-density desktop views or when navigation panels (left rail, directory tree, right telemetry sidebar) are expanded, these columns severely constrain the horizontal space available for the file name, forcing premature text truncation on descriptive or nested filenames.

To maximize filename readability, information density, and archival elegance, this specification defines a pure **Two-Column Explorer Table** (Type Icon and Name) replacing the date and size columns. Every real file and folder row includes a compact, persistent `26px × 26px` **Details Action Button** with 1px structural border at its trailing end. When clicked or activated via keyboard, this button opens an anchored **Item Details Popover** presenting the asset's complete metadata (full name, human-readable category, formatted size with `0 B` for empty files, creation timestamp, technical MIME type, and selectable Google Drive resource ID) in a high-precision Swiss Archive container without cluttering the main table grid.

## Users
- **Authenticated Desktop User:** A signed-in user exploring Google Drive items who benefits from maximally expanded filename visibility across the entire table width and has on-demand access to detailed item metadata via popover.

## User Stories
- **US-1 (Two-Column Explorer Table Layout):** As an authenticated user, I want the file explorer table to remove the fixed `Creation Date` and `Size` columns and expand the `Name` column across the full remaining table width so that long filenames are readable without truncation.
- **US-2 (Interactive Details Action Button & Keyboard Access):** As an authenticated user, I want each file and folder row to display a persistent `26px × 26px` details button with 1px structural borders matching top header controls at its trailing end that highlights on hover, receives keyboard focus, and opens an anchored metadata popover without modifying table row selection or triggering directory navigation.
- **US-3 (Swiss Archive Item Details Popover Presentation):** As an authenticated user, I want the details popover to display the item's full name, human-readable category, formatted size (`0 B` for empty files), creation timestamp in local time, exact MIME type, and Google Drive ID in a clean Swiss Archive layout that automatically stays within viewport boundaries.
- **US-4 (Single Popover Cardinality & Fluid Dismissal):** As a user, I want only one details popover open at any time, and I want the popover to automatically close whenever I click outside, press `Escape` (returning focus to the button), scroll the table, or navigate to another directory.
- **US-5 (Bilingual Localization Parity):** As a user, I want all metadata labels in the details popover and the button tooltip to be fully localized in my active language (`en` or `es`).

## Definitions
- **Two-Column Explorer Table:** A streamlined table layout consisting strictly of two visible columns: Column 1 (Type Icon, `w-10`) and Column 2 (Name, `flex-1`), where the row's trailing end accommodates the details action button.
- **Details Action Button:** A compact square geometric button (`26px × 26px`, `4px` radius) with visible 1px structural border (`#C9C6BD` / `#2C323D`) and surface background (`#FFFFFF` / `#181C23`) matching top utility header controls, displaying an info icon (`Info`) rendered at the trailing end of every real file and folder row.
- **Item Details Popover:** A floating contextual card anchored to the row's details button displaying comprehensive item metadata.
- **Single Popover Cardinality:** A strict UI state constraint ensuring that at most one details popover exists in the DOM at any given moment; opening a new popover immediately dismisses any previously active popover.
- **Parent Navigation Entry ("..."):** The virtual navigation row rendered at the top of subfolders, which navigates up one level on double-click; it represents no real cloud asset and never renders a details button.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL remove the `Creation Date` (`FECHA DE CREACIÓN`) and `Size` (`TAMAÑO`) columns from both the sticky table header and all file explorer rows.
- **FR-2:** THE SYSTEM SHALL render the sticky file explorer table header using strictly two columns:
  1. An icon column (`w-10`) displaying an empty placeholder.
  2. A name column (`flex-1`) displaying the localized header label (`NOMBRE` in `es` / `NAME` in `en`), expanding across the entire remaining width of the table.
- **FR-3:** THE SYSTEM SHALL render a persistent `26px × 26px` Details Action Button with a visible 1px structural border (`border-[#C9C6BD] dark:border-[#2C323D]`) and surface background (`bg-[#FFFFFF] dark:bg-[#181C23]`) matching top header utility controls at the trailing right end of each real file and folder row, displaying a centered info icon (`Info`) with a localized native tooltip (`Ver detalles` in `es` / `View details` in `en`).
- **FR-4:** WHILE hovering over the Details Action Button of any row, THE SYSTEM SHALL visually emphasize the button with Swiss Archive hover border and accent color transitions (`hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#1B44E8] dark:hover:text-[#3B66FF]`) without triggering row double-click or opening the popover.
- **FR-5:** WHEN the user clicks or activates the Details Action Button of a row (via `Enter` or `Space` key), THE SYSTEM SHALL:
  1. Prevent event propagation (`stopPropagation`) so that table row selection and navigation states are not altered.
  2. Automatically dismiss any currently open Item Details Popover (enforcing single popover cardinality).
  3. Open the **Item Details Popover** anchored to the activated button.
- **FR-6:** WHILE the Item Details Popover is open, THE SYSTEM SHALL render the following structured metadata fields inside a Swiss Archive container:
  1. **Full Name:** The complete item name (`item.name`), wrapping without truncation in selectable text (`select-text` / `cursor-text`), allowing users to highlight and copy complete filenames.
  2. **Item Type:** Human-readable category label derived from `item.iconType` and `item.isDirectory` (e.g., `Carpeta`, `Documento`, `Hoja de cálculo`, `Presentación`, `PDF`, `Imagen`, `Video`, `Audio`, `Archivo comprimido`, `Acceso directo`, `Archivo`).
  3. **File Size:** Formatted storage usage (`item.formattedSize`, displaying `0 B` for empty files and `--` for folders).
  4. **Creation Timestamp:** Localized creation date in `DD/MM/YYYY HH:mm:ss` format (`item.formattedCreatedAt`).
  5. **MIME Type:** Technical MIME string (`item.mimeType`, e.g., `application/pdf`, `application/vnd.google-apps.spreadsheet`).
  6. **Drive ID:** The unique Google Drive string identifier (`item.id`) in passive, selectable monospace text.
- **FR-7:** THE SYSTEM SHALL close the active Item Details Popover upon any of the following dismissal events:
  1. WHEN the user clicks anywhere outside the active popover container.
  2. WHEN the user presses the `Escape` key, closing the popover and returning keyboard focus to the triggering Details Action Button.
  3. WHEN the user scrolls the file explorer table (`onScroll`).
  4. WHEN the user initiates directory navigation (via double-click, breadcrumb navigation, or directory tree panel).
- **FR-8:** IF the user opens the Item Details Popover for an item near the bottom or right boundaries of the visible viewport, THEN THE SYSTEM SHALL automatically position the popover above or to the left of the anchor button to prevent overflow or clipping.
- **FR-9:** WHILE the user is viewing the virtual parent directory row (`"..."`), THE SYSTEM SHALL render an empty trailing space without any Details Action Button.
- **FR-10:** THE SYSTEM SHALL ensure all popover labels, category names, field headers, and button tooltips maintain 100% bilingual parity across English (`en`) and Spanish (`es`).

## Non-Functional Requirements
- **NFR-1 (Archival Visual Alignment):** The Item Details Popover and its anchor button must adhere strictly to Swiss Archive design tokens (Light and Dark surface palettes, `1px` structural borders, `4px` button radius, `6px` popover card radius, and `Space Grotesk` / `Inter` / `IBM Plex Mono` typography).
- **NFR-2 (Stack Simplicity & Zero Extra Dependencies):** The popover positioning and dismissal logic must be implemented cleanly using existing project styling and utilities without introducing heavy third-party positioning libraries (such as `popper.js` or `@floating-ui/react`), maintaining 60 FPS table scrolling.
- **NFR-3 (Contrast & Accessibility):** All metadata labels and monospace values inside the popover must satisfy WCAG AA contrast ratios (`>= 4.5:1` for primary text, `>= 3:1` for secondary labels) against the popover's elevated surface. The details button must be accessible via `Tab` key navigation.

## Edge Cases
- **EC-1:** Double-clicking the Details Action Button $\rightarrow$ Event propagation is stopped (`stopPropagation`), preventing accidental folder navigation or selection disruption.
- **EC-2:** Opening popover on an item with a very long filename (150+ characters) $\rightarrow$ The popover container enforces word-break wrapping and width boundaries, displaying the complete name cleanly without clipping.
- **EC-3:** Virtual parent row (`"..."`) $\rightarrow$ The virtual `"..."` row renders no details action button; double-clicking navigates up as usual.
- **EC-4:** Scrolling the table while a popover is open $\rightarrow$ The popover dismisses immediately upon table scroll, preventing detached or misplaced floating overlays.
- **EC-5:** Toggling Theme Mode (`light` $\leftrightarrow$ `dark`) while a details popover is open $\rightarrow$ The popover card surface, border rules, and monospace value colors update instantaneously without closing or resetting the popover.
- **EC-6:** Directory navigation while popover is open $\rightarrow$ The popover unmounts immediately when changing folders via double-click, breadcrumbs, or directory tree.
- **EC-7:** Keyboard focus management $\rightarrow$ Pressing `Tab` focuses the Details Action Button, `Enter` or `Space` opens the popover, and pressing `Escape` closes the popover and restores focus to the button.
- **EC-8:** Empty files with 0 bytes $\rightarrow$ The file size field displays `0 B`, differentiating empty files from folders which display `--`.
- **EC-9:** Opening popover on an unselected row $\rightarrow$ The popover opens without changing or selecting the row, preserving any preexisting selection on another row.
- **EC-10:** Text selection inside popover $\rightarrow$ Selecting or clicking and dragging over the filename or Google Drive ID does not trigger popover dismissal or outside-click handlers.

## Out of Scope
- Inline editing of metadata (such as renaming or changing MIME type from within the popover).
- Triggering Google Drive file downloads or deletions directly from inside the popover (those remain accessible via context menu or toolbar).
- Displaying remote file revision history or cloud permission ACLs.

## Completion Criteria
- Table header and file rows no longer render `Creation Date` and `Size` column containers.
- Table header displays strictly two columns: Icon (`w-10`) and `Name` (`flex-1`).
- Table `Name` column expands to fill all horizontal space across the table up to the trailing details button.
- Each real file and folder row displays a `26px × 26px` details button with 1px structural borders matching top header controls and localized tooltip.
- Clicking or activating the details button opens the Swiss Archive Item Details Popover displaying full name (selectable text), category, size (`0 B` for empty files), creation date, MIME type, and Drive ID (passive selectable text).
- Only one popover can be open at any time.
- Virtual `"..."` parent row has no details button.
- Popover closes on outside click, `Escape` key, table scroll, and directory navigation.
- 100% bilingual parity for all field labels and tooltips in `en` and `es`.
- 100% of automated unit and integration tests passing with zero regressions.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All functional and interaction decisions were resolved during the QA audit clarification.*

## Decisions / Clarifications (Changelog)
- **2026-11-17 (Initial Spec Interview):**
  - **Decision 1 (Interaction Trigger — Popover on Click):**
    - *Question*: Should the metadata panel trigger on hover (tooltip) or on click (popover)?
    - *Agreement*: Implement as a Popover activated by Click (with a brief native tooltip on hover: "Ver detalles" / "View details"). The popover remains open until dismissed.
    - *Why*: Allows the user to inspect metadata steadily, select or copy values (such as Drive ID or full name), and prevents accidental dismissal from slight mouse movements.
  - **Decision 2 (Metadata Fields Scope):**
    - *Question*: What data fields should be displayed inside the popover?
    - *Agreement*: Include 6 structured fields: Full Name, Item Category/Type, Formatted Size, Creation Timestamp, Technical MIME Type, and Google Drive ID.
    - *Why*: Provides comprehensive technical and operational visibility over the asset without cluttering the main table row.
  - **Decision 3 (Table Header Layout — Pure Two-Column Header):**
    - *Question*: How should the table sticky header be structured?
    - *Agreement*: Render strictly two columns in the header: Icon (`w-10`) and `Name` (`flex-1`), maximizing name column width across the entire table.
    - *Why*: Cleanest visual presentation that eliminates artificial empty action headers and aligns with Swiss Archive minimalism.
  - **Decision 4 (Button Visibility in Rows — Always Visible):**
    - *Question*: Should the details button be always visible or only show on hover/selection?
    - *Agreement*: Always visible in every real file/folder row with a subtle, muted appearance, brightening on hover.
    - *Why*: Clear discoverability for desktop users without requiring hover exploration to discover that details exist.
  - **Decision 5 (Virtual Parent Row Exclusion):**
    - *Question*: Does the virtual parent directory row (`"..."`) render a details button?
    - *Agreement*: No, the virtual `"..."` row renders an empty trailing space with no action button.
    - *Why*: The `"..."` row is a navigational construct, not a real Google Drive asset.
- **2026-11-17 (QA Audit Resolution — `/sdd-clarify`):**
  - **Finding 1 (Dismissal on Table Scroll):**
    - *Question*: How should the popover behave when the user scrolls the file explorer table (`EC-4`)?
    - *Agreement*: The popover dismisses immediately upon table scroll.
    - *Why*: Eliminates detached floating overlays and guarantees deterministic UI behavior.
  - **Finding 2 (Details Button Dimensions):**
    - *Question*: What are the exact dimensions of the Details Action Button?
    - *Agreement*: Exactly `28px × 28px` with `4px` corner radius.
    - *Why*: Fits comfortably within the `36px` (`h-9`) row height with balanced vertical margin (`4px`).
  - **Finding 3 (Single Popover Cardinality):**
    - *Question*: Can multiple popovers be open simultaneously across different rows?
    - *Agreement*: No, strictly one popover at a time. Opening a details popover closes any previously open popover.
    - *Why*: Prevents screen clutter and competing overlay states.
  - **Finding 4 (Row Selection Independence):**
    - *Question*: Does clicking the details button alter the row selection state?
    - *Agreement*: No, clicking the details button consumes the event (`stopPropagation`), opening the popover without modifying row selection.
    - *Why*: Keeps inspection decoupled from item selection.
  - **Finding 5 (Pure Two-Column Layout):**
    - *Question*: How should the table columns be defined to eliminate the "Two-Zone vs 3 columns" contradiction?
    - *Agreement*: Define the layout strictly as Two Columns (Icon `w-10` and Name `flex-1`), with the details button placed at the trailing end of the row.
    - *Why*: Provides clean terminology and maximizes the table header simplicity.
  - **Finding 6 (Accessibility and Keyboard Focus):**
    - *Question*: How does keyboard navigation interact with the details button and popover?
    - *Agreement*: The button receives focus via `Tab`, opens on `Enter`/`Space`, and pressing `Escape` closes the popover and returns focus to the button.
    - *Why*: Ensures full WCAG keyboard accessibility.
  - **Finding 7 (Dismissal on Directory Navigation):**
    - *Question*: Does the popover remain open when navigating to another folder?
    - *Agreement*: No, the popover unmounts immediately on any folder navigation.
    - *Why*: Prevents stale metadata from previous directory contents remaining on screen.
  - **Finding 8 (Empty 0-Byte File Representation):**
    - *Question*: How is file size formatted for 0-byte files vs folders?
    - *Agreement*: Files with 0 bytes display `0 B`, while folders display `--`.
    - *Why*: Accurately distinguishes an empty file from a directory.
  - **Finding 9 (Drive ID Copy Action vs Passive Text):**
    - *Question*: Does the Drive ID field include a copy button?
    - *Agreement*: Render as passive, selectable monospace text without a separate copy button.
    - *Why*: Keeps the popover clean and minimal.
  - **Finding 10 (Stack Simplicity for Positioning):**
    - *Question*: Are third-party positioning libraries allowed?
    - *Agreement*: Implement using lightweight positioning logic without heavy external dependencies, strictly adhering to Principle 3.
    - *Why*: Guarantees high performance, zero bundle bloat, and constitution compliance.
- **2026-11-18 (Requirement Change — `/sdd-change`):**
  - **Decision 11 (Details Button Sizing and Top Header Border Alignment):**
    - *Question*: Should the Details Action Button dimensions be adjusted to 26px x 26px and include a 1px structural border matching top header controls?
    - *Agreement*: Set button geometry to `26px × 26px` (`w-[26px] h-[26px]`, `rounded-[4px]`) and apply a visible 1px neutral structural border `border-[#C9C6BD] dark:border-[#2C323D]` with elevated background `bg-[#FFFFFF] dark:bg-[#181C23]`, transitioning to Klein Blue `hover:border-[#1B44E8] dark:hover:border-[#3B66FF]` on hover, matching the visual vocabulary of header utility buttons (`MenuBar.tsx`).
    - *Why*: Enhances visual consistency across the desktop shell, increases vertical breathing room inside the `36px` (`h-9`) table row (5px margins top and bottom), and gives the button clear clickable affordance.
  - **Decision 12 (Selectable File Name in Details Popover):**
    - *Question*: Should users be able to select and copy the file name displayed in the details popover?
    - *Agreement*: Allow text selection on the filename inside the Item Details Popover (`select-text cursor-text`), enabling users to highlight and copy long or complex filenames while maintaining the non-selectable shell aesthetic for the card container and field labels.
    - *Why*: In desktop workflows, inspecting details is often done to copy exact file names (especially long names truncated in the main table view) without renaming the file.
