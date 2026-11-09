import { describe, it, expect } from 'vitest';
import {
  initialShellState,
  shellReducer,
  shouldAutoCollapseSidebar,
  truncateEmail,
  getStaticDriveUnitBadge,
  shouldShowTopBarDisconnect,
  getPrydriveLogoCutoutColor,
  getQuotaProgressColorClass,
  getNavButtonStyles,
  getSidebarClasses,
  type ShellState
} from '../../src/shared/shell-state';

describe('Shell State & Utilities (US-1 / T1 & US-3 / T3)', () => {
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

  describe('Static Drive Unit Badge Resolver (FR-9, FR-10, EC-3)', () => {
    it('should return UNIDAD: //MY_DRIVE for es and DRIVE: //MY_DRIVE for en', () => {
      expect(getStaticDriveUnitBadge('es')).toBe('UNIDAD: //MY_DRIVE');
      expect(getStaticDriveUnitBadge('en')).toBe('DRIVE: //MY_DRIVE');
      expect(getStaticDriveUnitBadge()).toBe('DRIVE: //MY_DRIVE');
    });
  });

  describe('Conditional Top-Bar Disconnect Visibility (FR-16, EC-6)', () => {
    it('should show top-bar icon disconnect ONLY when sidebar is collapsed', () => {
      expect(shouldShowTopBarDisconnect(true)).toBe(false);
      expect(shouldShowTopBarDisconnect(false)).toBe(true);
    });
  });

  describe('Swiss Archive Prydrive Logo Cutout Color (FR-11, EC-5)', () => {
    it('should return exact Swiss Archive cutout surfaces matching active and inactive button surfaces', () => {
      expect(getPrydriveLogoCutoutColor(true, 'light')).toBe('#FFFFFF');
      expect(getPrydriveLogoCutoutColor(true, 'dark')).toBe('#181C23');
      expect(getPrydriveLogoCutoutColor(false, 'light')).toBe('#F2F0EA');
      expect(getPrydriveLogoCutoutColor(false, 'dark')).toBe('#15181E');
    });
  });

  describe('Swiss Archive Quota Progress Color Thresholds (FR-15)', () => {
    it('should return Klein Blue for normal usage (< 75%)', () => {
      expect(getQuotaProgressColorClass(50, false, 'light')).toContain('bg-[#1B44E8]');
      expect(getQuotaProgressColorClass(74, false, 'dark')).toContain('bg-[#3B66FF]');
    });

    it('should return warning/signal orange for usage >= 75% and < 90%', () => {
      expect(getQuotaProgressColorClass(75, false, 'light')).toContain('bg-[#D95D1E]');
      expect(getQuotaProgressColorClass(89, false, 'dark')).toContain('bg-[#F97316]');
    });

    it('should return danger red for critical usage >= 90%', () => {
      expect(getQuotaProgressColorClass(90, false, 'light')).toContain('bg-[#DC2626]');
      expect(getQuotaProgressColorClass(99, false, 'dark')).toContain('bg-[#EF4444]');
    });

    it('should return translucent Klein Blue for unmetered storage', () => {
      expect(getQuotaProgressColorClass(0, true, 'light')).toContain('bg-[#1B44E8]/60');
      expect(getQuotaProgressColorClass(0, true, 'dark')).toContain('bg-[#3B66FF]/60');
    });
  });

  describe('Swiss Archive Navigation Rail & Sidebar Styles (FR-11, FR-15)', () => {
    it('should return Swiss Archive active/inactive classes for rail buttons', () => {
      const activeDark = getNavButtonStyles(true, 'dark');
      expect(activeDark.container).toContain('bg-[#181C23]');
      expect(activeDark.container).toContain('border-[#2C323D]');
      expect(activeDark.container).toContain('text-[#3B66FF]');

      const activeLight = getNavButtonStyles(true, 'light');
      expect(activeLight.container).toContain('bg-[#FFFFFF]');
      expect(activeLight.container).toContain('border-[#C9C6BD]');
      expect(activeLight.container).toContain('text-[#1B44E8]');
    });

    it('should return Swiss Archive border classes for expanded sidebar', () => {
      expect(getSidebarClasses(true, 'dark').container).toContain('border-[#2C323D]');
      expect(getSidebarClasses(true, 'light').container).toContain('border-[#C9C6BD]');
    });
  });
});
