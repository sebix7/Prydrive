# Spec 010 — Explorer Navigation Breadcrumbs
Status: approved

## Context and Goal
Prydrive features a multi-panel desktop workspace where users explore their Google Drive contents. Currently, when navigating into nested folders, the only navigation affordance inside the table is the virtual `...` parent row, which only permits ascending one directory level at a time. The top header displays a panel toggle cluster, leaving the central table without a visual representation of the complete folder path.

To improve navigational awareness, hierarchy clarity, and speed of traversal:
1. Introduce a dedicated, persistent **Explorer Breadcrumb Bar** positioned directly above the column headers of the file table.
2. Render the full hierarchical path from the root directory (`Mi unidad` / `My Drive`) to the active folder, separated by subtle typography slashes (`/`).
3. Enable direct 1-click navigation to any ancestor directory in the path, automatically truncating subsequent history upon arrival.
4. Render the active (current) folder at the trailing edge of the trail as prominent, non-clickable text.
5. In deeply nested paths or narrow window viewports, retain the complete path with smooth horizontal scrolling, automatically keeping the active folder scrolled into view.
6. Retain the complementary `...` parent folder row inside the table for sequential step-by-step upward navigation.
7. Adhere strictly to the Swiss Archive design system in both Light and Dark themes, guaranteeing that the breadcrumb remains visible and fully interactive during loading, empty folder, and error states.

## Users
- **Desktop File Explorer:** A user managing files and nested folder hierarchies on Google Drive who needs instant visual awareness of their current directory path and rapid 1-click ascension to ancestor folders.

## User Stories
- **US-1 (Persistent Top Path Bar):** As a user browsing Google Drive, I want a dedicated breadcrumb bar above the file table showing the path from root to my current folder, so that I always know my exact location in the folder hierarchy.
- **US-2 (Direct Ancestor Navigation):** As a user, I want to click any ancestor folder in the breadcrumb trail to navigate directly to it and truncate the path, so that I can jump multiple levels up in a single action without repeatedly clicking "up one level".
- **US-3 (Deep Path Auto-Scroll & Horizontal Navigation):** As a user exploring deeply nested folders with long names, I want the breadcrumb bar to smoothly scroll to keep the active folder visible while allowing horizontal scrolling, so that I can inspect and access any level regardless of window width.
- **US-4 (Aesthetic Harmony & State Persistence):** As a user, I want the breadcrumb bar to follow the Swiss Archive design system in both Light and Dark themes, remaining visible and functional even during loading, empty states, or network errors.

## Definitions
- **Explorer Breadcrumb Bar:** A dedicated 32px horizontal bar placed directly above the table column headers displaying the active folder lineage.
- **Crumb Item:** An individual folder segment within the breadcrumb trail representing either the root directory, an intermediate ancestor folder, or the active directory.
- **Ancestor Crumb:** Any preceding folder in the active path hierarchy that can be clicked to navigate directly to that level.
- **Active Crumb:** The final, non-clickable segment of the trail representing the directory currently being viewed by the user.
- **Truncated Navigation Stack:** The updated folder lineage resulting from navigating to an ancestor crumb, which pops all descendant folders from the history stack.
- **Path Separator:** A subtle typographical forward slash (`/`) in monospace styling positioned between consecutive crumbs.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL render a dedicated breadcrumb bar immediately above the file table column headers (`TIPO`, `NOMBRE`, `CREADO`, `TAMAÑO`).
- **FR-2:** THE SYSTEM SHALL render the root directory as the first crumb item in the breadcrumb trail using localized plain text:
  - English: `My Drive`
  - Spanish: `Mi unidad`  
  The root item SHALL NOT display an icon.
- **FR-3:** WHILE the user is located at the root directory, THE SYSTEM SHALL display solely the root crumb item in the active crumb style without separators.
- **FR-4:** WHEN the user navigates into a subfolder, THE SYSTEM SHALL append a new crumb item representing that folder to the trailing end of the breadcrumb trail, separated from the previous crumb by a typographical forward slash (`/`).
- **FR-5:** WHEN the user clicks any ancestor crumb in the breadcrumb trail, THE SYSTEM SHALL:
  1. Truncate the navigation stack to that folder level.
  2. Load the contents of the selected folder.
  3. Update the breadcrumb trail so that the selected folder becomes the active (final) crumb.
- **FR-6:** THE SYSTEM SHALL render the active (final) crumb as prominent, non-interactive text (`font-semibold`, primary ink contrast), preventing click triggers or redundant re-fetching.
- **FR-7:** THE SYSTEM SHALL render ancestor crumbs with interactive styling (pointer cursor, neutral text, subtle hover pill highlight, and Klein Blue accent transition on hover).
- **FR-8:** WHILE the breadcrumb trail width exceeds the available viewport width, THE SYSTEM SHALL:
  1. Retain the full text name of all crumb items without artificial character truncation.
  2. Enable smooth horizontal scrolling while hiding the native visual scrollbar (`scrollbar-none`) to preserve the 32px height of the bar.
  3. Automatically scroll the container to the rightmost edge to ensure the active crumb is always visible upon navigation.
- **FR-9:** THE SYSTEM SHALL preserve the virtual `...` parent directory navigation row inside the file table when viewing subfolders, complementing the breadcrumb bar.
- **FR-10:** THE SYSTEM SHALL keep the breadcrumb bar permanently visible and interactive across all explorer lifecycle states, including loading spinners, empty folders, and network error/retry states.
- **FR-11:** WHILE the active theme is `light`, THE SYSTEM SHALL render the breadcrumb bar with Swiss Archive secondary surfaces (`#F2F0EA`), subtle 1px border (`#C9C6BD`), and Klein Blue hover accents (`#1B44E8`).
- **FR-12:** WHILE the active theme is `dark`, THE SYSTEM SHALL render the breadcrumb bar with Swiss Archive secondary surfaces (`#15181E`), subtle 1px border (`#2C323D`), and luminous Klein Blue hover accents (`#3B66FF`).
- **FR-13:** THE SYSTEM SHALL automatically synchronize the breadcrumb trail with the active directory of the central file table regardless of navigation origin (folder double-click in table, breadcrumb ancestor click, `...` parent row navigation, or directory tree node selection).

## Non-Functional Requirements
- **NFR-1 (Visual Hierarchy & Consistency):** The breadcrumb bar must seamlessly integrate between the top header area and the table column headers, maintaining exact 1px structural alignment and identical font-family metrics.
- **NFR-2 (Accessibility & Contrast):** All crumb items and separators must provide minimum WCAG AA contrast (4.5:1 for active/ancestor text, 3:1 for separators/borders), with clear focus-visible rings for keyboard navigation.
- **NFR-3 (Zero Regression):** The introduction of the breadcrumb bar must preserve 100% of existing directory navigation, tree synchronization, status bar metrics, drag-and-drop file operations, and window resizing behaviors.

## Edge Cases
- **EC-1:** Rapid consecutive clicks on ancestor crumbs $\rightarrow$ Debounced safely so that only the final requested folder fetches remote data, preventing state corruption.
- **EC-2:** Deeply nested hierarchy (e.g. 10+ levels) $\rightarrow$ Horizontal auto-scroll brings the active folder into view immediately upon folder entry.
- **EC-3:** Instantaneous language toggle between Spanish and English $\rightarrow$ The root crumb label updates immediately (`Mi unidad` $\leftrightarrow$ `My Drive`) without reloading directory contents.
- **EC-4:** Instantaneous theme toggle between Light and Dark modes $\rightarrow$ All surfaces, borders, separators, and text colors adapt in real time.
- **EC-5:** Folder load failure / network timeout $\rightarrow$ The breadcrumb remains fully functional, allowing the user to click any ancestor crumb to escape the failed directory.
- **EC-6:** Refresh action in status bar $\rightarrow$ Re-fetches the current directory contents while leaving the breadcrumb trail intact.
- **EC-7:** Directory tree navigation sync $\rightarrow$ Selecting any node in the directory tree updates the breadcrumb trail to reflect the full folder lineage of that node.
- **EC-8:** Double-click `...` in table $\rightarrow$ Ascends one level, pops the active folder, and updates the breadcrumb trail to the parent.

## Out of Scope
- Editable text path bar for manual path typing (e.g., Windows Explorer address bar text editing).
- Drag-and-drop movement of files directly onto breadcrumb segments.
- Dropdown menus embedded within individual breadcrumb crumb segments.

## Completion Criteria
- Dedicated 32px breadcrumb bar rendered directly above the table column headers.
- Root folder displays as plain text (`Mi unidad` / `My Drive`) without icon.
- Typographical forward slash (`/`) separators between consecutive crumb segments.
- Clicking ancestor crumbs navigates directly to that folder and truncates subsequent path history.
- Active crumb renders as prominent, non-clickable text.
- Horizontal auto-scroll ensures active folder is always visible on long paths while hiding native visual scrollbars (`scrollbar-none`).
- Full folder names displayed without artificial character truncation.
- The virtual `...` parent directory row remains functional inside the table and synchronizes with the breadcrumb.
- Breadcrumb persists across empty folder, loading, and error states.
- 100% test suite passing with unit and integration tests.
- Zero TypeScript errors (`tsc --noEmit`).

## Open Questions
*(All requirements, edge cases, and QA audit points resolved)*

## Decisions / Clarifications (Changelog)
- **2026-11-15 (Interview Resolution 1 - Placement & Direct Navigation):** Agreed to place the breadcrumb bar directly above the table column headers, displaying the path from root to current folder. Clicking an ancestor truncates the path to that folder; returning to root displays solely the root crumb.
- **2026-11-15 (Interview Resolution 2 - Separator & Plain Root Text):** Agreed to use typographical forward slashes (`/`) as separators matching Swiss Archive conventions, and plain text without icons for the root directory (`Mi unidad` / `My Drive`).
- **2026-11-15 (Interview Resolution 3 - Long Paths & Horizontal Scrolling):** Agreed to adopt Option A: smooth horizontal scrolling with automatic scroll-to-end, keeping all folder names complete and ensuring the active folder is always visible.
- **2026-11-15 (Interview Resolution 4 - Retention of '...' Parent Navigation Row):** Confirmed that the virtual parent navigation row displaying `...` with a folder icon inside the table is kept intact as a complementary quick navigation action.
- **2026-11-15 (Interview Resolution 5 - Active Crumb As Plain Text & State Persistence):** Agreed that the active crumb is purely prominent text without click action, and confirmed that the breadcrumb remains permanently visible and functional during loading, empty folder, and error states.
- **2026-11-16 (QA Audit Resolution 1 - Scrollbar-none in 32px Bar):** Agreed to hide the native visual scrollbar (`scrollbar-none`) while preserving smooth horizontal scrolling with mouse wheel and trackpad, ensuring the 32px bar height remains clean and undistorted.
- **2026-11-16 (QA Audit Resolution 2 - Full Folder Names):** Confirmed that folder names render in full length without artificial per-crumb truncation.
- **2026-11-16 (QA Audit Resolution 3 - Unification of Virtual '...' Row):** Corrected the residual mention of `.. Subir nivel` in Context & Goal to strictly match the literal `...` parent row.
- **2026-11-16 (QA Audit Resolution 4 - Universal Synchronization with Central Table):** Confirmed that the breadcrumb trail strictly mirrors the active folder and ancestry of the central file table regardless of navigation origin (table double-click, tree node click, breadcrumb crumb click, or `...` parent row).
- **2026-11-16 (QA Audit Resolution 5 - Double-Click '...' Ascend Synchronization):** Confirmed that ascending via the table's `...` row pops the current folder and updates the breadcrumb trail to the parent.
