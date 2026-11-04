# Tasks: Spec 003 — About Modal Project Links & Contact Metadata

- [x] **T1. Integrate the public Trello management board URL into project metadata and render the external board link row in the About modal dialog.** US-1 (FR-1, FR-2, NFR-1)
  - Depends on: None
  - Done when: The public Trello board link (`https://trello.com/b/aPzGPiHF/prydrive`) is defined in `ABOUT_METADATA` and rendered as a dedicated "Board" entry in the About modal metadata card; clicking the entry launches the URL in the operating system's default external web browser with an external link indicator. Verified via automated unit tests in `tests/unit/about-metadata.test.ts`.

- [x] **T2. Implement the developer contact email row, mailto launcher, and isolated copy-to-clipboard action with transient visual feedback and timer cleanup.** US-2 (FR-3, FR-4, FR-5, FR-6, NFR-2, EC-1, EC-2, EC-3, EC-4, EC-5)
  - Depends on: T1
  - Done when: The developer contact email (`sebiplay@hotmail.com`) is rendered in the About modal metadata card with a functional `mailto:` link; clicking the adjacent quick-action copy button copies the address to the system clipboard with event propagation isolated (`stopPropagation`), displays instantaneous visual confirmation (icon switches to checkmark, color shifts to emerald, tooltip switches to confirmation text), reverts after 2 seconds, and cancels active timeouts upon dialog unmount. Verified via automated unit tests in `tests/unit/about-metadata.test.ts`.

- [ ] **T3. Implement bilingual localization parity for all new metadata labels, action tooltips, and copy confirmation states.** US-3 (FR-7)
  - Depends on: T1, T2
  - Done when: All new About modal keys (`about_board`, `about_contact`, `about_copy_email`, `about_copied`) are defined in both English and Spanish with 100% dictionary key parity; toggling language between English and Spanish immediately updates all visible labels, action tooltips, and confirmation messages in the About modal dialog without application reload. Verified via automated dictionary symmetry and parity unit tests in `tests/unit/translations.test.ts`.
