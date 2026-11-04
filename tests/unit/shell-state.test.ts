import { describe, it, expect } from 'vitest';
import {
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  truncateEmail,
  type ShellState
} from '../../src/shared/shell-state';

describe('Shell State & Utilities (US-1 / T1)', () => {
  it('should initialize with expanded right sidebar and google-drive active nav', () => {
    expect(initialShellState.activeNav).toBe('google-drive');
    expect(initialShellState.isSidebarExpanded).toBe(true);
    expect(initialShellState.openMenu).toBeNull();
    expect(initialShellState.isAboutModalOpen).toBe(false);
    expect(initialShellState.isDisconnectModalOpen).toBe(false);
  });

  it('should handle SET_ACTIVE_NAV and close any open menu', () => {
    const state: ShellState = {
      ...initialShellState,
      openMenu: 'options'
    };
    const nextState = shellReducer(state, { type: 'SET_ACTIVE_NAV', payload: 'prydrive' });
    expect(nextState.activeNav).toBe('prydrive');
    expect(nextState.openMenu).toBeNull();
  });

  it('should handle TOGGLE_SIDEBAR and SET_SIDEBAR_EXPANDED', () => {
    const state1 = shellReducer(initialShellState, { type: 'TOGGLE_SIDEBAR' });
    expect(state1.isSidebarExpanded).toBe(false);

    const state2 = shellReducer(state1, { type: 'TOGGLE_SIDEBAR' });
    expect(state2.isSidebarExpanded).toBe(true);

    const state3 = shellReducer(state2, { type: 'SET_SIDEBAR_EXPANDED', payload: false });
    expect(state3.isSidebarExpanded).toBe(false);
  });

  it('should handle OPEN_MENU and CLOSE_MENUS', () => {
    const state1 = shellReducer(initialShellState, { type: 'OPEN_MENU', payload: 'options' });
    expect(state1.openMenu).toBe('options');

    const state2 = shellReducer(state1, { type: 'CLOSE_MENUS' });
    expect(state2.openMenu).toBeNull();
  });

  it('should handle modal opening and closing', () => {
    const withAbout = shellReducer(initialShellState, { type: 'OPEN_ABOUT_MODAL' });
    expect(withAbout.isAboutModalOpen).toBe(true);

    const closedAbout = shellReducer(withAbout, { type: 'CLOSE_ABOUT_MODAL' });
    expect(closedAbout.isAboutModalOpen).toBe(false);

    const withDisconnect = shellReducer(initialShellState, { type: 'OPEN_DISCONNECT_MODAL' });
    expect(withDisconnect.isDisconnectModalOpen).toBe(true);

    const closedDisconnect = shellReducer(withDisconnect, { type: 'CLOSE_DISCONNECT_MODAL' });
    expect(closedDisconnect.isDisconnectModalOpen).toBe(false);
  });

  it('should determine auto-collapse based on window width constraint (NFR-2 / EC-2)', () => {
    // Min width: 64 (rail) + 260 (sidebar) + 480 (canvas) = 804px
    expect(shouldAutoCollapseSidebar(1200)).toBe(false);
    expect(shouldAutoCollapseSidebar(960)).toBe(false);
    expect(shouldAutoCollapseSidebar(804)).toBe(false);
    expect(shouldAutoCollapseSidebar(800)).toBe(true);
    expect(shouldAutoCollapseSidebar(600)).toBe(true);
  });

  it('should truncate long emails gracefully with ellipsis (EC-1)', () => {
    expect(truncateEmail('user@test.com', 20)).toBe('user@test.com');
    const longEmail = 'extremelylongusernamefortesting@companydomain.com';
    const truncated = truncateEmail(longEmail, 24);
    expect(truncated.length).toBeLessThanOrEqual(24);
    expect(truncated).toContain('...');
    expect(truncated).toContain('@companydomain.com');
  });
});
