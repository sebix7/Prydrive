# Spec 002 — Desktop Application Shell
Status: approved

## Context and Goal
Prydrive requires a dedicated, structured desktop application shell that establishes the primary window layout for authenticated users, guided by the visual design mockup and the `frontend-design` craftsmanship principles. The shell replaces the interim linear header with a four-zone architecture: a classic top menu bar for application-level navigation and account actions, a vertical left navigation rail hosting interactive brand and provider buttons, a central workspace canvas serving as the future file explorer foundation, and a collapsible right telemetry sidebar displaying connected provider identity, user credentials, and cloud storage quota metrics. When unauthenticated, the sign-in screen occupies the full window; once authenticated, the shell becomes the permanent desktop workspace.

## Users
- **Authenticated Desktop User:** Any user who has connected their Google Drive account and needs a structured, distraction-free desktop environment to monitor storage capacity, access administrative settings, and prepare for cloud file management.

## User Stories
- **US-1:** As an authenticated user, I want a structured four-panel desktop shell (top menu bar, left navigation rail, central workspace, and right telemetry sidebar) so that the application provides a modern, native desktop experience.
- **US-2:** As an authenticated user, I want two interactive buttons on the left navigation rail (Prydrive logo and Google Drive logo) with distinctive active background styling that display the active Drive workspace so that I have intuitive navigation controls and a foundation for future provider views.
- **US-3:** As an authenticated user, I want a classic desktop menu bar with accessible menus (File, Account, View, Help) containing the account disconnection flow, language toggle, and window actions so that administrative actions are cleanly organized without cluttering the main workspace.
- **US-4:** As an authenticated user, I want a dedicated, collapsible right sidebar displaying the Google Drive logo, connected email address, and storage quota progress bar (used vs. total space), toggled via a circular divider button or menu action, so that I can monitor my account storage and collapse it when I want maximum canvas space.
- **US-5:** As an authenticated user, I want all shell elements, menu items, tooltips, and sidebar labels to seamlessly respect my preferred language (English or Spanish) so that the entire shell interface is fully localized.

## Definitions
- **Navigation Rail:** A vertical toolbar anchored to the left border of the application window containing primary brand and provider navigation buttons.
- **Classic Menu Bar:** A horizontal desktop menu strip offering traditional drop-down menus (File, Account, View, Help).
- **Telemetry Sidebar:** A collapsible vertical panel on the right side of the window dedicated to provider metadata, user identity, and storage capacity metrics.
- **Divider Toggle Button:** A circular button positioned on the panel border divider displaying directional chevrons (`<` / `>`) to toggle panel expansion and collapse.
- **Central Workspace:** The primary canvas area designed to host the active provider view and future file and folder exploration.

## Functional Requirements
- **FR-1:** WHILE the user has an active authenticated session, THE SYSTEM SHALL render the application shell structured into a top menu bar, a left navigation rail, a central workspace canvas, and a collapsible right sidebar.
- **FR-2:** IF the user does not have an active authenticated session, THEN THE SYSTEM SHALL render the full-window welcome screen ("Sign in with Google"), replacing the four-panel shell entirely.
- **FR-3:** THE SYSTEM SHALL render two interactive buttons in the left navigation rail: a primary button with the Prydrive brand logo at the top, and a secondary button with the Google Drive provider logo beneath it.
- **FR-4:** THE SYSTEM SHALL visually distinguish the currently active button in the left navigation rail with a distinctive background fill.
- **FR-5:** WHEN the user clicks either the Prydrive button or the Google Drive button on the left navigation rail, THE SYSTEM SHALL update the active navigation state and present the Google Drive workspace view in the central canvas.
- **FR-6:** THE SYSTEM SHALL render a classic desktop menu bar at the top of the application with drop-down menus for:
  - **File (Archivo):** containing "Close Window" (Cerrar ventana) / "Exit" (Salir).
  - **Account (Cuenta):** containing the connected user's email as an informational header, "Language" (Idioma: English / Español toggle), a divider, and "Disconnect account..." (Desconectar cuenta...).
  - **View (Ver):** containing "Toggle Storage Sidebar" (Alternar panel de almacenamiento).
  - **Help (Ayuda):** containing "About Prydrive" (Acerca de Prydrive) displaying version (v0.1.0) and project metadata.
- **FR-7:** WHEN the user selects the "Disconnect account..." action from the menu bar, THE SYSTEM SHALL close any open dropdown menus and present the modal confirmation dialog asking the user to confirm the sign-out action.
- **FR-8:** WHEN the user selects the language option from the menu bar, THE SYSTEM SHALL dynamically toggle the active language between English and Spanish, updating all shell labels, menus, sidebar text, and dialogs immediately.
- **FR-9:** THE SYSTEM SHALL render the right telemetry sidebar in an expanded state by default upon application startup and after login.
- **FR-10:** THE SYSTEM SHALL render within the right telemetry sidebar: the Google Drive logo, the connected user's email address, and the graphical storage quota progress bar indicating used vs. total storage.
- **FR-11:** THE SYSTEM SHALL provide a circular divider toggle button positioned on the panel border displaying a directional chevron (`<` / `>`) to collapse and expand the sidebar, in addition to the "View" menu toggle action.
- **FR-12:** WHEN the user clicks the circular divider toggle button or selects the toggle action in the "View" menu, THE SYSTEM SHALL animate the sidebar between the expanded state and the collapsed state, smoothly adjusting the central workspace width.
- **FR-13:** WHILE the right sidebar is collapsed, THE SYSTEM SHALL preserve storage quota metrics in memory and maintain the circular expand button on the divider line.
- **FR-14:** WHILE storage quota metrics are loading, THE SYSTEM SHALL render a skeleton placeholder within the right sidebar quota section.
- **FR-15:** IF storage quota metrics fail to load, THEN THE SYSTEM SHALL display a descriptive fallback status with a refresh action inside the right sidebar while preserving the user email and provider logo.
- **FR-16:** THE SYSTEM SHALL present a clean placeholder in the central workspace indicating that the Google Drive connection is active and ready for the file explorer.

## Non-Functional Requirements
- **NFR-1 (Aesthetic Craftsmanship):** The visual layout must adhere to the `frontend-design` aesthetic standards: clean 1px structural dividers, high visual clarity, no gratuitous all-caps badges, and distinct visual hierarchy between rails, canvas, and sidebars.
- **NFR-2 (Responsiveness):** The application shell must adapt dynamically to window resizing, enforcing a minimum window size of 960x600 pixels to ensure neither the navigation rail nor the menu bar are clipped.
- **NFR-3 (Fluid Sidebar Transition):** Toggling the sidebar between collapsed and expanded states must animate smoothly in under 200ms without layout jitter or content overflow.

## Edge Cases
- **EC-1:** Extremely long user email address in the right sidebar $\rightarrow$ Text truncates with an ellipsis (`...`) and provides a full-text tooltip upon hover to prevent sidebar horizontal blowout.
- **EC-2:** Window resized to minimum width with sidebar expanded $\rightarrow$ Central workspace maintains a minimum usable width of at least 480px; if further constrained, sidebar auto-collapses to prioritize the central canvas.
- **EC-3:** Menu bar opened when clicking outside $\rightarrow$ The active dropdown menu closes immediately on click-outside or pressing `Escape`.
- **EC-4:** Disconnect modal triggered while menu is open $\rightarrow$ The dropdown menu automatically closes and the confirmation modal takes focus with keyboard traps.
- **EC-5:** Rapid toggling of left rail buttons $\rightarrow$ Idempotent state management prevents redundant view re-renders or flickering.

## Out of Scope
- Keyboard navigation traversal (`Alt` key, arrow keys) for menu bar (mouse/click-driven menus for this iteration).
- Real file and folder listing, hierarchy navigation, and grid/list file cards (deferred to `specs/003-drive-explorer`).
- Native file drag & drop, file uploading, and streaming downloads (deferred to transfer specs).
- Multi-provider switching logic (e.g. adding Dropbox or OneDrive, reserved for future specs).
- In-app file previews, editing, and deletion (deferred to subsequent explorer specs).

## Completion Criteria
- Verified rendering of the four-panel layout (top menu, left rail, central canvas, right sidebar).
- Functional Prydrive and Google Drive buttons on the left rail with distinctive active background fill.
- Classic menu bar with File, Account, View, Help, language switching, and disconnection trigger.
- Right sidebar containing provider logo, email, quota progress bar, and circular divider collapse/expand toggle button.
- Clean full-window welcome screen when unauthenticated.
- Full bilingual localization (English / Spanish) across all shell components.
- 100% automated test coverage passing for shell state management and interactions.

## Decisions / Clarifications (Changelog)
- **2026-11-01:** Established `specs/002-app-shell` based on user-provided layout mockup and `frontend-design` guidelines.
- **2026-11-02 (QA Audit Resolution):**
  - **Question 1 (Menu actions):** Defined concrete menu items for File (Close/Exit), Account (Email, Language, Disconnect), View (Toggle Sidebar), and Help (About Prydrive v0.1.0).
  - **Question 2 (Sidebar collapse toggle):** Specified a circular divider toggle button sitting on the panel border with directional chevrons (`<` / `>`) matching reference mockup, alongside the "View" menu action.
  - **Question 3 (Initial sidebar state):** Set to expanded by default upon startup and login.
  - **Question 4 (Active button style):** Defined a distinctive background fill for the currently active button in the left navigation rail.
  - **Question 5 (Multi-provider foundation):** Acknowledged left rail architecture as the foundation for future cloud storage providers.
  - **Question 6 (Unauthenticated state):** Clarified that the welcome screen ("Sign in with Google") occupies the entire window, replacing the shell completely when not authenticated.
  - **Question 7 (Keyboard navigation):** Keyboard arrow traversal for menus explicitly marked out of scope for this iteration.
