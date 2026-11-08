import { describe, it, expect } from 'vitest';
import packageInfo from '../../package.json';
import {
  shellReducer,
  initialShellState,
  toggleMenuHeader,
  ABOUT_METADATA,
  APP_VERSION,
  RAW_VERSION,
  resolveOptionsSubmenu,
  type ShellState,
  type ActiveMenu
} from '../../src/shared/shell-state';

describe('Menu Bar & Dialog Transitions (US-3 / T3)', () => {
  it('should toggle menu header idempotently (open if closed, close if open)', () => {
    expect(toggleMenuHeader(null, 'options')).toBe('options');
    expect(toggleMenuHeader('options', 'options')).toBeNull();
    expect(toggleMenuHeader('options', 'help')).toBe('help');
    expect(toggleMenuHeader('help', 'help')).toBeNull();
  });

  it('should open and switch between drop-down menus in shell state (FR-6)', () => {
    let state = shellReducer(initialShellState, { type: 'OPEN_MENU', payload: 'options' });
    expect(state.openMenu).toBe('options');

    state = shellReducer(state, { type: 'OPEN_MENU', payload: 'help' });
    expect(state.openMenu).toBe('help');

    state = shellReducer(state, { type: 'CLOSE_MENUS' });
    expect(state.openMenu).toBeNull();
  });

  it('should close open menus and open disconnect modal upon disconnect trigger (FR-7 / EC-4)', () => {
    const stateWithMenu: ShellState = {
      ...initialShellState,
      openMenu: 'options',
      isDisconnectModalOpen: false
    };

    const nextState = shellReducer(stateWithMenu, { type: 'OPEN_DISCONNECT_MODAL' });
    expect(nextState.openMenu).toBeNull();
    expect(nextState.isDisconnectModalOpen).toBe(true);

    const closedState = shellReducer(nextState, { type: 'CLOSE_DISCONNECT_MODAL' });
    expect(closedState.isDisconnectModalOpen).toBe(false);
  });

  it('should dynamically synchronize About modal version with package.json (FR-6 / Help)', () => {
    expect(ABOUT_METADATA.version).toBe(`v${packageInfo.version}`);
    expect(ABOUT_METADATA.appName).toBe('Prydrive');
    expect(APP_VERSION).toBe(`v${packageInfo.version}`);
    expect(RAW_VERSION).toBe(packageInfo.version);

    const stateWithHelp: ShellState = {
      ...initialShellState,
      openMenu: 'help',
      isAboutModalOpen: false
    };

    const nextState = shellReducer(stateWithHelp, { type: 'OPEN_ABOUT_MODAL' });
    expect(nextState.openMenu).toBeNull();
    expect(nextState.isAboutModalOpen).toBe(true);

    const closedState = shellReducer(nextState, { type: 'CLOSE_ABOUT_MODAL' });
    expect(closedState.isAboutModalOpen).toBe(false);
  });

  it('should enforce mutual exclusion between Language and Theme submenus in Options (Spec 005 US-3 / FR-6)', () => {
    // Initially closed -> open 'language'
    expect(resolveOptionsSubmenu(null, 'language')).toBe('language');

    // Switching from 'language' to 'theme' automatically closes 'language' and opens 'theme'
    expect(resolveOptionsSubmenu('language', 'theme')).toBe('theme');

    // Switching from 'theme' to 'language' automatically closes 'theme' and opens 'language'
    expect(resolveOptionsSubmenu('theme', 'language')).toBe('language');

    // Clicking the already open submenu toggles it closed
    expect(resolveOptionsSubmenu('theme', 'theme')).toBeNull();
    expect(resolveOptionsSubmenu('language', 'language')).toBeNull();

    // Explicitly passing null closes any open submenu
    expect(resolveOptionsSubmenu('theme', null)).toBeNull();
  });
});
