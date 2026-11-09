# Spec 006 — Swiss Archive Visual Design System
Status: approved

## Context and Goal
While Prydrive currently supports Light and Dark modes across its sign-in and file explorer workflows, its visual styling relies on generic rounded cards, soft drop shadows, and standard neutral grays. To give Prydrive a distinctive, intentional desktop identity inspired by Neo-Brutalist Swiss Grids and archival precision, this specification defines the transition of the entire application user interface to the **Swiss Archive** design system. The goal is to apply warm stone-paper and deep-ink surface palettes, International Klein Blue accents, exposed `1px` structural grid hairlines, tight `4px–6px` geometric radii, technical header index strips, unified top-right action controls, and a three-tier typographic hierarchy across 100% of existing screens, states, and modal dialogs in both Light and Dark modes.

## Users
- **Unauthenticated User (Pre-Authentication Views):** A user interacting with the sign-in screen, session validation view, offline mode screen, or authorization modal who experiences the Swiss Archive dot-grid canvas, framed technical cards, and geometric top-right controls (including direct access to the About modal).
- **Authenticated Desktop User (Workspace & File Explorer):** A signed-in user navigating Google Drive folders, viewing storage telemetry, and interacting with direct header controls and modals within the 4-zone Swiss Archive desktop shell.

## User Stories
- **US-1 (Swiss Archive Color Palette, Typography & Geometric Tokens):** As a user, I want the application to apply the Swiss Archive Light and Dark color palettes, three-tier typographic hierarchy (display headings, UI body, and monospace technical data), `1px` exposed borders, and tight `4px–6px` corner radii so that the interface presents a cohesive, high-precision archival aesthetic in both theme modes.
- **US-2 (Swiss Archive Pre-Authentication & Offline Views):** As an unauthenticated user, I want the sign-in and offline screens to render over a subtle radial dot-matrix canvas with a framed central card featuring an upper technical index strip, geometric top-right controls (About info button opening the About modal, Moon/Sun theme toggle, and `EN | ES` language selector), and a Klein Blue interactive sign-in button so that pre-authentication workflows reflect the Swiss Archive visual identity.
- **US-3 (Swiss Archive Desktop Shell, Unified Top-Right Controls & Telemetry Sidebar):** As an authenticated user, I want the `40px` top header bar (displaying the static drive unit indicator on the left and the unified About, Theme, and Language controls on the right—plus a conditional icon-only Disconnect button when the right sidebar is collapsed), the 64px left navigation rail, the Prydrive workspace view, and the 260px collapsible right telemetry sidebar (including account/storage cards and a bottom-pinned Disconnect button when expanded) to use Swiss Archive secondary surfaces, `1px` structural hairlines, and monospace telemetry cards so that all workspace controls and actions remain 1-click accessible at all times.
- **US-4 (Swiss Archive File Explorer Table, Selection Rule & Status Bar):** As an authenticated user, I want the Google Drive file explorer to feature an uppercase monospace sticky header, `36px` rows with a `3px` left Klein Blue indicator bar when selected, monospace creation timestamps and file sizes, and a structured bottom status bar so that directory listings are scannable with archival clarity.
- **US-5 (Swiss Archive Modal Dialogs with Technical Header Strips):** As a user, I want the Waiting for Authorization, About Prydrive, and Disconnect Account modal dialogs to include upper technical index strips, `1px` framed metadata containers, and geometric action buttons so that all dialogs match the Swiss Archive aesthetic.

## Definitions
- **Swiss Archive Light Palette:** The color scheme applied when `light` mode is active: primary canvas `#FAF9F6` (warm stone paper), secondary bar/rail/sidebar surface `#F2F0EA`, elevated card/table surface `#FFFFFF`, hover surface `#ECEAE3`, selected row surface `#DDE7FA`, primary ink `#111315`, secondary ink `#4A4E54`, muted ink `#7C8087`, strong `1px` border rule `#C9C6BD`, subtle `1px` row rule `#DFDDD6`, primary accent `#1B44E8` (International Klein Blue, hover `#1231B5`), warning/signal accent `#D95D1E`, and danger accent `#DC2626`.
- **Swiss Archive Dark Palette:** The color scheme applied when `dark` mode is active: primary canvas `#101216`, secondary bar/rail/sidebar surface `#15181E`, elevated card/table surface `#181C23`, hover surface `#1E232C`, selected row surface `#1C2D52`, primary ink `#F3F4F6`, secondary ink `#9CA3AF`, muted ink `#6B7280`, strong `1px` border rule `#2C323D`, subtle `1px` row rule `#222730`, primary accent `#3B66FF` (hover `#5A7FFF`), warning/signal accent `#F97316`, and danger accent `#EF4444`.
- **Three-Tier Typographic Hierarchy:**
  1. **Display / Headings (`Space Grotesk` with system geometric sans-serif fallback):** Used for screen titles, modal titles, provider titles, and primary action button labels.
  2. **Interface Body (`Inter` with system sans-serif fallback):** Used for file and folder names, descriptive paragraphs, and general UI labels.
  3. **Technical / Tabular Data (`IBM Plex Mono` with system monospace fallback):** Used for table column headers, creation timestamps, byte sizes, status bar counters, storage quota figures, user email addresses, version badges, language switchers, and technical index strips.
- **Technical Index Strip:** A compact `30px–32px` upper header bar inside cards and modal dialogs separated by a `1px` bottom border rule (`--rule-strong`), displaying uppercase monospace context labels on the left and right.
- **Dot-Matrix Canvas:** A primary canvas background featuring a subtle `1px` radial dot pattern spaced on a `20px × 20px` grid using the active theme's strong border rule color (`#C9C6BD` in `light` mode, `#2C323D` in `dark` mode).

## Functional Requirements
- **FR-1:** WHILE the active theme is `light`, THE SYSTEM SHALL render all application surfaces, text, borders, and interactive accents using the **Swiss Archive Light Palette**.
- **FR-2:** WHILE the active theme is `dark`, THE SYSTEM SHALL render all application surfaces, text, borders, and interactive accents using the **Swiss Archive Dark Palette**.
- **FR-3:** THE SYSTEM SHALL apply the **Three-Tier Typographic Hierarchy** across all views and modals, rendering headings and primary buttons in the display typeface, general UI labels and file names in the body typeface, and all timestamps, sizes, counters, emails, badges, table headers, and index strips in the monospace typeface.
- **FR-4:** THE SYSTEM SHALL enforce tight geometric border radii (`4px` for buttons, badges, and interactive controls; `6px` for cards and modal containers) and exposed `1px` solid structural borders (`--rule-strong`) across all panels, cards, controls, and dialogs, eliminating large pill-shaped or `16px+` rounded containers (except circular status dots and the circular sidebar divider toggle button).
- **FR-5:** WHILE displaying the sign-in screen, offline mode screen, session validation screen, or the Prydrive workspace tab view, THE SYSTEM SHALL render the primary background as a **Dot-Matrix Canvas**.
- **FR-6:** THE SYSTEM SHALL render a **Technical Index Strip** at the top of the sign-in welcome card (displaying `PRYDRIVE // AUTHENTICATION` on the left and `OAUTH 2.0 · v<version>` on the right) and at the top of the offline mode card (displaying `PRYDRIVE // OFFLINE` on the left and `NETWORK_STATUS` on the right).
- **FR-7:** THE SYSTEM SHALL render a unified top-right control cluster consisting of an `About Prydrive` info icon button (`30px × 30px`), the theme toggle button (`30px × 30px`, displaying a Moon icon in `light` mode and a Sun icon in `dark` mode), and the `EN | ES` language selector group (`30px` height) with `4px` corner radii, `1px` structural borders, `8px` horizontal gap between controls, and identical top-right edge offsets (`5px` from the top edge and `12px` from the right edge) in both the pre-authentication screens AND the `40px` authenticated top header bar; WHEN the user clicks the `About Prydrive` info icon button in any screen (Sign-In, Offline Mode, or Authenticated Workspace), THE SYSTEM SHALL open the `About Prydrive` modal dialog over the current view.
- **FR-8:** WHEN the user hovers over the "Sign in with Google" button on the sign-in card, THE SYSTEM SHALL transition the button background and border to the active theme's Klein Blue accent (`#1B44E8` in `light` mode, `#3B66FF` in `dark` mode) with white label and arrow iconography, while keeping the official 4-color Google "G" emblem inside a crisp white `24px × 24px` square badge (`3px` radius).
- **FR-9:** THE SYSTEM SHALL render the `40px` authenticated top header bar using the secondary surface color (`#F2F0EA` in `light` mode, `#15181E` in `dark` mode) with a `1px` bottom structural border, eliminating the legacy `Options` (`Opciones`) and `Help` (`Ayuda`) dropdown menus, displaying on the left the static monospace unit indicator (`UNIDAD: //MY_DRIVE` in `es` / `DRIVE: //MY_DRIVE` in `en`), and displaying on the right the unified control cluster (`About Prydrive` info button, theme toggle button, and `EN | ES` language selector).
- **FR-10:** WHILE navigating into or out of any Google Drive subfolder OR switching between the `Prydrive Workspace` and `Google Drive` tabs in the left navigation rail, THE SYSTEM SHALL keep the left-aligned top header bar indicator text strictly static (`UNIDAD: //MY_DRIVE` in `es` / `DRIVE: //MY_DRIVE` in `en`).
- **FR-11:** THE SYSTEM SHALL render the `64px` left navigation rail using the secondary surface color with a `1px` right border, a `3px`-wide vertical Klein Blue left indicator bar on the active rail item, a `40px × 40px` (`6px` radius) framed active button surface, and a `1px` horizontal divider between the Prydrive and Google Drive buttons.
- **FR-12:** THE SYSTEM SHALL render the Google Drive file explorer table inside the central elevated surface (`#FFFFFF` in `light` mode, `#181C23` in `dark` mode) with a `36px` sticky header row in uppercase monospace typography (`11px`, secondary surface background, `1px` bottom strong border) and `36px` item rows separated by `1px` subtle horizontal rules (`#DFDDD6` in `light` mode, `#222730` in `dark` mode).
- **FR-13:** WHILE a file or folder row is selected in the file explorer, THE SYSTEM SHALL highlight the row using the selected surface color (`#DDE7FA` in `light` mode, `#1C2D52` in `dark` mode), apply Klein Blue text to the row's name, timestamp, and size columns, and render a `3px`-wide vertical Klein Blue accent bar along the left edge of the row.
- **FR-14:** THE SYSTEM SHALL render the `36px` bottom explorer status bar using the secondary surface color with a `1px` top strong border, displaying a framed monospace `Refresh` (`Actualizar`) button on the left, monospace folder/file counts in the center, and monospace total size on the right.
- **FR-15:** THE SYSTEM SHALL render the `260px` collapsible right telemetry sidebar using the secondary surface color with a `1px` left strong border, a `28px × 28px` circular collapse/expand button anchored on the divider, and `1px`-bordered elevated cards (`6px` radius) for Account (`CUENTA` / `ACCOUNT`) and Storage (`ALMACENAMIENTO` / `STORAGE`) featuring uppercase `10px` monospace headers, monospace quota figures, and a `6px`-high rectangular progress track (`2px` radius) that preserves usage color thresholds (`< 75%` Klein Blue, `>= 75%` warning/signal, `>= 90%` danger/red, and `100%` width at `60%` opacity for unlimited storage).
- **FR-16:** WHILE the right telemetry sidebar is expanded, THE SYSTEM SHALL display a full-width danger-styled `Disconnect` (`Desconectar`) button (icon + label, `4px` radius, `1px` danger border) pinned at the bottom of the right sidebar and hide any disconnect control from the top header bar; WHILE the right telemetry sidebar is collapsed, THE SYSTEM SHALL render a compact `30px × 30px` icon-only `Disconnect` button (displaying only the logout SVG icon with danger styling and localized tooltip) in the top header bar immediately to the right of the `EN | ES` language selector (`8px` gap), hiding it again as soon as the sidebar is expanded.
- **FR-17:** THE SYSTEM SHALL render a **Technical Index Strip** at the top of each modal dialog:
  - **Waiting for Authorization Modal:** `OAUTH 2.0 LOOPBACK` on the left and `127.0.0.1` on the right.
  - **About Prydrive Modal:** `SYSTEM // ABOUT` on the left and an interactive `[ESC]` close button on the right, plus a rectangular monospace version badge (`3px` radius), a `1px`-framed metadata box, and a bordered monospace `COPY` / `COPIAR` (`COPIED!` / `¡COPIADO!`) button next to the contact email.
  - **Disconnect Account Modal:** `SECURITY // REVOKE SESSION` on the left and `SAFE_STORAGE` on the right.

## Non-Functional Requirements
- **NFR-1 (Contrast & Legibility Compliance):** All primary text and monospace data across both Swiss Archive palettes (`light` and `dark`) must maintain a contrast ratio of at least `4.5:1` (WCAG AA), and secondary/muted metadata at least `3:1` against their respective background surfaces.
- **NFR-2 (Offline Typographic Resilience & Stack Simplicity):** Typographic stacks must be configured using CSS font-family declarations with immediate system geometric sans-serif, UI sans-serif, and monospace fallbacks without introducing unauthorized third-party runtime packages, ensuring zero layout shift or row height (`36px`) distortion when launched offline.
- **NFR-3 (Zero Functional Regression):** Applying the Swiss Archive visual system must preserve 100% of existing authentication flows, theme persistence, bilingual localization (`en` / `es`), folder navigation, virtual parent (`"..."`) row behavior, status bar metric calculations, and keyboard shortcuts (`Escape`).

## Edge Cases
- **EC-1:** Launching or operating the application in Offline Mode without network access $\rightarrow$ The Offline Mode banner and Offline Mode card render with Swiss Archive amber/warning accents, `1px` borders, Dot-Matrix Canvas, and the `PRYDRIVE // OFFLINE` technical strip without broken font layouts.
- **EC-2:** Empty folder, loading spinner, pagination spinner, or error banner inside the File Explorer $\rightarrow$ Each state renders inside the central explorer canvas using Swiss Archive framed icon badges (`6px` radius), monospace status labels, and a Klein Blue retry button on error states.
- **EC-3:** Navigating into deeply nested subfolders or switching rail tabs in the Authenticated Shell $\rightarrow$ The left-aligned top header bar indicator remains strictly static (`UNIDAD: //MY_DRIVE` or `DRIVE: //MY_DRIVE`), preventing any horizontal overflow in the `40px` header bar.
- **EC-4:** Toggling between Light Mode and Dark Mode while a row is selected or a modal with a Technical Index Strip is open $\rightarrow$ All Swiss Archive surface tokens, `1px` borders, `3px` left selection bar, and index strips update instantaneously without losing selection or modal state.
- **EC-5:** Prydrive logo inner cutout inside the Left Navigation Rail $\rightarrow$ The inner circle cutout of the `"P"` emblem dynamically matches the button's active or inactive Swiss Archive surface (`#FFFFFF` in `light` mode / `#181C23` in `dark` mode when active; `#F2F0EA` in `light` mode / `#15181E` in `dark` mode when inactive).
- **EC-6:** Collapsing and expanding the Right Telemetry Sidebar $\rightarrow$ When collapsed, the `30px × 30px` icon-only `Disconnect` SVG button appears to the right of the `EN | ES` selector in the top header bar so the user can always sign out; when expanded, the top-bar icon button disappears and the full-width `Disconnect` button is available at the bottom of the right sidebar.
- **EC-7:** Clicking the `About Prydrive` (`i`) button from the Sign-In or Offline screen $\rightarrow$ Opens the `About Prydrive` modal dialog directly over the pre-authentication screen and closes cleanly via `[ESC]`, `Escape` key, backdrop click, or the primary dismiss button.

## Out of Scope
- Adding new functional capabilities to the file explorer (such as file search, file upload/download, sorting, or grid view).
- Creating a multi-theme picker to switch back to the legacy pre-Swiss visual style (Swiss Archive replaces the existing Light and Dark appearance).
- Dynamic breadcrumb path concatenation inside the top header bar's `//MY_DRIVE` indicator.
- Tracking or committing the local `ui-proposals/` HTML design prototype folder into version control.

## Completion Criteria
- Complete implementation of the Swiss Archive Light and Dark color palettes, `1px` structural borders, `4px–6px` corner radii, and three-tier typography across all views and modals.
- Welcome/sign-in and offline cards display the Dot-Matrix Canvas, Technical Index Strips, unified top-right controls (`About Prydrive` info button opening the About modal, `ThemeToggle`, and `LanguageToggle` at `top: 5px; right: 12px; gap: 8px`), and the Klein Blue hover state on the Google sign-in button.
- Authenticated `40px` top header bar renders in Swiss Archive style without `Options` or `Help` dropdown menus, displaying the localized static unit indicator (`UNIDAD: //MY_DRIVE` in `es`, `DRIVE: //MY_DRIVE` in `en`) on the left and the unified `About Prydrive` + `ThemeToggle` + `LanguageToggle` controls on the right (plus the icon-only `Disconnect` SVG button to the right of `EN | ES` solely when the right sidebar is collapsed).
- Left navigation rail, Prydrive workspace view, and collapsible right telemetry sidebar render with Swiss Archive surfaces, monospace labels, rectangular quota progress bar preserving usage thresholds (`< 75%`, `>= 75%`, `>= 90%`), and a bottom-pinned `Disconnect` (`Desconectar`) button inside the right sidebar when expanded.
- File explorer table renders with uppercase monospace headers, `36px` rows, `3px` left Klein Blue selection indicator bar, and monospace status bar.
- All three modal dialogs (`Waiting for Authorization`, `About Prydrive`, `Disconnect Account`) render with their respective Technical Index Strips and geometric buttons.
- 100% of unit and integration tests passing with zero regressions.

## Open Questions (`[NEEDS CLARIFICATION]`)
*None. All initial requirements and QA audit findings have been resolved.*

## Decisions / Clarifications (Changelog)
- **2026-11-08 (Initial Spec Interview):**
  - **Decision 1 (Technical Index Strips & Menu Bar Path Indicator):**
    - *Question*: Should the editorial technical strips at the top of cards/modals (e.g., `PRYDRIVE // AUTHENTICATION · OAUTH 2.0`, `SYSTEM // ABOUT`) and the top bar indicator (`UNIDAD: //MY_DRIVE`) from `prydrive-swiss-archive.html` be included in the real application?
    - *Agreement*: Yes, include all technical header strips on cards and modals as well as the indicator in the top bar.
    - *Why*: These structural index strips and monospace tags are signature visual elements of the Swiss Archive aesthetic chosen by the user.
  - **Decision 2 (Full Coverage of Secondary Views & States):**
    - *Question*: Should secondary views and states (Offline Mode screen/banner, Prydrive Workspace rail tab, and loading/empty/error explorer states) also be unified under Swiss Archive in both Light and Dark modes?
    - *Agreement*: Yes, unify 100% of existing screens, tabs, banners, and states under the Swiss Archive design system in both Light and Dark modes.
    - *Why*: Ensures complete visual consistency across every state of the desktop client without leftover legacy styling.
  - **Decision 3 (Static Behavior of the Top Header Drive Indicator):**
    - *Question*: How should the top bar indicator (`UNIDAD: //MY_DRIVE`) behave when navigating into subfolders or long folder names?
    - *Agreement*: Keep the indicator text static (`UNIDAD: //MY_DRIVE` in Spanish / `DRIVE: //MY_DRIVE` in English) at all times without changing or concatenating subfolder paths.
    - *Why*: Preserves a clean, compact architectural badge in the top bar without duplicating breadcrumb logic or risking text overflow.
  - **Decision 4 (Disposition of `ui-proposals/` HTML Prototypes):**
    - *Question*: What should be done with the temporary `ui-proposals/` HTML folder created during visual exploration?
    - *Agreement*: Keep `ui-proposals/` out of scope of this specification (untracked in git) as a local visual reference.
    - *Why*: Preserves the local HTML reference files on disk while keeping the repository history focused strictly on production specs and code.
  - **Decision 5 (Unified Theme & Language Controls Across Login and File Explorer):**
    - *Question*: Which mechanism should be standardized across both the Login screen and the File Explorer so that changing language and Light/Dark theme works identically in both views?
    - *Agreement*: Use the direct top-right quick-access controls (Moon/Sun theme toggle button + `EN | ES` language selector) in BOTH views at the exact same coordinates (`top: 5px; right: 12px; gap: 8px`).
    - *Why*: Eliminates interaction and positional asymmetry between Login and File Explorer.
  - **Decision 6 (Elimination of `Options` and `Help` Menus; Extraction of `About` and `Disconnect`):**
    - *Question*: Should `Options` and `Help` dropdown menus be kept now that they only contain 1 item each, or extracted as direct buttons?
    - *Agreement*: Eliminate the `Options` and `Help` dropdown menus completely. Place the `About Prydrive` (`i`) button in the top-right control group next to the Theme and Language buttons (in both Login and File Explorer), and place the `Disconnect` (`Desconectar`) button at the very bottom of the right telemetry sidebar.
    - *Why*: Avoids single-item dropdown menus (2-click anti-pattern), makes `About Prydrive` accessible from the Login screen as well, and groups `Disconnect` naturally with the user account/session panel on the right.
- **2026-11-09 (QA Audit Resolution — `/sdd-clarify`):**
  - **Finding 1 (Storage Quota Progress Bar Color Thresholds in `FR-15`):**
    - *Question*: Does the rectangular storage quota progress bar always render in Klein Blue, or does it preserve warning/danger usage thresholds?
    - *Agreement*: Preserve the existing usage color thresholds (`< 75%` Klein Blue, `>= 75%` warning/signal, `>= 90%` danger/red, and `100%` width at `60%` opacity for unlimited storage).
    - *Why*: Maintains critical visual feedback when a user's cloud storage is nearly full.
  - **Finding 2 (Top Header Indicator Across Rail Tabs in `FR-10`):**
    - *Question*: Does `UNIDAD: //MY_DRIVE` (`DRIVE: //MY_DRIVE`) change when selecting the `Prydrive Workspace` button in the left navigation rail?
    - *Agreement*: Always static (`UNIDAD: //MY_DRIVE` in `es` / `DRIVE: //MY_DRIVE` in `en`) regardless of folder navigation or active rail tab.
    - *Why*: Keeps the top header bar predictable and free of dynamic state complexity.
  - **Finding 3 (Prydrive Logo Inner Cutout Colors in `EC-5`):**
    - *Question*: What exact hex colors should the inner circle cutout of the `"P"` logo use in Swiss Archive?
    - *Agreement*: Match the button's active/inactive Swiss Archive surface: `#FFFFFF` (Light) / `#181C23` (Dark) when active, and `#F2F0EA` (Light) / `#15181E` (Dark) when inactive.
    - *Why*: Ensures a true optical cutout against the elevated active card surface and secondary rail background in both themes.
  - **Finding 4 (Removal of Residual Dropdown Menu Mentions):**
    - *Question*: Should all remaining references to dropdown menus and submenu mutual exclusion in `Users`, `FR-4`, `NFR-3`, and `EC-3` be purged?
    - *Agreement*: Yes, remove all references to dropdown menus across the specification.
    - *Why*: Ensures 100% internal consistency with `FR-9` and `Decision 6`.
  - **Finding 5 (Conditional Top-Bar Icon-Only `Disconnect` Button When Right Sidebar is Collapsed in `FR-16` & `EC-6`):**
    - *Question*: How does the user access `Disconnect` when the right telemetry sidebar is collapsed (`0px` width)?
    - *Agreement*: When the right sidebar is collapsed, render a compact `30px × 30px` icon-only `Disconnect` button (showing only the logout SVG icon) immediately to the right of the `EN | ES` language selector in the top header bar. When the right sidebar is expanded, hide that top-bar icon button and display the full-width `Disconnect` button at the bottom of the right sidebar.
    - *Why*: Guarantees 1-click access to sign out even when the telemetry sidebar is hidden, without duplicating visible disconnect buttons when the sidebar is open.
  - **Finding 6 (Opening `About Prydrive` Modal from Pre-Authentication Views in `FR-7` & `EC-7`):**
    - *Question*: Should the spec explicitly require the `About Prydrive` modal to open when clicking the top-right `About` (`i`) button on the Sign-In and Offline screens?
    - *Agreement*: Yes, specify explicitly in `FR-7` and `EC-7` that clicking the `About Prydrive` (`i`) button opens the modal across all pre-authentication and authenticated views.
    - *Why*: Ensures the new top-right `About` button on the Login and Offline views is fully functional end-to-end.
  - **Finding 7 (Offline-Resilient Typography Without New Runtime Dependencies in `NFR-2`):**
    - *Question*: How should the 3-tier typography be delivered while respecting Principle 3 (Stack Simplicity) and offline resilience?
    - *Agreement*: Use CSS font-family stacks with non-blocking stylesheet definitions and metric-compatible system geometric/sans/monospace fallbacks, adding zero new runtime dependencies.
    - *Why*: Complies strictly with the Project Constitution while guaranteeing zero layout shifts offline.
