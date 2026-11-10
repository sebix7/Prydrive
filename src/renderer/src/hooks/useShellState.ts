import { useReducer, useEffect, useRef } from 'react';
import {
  type ActiveNavTab,
  type ActiveMenu,
  type ShellState,
  type ShellAction,
  type NavItem,
  type AboutMetadata,
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  shouldAutoCollapseTree,
  getTreePanelClasses,
  truncateEmail,
  NAV_ITEMS,
  resolveWorkspaceView,
  getNavButtonStyles,
  getSidebarClasses,
  ABOUT_METADATA,
  toggleMenuHeader,
  APP_VERSION,
  RAW_VERSION
} from '../../../shared/shell-state';

export type { ActiveNavTab, ActiveMenu, ShellState, ShellAction, NavItem, AboutMetadata };
export {
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  shouldAutoCollapseTree,
  getTreePanelClasses,
  truncateEmail,
  NAV_ITEMS,
  resolveWorkspaceView,
  getNavButtonStyles,
  getSidebarClasses,
  ABOUT_METADATA,
  toggleMenuHeader,
  APP_VERSION,
  RAW_VERSION
};

/**
 * Hook providing shell state, handlers, and click-outside/escape listeners.
 */
export function useShellState() {
  const [state, dispatch] = useReducer(shellReducer, initialShellState);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Global escape key listener to dismiss open menus
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && state.openMenu !== null) {
        dispatch({ type: 'CLOSE_MENUS' });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.openMenu]);

  // Global click-outside listener to dismiss open menus
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        state.openMenu !== null &&
        menuBarRef.current &&
        !menuBarRef.current.contains(event.target as Node)
      ) {
        dispatch({ type: 'CLOSE_MENUS' });
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [state.openMenu]);

  // Responsive resize constraint listener
  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined') {
        if (shouldAutoCollapseSidebar(window.innerWidth) && state.isSidebarExpanded) {
          dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: false });
        }
        if (
          shouldAutoCollapseTree(window.innerWidth, state.isSidebarExpanded) &&
          state.isTreeExpanded
        ) {
          dispatch({ type: 'SET_TREE_EXPANDED', payload: false });
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isSidebarExpanded, state.isTreeExpanded]);

  return {
    state,
    dispatch,
    menuBarRef
  };
}
