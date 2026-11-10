# Spec 007 — Directory Tree Navigation Panel
Status: approved

## Context and Goal
Prydrive allows users to browse Google Drive contents through a central file explorer table and breadcrumb navigation. However, exploring deeply nested folder structures currently requires sequential folder-by-folder drilling from the table. To provide instant hierarchical visibility, rapid folder jumping, and an authentic desktop file management workflow, this specification defines a **collapsible Directory Tree Navigation Panel** situated between the 64px left navigation rail and the central file explorer. The panel will display an on-demand, expandable tree of Google Drive folders starting from "My Drive", feature classic `[+]` / `[-]` boxed expanders with dotted hierarchy guidelines, symmetrical circular toggle controls, bidirectional navigation synchronization with the central table, and full adherence to the Swiss Archive design system in both Light and Dark modes.

## Users
- **Desktop Cloud Explorer:** A signed-in user navigating through Google Drive files and folders who needs an overview of their folder hierarchy, the ability to jump directly to any nested directory with 1 click, and the flexibility to collapse the tree when maximizing file table width.

## User Stories
- **US-1 (Collapsible Directory Tree Panel, Symmetric Toggle & Responsive Safety):** As a user, I want a collapsible 240px secondary left sidebar containing the directory tree that defaults to collapsed and can be expanded or collapsed via a circular toggle button anchored on the left rail divider (with automatic collapse on narrow windows), so that I can access my folder structure on demand without sacrificing table space when not needed.
- **US-2 (On-Demand Hierarchical Folder Loading with Boxed Expanders):** As a user, I want the directory tree to start from "My Drive" with dotted hierarchy guidelines and boxed `[+]` / `[-]` expanders that load nested subfolders lazily, collapsing to the parent's contents on `[-]` and showing no box on leaf folders, so that folder structures load quickly and communicate branch depth clearly.
- **US-3 (Bidirectional Navigation & Traversal Synchronization):** As a user, I want clicking a folder in the tree to navigate the central table to that directory, and navigating in the central table to automatically expand ancestor branches and highlight the active folder in the tree, so that both navigation surfaces work in parallel.
- **US-4 (Swiss Archive Aesthetic, Tooltips & Cache Invalidation):** As a user, I want the directory tree panel to incorporate Swiss Archive surface colors, a technical header index strip (`DRIVE // TREE` · `MY_DRIVE`), single-line rows with ellipsis and persistent tooltips, high-contrast Klein Blue active selection highlighting, and full cache invalidation on manual refresh, so that the panel integrates seamlessly with the desktop experience.

## Definitions
- **Directory Tree Panel:** A secondary left-side vertical panel (fixed 240px width when expanded, 0px when collapsed) positioned immediately to the right of the 64px navigation rail and to the left of the central explorer canvas.
- **Rail Divider Toggle:** A 28px × 28px circular button anchored on the vertical border separating the navigation rail and the tree panel, displaying a chevron-right (`>`) icon when the tree is collapsed and a chevron-left (`<`) icon when expanded, creating an exact visual symmetry with the right telemetry sidebar toggle.
- **Boxed Branch Expanders (`[+]` / `[-]`):** Classic square boxed indicators indicating expandable state: `[+]` indicates a folder with subfolders that is currently collapsed; `[-]` indicates an expanded folder branch.
- **Leaf Folder Node:** A folder that contains zero subdirectories; leaf folders display no `[+]` or `[-]` box, connecting directly to the folder icon via dotted guidelines.
- **Dotted Hierarchy Guidelines:** Subtle vertical and horizontal dotted guide lines (`1px` dotted line) visually connecting parent nodes with their respective child folders.
- **Active Directory Indicator:** A 3px-wide vertical Klein Blue accent bar along the left edge of the tree node, accompanied by elevated selection surface color and Klein Blue text, identifying the folder currently displayed in the central table.
- **Lazy Folder Loading:** Asynchronous loading of immediate child folders triggered on-demand when the user clicks a folder's `[+]` expander, caching loaded subfolders in memory to avoid repeated queries.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL provide a collapsible **Directory Tree Panel** positioned between the left navigation rail and the central workspace canvas, defaulting to **collapsed (0px width)** upon application launch.
- **FR-2:** THE SYSTEM SHALL render a **Rail Divider Toggle** button (28px × 28px, circular, with a 1px structural border and chevron iconography) anchored on the right border of the 64px navigation rail; WHEN the user clicks the toggle while the directory tree is collapsed, THE SYSTEM SHALL expand the directory tree panel to 240px; WHEN the user clicks the toggle while the directory tree is expanded, THE SYSTEM SHALL collapse the panel to 0px.
- **FR-3:** WHILE the directory tree panel is expanded, THE SYSTEM SHALL render an upper **Technical Index Strip** (32px height, secondary surface background, 1px bottom border rule) displaying `DRIVE // TREE` on the left and `MY_DRIVE` on the right in uppercase monospace typography in both English and Spanish locales.
- **FR-4:** THE SYSTEM SHALL render the root of the directory tree representing the user's **"My Drive"** (`Mi unidad` in Spanish / `My Drive` in English) displaying a cloud/drive root icon, an expander box, and the localized root label.
- **FR-5:** WHEN the user clicks the `[+]` expander box of a folder node in the directory tree, THE SYSTEM SHALL fetch and display only the immediate child folders of that node asynchronously (lazy loading), render dotted guidelines to child folders, and transition the expander box to `[-]`.
- **FR-6:** WHEN the user clicks the `[-]` expander box of an expanded folder node in the directory tree, THE SYSTEM SHALL collapse that node's subfolder branch, transition the expander box to `[+]`, and navigate the central file explorer table to display the contents of the parent folder.
- **FR-7:** IF a folder contains zero subfolders upon expansion or discovery, THEN THE SYSTEM SHALL render no `[+]` or `[-]` box on that node, connecting the node directly to the tree with dotted guidelines without rendering empty folder message labels.
- **FR-8:** WHEN the user clicks the name or icon of a folder node in the directory tree, THE SYSTEM SHALL navigate the central file explorer table directly to that folder and mark that tree node with the **Active Directory Indicator**.
- **FR-9:** WHEN the user navigates into a folder or ascends to a parent folder from within the central file explorer table, THE SYSTEM SHALL reflect that traversal path in the directory tree by automatically expanding any ancestor branches and highlighting the current folder with the **Active Directory Indicator**.
- **FR-10:** THE SYSTEM SHALL cache previously fetched subfolder lists in memory; WHEN the user clicks the manual `Refresh` (`Actualizar`) button in the bottom status bar, THE SYSTEM SHALL invalidate the entire directory tree cache and re-fetch the active folder structure from the storage provider.
- **FR-11:** WHILE the active theme is `light`, THE SYSTEM SHALL style the directory tree panel using the Swiss Archive secondary surface (`#F2F0EA`), 1px borders (`#C9C6BD`), hover background (`#ECEAE3`), selected active surface (`#DDE7FA`), and primary Klein Blue accent (`#1B44E8`).
- **FR-12:** WHILE the active theme is `dark`, THE SYSTEM SHALL style the directory tree panel using the Swiss Archive secondary surface (`#15181E`), 1px borders (`#2C323D`), hover background (`#1E232C`), selected active surface (`#1C2D52`), and luminous Klein Blue accent (`#3B66FF`).
- **FR-13:** THE SYSTEM SHALL render directory tree folder rows with a uniform height of 32px, proportional progressive indentation based on hierarchical depth (`16px` per nesting level), a 3px vertical Klein Blue accent bar on the active row, single-line text with `ellipsis` overflow truncation, and a persistent tooltip (`title`) displaying the full folder name on hover for all nodes.
- **FR-14:** WHILE the application window width is smaller than the responsive threshold, THE SYSTEM SHALL automatically collapse the directory tree panel to 0px and disable manual expansion, preventing layout clipping in the central file explorer table.

## Non-Functional Requirements
- **NFR-1 (Decoupled Provider Architecture & Quota Conservation):** Expanding a folder node must only query subfolders through the typed Main Process `StorageProvider` IPC contracts (filtering files out of the tree query) and complete within 600ms on broadband connections, reusing cached tree branches for zero redundant network roundtrips.
- **NFR-2 (Layout Responsiveness & Fluid Transitions):** Panel expand and collapse animations must use CSS transitions (`duration-200`) without triggering layout overflow, horizontal scrollbars, or text clipping in the central file explorer table.
- **NFR-3 (Zero Functional Regression):** Introducing the directory tree panel must preserve 100% of existing table navigation, status bar counts, telemetry sidebar controls, modal dialogs, and theme/language toggle mechanisms.

## Edge Cases
- **EC-1:** Rapid consecutive clicks on a folder's expander while its children are loading $\rightarrow$ The system displays a subtle inline loading indicator and ignores duplicate requests until the query resolves.
- **EC-2:** Deeply nested directory hierarchy exceeding panel width $\rightarrow$ Text truncates with ellipsis and the container provides smooth horizontal scroll or title tooltips on hover, preventing broken layout.
- **EC-3:** Navigating to root via breadcrumbs or parent nav row $\rightarrow$ The tree smoothly deselects subfolders and marks "My Drive" root as active.
- **EC-4:** Network error when expanding a folder branch $\rightarrow$ The system displays a discreet retry icon on the branch without collapsing the tree or crashing the view.
- **EC-5:** Toggling between Light and Dark modes while the tree has multiple expanded branches $\rightarrow$ All tree surfaces, text inks, `[+]`/`[-]` boxes, and active indicator bars update instantaneously without resetting expanded branch states.
- **EC-6:** Clicking `[-]` on the root "My Drive" node $\rightarrow$ Collapses the root branch and keeps the central file table displaying "My Drive" contents.

## Out of Scope
- Drag and drop file/folder movement between the central table and the directory tree branches.
- Right-click contextual menus (Rename, Delete, New Folder) directly on tree nodes (operations remain in the central explorer table).
- Displaying standalone files (PDFs, images, docs) in the directory tree (tree displays folders exclusively).
- Multi-provider trees (e.g. Dropbox, OneDrive) or secondary roots ("Shared with me", "Trash").

## Completion Criteria
- Collapsible 240px Directory Tree Panel positioned between the navigation rail and central table, defaulting to collapsed (0px).
- Symmetrical 28px × 28px circular toggle button on the rail divider with chevron iconography and responsive auto-collapse safety.
- Root node showing "My Drive" (`Mi unidad` / `My Drive`) with lazy-loaded subfolders on `[+]` click and dotted guidelines.
- Collapsing an expanded branch via `[-]` navigates the central table to the parent folder.
- Leaf folders with zero subfolders display no `[+]` or `[-]` box and connect cleanly via dotted guidelines.
- Two-way traversal synchronization: clicking a tree folder updates the table; navigating inside the table auto-expands ancestor branches and highlights the folder in the tree.
- Single-line 32px rows with ellipsis, persistent title tooltips, and 3px left Klein Blue selection bar.
- Status bar `Refresh` button invalidates the entire folder tree cache.
- 100% automated test suite passing with zero regressions.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All requirements, QA audit findings, and edge cases have been resolved.*

## Decisions / Clarifications (Changelog)
- **2026-11-09 (Initial Spec Interview):**
  - **Decision 1 (Root Section Scope):**
    - *Question*: What main sections should the tree display at root level?
    - *Agreement*: Only "My Drive" (`Mi unidad`), keeping secondary sections ("Shared with me", "Trash") out of scope for this iteration.
    - *Why*: Streamlines initial delivery and focuses on primary folder hierarchy navigation.
  - **Decision 2 (On-Demand Lazy Loading):**
    - *Question*: Should the tree eagerly fetch all nested folders or load branches on demand?
    - *Agreement*: On-demand lazy loading upon clicking each folder's expander.
    - *Why*: Minimizes initial load latency and conserves Google Drive API rate quotas.
  - **Decision 3 (Bidirectional Navigation Synchronization):**
    - *Question*: How should the tree and central file table synchronize?
    - *Agreement*: Full two-way synchronization working in parallel. Clicking a folder in the tree navigates the table; navigating in the table auto-expands parent branches and highlights the folder in the tree.
    - *Why*: Prevents state desynchronization and provides intuitive orientation.
  - **Decision 4 (Default Collapsed State & Symmetric Toggle):**
    - *Question*: What is the initial visibility and toggle mechanism for the tree panel?
    - *Agreement*: Collapsed (0px) by default, toggled via a 28px circular button on the rail divider with chevron icons, mirroring the right telemetry sidebar toggle.
    - *Why*: Preserves full table workspace on startup and creates perfect bilateral symmetry in the shell.
  - **Decision 5 (Navigation Scope):**
    - *Question*: Should the tree support context menus?
    - *Agreement*: Tree is strictly for fast navigation (no right-click menus).
    - *Why*: Maintains high velocity and archival visual purity.
- **2026-11-10 (QA Audit Clarifications — `/sdd-clarify`):**
  - **Decision 6 (Traversal Synchronization & Parent Navigation on Collapse in `FR-6` & `FR-9`):**
    - *Question*: How should ancestor branches be resolved when traversing from the table, and what happens when collapsing an expanded folder via `[-]`?
    - *Agreement*: The tree dynamically reflects the traversal path when navigating through the file list, and the file list shows the contents of the last selected folder. Clicking `[-]` collapses the folder node and navigates the central table to the parent folder.
    - *Why*: Guarantees tight parallel synchronization between both views.
  - **Decision 7 (Static English Technical Strip in `FR-3`):**
    - *Question*: Should `MY_DRIVE` in the technical index strip be localized to `MI_UNIDAD` in Spanish?
    - *Agreement*: Kept strictly in English (`DRIVE // TREE` · `MY_DRIVE`) across all languages.
    - *Why*: Maintains editorial consistency with system tokens like `OAUTH 2.0` and `SAFE_STORAGE`.
  - **Decision 8 (Ellipsis & Persistent Tooltip in `FR-13`):**
    - *Question*: How should long folder names be formatted?
    - *Agreement*: Single-line 32px height with `text-overflow: ellipsis`, and an informative tooltip (`title`) always present regardless of whether the text is truncated.
    - *Why*: Ensures fixed row height and immediate readability of long folder names on hover.
  - **Decision 9 (Boxed `[+]` / `[-]` Expanders, Dotted Guide Lines & Clean Leaf in `FR-5`, `FR-6`, `FR-7`):**
    - *Question*: How should expansion states and leaf nodes be visually indicated?
    - *Agreement*: Use classic square boxed `[+]` (collapsed) and `[-]` (expanded) indicators connected by dotted hierarchy lines. When a folder has no subfolders, display no expander box at all (just the dotted line directly to the folder icon).
    - *Why*: Eliminates user confusion on empty branches and matches classic archival desktop file managers.
  - **Decision 10 (Responsive Auto-Collapse in `FR-14`):**
    - *Question*: How should the tree panel behave on narrow window widths?
    - *Agreement*: Auto-collapse to 0px and disable manual expansion when the window width drops below the minimum threshold, mirroring the right sidebar behavior.
    - *Why*: Prevents severe horizontal compression of the central table on small screens.
  - **Decision 11 (Total Cache Invalidation on Refresh in `FR-10`):**
    - *Question*: Does the manual status bar `Refresh` button invalidate the folder tree cache?
    - *Agreement*: Yes, invalidates the entire folder tree cache and re-fetches from Google Drive.
    - *Why*: Ensures full synchronization with remote changes on demand.
  - **Decision 12 (Decoupled StorageProvider Architecture in `NFR-1`):**
    - *Question*: How should tree queries be structured to adhere to Constitution Principle 2?
    - *Agreement*: Executed strictly via typed IPC calls in the Main process through `StorageProvider`, maintaining process isolation and provider agnosticism.
    - *Why*: Preserves architecture decoupling and security rules.
