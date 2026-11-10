import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initialShellState,
  createInitialShellState,
  shellReducer,
  shouldAutoCollapseTree,
  getTreePanelClasses
} from '../../src/shared/shell-state';

describe('Tree Shell State & Responsive Reducers (Spec 007 US-1 / T1)', () => {
  describe('Initial State & Reducer Actions (FR-1, FR-2, FR-14)', () => {
    it('should default isTreeExpanded to true upon initialization (when not constrained by screen width)', () => {
      expect(initialShellState.isTreeExpanded).toBe(true);
    });

    it('should toggle isTreeExpanded on TOGGLE_TREE action', () => {
      const state1 = shellReducer(initialShellState, { type: 'TOGGLE_TREE' });
      expect(state1.isTreeExpanded).toBe(false);

      const state2 = shellReducer(state1, { type: 'TOGGLE_TREE' });
      expect(state2.isTreeExpanded).toBe(true);
    });

    it('should set explicit boolean on SET_TREE_EXPANDED action', () => {
      const state1 = shellReducer(initialShellState, {
        type: 'SET_TREE_EXPANDED',
        payload: false
      });
      expect(state1.isTreeExpanded).toBe(false);

      const state2 = shellReducer(state1, {
        type: 'SET_TREE_EXPANDED',
        payload: true
      });
      expect(state2.isTreeExpanded).toBe(true);
    });

    it('should resolve initial shell state with createInitialShellState safely', () => {
      // Unconstrained width (e.g. 1200px)
      const wideState = createInitialShellState(1200);
      expect(wideState.isSidebarExpanded).toBe(true);
      expect(wideState.isTreeExpanded).toBe(true);

      // Width below tree + sidebar threshold (< 1044px) but above sidebar threshold (>= 804px)
      const mediumState = createInitialShellState(1000);
      expect(mediumState.isSidebarExpanded).toBe(true);
      expect(mediumState.isTreeExpanded).toBe(false);

      // Narrow width below sidebar threshold (< 804px) and below tree threshold (< 784px)
      const narrowState = createInitialShellState(700);
      expect(narrowState.isSidebarExpanded).toBe(false);
      expect(narrowState.isTreeExpanded).toBe(false);

      // Undefined width falls back to unconstrained defaults
      const defaultState = createInitialShellState();
      expect(defaultState.isSidebarExpanded).toBe(true);
      expect(defaultState.isTreeExpanded).toBe(true);
    });
  });

  describe('shouldAutoCollapseTree (FR-14, NFR-2)', () => {
    it('should calculate auto-collapse threshold when right sidebar is expanded (1044px minimum)', () => {
      // 64 (rail) + 240 (tree) + 260 (sidebar) + 480 (canvas) = 1044px
      expect(shouldAutoCollapseTree(1200, true)).toBe(false);
      expect(shouldAutoCollapseTree(1044, true)).toBe(false);
      expect(shouldAutoCollapseTree(1043, true)).toBe(true);
      expect(shouldAutoCollapseTree(800, true)).toBe(true);
    });

    it('should calculate auto-collapse threshold when right sidebar is collapsed (784px minimum)', () => {
      // 64 (rail) + 240 (tree) + 0 (sidebar) + 480 (canvas) = 784px
      expect(shouldAutoCollapseTree(1000, false)).toBe(false);
      expect(shouldAutoCollapseTree(784, false)).toBe(false);
      expect(shouldAutoCollapseTree(783, false)).toBe(true);
      expect(shouldAutoCollapseTree(720, false)).toBe(true);
    });
  });

  describe('getTreePanelClasses across Swiss Archive themes (FR-1, FR-10, FR-11)', () => {
    it('should return expanded 240px container with border-r for light mode', () => {
      const classes = getTreePanelClasses(true, 'light');
      expect(classes.container).toContain('w-[240px]');
      expect(classes.container).toContain('border-r');
      expect(classes.container).toContain('border-[#C9C6BD]');
      expect(classes.container).toContain('transition-all');
      expect(classes.container).toContain('duration-200');
      expect(classes.inner).toContain('opacity-100');
    });

    it('should return expanded 240px container with border-r for dark mode', () => {
      const classes = getTreePanelClasses(true, 'dark');
      expect(classes.container).toContain('w-[240px]');
      expect(classes.container).toContain('border-r');
      expect(classes.container).toContain('border-[#2C323D]');
      expect(classes.inner).toContain('opacity-100');
    });

    it('should return collapsed 0px container when isExpanded is false', () => {
      const classes = getTreePanelClasses(false, 'dark');
      expect(classes.container).toContain('w-0');
      expect(classes.container).toContain('border-r-0');
      expect(classes.container).toContain('overflow-hidden');
      expect(classes.inner).toContain('opacity-0');
      expect(classes.inner).toContain('pointer-events-none');
    });
  });

  describe('Component Structure Integration (FR-2, US-1)', () => {
    it('should verify NavigationRail.tsx renders 28px circular RailDividerToggle on right border', () => {
      const railSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/NavigationRail.tsx'),
        'utf-8'
      );
      expect(railSource).toContain('tree-rail-toggle');
      expect(railSource).toContain('w-7');
      expect(railSource).toContain('h-7');
      expect(railSource).toContain('rounded-[4px]');
      expect(railSource).toContain('onToggleTree');
    });

    it('should verify DirectoryTreePanel.tsx exists with data-testid="directory-tree-panel"', () => {
      const panelSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/DirectoryTreePanel.tsx'),
        'utf-8'
      );
      expect(panelSource).toContain('directory-tree-panel');
      expect(panelSource).toContain('getTreePanelClasses');
    });
  });
});
