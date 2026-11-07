# Spec 005 — Light and Dark Theme Mode
Status: approved

## Context and Goal
Currently, Prydrive presents a fixed light appearance on the welcome/sign-in and offline screens while presenting a fixed dark appearance across the authenticated desktop shell and file explorer. Users need a cohesive, comfortable visual experience that adapts to their environment and personal preference across the entire application. This specification defines a functional, persistent theme switching capability supporting **Light Mode** and **Dark Mode** across both the sign-in experience and the authenticated file explorer workspace, defaulting to the operating system's color scheme on first launch.

## Users
- **Unauthenticated User (Sign-In & Offline Views):** A user on the welcome or offline screen who wants to toggle between light and dark appearances before signing in.
- **Authenticated Desktop User (Explorer & Shell):** A signed-in user managing Google Drive files who wants to switch between light and dark themes from the application menu bar and have their choice remembered across sessions.

## User Stories
- **US-1 (OS Default Theme Detection & Cross-Session Persistence):** As a user, I want the application to automatically adopt my operating system's light or dark preference on first launch and remember any manual theme change I make so that my preferred visual mode is preserved across sign-in, sign-out, and application restarts.
- **US-2 (Theme Toggle on Sign-In & Pre-Authentication Views):** As an unauthenticated user, I want a dedicated sun/moon theme toggle button next to the language selector on the sign-in and offline screens so that I can immediately switch between Light Mode and Dark Mode.
- **US-3 (Theme Selector in Application Options Menu):** As an authenticated user, I want a "Theme" submenu inside the top "Options" menu bar allowing me to select between "Light" and "Dark" with a visual active indicator so that I can change the workspace appearance at any time.
- **US-4 (Uniform Theme Styling Across All Application Surfaces & Modals):** As a user, I want the active theme (Light or Dark) to style all application surfaces—including the sign-in screen, top menu bar, left navigation rail, file explorer table, bottom status bar, right storage sidebar, scrollbars, and modal dialogs—so that the visual experience is cohesive and free of jarring contrast mismatches.
- **US-5 (Bilingual Localization Parity for Theme Controls):** As a user, I want all theme menu labels, options, and button tooltips to be displayed in my active language (English or Spanish) so that the interface remains fully localized.

## Definitions
- **Active Theme:** The visual color scheme currently applied to the entire application interface, restricted to either `light` (Light Mode) or `dark` (Dark Mode).
- **System Theme Fallback:** The operating system's preferred color scheme (`light` or `dark`), evaluated once at application startup when the user has not yet saved an explicit manual theme preference.
- **Pre-Authentication Views:** The welcome/sign-in screen, session validation loading screen, offline mode screen, and awaiting authorization modal.
- **Authenticated Workspace Views:** The top menu bar, left navigation rail, central Google Drive file explorer (table headers, rows, parent `"..."` row, loading/empty/error states, and bottom status bar), right storage telemetry sidebar, about modal, and disconnect confirmation modal.

## Functional Requirements
- **FR-1:** WHEN the application launches without a previously saved theme preference, THE SYSTEM SHALL detect the operating system's color scheme preference once at startup and set the initial active theme to `dark` or `light` accordingly.
- **FR-2:** WHEN the user manually selects or toggles a theme in any view, THE SYSTEM SHALL persist the chosen theme locally on the device and apply it immediately across the entire application without requiring a restart.
- **FR-3:** WHEN the user transitions between unauthenticated views (sign-in/offline) and the authenticated file explorer (or restarts the application), THE SYSTEM SHALL preserve and apply the persisted theme preference.
- **FR-4:** THE SYSTEM SHALL render a theme toggle button adjacent to the language selector in the top-right corner of the sign-in screen and the offline mode screen, displaying a **Moon** icon when the active theme is `light` (indicating action to switch to dark mode) and a **Sun** icon when the active theme is `dark` (indicating action to switch to light mode).
- **FR-5:** WHEN the user clicks the theme toggle button on the sign-in or offline screen, THE SYSTEM SHALL alternate the active theme between `light` and `dark`.
- **FR-6:** THE SYSTEM SHALL include a "Theme" ("Tema") item within the top "Options" ("Opciones") menu bar dropdown positioned immediately below "Language" ("Idioma") and above the structural separator for "Disconnect" ("Desconectar"), opening a flyout submenu containing "Light" ("Claro") and "Dark" ("Oscuro") options with mutual exclusion against the "Language" submenu so only one flyout submenu is open at a time.
- **FR-7:** WHILE the "Theme" submenu is open, THE SYSTEM SHALL display a checkmark indicator beside the currently active theme option (`light` or `dark`).
- **FR-8:** WHEN the user selects "Light" or "Dark" from the "Theme" submenu, THE SYSTEM SHALL activate the selected theme, persist the preference, and close the open menu bar dropdown.
- **FR-9:** WHILE the active theme is set to `dark`, THE SYSTEM SHALL render all Pre-Authentication Views and Authenticated Workspace Views (including modals and scrollbars) using the dark color palette with high-contrast light typography.
- **FR-10:** WHILE the active theme is set to `light`, THE SYSTEM SHALL render all Pre-Authentication Views and Authenticated Workspace Views (including modals and scrollbars) using the light color palette with high-contrast dark typography.
- **FR-11:** THE SYSTEM SHALL maintain clear visual distinction for interactive states (row hover, selected row highlight, active navigation rail button, and primary action buttons) and brand iconography in both `light` and `dark` themes.
- **FR-12:** IF reading or writing the local theme preference fails due to storage restrictions, THEN THE SYSTEM SHALL continue operating in memory using the active or system fallback theme without interrupting user workflows.
- **FR-13:** THE SYSTEM SHALL localize all theme menu items, option labels, and action-oriented button tooltips ("Switch to dark mode" / "Cambiar a modo oscuro" and "Switch to light mode" / "Cambiar a modo claro") symmetrically in English and Spanish according to the active application language.

## Non-Functional Requirements
- **NFR-1 (Instantaneous Visual Transition):** Switching between Light Mode and Dark Mode must update all visible UI surfaces instantaneously (< 50ms) without losing current folder navigation state, scroll position, or selected item state.
- **NFR-2 (Readability & Contrast Compliance):** All primary text must meet a minimum contrast ratio of 4.5:1 (WCAG AA) and secondary text/icons at least 3:1 against their respective backgrounds in both Light Mode and Dark Mode, maintaining clear structural separation between primary canvas surfaces and secondary navigation/bar surfaces.

## Edge Cases
- **EC-1:** First launch in an environment where OS color scheme detection is unavailable $\rightarrow$ Gracefully default to `dark` mode without errors.
- **EC-2:** Corrupted or unrecognized value stored in local theme persistence $\rightarrow$ Ignore the invalid value and fall back to the operating system's color scheme.
- **EC-3:** Toggling the theme while inside a nested Google Drive subfolder with an active row selection $\rightarrow$ The theme updates across the shell and table while preserving the current subfolder list, scroll offset, and selected item highlight.
- **EC-4:** Toggling the theme while a modal (`About`, `Disconnect`, or `Awaiting Authorization`) is open $\rightarrow$ The modal and backdrop immediately reflect the new theme.
- **EC-5:** Operating system color scheme changes while Prydrive is already running $\rightarrow$ The application retains the initial or user-selected theme of the active session without unexpected mid-session theme flips.
- **EC-6:** Brand logos and icons across themes $\rightarrow$ Official multicolor brand marks (Google "G" and Google Drive) preserve their authentic colors, while monochrome/cutout brand marks (Prydrive rail icon) adapt their inner cutout and stroke contrast to match the active button surface in both Light and Dark modes.

## Out of Scope
- Custom user-defined color palettes or accent color pickers beyond Light Mode and Dark Mode.
- Scheduled or time-of-day automatic theme switching.
- Dynamic live-listening to mid-session OS theme changes after startup.
- Per-folder or per-account independent theme configurations (theme preference is global to the desktop client).

## Completion Criteria
- Automatic one-time startup detection of OS color scheme when no saved preference exists.
- Persistent storage of manual theme selection surviving sign-in, sign-out, and application restarts.
- Functional Moon/Sun theme toggle button (Moon in Light Mode, Sun in Dark Mode) next to the language switcher on the sign-in and offline screens.
- Functional `Options -> Theme -> Light / Dark` submenu in the authenticated top menu bar with checkmark indicator and mutual exclusion with the `Language` submenu.
- Complete Light Mode and Dark Mode visual styling across all pre-authentication screens, desktop shell zones, file explorer table, status bar, scrollbars, and modals meeting WCAG AA contrast.
- 100% bilingual localization parity (English and Spanish) for all theme labels and tooltips.
- 100% automated test suite passing for theme resolution, toggling, persistence fallback, menu interactions, and translation keys.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All ambiguities and QA audit findings have been resolved.*

## Decisions / Clarifications (Changelog)
- **2026-11-05 (Initial Spec Interview):**
  - **Question 1 (Theme control placement):**
    - *Question*: Where should the theme controls be located in the Sign-In view and in the File Explorer view?
    - *Agreement*: In the Sign-In (and Offline) view, a sun/moon icon toggle button placed next to the top-right language selector. In the File Explorer view, inside the top menu bar under `Options -> Theme (Light / Dark)` (`Opciones -> Tema (Claro / Oscuro)`).
    - *Why*: Matches existing UI patterns in both views without cluttering the workspace.
  - **Question 2 (Default theme & persistence):**
    - *Question*: What should the initial default theme be on first launch, and should manual changes persist across sessions?
    - *Agreement*: Default to the operating system's theme on first launch, and persist any manual selection locally across views and app restarts.
    - *Why*: Respects OS-level user ergonomics out of the box while honoring explicit user overrides.
  - **Question 3 (Visual coverage across surfaces and modals):**
    - *Question*: Should both themes apply uniformly across all pre-auth screens, shell panels, explorer table, scrollbars, and modals?
    - *Agreement*: Yes, 100% uniform coverage across every screen, panel, scrollbar, and modal in the application.
    - *Why*: Eliminates visual inconsistency between pre-authentication and authenticated views.
- **2026-11-05 (QA Audit Resolution):**
  - **Finding 1 (Sun/Moon icon semantics on Sign-In & Offline views):**
    - *Question*: Should the toggle icon show the current state or the target action?
    - *Agreement*: Show the target action: display the **Moon** icon when in Light Mode (to switch to Dark Mode) and display the **Sun** icon when in Dark Mode (to switch to Light Mode).
    - *Why*: Standard intuitive toggle affordance indicating what clicking the button will activate.
  - **Finding 2 (Menu item ordering & submenu mutual exclusion):**
    - *Question*: Where is "Theme" placed in the "Options" menu, and how do nested submenus interact?
    - *Agreement*: Place "Theme" immediately below "Language" and above the separator for "Disconnect". Opening "Theme" closes "Language" and vice versa.
    - *Why*: Groups user preferences together above destructive session actions and prevents overlapping flyout submenus.
  - **Finding 3 (Verifiable contrast threshold in `NFR-2`):**
    - *Question*: What measurable criterion defines legible contrast in both themes?
    - *Agreement*: Minimum WCAG AA contrast ratio ($\ge 4.5:1$ for primary text, $\ge 3:1$ for secondary text/icons) and distinct surface hierarchy between primary canvas and secondary bars.
    - *Why*: Provides an objective, auditable visual quality standard.
  - **Finding 4 (OS theme changes while app is running):**
    - *Question*: What happens if the OS theme changes while Prydrive is already open?
    - *Agreement*: Keep the original theme established at session startup (no live mid-session flip).
    - *Why*: Prevents disruptive visual flashes while the user is actively working.
  - **Finding 5 (Brand iconography across themes):**
    - *Question*: How should brand icons adapt between Light and Dark modes?
    - *Agreement*: Official multicolor logos (Google, Google Drive) keep their native colors; monochrome/cutout marks (Prydrive logo) dynamically adapt their inner cutout contrast to the button's active/inactive background.
    - *Why*: Preserves brand identity while preventing invisible cutouts on light backgrounds.
