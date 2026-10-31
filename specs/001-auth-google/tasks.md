# Tasks: Spec 001 — Google Authentication Flow

- [x] **T1. Implement single-click Google Sign-In with loopback authorization and encrypted token storage.** US-1 (FR-1, FR-5, NFR-1, NFR-2, NFR-3, EC-6)
  - Depends on: None
  - Done when: Project tooling (Vite, Electron, React, Vitest) is scaffolded with typed IPC channels; clicking the "Sign in with Google" button immediately disables to prevent double-clicks, starts a local loopback server on an ephemeral port (with up to 3 retries), launches the external system browser, exchanges the authorization code for tokens, securely encrypts the refresh token to disk via `safeStorage`, and transitions the app state. Verified via unit and IPC mock tests.

- [x] **T2. Implement authorization waiting modal, manual cancellation, and 60-second timeout abort.** US-2 (FR-2, FR-3, FR-4, EC-1, EC-4)
  - Depends on: T1
  - Done when: The waiting modal displays an animated indicator, explanatory message, and enabled "Cancel" button; clicking "Cancel" or reaching the 60-second timeout terminates the loopback server cleanly and returns the application to the welcome screen without orphan processes or state locks. Verified via automated unit and timer abort tests.

- [ ] **T3. Implement background startup session restoration with non-destructive offline handling.** US-3 (FR-6, FR-7, FR-8, EC-2, EC-5)
  - Depends on: T1
  - Done when: Application startup checks for saved credentials and validates them silently in the background; confirmed revoked/invalid tokens (`invalid_grant`) are purged with an alert notification, whereas network offline errors preserve the encrypted credentials and display a non-destructive offline alert with a retry button. Verified via unit tests on error categorization and startup mock tests.

- [ ] **T4. Implement authenticated header view with storage quota bar, skeleton loader, and API error fallback.** US-4 (FR-9, FR-10, FR-11, EC-3)
  - Depends on: T1, T3
  - Done when: The authenticated header displays the user's email address and a storage quota progress bar (used vs. total space formatted in GB/MB); displays a skeleton loader during data fetching, adapts cleanly to unmetered accounts, and falls back to a "Storage details unavailable" state with a refresh option if the Google Drive quota API fails. Verified via pure unit tests for quota formatting and component render tests.

- [ ] **T5. Implement account disconnection flow with confirmation modal and local credential purge.** US-5 (FR-12, FR-13, FR-14)
  - Depends on: T1, T3
  - Done when: Clicking the "Disconnect" button in the header triggers a confirmation dialog; canceling dismisses the dialog while confirming purges the encrypted session file from disk and returns the user immediately to the welcome screen. Verified via IPC integration tests.

- [ ] **T6. Implement interactive English/Spanish language toggle across all views and dialogs.** US-6 (FR-15)
  - Depends on: T1
  - Done when: An interactive language toggle allows switching between English (default) and Spanish, dynamically updating all visible text labels, waiting messages, dialogs, and alert banners with 100% dictionary key parity between languages. Verified via dictionary symmetry unit tests.
