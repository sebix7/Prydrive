# Spec 003 — About Modal Project Links & Contact Metadata
Status: approved

## Context and Goal
The About modal dialog in Prydrive currently provides baseline project information (application name, dynamic version, short description, and GitHub repository link). To improve community transparency, project tracking visibility, and user support channels, the modal needs to be enriched with direct access to the public project management board (Trello) and an official developer contact email address with quick copy-to-clipboard functionality.

## Users
- **Desktop Application User:** Any user exploring the application information dialog who wants to follow development progress, check upcoming features on the public roadmap, or contact the developer for support or feedback.

## User Stories
- **US-1:** As a user, I want to access the public Trello roadmap board directly from the About modal so that I can see planned features, active progress, and project updates.
- **US-2:** As a user, I want to see the developer contact email address in the About modal with options to open my system email client or copy the address to my clipboard with instant visual confirmation so that I can reach out easily.
- **US-3:** As a user, I want all new metadata labels, tooltips, and feedback messages to be fully localized in my selected language (English or Spanish) so that the information is clear and accessible.

## Definitions
- **Metadata Card:** The structured container within the About dialog presenting key-value project information rows.
- **Copy Action Feedback:** A transient visual cue displaying a checkmark icon, emerald accent styling, and a dynamic tooltip ("Copied!" / "¡Copiado!") confirming clipboard placement.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL display a dedicated "Board" (Tablero) entry in the About dialog metadata card linking to `https://trello.com/b/aPzGPiHF/prydrive`.
- **FR-2:** WHEN the user activates the Trello board link, THE SYSTEM SHALL launch the URL in the operating system's default web browser.
- **FR-3:** THE SYSTEM SHALL display a dedicated "Contact" (Contacto) entry in the About dialog metadata card showing the email address `sebeatport@gmail.com`.
- **FR-4:** WHEN the user clicks the contact email address link, THE SYSTEM SHALL trigger the operating system's default email client via a `mailto:sebeatport@gmail.com` protocol handler.
- **FR-5:** THE SYSTEM SHALL provide a quick-action copy button adjacent to the contact email address.
- **FR-6:** WHEN the user activates the copy button, THE SYSTEM SHALL copy `sebeatport@gmail.com` to the system clipboard without triggering the `mailto:` email client, and display a temporary confirmation feedback state (icon transitions to checkmark, color shifts to emerald, and tooltip displays "Copied!" / "¡Copiado!").
- **FR-7:** THE SYSTEM SHALL localize all new labels ("Board", "Contact", "Copy email", "Copied!") symmetrically in English and Spanish according to the active language setting.

## Non-Functional Requirements
- **NFR-1 (Aesthetic Consistency & Flexibility):** The layout and typographic hierarchy of the metadata card must maintain visual harmony with existing project details, using subtle separators, consistent iconography, and flexible vertical layout within standard width (`max-w-sm`).
- **NFR-2 (Feedback Timeliness):** The clipboard copy feedback must appear immediately upon activation (< 100ms) and revert to its resting state after 2 seconds.

## Edge Cases
- **EC-1:** System default email client is not configured $\rightarrow$ The email address remains readable and the copy button allows the user to copy the address manually without blocking or crashing the application.
- **EC-2:** Rapid repeated clicks on the copy button $\rightarrow$ The copy operation is idempotent and the temporary feedback timer resets gracefully without animation glitches.
- **EC-3:** Clipboard API permission failure or rejection $\rightarrow$ If the system clipboard write operation fails, the system gracefully handles the error without crashing, keeping the button in its resting state.
- **EC-4:** Dialog dismissal during active copy feedback $\rightarrow$ Active feedback timers are cleanly cleared on dialog close or unmount, preventing memory leaks.
- **EC-5:** Horizontal text constraint in contact row $\rightarrow$ The email container employs flexbox truncation (`truncate`, `min-w-0`) while label and copy button remain fixed (`shrink-0`), preventing layout overflow.

## Out of Scope
- Built-in feedback or email composition form inside the application window.
- In-app browser or embedded web view for Trello (all external links open in the external OS default browser).
- Dynamic fetching of live Trello board cards or statistics via external APIs.

## Completion Criteria
- Verified presence of the Trello board link in the About dialog metadata card.
- Verified launching of the Trello URL in the external default browser upon click.
- Verified display of the contact email address with functional `mailto:` link.
- Functional clipboard copy button copying the exact email address with transient visual feedback (checkmark, emerald color, tooltip).
- Clean isolation between clicking the copy button and clicking the email `mailto:` link.
- Graceful handling of clipboard rejection and timer cleanup on unmount.
- Full bilingual localization parity (English and Spanish) for all new labels and tooltips.
- 100% automated test coverage passing for metadata and localization dictionaries.

## Decisions / Clarifications (Changelog)
- **2026-11-04 (Initial Spec Interview):**
  - **Question 1 (Email interaction):** Specified that clicking the email triggers the system email client (`mailto:`) while also offering an inline copy-to-clipboard action with visual feedback.
  - **Question 2 (Visual organization):** Specified that the Trello board and Contact email will be integrated cleanly as structured rows inside the existing metadata card alongside the GitHub repository entry.
- **2026-11-04 (QA Audit Resolution):**
  - **Question 1 (Copy Feedback Design):**
    - *Agreement:* The copy button icon transitions to a checkmark (`Check`), text/icon color turns emerald/green, and the tooltip dynamically switches to *"¡Copiado!"* (ES) / *"Copied!"* (EN) for 2 seconds.
    - *Why:* Provides clear, multi-sensory confirmation that the text was placed in the clipboard.
  - **Question 2 (Event Isolation between Link and Copy Button):**
    - *Agreement:* Activating the copy button stops event propagation so it only performs clipboard copying and does NOT open the email client. Clicking the email text itself triggers `mailto:`.
    - *Why:* Prevents unwanted system mail app popups when the user merely wants to copy the email.
  - **Question 3 (Modal Dimensions):**
    - *Agreement:* Maintain standard `max-w-sm` (~384px) with flexible vertical growth for the metadata card to host all three items naturally.
    - *Why:* Preserves clean desktop dialog proportions without rigid cutoffs.
  - **Question 4 (Clipboard Failure Handling):**
    - *Agreement:* Silently catch any clipboard write rejection, preventing crashes and keeping the button in resting state.
    - *Why:* Robustness in environments with restricted clipboard permissions.
  - **Question 5 (Timer Cleanup):**
    - *Agreement:* Ensure feedback timers are cancelled if the modal is dismissed while active.
    - *Why:* Avoids React unmounted component state update warnings and memory leaks.
  - **Question 6 (Text Layout & Truncation):**
    - *Agreement:* Use `min-w-0 flex-1 truncate` on the email address container and `shrink-0` on labels and actions.
    - *Why:* Prevents layout blowout on high DPI scaling or small window bounds.
