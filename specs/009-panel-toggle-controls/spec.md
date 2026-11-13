# Spec 009 — Panel Visibility Toggle Controls
Status: approved

## Context and Goal
Prydrive features a multi-panel desktop shell comprising a left navigation rail (64px), a collapsible directory tree panel (240px), a central file explorer workspace, and a right telemetry/storage sidebar (260px). Currently, the left side of the top header bar renders a static text badge (`UNIDAD: //MY_DRIVE` / `DRIVE: //MY_DRIVE`). On narrow desktop viewports, simultaneously expanding lateral panels can compress the central file table or cause layout crowding.

To optimize workspace flexibility and empower users to tailor their layout:
1. Replace the static text badge in the top-left header with a standardized **Panel Visibility Toggle Cluster**.
2. In standard resolution ($\ge 784px$), provide 2 buttons to toggle the **Directory Tree Panel** and the **Right Sidebar**, featuring clear "pressed" state feedback (`aria-pressed="true"`) when a panel is visible.
3. In compact resolution ($< 784px$), automatically introduce a 3rd button for the **Left Navigation Rail**, automatically collapse all three lateral bars to 0px width (`w-0`) upon entering compact mode, and dedicate 100% of the window width to the central file explorer.
4. When working in compact resolution, allow the user to display any of the three bars (rail, tree, or sidebar) **one at a time under strict mutual exclusion**, closing any previously open bar so they never superimpose simultaneously.
5. In compact resolution, hide redundant floating controls (the circular rail divider toggle and the bottom status bar button), establishing the top-left header cluster as the exclusive, centralized control point.
6. When resizing back to standard resolution ($\ge 784px$), automatically restore the navigation rail to its standard 64px width.
7. Guarantee bidirectional synchronization between the header buttons and all panel visibility state mechanisms.

## Users
- **Desktop File Manager:** A user working across various screen resolutions (from full-screen monitors to compact split-screen viewports) who needs fast, accessible control over panel visibility to maximize canvas real estate for files and folders.

## User Stories
- **US-1 (Top Header Panel Toggle Cluster):** As a user, I want dedicated toggle buttons in the top-left header bar replacing the static text badge, so that I can directly toggle the directory tree and right sidebar with intuitive visual feedback.
- **US-2 (Low-Resolution Adaptive Navigation Rail Toggle):** As a user on a narrow window, I want a third button to appear for the left navigation rail, with all bars automatically collapsed upon entering low resolution, so that I can give 100% of the screen width to my files.
- **US-3 (Low-Resolution Mutually Exclusive Overlays):** As a user on a narrow window, I want opening any lateral bar to hide any other open bar, so that I can inspect folder hierarchies or storage quota one at a time without breaking the layout or causing visual crowding.
- **US-4 (Bidirectional Synchronization and Accessible Feedback):** As a user, I want the header toggle buttons to remain synchronized with all existing toggle triggers, with tooltips in English and Spanish and pressed-state accessibility attributes.

## Definitions
- **Panel Visibility Toggle Cluster:** Group of compact interactive buttons in the top-left header bar governing the visibility of the application's structural panels.
- **Standard Resolution:** Viewport width $\ge 784px$ where the central file explorer has sufficient clearance to coexist alongside expanded lateral panels in fluid desktop columns.
- **Compact Resolution:** Viewport width $< 784px$ where simultaneous column expansion would compromise table legibility, triggering overlay mode, automatic panel collapse, and navigation rail collapse affordance.
- **Overlay Mode:** Superimposing layout presentation in compact viewports where lateral panels float on top of the central workspace without altering the underlying file table width.
- **Pressed State:** Visual and semantic indication (`aria-pressed="true"`) confirming that the associated panel is currently visible and expanded, styled with Swiss Archive selection tokens (`bg-[#DDE7FA] border-[#1B44E8] text-[#1B44E8]` in Light Mode; `bg-[#1C2D52] border-[#3B66FF] text-[#3B66FF]` in Dark Mode).
- **Exclusive Control Center:** In compact resolution, both lateral floating divider buttons (the left rail divider toggle and the right sidebar toggle) are hidden, centralizing lateral panel controls strictly in the top-left header cluster, while the bottom status bar remains permanently visible and persistent across all resolutions.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL replace the static monospace unit badge in the top-left area of the header bar with an interactive panel toggle cluster.
- **FR-2:** THE SYSTEM SHALL render buttons in the top-left header cluster with standardized 30×30 px dimensions, subtle 4px corner rounding (`rounded-[4px]`), and 1px borders aligned with the Swiss Archive design system.
- **FR-3:** WHILE the application window is at standard resolution (viewport width >= 784px), THE SYSTEM SHALL render two panel toggle buttons in the top-left cluster in the exact sequence:
  1. **Directory Tree Toggle** (folder tree icon)
  2. **Right Sidebar Toggle** (right panel icon)
- **FR-4:** WHILE the application window is at compact resolution (viewport width < 784px), THE SYSTEM SHALL render three panel toggle buttons in the top-left cluster in the exact sequence:
  1. **Navigation Rail Toggle** (left panel icon)
  2. **Directory Tree Toggle** (folder tree icon)
  3. **Right Sidebar Toggle** (right panel icon)
- **FR-5:** WHEN the user activates a panel toggle button, THE SYSTEM SHALL alternate the visibility of the corresponding panel between expanded and collapsed states.
- **FR-6:** WHILE a panel is expanded/visible, THE SYSTEM SHALL render its corresponding header toggle button in an active "pressed" state (`aria-pressed="true"`):
  - Light Mode: `bg-[#DDE7FA] border-[#1B44E8] text-[#1B44E8]`
  - Dark Mode: `bg-[#1C2D52] border-[#3B66FF] text-[#3B66FF]`  
  WHILE a panel is collapsed/hidden, THE SYSTEM SHALL render its toggle button in an inactive neutral state (`aria-pressed="false"`, `bg-[#FFFFFF] dark:bg-[#181C23] border-[#C9C6BD] dark:border-[#2C323D] text-[#111315] dark:text-[#F3F4F6]`).
- **FR-7:** WHEN the application window crosses below the 784px width threshold into compact resolution, THE SYSTEM SHALL automatically collapse all three lateral bars (Navigation Rail, Directory Tree, Right Sidebar) to 0px width (`w-0`), allocating the full window width to the central file explorer.
- **FR-8:** WHEN the application window crosses back to standard resolution (viewport width >= 784px), THE SYSTEM SHALL automatically re-expand the left navigation rail to its standard 64px width.
- **FR-9:** WHILE in compact resolution (< 784px), WHEN the user opens any lateral panel (Navigation Rail, Directory Tree, or Right Sidebar), THE SYSTEM SHALL automatically close any other currently open lateral panel, enforcing strict mutual exclusion so that only one panel is open at a time.
- **FR-10:** WHILE a panel is open in compact overlay mode, WHEN the user navigates or selects folders in the Directory Tree, THE SYSTEM SHALL keep the overlay open for continuous exploration. THE SYSTEM SHALL close the active overlay strictly when the user activates its corresponding header toggle button again.
- **FR-11:** WHILE the application window is at compact resolution (< 784px), THE SYSTEM SHALL hide both lateral floating divider toggle buttons: the circular rail divider toggle on the left (`RailDividerToggle`) AND the floating sidebar toggle on the right (`sidebar-toggle-btn`), designating the top-left header cluster as the exclusive control center for lateral panel visibility.
- **FR-12:** THE SYSTEM SHALL preserve the bottom explorer status bar (housing the manual Refresh action, folder/file metrics, and aggregate size telemetry) fully visible, accessible, and persistent across all window resolutions, including compact resolution.
- **FR-13:** THE SYSTEM SHALL synchronize the pressed state of all header toggle buttons bidirectionally with all other panel toggle mechanisms (including rail floating toggles, bottom status bar buttons, and menu bar shortcuts) while in standard resolution.
- **FR-14:** THE SYSTEM SHALL provide localized hover tooltips and accessible `aria-label` tags in both English and Spanish communicating the exact action and state of each button:
  - Navigation Rail: `Ocultar barra de navegación` / `Mostrar barra de navegación` (ES) — `Hide navigation rail` / `Show navigation rail` (EN)
  - Directory Tree: `Ocultar árbol de carpetas` / `Mostrar árbol de carpetas` (ES) — `Hide directory tree` / `Show directory tree` (EN)
  - Right Sidebar: `Ocultar panel lateral` / `Mostrar panel lateral` (ES) — `Hide sidebar` / `Show sidebar` (EN)

## Non-Functional Requirements
- **NFR-1 (Aesthetic Harmony):** Header toggle buttons must adopt Swiss Archive surfaces in both Light and Dark themes, matching the styling, dimensions (30×30 px), and active hover states of the top-right control cluster.
- **NFR-2 (Accessibility & Touch/Click Target):** Buttons must provide minimum WCAG AA contrast (4.5:1 for active text/icons, 3:1 for borders), clear focus rings, and explicit `aria-pressed` states.
- **NFR-3 (Zero Regression):** Panel toggles must preserve active file transfers, directory navigation stack, and existing keyboard shortcuts.

## Edge Cases
- **EC-1:** Dynamic window resizing across 784px width threshold $\rightarrow$ Seamlessly adds or removes the Navigation Rail toggle button, auto-restoring standard layout without UI jitter.
- **EC-2:** Rapid consecutive clicks on toggle buttons $\rightarrow$ Panel animation state transitions gracefully without visual clipping or state desynchronization.
- **EC-3:** Instantaneous theme toggle $\rightarrow$ Pressed and neutral button states transition immediately in both Light and Dark themes.
- **EC-4:** Instantaneous language toggle $\rightarrow$ All tooltips and accessible labels update immediately between Spanish and English.
- **EC-5:** Navigation within an overlay tree $\rightarrow$ Selecting a folder in the overlaid directory tree navigates the underlying central table while preserving user focus and keeping the overlay open.
- **EC-6:** Auto-collapse upon entering compact resolution $\rightarrow$ Crossing below 784px automatically collapses all three bars (rail, tree, sidebar) to 0px width.
- **EC-7:** Auto-restoration upon returning to standard resolution $\rightarrow$ Crossing back $\ge 784px$ automatically restores the left navigation rail to its standard 64px width.

## Out of Scope
- Drag-and-drop manual width resizing of the header toggle buttons.
- User-customizable drag-and-drop rearrangement of toggle buttons.
- Multi-window detaching of panels into independent desktop windows.

## Completion Criteria
- Top-left header text replaced with 2 buttons in standard resolution (`FolderTree`, `PanelRight`) and 3 buttons in compact resolution (`PanelLeft`, `FolderTree`, `PanelRight`).
- Pressed state visual feedback (`bg-[#DDE7FA] border-[#1B44E8]` in Light; `bg-[#1C2D52] border-[#3B66FF]` in Dark) applied cleanly when panels are visible.
- Entering compact resolution (< 784px) automatically closes all three bars (rail, tree, sidebar) to 0px.
- Navigation rail restores to 64px upon returning to standard resolution ($\ge 784px$).
- Mutually exclusive overlay mode functioning on narrow screens (opening one panel hides any other open panel).
- Directory tree overlay remains open during nested folder clicks until explicitly closed via header toggle.
- Secondary floating toggles (both the left rail divider toggle and the right sidebar toggle) hidden in compact resolution.
- Bottom explorer status bar (with manual Refresh button, folder/file metrics, and size telemetry) remains permanently visible and persistent across all resolutions.
- Bidirectional synchronization with existing status bar and rail toggle controls in standard mode.
- 100% test suite passing with unit and integration tests.
- Zero TypeScript errors (`tsc --noEmit`).

## Open Questions
*(All requirements, edge cases, and QA audit points resolved)*

## Decisions / Clarifications (Changelog)
- **2026-11-12 (Interview Resolution 1 - Iconography & Order):** Agreed to use standard Lucide icons (`PanelLeft`, `FolderTree`, `PanelRight`) for clarity and immediate recognition, ordered left-to-right corresponding to screen layout: Navigation Rail (when present) $\rightarrow$ Directory Tree $\rightarrow$ Right Sidebar.
- **2026-11-12 (Interview Resolution 2 - Low-Resolution Threshold & Rail Collapse):** Agreed that the Navigation Rail button appears when the window width is insufficient to expand both lateral panels alongside the central canvas ($< 784px$). Clicking it collapses the rail to 0px width (`w-0`), giving 100% width to the file table.
- **2026-11-12 (Interview Resolution 3 - Pressed Visual State):** Confirmed that each button displays a sunken / "pressed" appearance (`aria-pressed="true"`, active background and border) when its panel is visible, and neutral when hidden.
- **2026-11-12 (Interview Resolution 4 - Low-Resolution Mutually Exclusive Overlays):** Agreed that in compact resolution with the rail collapsed, the directory tree and right sidebar superimpose on top of the file table one at a time (opening one automatically closes the other), and dismiss strictly when clicked again.
- **2026-11-12 (Interview Resolution 5 - Bidirectional Synchronization & Geometry):** Confirmed that header buttons maintain 100% bidirectional sync with existing toggles (rail divider toggle and status bar button) and share identical 30×30 px dimensions and 4px rounding with the top-right cluster buttons.
- **2026-11-12 (QA Audit Resolution 1 - Swiss Archive Pressed Tokens):** Standardized pressed button tokens on Swiss Archive selection theme colors: Light mode uses `bg-[#DDE7FA] border-[#1B44E8] text-[#1B44E8]`; Dark mode uses `bg-[#1C2D52] border-[#3B66FF] text-[#3B66FF]`.
- **2026-11-12 (QA Audit Resolution 2 - Auto-Restoration on Standard Return):** Agreed that crossing back to standard resolution ($\ge 784px$) automatically restores the left navigation rail to 64px width.
- **2026-11-12 (QA Audit Resolution 3 - Compact Entry Auto-Close & Strict Mutual Exclusion):** Confirmed that crossing below 784px automatically collapses all three bars (rail, tree, sidebar) to 0px. In this mode, opening any bar automatically closes any other currently open bar, enforcing strict 1-at-a-time visibility.
- **2026-11-12 (QA Audit Resolution 4 - Hiding Floating Toggles in Compact Mode):** Agreed that in compact resolution ($< 784px$), both the floating circular rail divider toggle and the bottom status bar sidebar toggle are hidden, centralizing panel controls strictly in the top-left header cluster.
- **2026-11-12 (QA Audit Resolution 5 - Directory Tree Overlay Persistence):** Confirmed that navigating/clicking folders within the overlaid directory tree keeps the overlay open for continuous subfolder exploration, closing strictly when the user activates the header toggle button again.
- **2026-11-12 (QA Audit Resolution 6 - Global Synchronization Consistency):** Confirmed bidirectional state consistency across all controls.
- **2026-11-12 (Clarification — Hiding Right Sidebar Floating Button in Low Resolution):** Clarified and mandated that in compact resolution (< 784px), the right sidebar's floating edge toggle button (`sidebar-toggle-btn`) must disappear alongside the left rail's floating divider toggle, completely eliminating all floating buttons over the workspace canvas.
- **2026-11-12 (Requirement Refinement — Preserving Bottom Explorer Status Bar in All Resolutions):** Clarified that the bottom explorer status bar (housing the manual Refresh button, file/folder counts, and aggregate size) must never be hidden in low resolution. It remains 100% persistent and visible across all resolutions. Only the lateral floating divider buttons (`RailDividerToggle` on the left and `sidebar-toggle-btn` on the right) are hidden in compact mode.
