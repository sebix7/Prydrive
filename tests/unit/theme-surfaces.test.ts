import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getThemeSurfaceClasses,
  getTechnicalIndexStrip,
  SWISS_ARCHIVE_FONTS
} from '../../src/shared/theme';
import {
  getNavButtonStyles,
  getSidebarClasses,
  getPrydriveLogoCutoutColor
} from '../../src/shared/shell-state';
import { getRowSelectionClasses } from '../../src/shared/explorer-helpers';

describe('Theme Surfaces, Interactive Contrast & Brand Iconography (Spec 005 US-4 / Spec 006 US-1 T1)', () => {
  describe('getThemeSurfaceClasses — Swiss Archive Palettes (Spec 006 FR-1, FR-2, NFR-1)', () => {
    it('should return Swiss Archive dark surface and high-contrast light ink classes for dark mode (FR-2)', () => {
      const darkPalette = getThemeSurfaceClasses('dark');
      expect(darkPalette.canvasBg).toContain('bg-[#101216]');
      expect(darkPalette.secondaryBg).toContain('bg-[#15181E]');
      expect(darkPalette.cardBg).toContain('bg-[#181C23]');
      expect(darkPalette.modalBg).toContain('bg-[#181C23]');
      expect(darkPalette.hoverBg).toContain('hover:bg-[#1E232C]');
      expect(darkPalette.selectedBg).toContain('bg-[#1C2D52]');
      expect(darkPalette.border).toContain('border-[#2C323D]');
      expect(darkPalette.borderSubtle).toContain('border-[#222730]');
      expect(darkPalette.textPrimary).toContain('text-[#F3F4F6]');
      expect(darkPalette.textSecondary).toContain('text-[#9CA3AF]');
      expect(darkPalette.textMuted).toContain('text-[#6B7280]');
      expect(darkPalette.accentBg).toContain('bg-[#3B66FF]');
      expect(darkPalette.accentText).toContain('text-[#3B66FF]');
    });

    it('should return Swiss Archive light stone-paper surface and dark ink classes for light mode (FR-1)', () => {
      const lightPalette = getThemeSurfaceClasses('light');
      expect(lightPalette.canvasBg).toContain('bg-[#FAF9F6]');
      expect(lightPalette.secondaryBg).toContain('bg-[#F2F0EA]');
      expect(lightPalette.cardBg).toContain('bg-[#FFFFFF]');
      expect(lightPalette.modalBg).toContain('bg-[#FFFFFF]');
      expect(lightPalette.hoverBg).toContain('hover:bg-[#ECEAE3]');
      expect(lightPalette.selectedBg).toContain('bg-[#DDE7FA]');
      expect(lightPalette.border).toContain('border-[#C9C6BD]');
      expect(lightPalette.borderSubtle).toContain('border-[#DFDDD6]');
      expect(lightPalette.textPrimary).toContain('text-[#111315]');
      expect(lightPalette.textSecondary).toContain('text-[#4A4E54]');
      expect(lightPalette.textMuted).toContain('text-[#7C8087]');
      expect(lightPalette.accentBg).toContain('bg-[#1B44E8]');
      expect(lightPalette.accentText).toContain('text-[#1B44E8]');
    });
  });

  describe('getTechnicalIndexStrip — Swiss Archive Header Strips (Spec 006 FR-6, FR-17)', () => {
    it('should return deterministic uppercase labels for welcome, offline, workspace, and modals', () => {
      expect(getTechnicalIndexStrip('welcome', 'v0.4.0')).toEqual({
        leftLabel: 'PRYDRIVE // AUTHENTICATION',
        rightLabel: 'OAUTH 2.0 · v0.4.0'
      });
      expect(getTechnicalIndexStrip('offline')).toEqual({
        leftLabel: 'PRYDRIVE // OFFLINE',
        rightLabel: 'NETWORK_STATUS'
      });
      expect(getTechnicalIndexStrip('workspace', 'v0.4.0')).toEqual({
        leftLabel: 'PRYDRIVE // WORKSPACE',
        rightLabel: 'v0.4.0'
      });
      expect(getTechnicalIndexStrip('awaiting_auth')).toEqual({
        leftLabel: 'OAUTH 2.0 LOOPBACK',
        rightLabel: '127.0.0.1'
      });
      expect(getTechnicalIndexStrip('about')).toEqual({
        leftLabel: 'SYSTEM // ABOUT',
        rightLabel: '[ESC]'
      });
      expect(getTechnicalIndexStrip('disconnect')).toEqual({
        leftLabel: 'SECURITY // REVOKE SESSION',
        rightLabel: 'SAFE_STORAGE'
      });
    });
  });

  describe('Three-Tier Typographic Hierarchy in tailwind.config.js & theme.ts (Spec 006 FR-3, NFR-2)', () => {
    it('should configure display (Space Grotesk), sans (Inter), and mono (IBM Plex Mono) font stacks with system fallbacks', () => {
      expect(SWISS_ARCHIVE_FONTS.display[0]).toBe('Space Grotesk');
      expect(SWISS_ARCHIVE_FONTS.sans[0]).toBe('Inter');
      expect(SWISS_ARCHIVE_FONTS.mono[0]).toBe('IBM Plex Mono');

      const configSource = readFileSync(
        resolve(__dirname, '../../tailwind.config.js'),
        'utf-8'
      );
      expect(configSource).toContain("display: ['Space Grotesk'");
      expect(configSource).toContain("sans: ['Inter'");
      expect(configSource).toContain("mono: ['IBM Plex Mono'");
    });
  });

  describe('getRowSelectionClasses (FR-11, EC-3)', () => {
    it('should return high-contrast selected and hover classes for dark mode', () => {
      const selectedDark = getRowSelectionClasses(true, 'dark');
      expect(selectedDark).toContain('bg-blue-600/20');
      expect(selectedDark).toContain('text-white');

      const unselectedDark = getRowSelectionClasses(false, 'dark');
      expect(unselectedDark).toContain('text-slate-200');
      expect(unselectedDark).toContain('hover:bg-slate-800/50');
    });

    it('should return high-contrast selected and hover classes for light mode', () => {
      const selectedLight = getRowSelectionClasses(true, 'light');
      expect(selectedLight).toContain('bg-blue-50');
      expect(selectedLight).toContain('text-blue-950');

      const unselectedLight = getRowSelectionClasses(false, 'light');
      expect(unselectedLight).toContain('text-slate-800');
      expect(unselectedLight).toContain('hover:bg-slate-100');
    });
  });

  describe('getNavButtonStyles & getSidebarClasses across themes (FR-11)', () => {
    it('should adapt inactive navigation button styles for light and dark themes while keeping active blue button', () => {
      expect(getNavButtonStyles(true, 'dark').container).toContain('bg-blue-600');
      expect(getNavButtonStyles(true, 'light').container).toContain('bg-blue-600');

      expect(getNavButtonStyles(false, 'dark').container).toContain('text-slate-400');
      expect(getNavButtonStyles(false, 'light').container).toContain('text-slate-600');
      expect(getNavButtonStyles(false, 'light').container).toContain('hover:bg-slate-200');
    });

    it('should adapt expanded sidebar border color for light and dark themes', () => {
      expect(getSidebarClasses(true, 'dark').container).toContain('border-slate-800');
      expect(getSidebarClasses(true, 'light').container).toContain('border-slate-200');
      expect(getSidebarClasses(false, 'light').container).toContain('w-0');
    });
  });

  describe('getPrydriveLogoCutoutColor (EC-6)', () => {
    it('should adapt the Prydrive inner cutout color across active/inactive states in light and dark modes', () => {
      const activeDark = getPrydriveLogoCutoutColor(true, 'dark');
      const activeLight = getPrydriveLogoCutoutColor(true, 'light');
      const inactiveDark = getPrydriveLogoCutoutColor(false, 'dark');
      const inactiveLight = getPrydriveLogoCutoutColor(false, 'light');

      expect(activeDark).toBe('#2563EB');
      expect(activeLight).toBe('#2563EB');
      expect(inactiveDark).toBe('#161B22');
      expect(inactiveLight).toBe('#F1F5F9');
      expect(inactiveDark).not.toBe(inactiveLight);
    });
  });
});
