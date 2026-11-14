import { useReducer, useEffect, useRef, useState } from 'react';
import {
  type ActiveNavTab,
  type ActiveMenu,
  type ShellState,
  type ShellAction,
  type NavItem,
  type AboutMetadata,
  initialShellState,
  createInitialShellState,
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
  RAW_VERSION,
  isCompactPanelWidth,
  resolveResponsivePanelCollapse
} from '../../../shared/shell-state';

export type { ActiveNavTab, ActiveMenu, ShellState, ShellAction, NavItem, AboutMetadata };
export {
  initialShellState,
  createInitialShellState,
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
  const [state, dispatch] = useReducer(
    shellReducer,
    typeof window !== 'undefined' ? window.innerWidth : undefined,
    createInitialShellState
  );
  const menuBarRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [isCompactWidth, setIsCompactWidth] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isCompactPanelWidth(window.innerWidth) : false
  );

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
        const currentWidth = window.innerWidth;
        const wasCompact = isCompactPanelWidth(prevWidthRef.current);
        const isNowCompact = isCompactPanelWidth(currentWidth);

        // Crossing into compact resolution (< 784px): auto-collapse all 3 lateral bars (FR-7)
        if (!wasCompact && isNowCompact) {
          dispatch({ type: 'SET_RAIL_EXPANDED', payload: false });
          dispatch({ type: 'SET_TREE_EXPANDED', payload: false });
          dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: false });
        } else if (wasCompact && !isNowCompact) {
          // Crossing back into standard resolution (>= 784px): auto-restore rail (FR-8)
          dispatch({ type: 'SET_RAIL_EXPANDED', payload: true });
        } else if (!isNowCompact) {
          // Standard resolution auto-collapse rules
          if (shouldAutoCollapseSidebar(currentWidth) && state.isSidebarExpanded) {
            dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: false });
          }
          if (
            shouldAutoCollapseTree(currentWidth, state.isSidebarExpanded) &&
            state.isTreeExpanded
          ) {
            dispatch({ type: 'SET_TREE_EXPANDED', payload: false });
          }
        }
        setIsCompactWidth(isNowCompact);
        prevWidthRef.current = currentWidth;
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isSidebarExpanded, state.isTreeExpanded, state.isRailExpanded]);

  const toggleRail = () =>
    dispatch({
      type: 'TOGGLE_RAIL',
      isCompact: isCompactWidth,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : undefined
    });
  const toggleTree = () =>
    dispatch({
      type: 'TOGGLE_TREE',
      isCompact: isCompactWidth,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : undefined
    });
  const toggleSidebar = () =>
    dispatch({
      type: 'TOGGLE_SIDEBAR',
      isCompact: isCompactWidth,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : undefined
    });

  return {
    state,
    dispatch,
    menuBarRef,
    isCompactWidth,
    toggleRail,
    toggleTree,
    toggleSidebar
  };
}
