import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getHeaderPanelToggleButtonClasses,
  getNavigationRailClasses
} from '../../src/shared/theme';
import {
  PANEL_COMPACT_WIDTH_THRESHOLD,
  isCompactPanelWidth,
  resolveResponsivePanelCollapse,
  shellReducer,
  initialShellState,
  createInitialShellState
} from '../../src/shared/shell-state';

describe('Panel Visibility Toggle Controls (Spec 009 US-1 / T1 / FR-1, FR-2, FR-3, FR-5, FR-6)', () => {
  describe('getHeaderPanelToggleButtonClasses — Swiss Archive Pressed vs Neutral Tokens (FR-2, FR-6, NFR-1)', () => {
    it('should resolve pressed classes with Swiss Archive active selection contrast in Light Mode (FR-6)', () => {
      const pressedLight = getHeaderPanelToggleButtonClasses(true, 'light');
      expect(pressedLight).toContain('w-[30px]');
      expect(pressedLight).toContain('h-[30px]');
      expect(pressedLight).toContain('rounded-[4px]');
      expect(pressedLight).toContain('bg-[#DDE7FA]');
      expect(pressedLight).toContain('border-[#1B44E8]');
      expect(pressedLight).toContain('text-[#1B44E8]');
    });

    it('should resolve neutral classes with subtle borders and hover transitions in Light Mode (FR-6)', () => {
      const neutralLight = getHeaderPanelToggleButtonClasses(false, 'light');
      expect(neutralLight).toContain('bg-[#FFFFFF]');
      expect(neutralLight).toContain('border-[#C9C6BD]');
      expect(neutralLight).toContain('text-[#111315]');
      expect(neutralLight).toContain('hover:bg-[#ECEAE3]');
      expect(neutralLight).toContain('hover:border-[#1B44E8]');
      expect(neutralLight).toContain('hover:text-[#1B44E8]');
    });

    it('should resolve pressed classes with Luminous Klein Blue contrast in Dark Mode (FR-6)', () => {
      const pressedDark = getHeaderPanelToggleButtonClasses(true, 'dark');
      expect(pressedDark).toContain('bg-[#1C2D52]');
      expect(pressedDark).toContain('border-[#3B66FF]');
      expect(pressedDark).toContain('text-[#3B66FF]');
    });

    it('should resolve neutral classes with subtle dark borders and hover transitions in Dark Mode (FR-6)', () => {
      const neutralDark = getHeaderPanelToggleButtonClasses(false, 'dark');
      expect(neutralDark).toContain('bg-[#181C23]');
      expect(neutralDark).toContain('border-[#2C323D]');
      expect(neutralDark).toContain('text-[#F3F4F6]');
      expect(neutralDark).toContain('hover:bg-[#1E232C]');
      expect(neutralDark).toContain('hover:border-[#3B66FF]');
      expect(neutralDark).toContain('hover:text-[#3B66FF]');
    });
  });

  describe('MenuBar.tsx Header Panel Toggle Cluster Integration (FR-1, FR-2, FR-3, FR-5)', () => {
    const menuBarSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/MenuBar.tsx'),
      'utf-8'
    );

    it('should import FolderTree and PanelRight icons and getHeaderPanelToggleButtonClasses', () => {
      expect(menuBarSource).toContain('FolderTree');
      expect(menuBarSource).toContain('PanelRight');
      expect(menuBarSource).toContain('getHeaderPanelToggleButtonClasses');
    });

    it('should render header-toggle-tree-btn and header-toggle-sidebar-btn with aria-pressed', () => {
      expect(menuBarSource).toContain('header-toggle-tree-btn');
      expect(menuBarSource).toContain('header-toggle-sidebar-btn');
      expect(menuBarSource).toContain('aria-pressed={isTreeExpanded}');
      expect(menuBarSource).toContain('aria-pressed={isSidebarExpanded}');
    });

    it('should wire onToggleTree and onToggleSidebar click triggers', () => {
      expect(menuBarSource).toContain('onClick={onToggleTree}');
      expect(menuBarSource).toContain('onClick={onToggleSidebar}');
    });
  });

  describe('Adaptive Rail Toggle, 784px Threshold & Responsive Transitions (Spec 009 US-2 / T2 / FR-4, FR-7, FR-8, FR-11)', () => {
    it('should define PANEL_COMPACT_WIDTH_THRESHOLD at 784px', () => {
      expect(PANEL_COMPACT_WIDTH_THRESHOLD).toBe(784);
    });

    it('should evaluate isCompactPanelWidth correctly across boundaries', () => {
      expect(isCompactPanelWidth(720)).toBe(true);
      expect(isCompactPanelWidth(783)).toBe(true);
      expect(isCompactPanelWidth(784)).toBe(false);
      expect(isCompactPanelWidth(1024)).toBe(false);
      expect(isCompactPanelWidth(1200)).toBe(false);
      expect(isCompactPanelWidth(undefined)).toBe(false);
      expect(isCompactPanelWidth(NaN)).toBe(false);
    });

    it('should handle TOGGLE_RAIL and SET_RAIL_EXPANDED in shellReducer', () => {
      expect(initialShellState.isRailExpanded).toBe(true);

      const toggled = shellReducer(initialShellState, { type: 'TOGGLE_RAIL' });
      expect(toggled.isRailExpanded).toBe(false);

      const reToggled = shellReducer(toggled, { type: 'TOGGLE_RAIL' });
      expect(reToggled.isRailExpanded).toBe(true);

      const setFalse = shellReducer(initialShellState, {
        type: 'SET_RAIL_EXPANDED',
        payload: false
      });
      expect(setFalse.isRailExpanded).toBe(false);
    });

    it('should auto-collapse all 3 lateral bars when crossing below 784px threshold (FR-7, EC-6)', () => {
      const activeStandardState = {
        ...initialShellState,
        isRailExpanded: true,
        isTreeExpanded: true,
        isSidebarExpanded: true
      };

      const collapsedState = resolveResponsivePanelCollapse(
        activeStandardState,
        1000,
        750
      );
      expect(collapsedState.isRailExpanded).toBe(false);
      expect(collapsedState.isTreeExpanded).toBe(false);
      expect(collapsedState.isSidebarExpanded).toBe(false);
    });

    it('should auto-restore navigation rail when crossing back above 784px threshold (FR-8, EC-7)', () => {
      const compactState = {
        ...initialShellState,
        isRailExpanded: false,
        isTreeExpanded: false,
        isSidebarExpanded: false
      };

      const restoredState = resolveResponsivePanelCollapse(
        compactState,
        750,
        1000
      );
      expect(restoredState.isRailExpanded).toBe(true);
    });

    it('should initialize shell state with collapsed bars when starting below 784px', () => {
      const compactInitial = createInitialShellState(750);
      expect(compactInitial.isRailExpanded).toBe(false);
      expect(compactInitial.isTreeExpanded).toBe(false);
      expect(compactInitial.isSidebarExpanded).toBe(false);

      const standardInitial = createInitialShellState(1200);
      expect(standardInitial.isRailExpanded).toBe(true);
    });

    it('should resolve getNavigationRailClasses for expanded and collapsed states (FR-7)', () => {
      const expandedClasses = getNavigationRailClasses(true, 'dark');
      expect(expandedClasses).toContain('w-16');
      expect(expandedClasses).toContain('opacity-100');

      const collapsedClasses = getNavigationRailClasses(false, 'dark');
      expect(collapsedClasses).toContain('w-0');
      expect(collapsedClasses).toContain('overflow-hidden');
      expect(collapsedClasses).toContain('opacity-0');
      expect(collapsedClasses).toContain('pointer-events-none');
    });

    it('should verify NavigationRail.tsx integrates getNavigationRailClasses and hides rail divider toggle in compact mode (FR-11)', () => {
      const railSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/NavigationRail.tsx'),
        'utf-8'
      );
      expect(railSource).toContain('getNavigationRailClasses');
      expect(railSource).toContain('isRailExpanded');
      expect(railSource).toContain('!isCompactWidth');
    });
  });
});
