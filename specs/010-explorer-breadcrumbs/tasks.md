# Tasks: Spec 010 — Explorer Navigation Breadcrumbs

- [x] **T1. Implement persistent Explorer Breadcrumb Bar, root localization, and path formatting above table header.** US-1 (FR-1, FR-2, FR-3, FR-4, FR-9, NFR-1)
  - Depends on: None
  - Done when: `src/shared/explorer-helpers.ts` implements `formatCrumbDisplayName` localizing root to `Mi unidad` / `My Drive`; `src/shared/theme.ts` implements `getBreadcrumbBarClasses`, `getBreadcrumbCrumbClasses`, and `getBreadcrumbSeparatorClasses`; `src/renderer/src/components/explorer/ExplorerBreadcrumbBar.tsx` is created and mounted immediately above the table header in `FileExplorer.tsx`; breadcrumb renders root crumb when at root and full lineage with `/` separators when in subfolders; and the virtual `...` parent row remains functional inside the table. Verified via automated unit tests in `tests/unit/explorer-breadcrumbs.test.ts`.

- [x] **T2. Implement direct ancestor crumb navigation, stack truncation, and non-clickable active crumb.** US-2 (FR-5, FR-6, FR-7, FR-13, NFR-1, NFR-2, NFR-3)
  - Depends on: T1
  - Done when: `src/shared/explorer-helpers.ts` implements `truncateFolderStack` slicing history stack up to the target folder ID; ancestor crumbs render as interactive clickable buttons with hover transitions (`hover:text-[#1B44E8]` / `hover:text-[#3B66FF]`); clicking an ancestor invokes `navigateToFolderStack` and truncates subsequent history; active crumb renders as prominent non-clickable text with `aria-current="page"`; and double-clicking `...` in the table pops the active crumb. Verified via automated integration tests in `tests/integration/breadcrumb-navigation-flow.test.ts` and unit tests in `tests/unit/explorer-breadcrumbs.test.ts`.

- [ ] **T3. Implement deep path auto-scroll, native scrollbar hiding, and full-length crumb rendering.** US-3 (FR-8, NFR-1, NFR-2, EC-2)
  - Depends on: T2
  - Done when: `ExplorerBreadcrumbBar.tsx` applies `overflow-x-auto` and `scrollbar-none` to hide native visual scrollbars without clipping the 32px bar height; `useEffect` programmatically scrolls container to the rightmost edge (`scrollLeft = scrollWidth`) upon path changes; and all folder names render in full length without artificial character truncation. Verified via automated unit tests in `tests/unit/explorer-breadcrumbs.test.ts`.

- [ ] **T4. Implement Swiss Archive Light/Dark theming, lifecycle state persistence, and quality suite verification.** US-4 (FR-10, FR-11, FR-12, NFR-1, NFR-2, NFR-3, EC-3, EC-4, EC-5, EC-6)
  - Depends on: T2, T3
  - Done when: `src/shared/theme.ts` provides pure class resolvers ensuring Swiss Archive surfaces (`#F2F0EA` / `#15181E`) and 1px border (`#C9C6BD` / `#2C323D`) across Light and Dark themes verified by `tests/unit/theme-surfaces.test.ts`; breadcrumb bar stays permanently mounted and interactive during loading spinner, empty folder state, and error banner states; language toggling reactively updates root crumb (`Mi unidad` $\leftrightarrow$ `My Drive`); and the complete test suite (`pnpm test`) and type check (`pnpm run typecheck`) pass with zero errors.
