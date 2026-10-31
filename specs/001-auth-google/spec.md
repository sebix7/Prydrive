# Spec 001 — Google Authentication Flow
Status: approved

## Context and Goal
Prydrive requires a frictionless desktop authentication flow using Google Sign-In. Users must be able to connect their Google account with a single click through their default system browser without manually managing API keys or configuration files. The application must securely persist the session across restarts, display basic account storage metrics in a clean header, allow clean disconnection, and support both English (default) and Spanish interfaces.

## Users
- **Desktop User:** Any individual who wants to securely connect their Google Drive storage to the desktop app without typing credentials inside the application window.

## User Stories
- **US-1:** As a user, I want to initiate Google sign-in with a single click so that I can authorize access securely through my default web browser.
- **US-2:** As a user, I want to see an explanatory waiting message, an explicit cancel button, and an automatic 60-second timeout while authenticating so that I can abort or avoid hanging if I decide not to proceed.
- **US-3:** As a user, I want my active session to be automatically and silently restored when launching the application (with non-destructive handling if offline) so that I do not need to sign in repeatedly.
- **US-4:** As an authenticated user, I want to see my connected email address and a visual storage quota bar (used vs. total space) with skeleton loading and graceful error fallback so that I always know which account is active and how much storage remains.
- **US-5:** As an authenticated user, I want a confirmation dialog when clicking disconnect so that I do not accidentally lose my active session and local credentials.
- **US-6:** As a user, I want an interactive language toggle between English and Spanish so that I can interact with all interface texts, alerts, and dialogs in my preferred language.

## Definitions
- **Loopback Authorization:** Desktop authentication mechanism where the app launches the external system browser and listens on an ephemeral local address to capture the authorization code.
- **Storage Quota:** The metric representing the user's used cloud storage against their total allocated capacity.
- **Silent Restoration:** Background session validation on app startup that transitions directly to the authenticated view without user intervention.
- **Skeleton State:** Visual placeholder layout indicating content loading before remote data is received.

## Functional Requirements
- **FR-1:** WHEN the user clicks the "Sign in with Google" button on the welcome screen, THE SYSTEM SHALL immediately disable the button to prevent duplicate triggers, launch the default system browser with the authorization URL, and transition the application to an awaiting-authorization state.
- **FR-2:** WHILE the system is awaiting authorization from the browser, THE SYSTEM SHALL display an explanatory waiting message and an enabled "Cancel" button.
- **FR-3:** WHEN the user clicks the "Cancel" button while awaiting authorization, THE SYSTEM SHALL terminate the local authorization listener, dismiss the waiting state, and return to the welcome screen.
- **FR-4:** IF authorization is not received within 60 seconds, THEN THE SYSTEM SHALL automatically abort the waiting state, display a timeout notification, and return to the welcome screen.
- **FR-5:** WHEN the user completes authorization in the browser, THE SYSTEM SHALL securely exchange the authorization response for session credentials, persist them locally, and transition to the authenticated view.
- **FR-6:** WHEN the application is launched, THE SYSTEM SHALL check for existing saved credentials and silently attempt to validate and restore the active session in the background.
- **FR-7:** IF stored credentials are confirmed invalid or revoked by the provider upon startup validation (e.g. HTTP 400/401/invalid_grant), THEN THE SYSTEM SHALL display a descriptive notification explaining that the session has expired or been revoked, purge the stored credentials, and present the welcome screen.
- **FR-8:** IF session validation on startup fails due to temporary network unavailability, THEN THE SYSTEM SHALL preserve the stored local credentials, display a non-destructive offline notification with a "Retry" action, and remain on the welcome view without wiping the session.
- **FR-9:** WHILE storage quota metrics are loading from Google Drive, THE SYSTEM SHALL display a skeleton loader bar in the header area.
- **FR-10:** WHILE in the authenticated view with loaded metrics, THE SYSTEM SHALL display the connected account's email address, a graphical progress bar indicating used storage versus total storage (formatted in GB/MB), and a "Disconnect" button.
- **FR-11:** IF storage quota metrics cannot be retrieved due to provider API errors or account restrictions, THEN THE SYSTEM SHALL maintain the authenticated view, display the account email, and show a "Storage details unavailable" fallback state with a refresh option in place of the quota bar.
- **FR-12:** WHEN the user clicks the "Disconnect" button, THE SYSTEM SHALL display a modal confirmation dialog asking the user to confirm the sign-out action.
- **FR-13:** WHEN the user confirms sign-out in the confirmation dialog, THE SYSTEM SHALL wipe all stored session credentials from the local machine and transition back to the welcome screen.
- **FR-14:** IF the user cancels the sign-out confirmation dialog, THEN THE SYSTEM SHALL dismiss the dialog and maintain the active authenticated view.
- **FR-15:** THE SYSTEM SHALL provide an interactive language control allowing the user to toggle between English (default) and Spanish, dynamically updating all visible interface labels, status alerts, and dialogs.

## Non-Functional Requirements
- **NFR-1 (Security):** Session tokens must strictly be encrypted using the operating system's native credential protection mechanism; plain-text credential persistence on disk is forbidden.
- **NFR-2 (Responsiveness):** Transition from receiving the browser authorization callback to displaying the authenticated view must take less than 2 seconds under standard network conditions.
- **NFR-3 (Reliability):** The local loopback redirect server must dynamically bind to an available ephemeral port to prevent collisions with existing system services.

## Edge Cases
- **EC-1:** User closes the browser window or denies permissions on Google's consent page $\rightarrow$ The 60-second automatic timeout or manual "Cancel" button cleanly aborts the wait and restores the welcome screen.
- **EC-2:** No network connection available when clicking login $\rightarrow$ The system displays an immediate descriptive alert indicating network unavailability without launching the browser.
- **EC-3:** User account possesses an unlimited or unmetered storage quota $\rightarrow$ The storage quota indicator adapts to display used space gracefully without calculation overflow or percentage errors.
- **EC-4:** Port binding failure on dynamic loopback address $\rightarrow$ The system automatically attempts to bind to up to 3 alternate dynamic ephemeral ports; if all 3 fail, it aborts the operation with a descriptive firewall/permission message and returns to the welcome screen.
- **EC-5:** Transient network loss during startup validation $\rightarrow$ System preserves local credentials and alerts the user with a retry button instead of purging the session.
- **EC-6:** Double-click or rapid clicks on login button $\rightarrow$ Immediate button disablement prevents multiple concurrent local listeners and duplicate browser tabs.

## Out of Scope
- File and folder exploration, listing, uploading, or downloading (deferred to subsequent specs).
- Multiple simultaneous accounts and account switching (single active Google account supported per installation in this iteration).
- Manual key pasting or service account file upload (standard browser loopback is the exclusive authentication mechanism).
- Settings menu and Light/Dark theme switching (deferred to product backlog in `AGENTS.md`).

## Completion Criteria
- [ ] Welcome screen renders with "Sign in with Google" button and interactive language toggle (EN/ES).
- [ ] Clicking login immediately disables the button, launches default system browser, and displays the waiting state with explanatory message and "Cancel" button.
- [ ] Clicking "Cancel" or reaching the 60-second timeout terminates the listener and returns cleanly to the welcome screen.
- [ ] Successful authorization captures tokens, securely persists them, and opens the authenticated view.
- [ ] Authenticated view displays user email and storage quota progress bar (used vs. total space) with skeleton state while loading and fallback if API fails.
- [ ] Quitting and reopening the app restores the authenticated session silently in the background; offline state preserves credentials with retry option.
- [ ] Disconnect button triggers confirmation modal; confirming purges credentials and returns to welcome screen, while canceling maintains the session.

## Open Questions
None. All ambiguities and parameters were resolved during the feature interview and QA audit.

## Decisions / Clarifications (Changelog)
1. **Waiting State and Timeout Duration:**
   - *Question:* What controls should appear while waiting for browser authorization, and what is the timeout limit?
   - *Agreement:* Display an explanatory message and an explicit "Cancel" button. Timeout set to 60 seconds.
   - *Why:* Prevents the application from remaining in an indefinite hanging state if the user abandons the browser tab.
2. **Session Restoration and Failure Handling:**
   - *Question:* Should sessions restore automatically on launch, and how should expired/revoked sessions be treated?
   - *Agreement:* Restore silently in background. If validation fails or credentials are lost, show a descriptive alert explaining the reason and return to the welcome screen.
   - *Why:* Frictionless user experience on daily launches with clear, transparent feedback if the user revoked access externally.
3. **Authenticated View Scope:**
   - *Question:* What metrics appear in this initial auth iteration, and are file operations included?
   - *Agreement:* Header displays user email and visual storage quota bar (used vs. total space). All file operations remain explicitly out of scope for subsequent specs.
   - *Why:* Keeps this initial delivery focused strictly on robust authentication and account status before introducing explorer features.
4. **Sign-Out Confirmation:**
   - *Question:* Should clicking disconnect require confirmation, and what happens to local credentials?
   - *Agreement:* Confirmation modal required. Confirming wipes all local session credentials and returns immediately to the welcome screen.
   - *Why:* Protects users against accidental session termination while ensuring a clean local security state upon sign-out.
5. **Language and Localization:**
   - *Question:* How should language support be configured, and is multi-account supported?
   - *Agreement:* Interactive toggle between English (default) and Spanish for all interface labels, alerts, and dialogs. Single active account per installation in this iteration.
   - *Why:* Meets bilingual accessibility requirements while keeping account state architecture minimal and resilient.
6. **Settings Menu and Theme Backlog:**
   - *Question:* Should theme switching and settings be part of Spec 001?
   - *Agreement:* Deferred to the product backlog in `AGENTS.md`. Spec 001 focuses exclusively on the initial Google authentication flow and bilingual toggle.
   - *Why:* Maintains lean specification scope and prevents scope creep.
7. **Quota Skeleton State:**
   - *Question:* How should the header react while quota metrics are loading?
   - *Agreement:* Display a skeleton loader bar in the quota area until API data arrives.
   - *Why:* Prevents layout shifts and provides immediate visual feedback.
8. **Non-Destructive Offline Startup:**
   - *Question:* How should startup validation differentiate between invalid tokens and temporary network unavailability?
   - *Agreement:* Purge credentials only on confirmed provider revocation/expiration (HTTP 400/401). Retain credentials on network error with an offline alert and retry action.
   - *Why:* Prevents destroying valid local sessions when launching without internet connectivity.
9. **Single-Click Login Debounce:**
   - *Question:* How should the system prevent race conditions from rapid double-clicks on the login button?
   - *Agreement:* Disable the login button immediately on the first click upon initiating the flow.
   - *Why:* Avoids opening duplicate browser tabs and colliding ephemeral local listeners.
10. **Storage Quota API Failure Fallback:**
    - *Question:* How should the interface respond if Google Drive quota API fails or is restricted?
    - *Agreement:* Keep session active, display email, and render a "Storage details unavailable" fallback message with a retry button instead of failing the entire view.
    - *Why:* Guarantees graceful degradation without locking the user out of the application.
11. **Loopback Port Binding Retries:**
    - *Question:* What retry policy should apply if local port binding fails?
    - *Agreement:* Automatically attempt binding on up to 3 alternate dynamic ephemeral ports before displaying a permission error.
    - *Why:* Maximizes connection reliability on machines with constrained or active local ports.
