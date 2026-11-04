# Tasks: Spec 002 — Desktop Application Shell

- [x] **T1. Implement the foundational 4-zone desktop application shell container, responsive constraints, and pure state machine.** US-1 (FR-1, FR-2, FR-16, NFR-1, NFR-2)
  - Depends on: None
  - Done when: The application shell container coordinates the 4-zone layout (top menu bar, left navigation rail, central canvas, right sidebar); when unauthenticated, the full-window welcome screen replaces the shell completely; when authenticated, the 4-zone shell mounts with clean 1px structural dividers adhering to `frontend-design` craftsmanship and enforcing a minimum window size constraint of 960x600 pixels. Verified via automated unit tests in `tests/unit/shell-state.test.ts`.

- [x] **T2. Implement the left navigation rail with interactive brand and provider buttons, active surface styling, and Drive workspace view activation.** US-2 (FR-3, FR-4, FR-5, EC-5)
  - Depends on: T1
  - Done when: The left navigation rail (64px width) renders the interactive Prydrive brand button and the Google Drive provider button; clicking either button updates the active navigation state idempotently without flickering, highlights the selected button with a distinctive background fill, and renders the Google Drive workspace view in the central canvas. Verified via automated unit tests.

- [x] **T3. Implement classic desktop horizontal menu bar with accessible drop-downs, outside-click/Escape dismissal, Account disconnection trigger, and About modal.** US-3 (FR-6, FR-7, EC-3, EC-4)
  - Depends on: T1
  - Done when: The horizontal menu bar renders File, Account, View, and Help drop-down menus; clicking menu headers opens the menu while clicking outside or pressing Escape closes it; selecting "Disconnect account..." in the Account menu closes open menus and opens the sign-out confirmation modal; and selecting "About Prydrive" in the Help menu displays the About modal with version `v0.1.0`. Verified via automated unit tests.

- [x] **T4. Implement the collapsible right telemetry sidebar with Google Drive branding, truncated user email with tooltip, storage quota progress bar, and circular divider toggle button.** US-4 (FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, NFR-3, EC-1, EC-2)
  - Depends on: T1
  - Done when: The right sidebar initializes in an expanded state by default upon login and restart; displays the Google Drive logo, the connected user's email address truncated with tooltip, and the storage quota bar with skeleton/error fallback states; clicking the circular divider button (`<` / `>`) or the View menu action animates between expanded (260px) and collapsed (0px) states within 200ms while retaining the circular toggle trigger. Verified via automated unit tests.

- [ ] **T5. Implement bilingual localization (English / Spanish) across all shell menus, labels, tooltips, sidebar metrics, and modal dialogs with real-time switching.** US-5 (FR-8, FR-6)
  - Depends on: T1, T2, T3, T4
  - Done when: All shell text (File, Account, View, Help menus, sidebar headers, tooltips, canvas placeholders, About dialog) is defined in both English and Spanish with 100% dictionary key parity; selecting the language option in the Account menu immediately updates all visible shell text without page reload or state loss. Verified via automated dictionary symmetry and parity unit tests in `tests/unit/translations.test.ts`.
