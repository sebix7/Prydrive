# Tasks: Spec 005 — Light and Dark Theme Mode

- [x] **T1. Implement OS default theme detection at startup, cross-session local persistence, and root theme state management.** US-1 (FR-1, FR-2, FR-3, FR-12, EC-1, EC-2, EC-5)
  - Depends on: None
  - Done when: The system detects the operating system's color scheme once at startup when no saved preference exists (`resolveInitialTheme`), validates and restores any persisted preference (`'light'` or `'dark'`) from local storage while safely falling back on corrupted or restricted storage, enables `darkMode: 'class'` in `tailwind.config.js`, and synchronizes the active theme class (`dark`) and `data-theme` attribute on the root document element via `useTheme.ts` and `App.tsx`. Verified via automated unit tests in `tests/unit/theme.test.ts`.

- [x] **T2. Implement the Moon/Sun theme toggle button on the sign-in and offline screens.** US-2 (FR-4, FR-5)
  - Depends on: T1
  - Done when: A theme toggle button (`ThemeToggle.tsx`) is rendered adjacent to the language selector in the top-right corner of both the welcome/sign-in screen and the offline mode screen, displaying a Moon icon when the active theme is `light` and a Sun icon when the active theme is `dark` (`getThemeToggleMetadata`), and clicking the button immediately alternates and persists the active theme between `light` and `dark`. Verified via automated unit tests in `tests/unit/theme-toggle.test.ts`.

- [ ] **T3. Implement the "Theme" ("Light" / "Dark") flyout submenu inside the top "Options" menu bar.** US-3 (FR-6, FR-7, FR-8)
  - Depends on: T1
  - Done when: The top "Options" ("Opciones") menu bar dropdown includes a "Theme" ("Tema") item positioned immediately below "Language" ("Idioma") and above the "Disconnect" separator, opening a flyout submenu with "Light" ("Claro") and "Dark" ("Oscuro") options, enforcing mutual exclusion with the "Language" submenu (`resolveOptionsSubmenu`), displaying a checkmark next to the active theme, and persisting the chosen theme while closing the menu upon selection. Verified via automated unit tests in `tests/unit/menu-bar.test.ts`.

- [ ] **T4. Implement uniform Light Mode and Dark Mode visual styling across all application views, file explorer table, scrollbars, and modal dialogs.** US-4 (FR-9, FR-10, FR-11, NFR-1, NFR-2, EC-3, EC-4, EC-6)
  - Depends on: T1, T2, T3
  - Done when: Switching between `light` and `dark` themes instantaneously updates all Pre-Authentication Views (`WelcomeScreen`, session validation loader, offline view, `AwaitingAuthModal`) and Authenticated Workspace Views (`AppShell`, `MenuBar`, `NavigationRail` including Prydrive logo cutout contrast `getPrydriveLogoCutoutColor`, `WorkspaceCanvas`, `FileExplorer` sticky header/rows/`"..."` parent row/empty/error states, `ExplorerStatusBar`, `TelemetrySidebar`, `QuotaBar`, `AboutModal`, `DisconnectModal`, and CSS scrollbars in `main.css`) with WCAG AA compliant contrast while preserving folder navigation and row selection state. Verified via automated unit tests in `tests/unit/theme-surfaces.test.ts`.

- [ ] **T5. Implement full bilingual localization parity (English and Spanish) for all theme menu items, option labels, and action tooltips.** US-5 (FR-13)
  - Depends on: T1, T2, T3
  - Done when: All theme translation keys (`menu_theme`, `theme_light`, `theme_dark`, `theme_switch_to_dark`, `theme_switch_to_light`) are defined in both English and Spanish in `src/shared/i18n/translations.ts` with 100% key parity and dynamically update the sign-in/offline toggle tooltip and the `Options -> Theme` submenu labels when switching languages. Verified via automated unit tests in `tests/unit/translations.test.ts`.
