import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTranslation } from '../../src/shared/i18n/translations';
import {
  UPCOMING_PROVIDERS,
  WELCOME_COMPACT_HEIGHT_THRESHOLD,
  isWelcomeCompactHeight
} from '../../src/shared/shell-state';
import {
  getGoogleDriveConnectButtonClasses,
  getUpcomingProviderButtonClasses
} from '../../src/shared/theme';

describe('Cloud Providers Showcase (Spec 008 US-2 / T2 / FR-3, FR-4, FR-5, FR-10)', () => {
  describe('Adaptive Viewport Height Evaluator (FR-3, FR-4, FR-5)', () => {
    it('should define the compact viewport height threshold at 620px', () => {
      expect(WELCOME_COMPACT_HEIGHT_THRESHOLD).toBe(620);
    });

    it('should classify heights below 620px as compact mode', () => {
      expect(isWelcomeCompactHeight(500)).toBe(true);
      expect(isWelcomeCompactHeight(619)).toBe(true);
    });

    it('should classify heights >= 620px as standard fullscreen mode', () => {
      expect(isWelcomeCompactHeight(620)).toBe(false);
      expect(isWelcomeCompactHeight(760)).toBe(false);
      expect(isWelcomeCompactHeight(1080)).toBe(false);
    });

    it('should safely return false for undefined or invalid inputs', () => {
      expect(isWelcomeCompactHeight(undefined)).toBe(false);
      expect(isWelcomeCompactHeight(NaN)).toBe(false);
    });
  });

  describe('Theme Button Classes Layout Variants (FR-3, FR-4)', () => {
    it('should resolve full-width classes with gap-3 and opacity-40 for standard fullscreen layout', () => {
      const gdriveFull = getGoogleDriveConnectButtonClasses('light', false, 'full');
      expect(gdriveFull).toContain('w-full');
      expect(gdriveFull).toContain('gap-3');

      const upcomingFull = getUpcomingProviderButtonClasses('dark', 'full');
      expect(upcomingFull).toContain('w-full');
      expect(upcomingFull).toContain('gap-3');
      expect(upcomingFull).toContain('opacity-40');
    });

    it('should resolve intrinsic classes with gap-5 and opacity-40 for compact 2x2 grid layout', () => {
      const gdriveCompact = getGoogleDriveConnectButtonClasses('light', false, 'compact');
      expect(gdriveCompact).not.toContain('w-full');
      expect(gdriveCompact).toContain('gap-5');

      const upcomingCompact = getUpcomingProviderButtonClasses('dark', 'compact');
      expect(upcomingCompact).not.toContain('w-full');
      expect(upcomingCompact).toContain('gap-5');
      expect(upcomingCompact).toContain('opacity-40');
    });
  });

  describe('Upcoming Providers Registry (FR-3, FR-4)', () => {
    it('should define UPCOMING_PROVIDERS registry in exact order: onedrive -> mega -> mediafire', () => {
      expect(UPCOMING_PROVIDERS).toHaveLength(3);
      expect(UPCOMING_PROVIDERS[0].id).toBe('onedrive');
      expect(UPCOMING_PROVIDERS[0].name).toBe('OneDrive');
      expect(UPCOMING_PROVIDERS[1].id).toBe('mega');
      expect(UPCOMING_PROVIDERS[1].name).toBe('MEGA');
      expect(UPCOMING_PROVIDERS[2].id).toBe('mediafire');
      expect(UPCOMING_PROVIDERS[2].name).toBe('MediaFire');
    });

    it('should assign valid translation keys to each upcoming provider', () => {
      expect(UPCOMING_PROVIDERS[0].labelKey).toBe('connect_onedrive');
      expect(UPCOMING_PROVIDERS[1].labelKey).toBe('connect_mega');
      expect(UPCOMING_PROVIDERS[2].labelKey).toBe('connect_mediafire');
      UPCOMING_PROVIDERS.forEach((provider) => {
        expect(provider.badgeKey).toBe('provider_coming_soon');
      });
    });
  });

  describe('Bilingual Localization for Upcoming Providers & Roadmap Badges (FR-4, FR-5)', () => {
    it('should provide localized labels in English and Spanish', () => {
      expect(getTranslation('en', 'connect_onedrive')).toBe('Connect to OneDrive');
      expect(getTranslation('es', 'connect_onedrive')).toBe('Conectarse a OneDrive');

      expect(getTranslation('en', 'connect_mega')).toBe('Connect to MEGA');
      expect(getTranslation('es', 'connect_mega')).toBe('Conectarse a MEGA');

      expect(getTranslation('en', 'connect_mediafire')).toBe('Connect to MediaFire');
      expect(getTranslation('es', 'connect_mediafire')).toBe('Conectarse a MediaFire');

      expect(getTranslation('en', 'provider_coming_soon')).toBe('Coming soon');
      expect(getTranslation('es', 'provider_coming_soon')).toBe('Próximamente');
    });
  });

  describe('WelcomeScreen Layout & Single Vertical Showcase Block (FR-3, FR-4, FR-5, FR-10)', () => {
    const welcomeSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/auth/WelcomeScreen.tsx'),
      'utf-8'
    );

    it('should import and render OneDriveLogo, MegaLogo, and MediaFireLogo', () => {
      expect(welcomeSource).toContain('OneDriveLogo');
      expect(welcomeSource).toContain('MegaLogo');
      expect(welcomeSource).toContain('MediaFireLogo');
    });

    it('should import and iterate over UPCOMING_PROVIDERS', () => {
      expect(welcomeSource).toContain('UPCOMING_PROVIDERS');
    });

    it('should render standardized 24x24 white brand icon badges for all providers', () => {
      expect(welcomeSource).toContain('w-6 h-6 rounded-[3px] bg-white border border-black/10');
    });

    it('should support adaptive dual-mode rendering for both standard vertical list and compact 2x2 grid (FR-3, FR-4, FR-5)', () => {
      expect(welcomeSource).toContain('isWelcomeCompactHeight');
      expect(welcomeSource).toContain('provider-showcase-grid');
      expect(welcomeSource).toContain('provider-showcase-list');
      expect(welcomeSource).toContain('grid grid-cols-2');
      expect(welcomeSource).toContain('provider.badgeKey');
      expect(welcomeSource).toContain('ArrowRight');
    });

    it('should anchor browser notice below the complete provider stack (FR-10)', () => {
      const providerIndex = welcomeSource.indexOf('UPCOMING_PROVIDERS');
      const noticeIndex = welcomeSource.indexOf('browser_notice');
      expect(providerIndex).toBeGreaterThan(-1);
      expect(noticeIndex).toBeGreaterThan(-1);
      expect(noticeIndex).toBeGreaterThan(providerIndex);
    });
  });
});
