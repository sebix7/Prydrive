# Tasks: Spec 011 — Item Details Popover and Table Column Optimization

- [x] **T1. Implement Two-Column Explorer Table layout removing creation date and size columns.** US-1 (FR-1, FR-2)
  - Depends on: None
  - Done when: `FileExplorer.tsx` renders a sticky header with strictly two columns (Icon placeholder `w-10` and `NAME` / `NOMBRE` `flex-1`), `FileTableRow.tsx` removes the `176px` creation date and `96px` size cells expanding the filename container across the remaining width, and `ParentNavRow.tsx` adopts the two-column structure with an empty trailing space; verified via automated unit tests in `tests/unit/drive-explorer.test.ts`.
  - Test Scenarios:
    1. *Header Two-Column Layout Verification:* `FileExplorer.tsx` renders sticky header containing only Icon placeholder (`w-10`) and Name column (`flex-1`), with no creation date or size columns. Verified in `tests/unit/drive-explorer.test.ts`.
    2. *Row Two-Column Structure Verification:* `FileTableRow.tsx` and `ParentNavRow.tsx` render without creation date (`176px` / `w-44`) or size (`96px` / `w-24`) cells, allowing filename to utilize the full available row width. Verified in `tests/unit/drive-explorer.test.ts`.

- [x] **T2. Implement interactive Details Action Button on item rows with keyboard accessibility and selection decoupling.** US-2 (FR-3, FR-4, FR-5, EC-1, EC-7)
  - Depends on: T1
  - Done when: Every real file and folder row in `FileTableRow.tsx` displays a `26px × 26px` geometric button with an `Info` icon, 1px structural borders matching top header controls, localized native tooltip (`Ver detalles` in `es` / `View details` in `en`), highlights with Swiss Archive borders and text accents on hover, receives focus via `Tab`, activates via `Enter`/`Space` or click, and stops event propagation (`stopPropagation`) to ensure row selection and double-click navigation states are not altered; verified via automated unit tests in `tests/unit/drive-explorer.test.ts` and `tests/integration/item-details-flow.test.ts`.
  - Test Scenarios:
    1. *Action Button Rendering & Tooltip Localization:* Every real file and folder row renders a `26px × 26px` details button with `Info` icon, 1px neutral structural border (`border-[#C9C6BD] dark:border-[#2C323D]`), `title` and `aria-label` localized to `"View details"` (`en`) / `"Ver detalles"` (`es`), and Swiss Archive hover border transitions. Verified in `tests/unit/drive-explorer.test.ts` and `tests/integration/item-details-flow.test.ts`.
    2. *Event Decoupling & Propagation Prevention:* Clicking or double-clicking the details action button stops event propagation (`stopPropagation`), preventing triggering row selection (`onSelect`) or folder navigation (`onDoubleClick`). Verified in `tests/integration/item-details-flow.test.ts`.
    3. *Keyboard Accessibility & Virtual Row Exclusion:* The details button is focusable via `Tab` (`tabIndex={0}`), triggers on `Enter` and `Space` keydown preventing default scroll/action, and the virtual parent row (`ParentNavRow.tsx`) does not render any details button. Verified in `tests/integration/item-details-flow.test.ts`.
    4. *Trailing Clearance from Lateral Toggle:* Every row applies `pr-9` trailing padding ensuring details action buttons maintain at least a 12px clearance from the lateral sidebar divider toggle button, preventing any visual overlap. Verified in `tests/integration/item-details-flow.test.ts`.

- [ ] **T3. Implement Swiss Archive Item Details Popover presentation and pure boundary collision calculations.** US-3 (FR-6, FR-8, NFR-1, NFR-2, NFR-3, EC-2, EC-5, EC-8)
  - Depends on: T2
  - Done when: `src/shared/item-details.ts` implements `resolveItemCategory`, `formatItemSizeDetail` (verifying `0 B` for empty files and `--` for folders), and `calculatePopoverPosition` (verifying automatic upward and inward flipping near viewport boundaries); and `ItemDetailsPopover.tsx` renders a `280px`-wide Swiss Archive elevated card displaying the 6 structured metadata fields (Full Name with wrapping, Category, Size, Creation Date, MIME type, and selectable Google Drive ID) with top index strip; verified via automated unit tests in `tests/unit/item-details.test.ts`.

- [ ] **T4. Implement Single Popover Cardinality and fluid dismissal machine.** US-4 (FR-5, FR-7, EC-4, EC-6, EC-7, EC-9)
  - Depends on: T3
  - Done when: `FileExplorer.tsx` manages a single `activeDetailsItemId` state ensuring opening a details popover closes any previously open popover, and the active popover dismisses cleanly upon outside click, pressing `Escape` (returning focus to the triggering details button), table scrolling (`onScroll`), or directory navigation; verified via automated integration tests in `tests/integration/item-details-flow.test.ts`.

- [ ] **T5. Implement complete bilingual localization parity for all item details labels and categories.** US-5 (FR-10)
  - Depends on: T3
  - Done when: `src/shared/i18n/translations.ts` defines 100% matched keys across English (`en`) and Spanish (`es`) for popover field headers (`item_details_*`) and item categories (`category_*`), returning correct translations according to active language; verified via automated unit tests in `tests/unit/translations.test.ts`.
