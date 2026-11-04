import { describe, it, expect } from 'vitest';
import { translations, getTranslation } from '../../src/shared/i18n/translations';
import type { TranslationKey } from '../../src/shared/i18n/translations';

describe('Bilingual Localization Dictionary (US-6 / T6 / FR-15)', () => {
  const enKeys = Object.keys(translations.en) as TranslationKey[];
  const esKeys = Object.keys(translations.es) as TranslationKey[];

  it('should maintain 100% key parity between English and Spanish', () => {
    expect(enKeys.sort()).toEqual(esKeys.sort());
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it('should not contain any empty or whitespace-only translation strings', () => {
    enKeys.forEach((key) => {
      expect(translations.en[key].trim().length).toBeGreaterThan(0);
      expect(translations.es[key].trim().length).toBeGreaterThan(0);
    });
  });

  it('should correctly return translations via getTranslation helper', () => {
    expect(getTranslation('en', 'welcome_title')).toBe('Welcome to Prydrive');
    expect(getTranslation('es', 'welcome_title')).toBe('Bienvenido a Prydrive');

    expect(getTranslation('en', 'sign_in_google')).toBe('Sign in with Google');
    expect(getTranslation('es', 'sign_in_google')).toBe('Iniciar sesión con Google');
  });

  it('should interpolate parameterized values correctly when placeholders are used', () => {
    expect(
      getTranslation('en', 'quota_usage_format', { used: '2 GB', total: '15 GB' })
    ).toBe('2 GB / 15 GB');
    expect(
      getTranslation('es', 'quota_usage_format', { used: '2 GB', total: '15 GB' })
    ).toBe('2 GB / 15 GB');
  });

  it('should fall back to English if an unsupported language code is provided', () => {
    // @ts-expect-error testing invalid language code fallback
    expect(getTranslation('fr', 'welcome_title')).toBe('Welcome to Prydrive');
  });

  describe('Shell Localization Parity (US-5 / T5 / FR-6 / FR-8)', () => {
    const requiredShellKeys: TranslationKey[] = [
      // Menu bar
      'menu_options',
      'menu_language',
      'menu_disconnect',
      'menu_help',
      'menu_about',
      'menu_file',
      'menu_close_window',
      'menu_view',
      'menu_toggle_sidebar',
      // Navigation rail
      'nav_prydrive_tooltip',
      'nav_google_drive_tooltip',
      // Central workspace canvas
      'canvas_prydrive_title',
      'canvas_drive_title',
      'canvas_placeholder_desc',
      'canvas_ready_status',
      // Telemetry sidebar
      'sidebar_connected',
      'sidebar_account',
      'sidebar_storage',
      'sidebar_collapse_tooltip',
      'sidebar_expand_tooltip',
      // About modal
      'about_title',
      'about_description',
      'about_repository',
      'about_close',
      'about_got_it'
    ];

    it('should have all shell translation keys defined in both English and Spanish', () => {
      requiredShellKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].length).toBeGreaterThan(0);
        expect(translations.es[key].length).toBeGreaterThan(0);
      });
    });

    it('should translate menu bar items accurately in both languages', () => {
      expect(getTranslation('en', 'menu_options')).toBe('Options');
      expect(getTranslation('es', 'menu_options')).toBe('Opciones');
      expect(getTranslation('en', 'menu_language')).toBe('Language');
      expect(getTranslation('es', 'menu_language')).toBe('Idioma');
      expect(getTranslation('en', 'menu_help')).toBe('Help');
      expect(getTranslation('es', 'menu_help')).toBe('Ayuda');
      expect(getTranslation('en', 'menu_about')).toBe('About Prydrive');
      expect(getTranslation('es', 'menu_about')).toBe('Acerca de Prydrive');
    });

    it('should translate telemetry sidebar labels accurately in both languages', () => {
      expect(getTranslation('en', 'sidebar_connected')).toBe('Connected');
      expect(getTranslation('es', 'sidebar_connected')).toBe('Conectado');
      expect(getTranslation('en', 'sidebar_account')).toBe('Account');
      expect(getTranslation('es', 'sidebar_account')).toBe('Cuenta');
      expect(getTranslation('en', 'sidebar_storage')).toBe('Storage');
      expect(getTranslation('es', 'sidebar_storage')).toBe('Almacenamiento');
      expect(getTranslation('en', 'sidebar_collapse_tooltip')).toBe('Collapse sidebar');
      expect(getTranslation('es', 'sidebar_collapse_tooltip')).toBe('Ocultar panel');
      expect(getTranslation('en', 'sidebar_expand_tooltip')).toBe('Expand sidebar');
      expect(getTranslation('es', 'sidebar_expand_tooltip')).toBe('Mostrar panel');
    });

    it('should translate canvas placeholder and about dialog accurately in both languages', () => {
      expect(getTranslation('en', 'canvas_drive_title')).toBe('Google Drive Connected');
      expect(getTranslation('es', 'canvas_drive_title')).toBe('Google Drive Conectado');
      expect(getTranslation('en', 'canvas_ready_status')).toBe('Ready to explore');
      expect(getTranslation('es', 'canvas_ready_status')).toBe('Listo para explorar');
      expect(getTranslation('en', 'about_got_it')).toBe('Got it');
      expect(getTranslation('es', 'about_got_it')).toBe('Entendido');
    });
  });
});
