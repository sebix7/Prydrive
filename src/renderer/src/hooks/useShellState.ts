import { useReducer, useEffect, useRef } from 'react';
import {
  type ActiveNavTab,
  type ActiveMenu,
  type ShellState,
  type ShellAction,
  type NavItem,
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  truncateEmail,
  NAV_ITEMS,
  resolveWorkspaceView,
  getNavButtonStyles
} from '../../../shared/shell-state';

export type { ActiveNavTab, ActiveMenu, ShellState, ShellAction, NavItem };
export {
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  truncateEmail,
  NAV_ITEMS,
  resolveWorkspaceView,
  getNavButtonStyles
};

/**
 * Hook providing shell state, handlers, and click-outside/escape listeners.
 */
export function useShellState() {
  const [state, dispatch] = useReducer(shellReducer, initialShellState);
  const menuBarRef = useRef<HTMLDivElement | null>(null);

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
      if (typeof window !== 'undefined' && shouldAutoCollapseSidebar(window.innerWidth)) {
        if (state.isSidebarExpanded) {
          dispatch({ type: 'SET_SIDEBAR_EXPANDED', payload: false });
        }
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isSidebarExpanded]);

  return {
    state,
    dispatch,
    menuBarRef
  };
}
