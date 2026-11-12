import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getHeaderPanelToggleButtonClasses } from '../../src/shared/theme';

describe('Panel Visibility Toggle Controls (Spec 009 US-1 / T1 / FR-1, FR-2, FR-3, FR-5, FR-6)', () => {
  describe('getHeaderPanelToggleButtonClasses — Swiss Archive Pressed vs Neutral Tokens (FR-2, FR-6, NFR-1)', () => {
    it('should resolve pressed classes with Swiss Archive active selection contrast in Light Mode (FR-6)', () => {
      const pressedLight = getHeaderPanelToggleButtonClasses(true, 'light');
      expect(pressedLight).toContain('w-[30px]');
      expect(pressedLight).toContain('h-[30px]');
      expect(pressedLight).toContain('rounded-[4px]');
      expect(pressedLight).toContain('bg-[#DDE7FA]');
      expect(pressedLight).toContain('border-[#1B44E8]');
      expect(pressedLight).toContain('text-[#1B44E8]');
    });

    it('should resolve neutral classes with subtle borders and hover transitions in Light Mode (FR-6)', () => {
      const neutralLight = getHeaderPanelToggleButtonClasses(false, 'light');
      expect(neutralLight).toContain('bg-[#FFFFFF]');
      expect(neutralLight).toContain('border-[#C9C6BD]');
      expect(neutralLight).toContain('text-[#111315]');
      expect(neutralLight).toContain('hover:bg-[#ECEAE3]');
      expect(neutralLight).toContain('hover:border-[#1B44E8]');
      expect(neutralLight).toContain('hover:text-[#1B44E8]');
    });

    it('should resolve pressed classes with Luminous Klein Blue contrast in Dark Mode (FR-6)', () => {
      const pressedDark = getHeaderPanelToggleButtonClasses(true, 'dark');
      expect(pressedDark).toContain('bg-[#1C2D52]');
      expect(pressedDark).toContain('border-[#3B66FF]');
      expect(pressedDark).toContain('text-[#3B66FF]');
    });

    it('should resolve neutral classes with subtle dark borders and hover transitions in Dark Mode (FR-6)', () => {
      const neutralDark = getHeaderPanelToggleButtonClasses(false, 'dark');
      expect(neutralDark).toContain('bg-[#181C23]');
      expect(neutralDark).toContain('border-[#2C323D]');
      expect(neutralDark).toContain('text-[#F3F4F6]');
      expect(neutralDark).toContain('hover:bg-[#1E232C]');
      expect(neutralDark).toContain('hover:border-[#3B66FF]');
      expect(neutralDark).toContain('hover:text-[#3B66FF]');
    });
  });

  describe('MenuBar.tsx Header Panel Toggle Cluster Integration (FR-1, FR-2, FR-3, FR-5)', () => {
    const menuBarSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/MenuBar.tsx'),
      'utf-8'
    );

    it('should import FolderTree and PanelRight icons and getHeaderPanelToggleButtonClasses', () => {
      expect(menuBarSource).toContain('FolderTree');
      expect(menuBarSource).toContain('PanelRight');
      expect(menuBarSource).toContain('getHeaderPanelToggleButtonClasses');
    });

    it('should render header-toggle-tree-btn and header-toggle-sidebar-btn with aria-pressed', () => {
      expect(menuBarSource).toContain('header-toggle-tree-btn');
      expect(menuBarSource).toContain('header-toggle-sidebar-btn');
      expect(menuBarSource).toContain('aria-pressed={isTreeExpanded}');
      expect(menuBarSource).toContain('aria-pressed={isSidebarExpanded}');
    });

    it('should wire onToggleTree and onToggleSidebar click triggers', () => {
      expect(menuBarSource).toContain('onClick={onToggleTree}');
      expect(menuBarSource).toContain('onClick={onToggleSidebar}');
    });
  });
});
