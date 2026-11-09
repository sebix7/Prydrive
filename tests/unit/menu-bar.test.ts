import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import packageInfo from '../../package.json';
import {
  shellReducer,
  initialShellState,
  ABOUT_METADATA,
  APP_VERSION,
  RAW_VERSION,
  getStaticDriveUnitBadge,
  shouldShowTopBarDisconnect,
  type ShellState
} from '../../src/shared/shell-state';

describe('Swiss Archive Menu Bar & Desktop Shell (Spec 006 US-3 / T3)', () => {
  it('should dynamically synchronize About modal version with package.json', () => {
    expect(ABOUT_METADATA.version).toBe(`v${packageInfo.version}`);
    expect(ABOUT_METADATA.appName).toBe('Prydrive');
    expect(APP_VERSION).toBe(`v${packageInfo.version}`);
    expect(RAW_VERSION).toBe(packageInfo.version);

    const withAbout = shellReducer(initialShellState, { type: 'OPEN_ABOUT_MODAL' });
    expect(withAbout.isAboutModalOpen).toBe(true);

    const closedAbout = shellReducer(withAbout, { type: 'CLOSE_ABOUT_MODAL' });
    expect(closedAbout.isAboutModalOpen).toBe(false);
  });

  it('should open and close disconnect modal directly from shell state', () => {
    const withDisconnect = shellReducer(initialShellState, { type: 'OPEN_DISCONNECT_MODAL' });
    expect(withDisconnect.isDisconnectModalOpen).toBe(true);

    const closedDisconnect = shellReducer(withDisconnect, { type: 'CLOSE_DISCONNECT_MODAL' });
    expect(closedDisconnect.isDisconnectModalOpen).toBe(false);
  });

  describe('MenuBar.tsx Swiss Archive Implementation (FR-7, FR-9, FR-10, FR-16)', () => {
    it('should eliminate legacy Options and Help dropdowns and render static drive badge and unified controls', () => {
      const menuBarSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/MenuBar.tsx'),
        'utf-8'
      );
      expect(menuBarSource).toContain('getStaticDriveUnitBadge');
      expect(menuBarSource).toContain('shouldShowTopBarDisconnect');
      expect(menuBarSource).toContain('ThemeToggle');
      expect(menuBarSource).toContain('LanguageToggle');
      expect(menuBarSource).toContain('topbar-disconnect-btn');
      expect(menuBarSource).not.toContain('menu-trigger-options');
      expect(menuBarSource).not.toContain('menu-trigger-help');
      expect(menuBarSource).not.toContain('resolveOptionsSubmenu');
    });
  });

  describe('NavigationRail.tsx Swiss Archive Implementation (FR-11, EC-5)', () => {
    it('should render a 3px left Klein Blue indicator bar and dynamic Prydrive logo cutout', () => {
      const railSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/NavigationRail.tsx'),
        'utf-8'
      );
      expect(railSource).toContain('w-[3px]');
      expect(railSource).toContain('getPrydriveLogoCutoutColor');
      expect(railSource).toContain('rounded-[6px]');
    });
  });

  describe('WorkspaceCanvas.tsx Swiss Archive Implementation (FR-5, US-3)', () => {
    it('should render unified Google Drive FileExplorer when activeNav is prydrive or google-drive', () => {
      const canvasSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/WorkspaceCanvas.tsx'),
        'utf-8'
      );
      expect(canvasSource).toContain('resolveWorkspaceView');
      expect(canvasSource).toContain('FileExplorer');
    });
  });

  describe('TelemetrySidebar.tsx Swiss Archive Implementation (FR-15, FR-16)', () => {
    it('should include bottom-pinned danger Disconnect button and 1px bordered cards', () => {
      const sidebarSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/shell/TelemetrySidebar.tsx'),
        'utf-8'
      );
      expect(sidebarSource).toContain('sidebar-disconnect-btn');
      expect(sidebarSource).toContain('onDisconnect');
      expect(sidebarSource).toContain('rounded-[6px]');
    });
  });
});
