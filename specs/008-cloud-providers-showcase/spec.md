# Spec 008 — Multi-Provider Login Showcase and Google Drive Brand Connection
Status: approved

## Context and Goal
Prydrive is designed with a multi-provider decoupled architecture capable of supporting various cloud storage systems. Currently, the welcome screen displays a generic Google "G" icon with the action "Iniciar sesión con Google" ("Sign in with Google"). To improve brand clarity and present the product's integration roadmap, this specification defines:
1. Updating the primary active authentication button to explicitly feature the **Google Drive logo** and directional arrow.
2. Introducing disabled visual showcase buttons for additional cloud storage providers (**OneDrive**, **MEGA**, and **MediaFire**) arranged in an **adaptive responsive layout**:
   - **Standard View (Fullscreen / Regular height >= 620px):** Single vertical stack of full-width rows with official logos, localized action labels ("Conectarse a [Servicio]"), and "Próximamente" roadmap pill tags.
   - **Compact View (Low resolution / Minimized height < 620px):** Compact 2×2 grid with intrinsic centered width and generous `gap-5` icon-to-arrow spacing, omitting text labels and pill tags to completely eliminate vertical clipping.
3. Providing clear, non-interactive visual cues on each secondary provider (official brand logos inside standardized contrast badges, muted disabled styling, and informative hover tooltips) across both responsive modes to showcase upcoming platform capabilities without generating false expectations.
4. Aligning the welcome subtitle to be cloud-storage agnostic while keeping the browser authentication notice anchored at the bottom of the card, adhering strictly to Swiss Archive aesthetics in both Light and Dark modes.

## Users
- **New or Logged-out User:** A desktop user opening Prydrive who wants to connect their Google Drive account and discover upcoming support for other cloud storage providers on the platform roadmap.

## User Stories
- **US-1 (Explicit Google Drive Connection Action):** As a user, I want the primary connection button on the welcome screen to display the official Google Drive logo and arrow, so that I know exactly which cloud service I am authenticating with.
- **US-2 (Upcoming Cloud Providers Showcase):** As a user, I want to see disabled buttons for OneDrive, MEGA, and MediaFire alongside Google Drive adapting responsively to my screen size (full vertical stack with labels in fullscreen; compact 2×2 grid in low resolution), so that I can see the multi-cloud roadmap clearly without window overflow.
- **US-3 (Informative Tooltips and Non-Interactive Guardrails):** As a user, I want hovering over disabled provider buttons to show a descriptive tooltip indicating that the provider is under development, with non-interactive cursor feedback that prevents accidental clicks.
- **US-4 (Agnostic Welcome Subtitle and Theme Harmony):** As a user, I want the card subtitle to refer to cloud storage generally, with all provider buttons rendered cleanly with Swiss Archive surface contrast in both Light and Dark themes.

## Definitions
- **Primary Connection Button:** The active, interactive button that triggers the OAuth 2.0 loopback authentication flow for Google Drive.
- **Upcoming Provider Buttons:** Secondary buttons representing planned storage backends (OneDrive, MEGA, MediaFire) rendered in a non-interactive, disabled visual state.
- **Brand Icon Badge:** A standardized 24px × 24px (`w-6 h-6`, `rounded-[3px]`) container with a clean white background and subtle 1px border (`border-black/10`), ensuring consistent icon presentation and contrast across both Light and Dark modes for all cloud services.
- **Adaptive Provider Showcase:** Dual-mode layout that renders a full-width vertical stack with localized labels and roadmap badges on standard viewports (height $\ge 620px$), and automatically collapses to an intrinsically centered 2×2 grid on compact viewports (height $< 620px$).
- **Provider-Agnostic Subtitle:** Welcome card descriptive copy that references cloud storage management generically rather than Google Drive exclusively.

## Functional Requirements
- **FR-1:** THE SYSTEM SHALL render the primary connection button with the official **Google Drive logo** housed in a standardized 24px × 24px brand icon badge and a trailing right arrow:
  - English: `Connect to Google Drive`
  - Spanish: `Conectarse a Google Drive`
- **FR-2:** WHEN the user clicks the primary Google Drive button, THE SYSTEM SHALL trigger the existing OAuth 2.0 loopback authentication flow.
- **FR-3:** WHILE the viewport height is at standard resolution (height >= 620px), THE SYSTEM SHALL render provider connection buttons as a **single cohesive vertical block of full-width rows** with uniform vertical spacing in the exact sequence:
  1. **Google Drive** (active primary)
  2. **OneDrive** (upcoming secondary)
  3. **MEGA** (upcoming secondary)
  4. **MediaFire** (upcoming secondary)  
  In this mode, each row SHALL display the brand icon badge, localized action label, and trailing arrow (with roadmap badge on upcoming providers).
- **FR-4:** WHILE the viewport height is at compact resolution (height < 620px), THE SYSTEM SHALL render provider connection buttons in an **intrinsically centered 2×2 grid** (`grid grid-cols-2 gap-2`, omitting `w-full`) in the sequence:
  - Row 1: **Google Drive** and **OneDrive**
  - Row 2: **MEGA** and **MediaFire**  
  In this mode, each button SHALL feature solely the brand icon badge and trailing arrow separated by `gap-5`, omitting inline text labels and roadmap pill tags to eliminate vertical overflow.
- **FR-5:** WHEN the user resizes the window across the 620px viewport height threshold, THE SYSTEM SHALL dynamically transition between the standard vertical stack and the compact 2×2 grid without page reload, layout clipping, or loss of state.
- **FR-6:** THE SYSTEM SHALL render all upcoming provider buttons in a **disabled state** with `aria-disabled="true"`, pronounced muted opacity (`opacity-40`), non-interactive cursor styling (`cursor-not-allowed`), and zero trigger action upon click, Enter, or Space key press across both standard and compact modes.
- **FR-7:** WHEN the user hovers over an upcoming provider button, THE SYSTEM SHALL display an informative tooltip indicating that connection to that provider is under development:
  - English: `[Service] integration coming soon` (e.g. `OneDrive integration coming soon`, `MEGA integration coming soon`, `MediaFire integration coming soon`)
  - Spanish: `Integración con [Service] próximamente` (e.g. `Integración con OneDrive próximamente`, `Integración con MEGA próximamente`, `Integración con MediaFire próximamente`)  
  The button or its container SHALL ensure hover/pointer event delivery so that tooltips render reliably on disabled elements.
- **FR-8:** WHILE authentication is in progress or the interface is globally disabled, THE SYSTEM SHALL disable the primary Google Drive button alongside all secondary provider buttons, preventing any action.
- **FR-9:** THE SYSTEM SHALL update the welcome card subtitle to:
  - English: `Connect to your cloud storage to manage your files directly from your desktop.`
  - Spanish: `Conéctate a tu almacenamiento en la nube para gestionar tus archivos directamente desde tu escritorio.`
- **FR-10:** THE SYSTEM SHALL anchor the browser authentication notice text at the bottom of the welcome card, below the active provider layout.
- **FR-11:** WHILE the active theme is `light`, THE SYSTEM SHALL render the primary button with high-contrast Klein Blue hover accent, and upcoming provider buttons with Swiss Archive secondary surfaces (`#F2F0EA`), subtle 1px borders (`#C9C6BD`), and accessible muted icon/arrow contrast.
- **FR-12:** WHILE the active theme is `dark`, THE SYSTEM SHALL render the primary button with luminous Klein Blue hover accent, and upcoming provider buttons with Swiss Archive secondary surfaces (`#15181E`), subtle 1px borders (`#2C323D`), and accessible muted icon/arrow contrast.

## Non-Functional Requirements
- **NFR-1 (Visual Hierarchy):** The primary Google Drive button must visually dominate the card with active hover transitions and primary contrast, while upcoming provider buttons must remain noticeably muted and secondary.
- **NFR-2 (Accessibility & Contrast):** All provider buttons and roadmap badges must provide minimum WCAG AA contrast (4.5:1 for body/button text, 3:1 for badges/borders), with clear `aria-disabled="true"` and descriptive accessible labels.
- **NFR-3 (Zero Regression):** Adding upcoming provider buttons must preserve 100% of existing authentication flows, top-right controls (theme, language, about), technical index strips, and responsive card centering.

## Edge Cases
- **EC-1:** Rapid consecutive clicks or enter key presses on disabled provider buttons $\rightarrow$ Ignored entirely, no network requests or state changes triggered.
- **EC-2:** Instantaneous language toggle between Spanish and English $\rightarrow$ All provider button labels, roadmap badges, informative tooltips, and subtitle update immediately without page refresh.
- **EC-3:** Instantaneous theme toggle between Light and Dark modes $\rightarrow$ All button surfaces, borders, badge backgrounds, and brand icon contrasts adapt instantaneously.
- **EC-4:** Responsive card height on small desktop viewports $\rightarrow$ The welcome card maintains consistent vertical spacing without scrollbars, clipping, or text overlap by automatically adopting the compact 2×2 grid mode.
- **EC-5:** Offline state $\rightarrow$ When offline without a saved session, the offline view and reconnect banner take precedence per Spec 006, preserving the full multi-provider card layout when network connectivity is re-established.
- **EC-6:** Dynamic window resizing across 620px threshold $\rightarrow$ Seamlessly switches between full vertical list and compact 2×2 grid without flickering or state loss.

## Out of Scope
- Functional OAuth or API connectivity for OneDrive, MEGA, or MediaFire (buttons are visual roadmap representations only).
- Multi-provider session switching or simultaneous multi-cloud storage explorers.
- Custom account linking or credential configuration for third-party providers.
- User-customizable drag-and-drop rearrangement of provider buttons.

## Completion Criteria
- Primary button displays the Google Drive logo with `Conectarse a Google Drive` / `Connect to Google Drive` and initiates login.
- In standard mode (height $\ge 620px$), all four provider rows display in vertical sequence with localized text labels and roadmap badges.
- In compact mode (height $< 620px$), all four buttons display in an intrinsically centered 2×2 grid with icon and arrow.
- Subtitle updated to cloud-storage agnostic copy; browser notice anchored at the bottom.
- 100% test suite passing with unit tests verifying labels, badges, disabled states, accessibility attributes, translations, and responsive threshold.
- Zero TypeScript errors (`tsc --noEmit`).

## Open Questions
*(All requirements and edge cases resolved during clarification interview and QA review)*

## Decisions / Clarifications (Changelog)
- **2026-11-12 (Interview Resolution 1 - Layout & Roadmap Badges):** Decided that upcoming providers will be arranged in a vertical stack directly below the Google Drive button, each featuring a compact "Próximamente" ("Coming soon") badge and an informative tooltip on hover.
- **2026-11-12 (Interview Resolution 2 - Label Format & Provider Order):** Agreed to format labels uniformly as "Conectarse a [Servicio]" ("Connect to [Service]") in the exact sequence: Google Drive, OneDrive, MEGA, MediaFire.
- **2026-11-12 (Interview Resolution 3 - Copy Alignment & Notice Placement):** Agreed to update the welcome subtitle to be provider-agnostic ("Conéctate a tu almacenamiento en la nube...") and retain the browser authentication notice at the bottom of the card.
- **2026-11-12 (QA Audit Resolution 1 - Badge and Trailing Arrow Coexistence):** Agreed that in upcoming provider buttons, the "Próximamente" / "Coming soon" pill badge coexists alongside a subtle, muted right arrow icon (`ArrowRight`) on the right edge, matching the layout structure of the primary button.
- **2026-11-12 (QA Audit Resolution 2 - Single Unified Vertical Block):** Confirmed that all four provider buttons form a single cohesive vertical block with uniform vertical spacing (`gap-2`), avoiding artificial divider rules.
- **2026-11-12 (QA Audit Resolution 3 - Reliable Tooltips on Disabled Controls):** Agreed that upcoming buttons or their immediate wrappers will ensure pointer/hover event delivery so that browser and OS tooltips display consistently on disabled elements.
- **2026-11-12 (QA Audit Resolution 4 - MediaFire Brand Capitalization):** Standardized official brand spelling as `MediaFire` (capital "F") across all English and Spanish texts.
- **2026-11-12 (QA Audit Resolution 5 - Keyboard Focus & Guardrails):** Agreed that disabled provider buttons will maintain `aria-disabled="true"` with non-interactive styling, strictly ignoring Enter and Space keyboard events to prevent accidental triggers.
- **2026-11-12 (QA Audit Resolution 6 - Permanent Disabled State):** Confirmed that upcoming provider buttons remain disabled at all times, both during idle state and while Google Drive authentication is in flight.
- **2026-11-12 (QA Audit Resolution 7 - Offline Mode Behavior):** Clarified that when launching offline without an active session, the offline card view established in Spec 006 takes precedence, seamlessly displaying the full multi-provider login card upon reconnecting.
- **2026-11-12 (QA Audit Resolution 8 - Icon Container Contrast):** Agreed that all cloud service logos (Google Drive, OneDrive, MEGA, MediaFire) will be framed inside a standardized 24px × 24px (`w-6 h-6`, `rounded-[3px]`) container with white background and subtle 1px border (`border-black/10`), providing identical visual alignment and high contrast in both Light and Dark themes.
- **2026-11-12 (Design Change - 2×2 Grid & Minimalist Icon+Arrow Affordance):** Converted provider connection layout from a 4-row vertical stack to a compact 2×2 grid (Row 1: Google Drive, OneDrive; Row 2: MEGA, MediaFire). Streamlined each button to feature exclusively the 24×24 brand icon badge and trailing directional arrow, removing inline text labels and "Próximamente" pill tags. This eliminates window overflow on small viewports (minHeight 500) while conveying roadmap availability through disabled styling and descriptive hover tooltips.
- **2026-11-12 (Grid Refinement — Intrinsic Centered Width & Gap-5 Spacing):** Updated 2×2 grid container to remove `w-full` so buttons wrap intrinsically around their contents and center cleanly inside the card. Updated button internal spacing from `gap-3` to `gap-5` to provide proportional separation between the brand icon tile and the directional arrow.
- **2026-11-12 (Adaptive Layout — Fullscreen Vertical Stack vs Low-Res 2×2 Grid):** Established responsive viewport-aware rendering. At standard fullscreen resolution (height >= 620px), the welcome card presents the full vertical stack of 4 full-width rows with localized text labels and roadmap badges. At low resolution / small window bounds (height < 620px), it dynamically switches to the compact centered 2×2 grid with icon and arrow only, achieving optimal visual richness on large screens and complete visibility without clipping on small viewports.
- **2026-11-12 (Visual Affordance — Increased Disabled Opacity to 40%):** Changed upcoming provider button opacity from `opacity-75` to `opacity-40` to make their disabled, non-interactive state significantly more distinct and unmistakable compared to the primary Google Drive button.
