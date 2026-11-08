import { describe, it, expect } from 'vitest';
import { getThemeSurfaceClasses } from '../../src/shared/theme';
import {
  getNavButtonStyles,
  getSidebarClasses,
  getPrydriveLogoCutoutColor
} from '../../src/shared/shell-state';
import { getRowSelectionClasses } from '../../src/shared/explorer-helpers';

describe('Theme Surfaces, Interactive Contrast & Brand Iconography (Spec 005 US-4 / T4)', () => {
  describe('getThemeSurfaceClasses (FR-9, FR-10, NFR-2)', () => {
    it('should return dark surface and high-contrast light typography classes for dark mode (FR-9)', () => {
      const darkPalette = getThemeSurfaceClasses('dark');
      expect(darkPalette.canvasBg).toContain('bg-[#0D1117]');
      expect(darkPalette.secondaryBg).toContain('bg-[#161B22]');
      expect(darkPalette.cardBg).toContain('bg-[#161B22]');
      expect(darkPalette.modalBg).toContain('bg-[#161B22]');
      expect(darkPalette.border).toContain('border-slate-800');
      expect(darkPalette.textPrimary).toContain('text-slate-100');
    });

    it('should return light surface and high-contrast dark typography classes for light mode (FR-10)', () => {
      const lightPalette = getThemeSurfaceClasses('light');
      expect(lightPalette.canvasBg).toContain('bg-white');
      expect(lightPalette.secondaryBg).toContain('bg-slate-100');
      expect(lightPalette.cardBg).toContain('bg-white');
      expect(lightPalette.modalBg).toContain('bg-white');
      expect(lightPalette.border).toContain('border-slate-200');
      expect(lightPalette.textPrimary).toContain('text-slate-900');
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
