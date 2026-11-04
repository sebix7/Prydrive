import { describe, it, expect } from 'vitest';
import {
  shellReducer,
  initialShellState,
  resolveWorkspaceView,
  getNavButtonStyles,
  NAV_ITEMS,
  type ShellState
} from '../../src/shared/shell-state';

describe('Navigation Rail & View Activation (US-2 / T2)', () => {
  it('should define navigation items for both Prydrive brand and Google Drive provider (FR-3)', () => {
    expect(NAV_ITEMS).toHaveLength(2);
    expect(NAV_ITEMS[0].id).toBe('prydrive');
    expect(NAV_ITEMS[0].label).toBe('Prydrive');
    expect(NAV_ITEMS[1].id).toBe('google-drive');
    expect(NAV_ITEMS[1].label).toBe('Google Drive');
  });

  it('should resolve workspace view to google-drive for both tabs (FR-5)', () => {
    expect(resolveWorkspaceView('prydrive')).toBe('google-drive');
    expect(resolveWorkspaceView('google-drive')).toBe('google-drive');
  });

  it('should return distinctive active fill vs subtle inactive styling (FR-4)', () => {
    const activeStyles = getNavButtonStyles(true);
    expect(activeStyles.container).toContain('bg-blue-600');
    expect(activeStyles.container).toContain('text-white');

    const inactiveStyles = getNavButtonStyles(false);
    expect(inactiveStyles.container).toContain('text-slate-400');
    expect(inactiveStyles.container).not.toContain('bg-blue-600');
  });

  it('should handle navigation selection idempotently without state corruption (EC-5)', () => {
    let state: ShellState = { ...initialShellState, activeNav: 'google-drive', openMenu: 'file' };

    // Selecting 'prydrive' updates activeNav and closes menus
    state = shellReducer(state, { type: 'SET_ACTIVE_NAV', payload: 'prydrive' });
    expect(state.activeNav).toBe('prydrive');
    expect(state.openMenu).toBeNull();

    // Re-selecting 'prydrive' is completely idempotent
    const stateSecondClick = shellReducer(state, { type: 'SET_ACTIVE_NAV', payload: 'prydrive' });
    expect(stateSecondClick.activeNav).toBe('prydrive');
    expect(stateSecondClick.openMenu).toBeNull();
    expect(stateSecondClick).toEqual(state);

    // Switching back to 'google-drive'
    state = shellReducer(state, { type: 'SET_ACTIVE_NAV', payload: 'google-drive' });
    expect(state.activeNav).toBe('google-drive');
    expect(state.openMenu).toBeNull();
  });
});
