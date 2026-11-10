import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getTechnicalIndexStrip,
  getGoogleSignInButtonClasses,
  SWISS_CONTROL_LAYOUT
} from '../../src/shared/theme';

describe('Swiss Archive Pre-Authentication & Offline Views (Spec 006 US-2 / T2)', () => {
  describe('Technical Index Strips for Pre-Auth & Offline (FR-6, EC-1)', () => {
    it('should return deterministic uppercase labels for the welcome screen strip with version', () => {
      const strip = getTechnicalIndexStrip('welcome', 'v0.4.0');
      expect(strip.leftLabel).toBe('PRYDRIVE // AUTHENTICATION');
      expect(strip.rightLabel).toBe('v0.4.0');
    });

    it('should return deterministic uppercase labels for the offline card strip', () => {
      const strip = getTechnicalIndexStrip('offline');
      expect(strip.leftLabel).toBe('PRYDRIVE // OFFLINE');
      expect(strip.rightLabel).toBe('NETWORK_STATUS');
    });
  });

  describe('Unified Top-Right Control Cluster Geometry (FR-7)', () => {
    it('should define standardized absolute coordinates top-[5px] right-[12px] and gap-2', () => {
      expect(SWISS_CONTROL_LAYOUT.topRightClusterClass).toBe(
        'absolute top-[5px] right-[12px] flex items-center gap-2'
      );
      expect(SWISS_CONTROL_LAYOUT.buttonDimensionClass).toBe('w-[30px] h-[30px]');
      expect(SWISS_CONTROL_LAYOUT.languageContainerClass).toBe('h-[30px]');
      expect(SWISS_CONTROL_LAYOUT.controlRadiusClass).toBe('rounded-[4px]');
      expect(SWISS_CONTROL_LAYOUT.cardRadiusClass).toBe('rounded-[6px]');
    });
  });

  describe('Google Sign-In Button Hover State & Klein Blue Transitions (FR-8)', () => {
    it('should transition to Klein Blue (#1B44E8) on hover in Light Mode with 4px border radius', () => {
      const classes = getGoogleSignInButtonClasses('light', false);
      expect(classes).toContain('rounded-[4px]');
      expect(classes).toContain('hover:bg-[#1B44E8]');
      expect(classes).toContain('hover:border-[#1B44E8]');
      expect(classes).toContain('hover:text-white');
      expect(classes).toContain('bg-[#F2F0EA]');
    });

    it('should transition to Luminous Klein Blue (#3B66FF) on hover in Dark Mode with 4px border radius', () => {
      const classes = getGoogleSignInButtonClasses('dark', false);
      expect(classes).toContain('rounded-[4px]');
      expect(classes).toContain('hover:bg-[#3B66FF]');
      expect(classes).toContain('hover:border-[#3B66FF]');
      expect(classes).toContain('hover:text-white');
      expect(classes).toContain('bg-[#15181E]');
    });

    it('should disable hover transitions and apply opacity when disabled', () => {
      const darkDisabled = getGoogleSignInButtonClasses('dark', true);
      expect(darkDisabled).toContain('cursor-not-allowed');
      expect(darkDisabled).toContain('opacity-60');
      expect(darkDisabled).not.toContain('hover:bg-[#3B66FF]');

      const lightDisabled = getGoogleSignInButtonClasses('light', true);
      expect(lightDisabled).toContain('cursor-not-allowed');
      expect(lightDisabled).toContain('opacity-60');
      expect(lightDisabled).not.toContain('hover:bg-[#1B44E8]');
    });
  });

  describe('Component Structure & About Modal Integration (FR-5, FR-7, EC-7)', () => {
    it('should verify WelcomeScreen.tsx renders swiss-dot-matrix canvas, technical index strip, and onOpenAbout trigger', () => {
      const welcomeSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/auth/WelcomeScreen.tsx'),
        'utf-8'
      );
      expect(welcomeSource).toContain('swiss-dot-matrix');
      expect(welcomeSource).toContain("getTechnicalIndexStrip('welcome'");
      expect(welcomeSource).toContain('SWISS_CONTROL_LAYOUT.topRightClusterClass');
      expect(welcomeSource).toContain('onOpenAbout');
      expect(welcomeSource).toContain('rounded-[6px]');
      expect(welcomeSource).toContain('rounded-[4px]');
      expect(welcomeSource).toContain('PrydriveLogo');
      expect(welcomeSource).toContain('theme={theme}');
    });

    it('should verify App.tsx renders swiss-dot-matrix canvas, offline technical strip, and global AboutModal for pre-auth', () => {
      const appSource = readFileSync(
        resolve(__dirname, '../../src/renderer/src/App.tsx'),
        'utf-8'
      );
      expect(appSource).toContain('swiss-dot-matrix');
      expect(appSource).toContain("getTechnicalIndexStrip('offline')");
      expect(appSource).toContain('isAboutModalOpen');
      expect(appSource).toContain('AboutModal');
      expect(appSource).toContain('SWISS_CONTROL_LAYOUT.topRightClusterClass');
    });
  });
});
