import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  initialShellState,
  reducePanelToggleWithMutualExclusion
} from '../../src/shared/shell-state';

describe('Panel Overlay & Mutual Exclusion Flow (Spec 009 US-3 / T3 / FR-9, FR-10, EC-2, EC-5)', () => {
  describe('reducePanelToggleWithMutualExclusion — Pure State Coordination (FR-9)', () => {
    it('should enforce strict mutual exclusion in compact mode (opening one closes others)', () => {
      const allCollapsed = {
        ...initialShellState,
        isRailExpanded: false,
        isTreeExpanded: false,
        isSidebarExpanded: false
      };

      // 1. Open Directory Tree
      const withTree = reducePanelToggleWithMutualExclusion(allCollapsed, 'tree', true);
      expect(withTree.isTreeExpanded).toBe(true);
      expect(withTree.isRailExpanded).toBe(false);
      expect(withTree.isSidebarExpanded).toBe(false);

      // 2. Open Right Sidebar -> Directory Tree must automatically close
      const withSidebar = reducePanelToggleWithMutualExclusion(withTree, 'sidebar', true);
      expect(withSidebar.isSidebarExpanded).toBe(true);
      expect(withSidebar.isTreeExpanded).toBe(false);
      expect(withSidebar.isRailExpanded).toBe(false);

      // 3. Open Navigation Rail -> Right Sidebar must automatically close
      const withRail = reducePanelToggleWithMutualExclusion(withSidebar, 'rail', true);
      expect(withRail.isRailExpanded).toBe(true);
      expect(withRail.isSidebarExpanded).toBe(false);
      expect(withRail.isTreeExpanded).toBe(false);

      // 4. Toggle Rail again -> Rail closes, all 3 are collapsed
      const closed = reducePanelToggleWithMutualExclusion(withRail, 'rail', true);
      expect(closed.isRailExpanded).toBe(false);
      expect(closed.isTreeExpanded).toBe(false);
      expect(closed.isSidebarExpanded).toBe(false);
    });

    it('should permit independent simultaneous panel expansion in standard dual resolution (>= 1044px)', () => {
      const state1 = reducePanelToggleWithMutualExclusion(initialShellState, 'tree', false, 1200);
      expect(state1.isTreeExpanded).toBe(false);

      const state2 = reducePanelToggleWithMutualExclusion(state1, 'tree', false, 1200);
      expect(state2.isTreeExpanded).toBe(true);
      expect(state2.isRailExpanded).toBe(true);
      expect(state2.isSidebarExpanded).toBe(true);
    });

    it('should enforce bidirectional mutual exclusion between tree and sidebar in intermediate resolution (804px - 1043px) (FR-10, EC-13)', () => {
      const stateWithSidebarOnly = {
        ...initialShellState,
        isRailExpanded: true,
        isSidebarExpanded: true,
        isTreeExpanded: false
      };

      // 1. Opening Directory Tree while Right Sidebar is open -> closes Right Sidebar and opens Directory Tree
      const treeOpened = reducePanelToggleWithMutualExclusion(
        stateWithSidebarOnly,
        'tree',
        false,
        900
      );
      expect(treeOpened.isTreeExpanded).toBe(true);
      expect(treeOpened.isSidebarExpanded).toBe(false);
      expect(treeOpened.isRailExpanded).toBe(true);

      // 2. Opening Right Sidebar while Directory Tree is open -> closes Directory Tree and opens Right Sidebar
      const sidebarOpened = reducePanelToggleWithMutualExclusion(
        treeOpened,
        'sidebar',
        false,
        900
      );
      expect(sidebarOpened.isSidebarExpanded).toBe(true);
      expect(sidebarOpened.isTreeExpanded).toBe(false);
      expect(sidebarOpened.isRailExpanded).toBe(true);
    });
  });

  describe('Overlay Layout Positioning & DOM Contracts (FR-8, FR-10)', () => {
    const appShellSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/AppShell.tsx'),
      'utf-8'
    );
    const treeSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/tree/DirectoryTreePanel.tsx'),
      'utf-8'
    );
    const sidebarSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/TelemetrySidebar.tsx'),
      'utf-8'
    );
    const railSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/NavigationRail.tsx'),
      'utf-8'
    );

    it('should pass isOverlay flag to NavigationRail, DirectoryTreePanel and TelemetrySidebar based on isCompactWidth', () => {
      expect(appShellSource).toContain('isOverlay={isCompactWidth}');
      expect(railSource).toContain('isOverlay');
      expect(railSource).toContain('getNavigationRailClasses(isRailExpanded, theme, isOverlay)');
    });

    it('should delegate all panel toggles through centralized handlers with compact state (FR-9, EC-8)', () => {
      expect(appShellSource).toContain('toggleRail');
      expect(appShellSource).toContain('toggleTree');
      expect(appShellSource).toContain('toggleSidebar');
      expect(appShellSource).toContain('onToggleSidebar={toggleSidebar}');
      expect(appShellSource).toContain('onToggleTree={toggleTree}');
      expect(appShellSource).toContain('onToggleRail={toggleRail}');
    });

    it('should apply absolute overlay positioning and high z-index in DirectoryTreePanel when isOverlay is true', () => {
      expect(treeSource).toContain('isOverlay');
      expect(treeSource).toContain('absolute');
      expect(treeSource).toContain('z-20');
      expect(treeSource).toContain('shadow-md');
    });

    it('should apply absolute overlay positioning and high z-index in TelemetrySidebar when isOverlay is true', () => {
      expect(sidebarSource).toContain('isOverlay');
      expect(sidebarSource).toContain('absolute');
      expect(sidebarSource).toContain('z-20');
      expect(sidebarSource).toContain('shadow-md');
    });
  });
});
