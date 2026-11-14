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

  describe('About Modal Project Metadata & Contact Parity (US-3 / T3 / Spec 006 US-5 / T5)', () => {
    const requiredAboutKeys: TranslationKey[] = [
      'about_board',
      'about_contact',
      'about_copy_email',
      'about_copied',
      'about_copy_short',
      'about_copied_short'
    ];

    it('should have all About modal link and contact keys defined in both English and Spanish', () => {
      requiredAboutKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].length).toBeGreaterThan(0);
        expect(translations.es[key].length).toBeGreaterThan(0);
      });
    });

    it('should accurately translate About modal link and contact keys', () => {
      expect(getTranslation('en', 'about_board')).toBe('Board:');
      expect(getTranslation('es', 'about_board')).toBe('Tablero:');

      expect(getTranslation('en', 'about_contact')).toBe('Contact:');
      expect(getTranslation('es', 'about_contact')).toBe('Contacto:');

      expect(getTranslation('en', 'about_copy_email')).toBe('Copy email');
      expect(getTranslation('es', 'about_copy_email')).toBe('Copiar correo');

      expect(getTranslation('en', 'about_copied')).toBe('Copied!');
      expect(getTranslation('es', 'about_copied')).toBe('¡Copiado!');

      expect(getTranslation('en', 'about_copy_short')).toBe('COPY');
      expect(getTranslation('es', 'about_copy_short')).toBe('COPIAR');

      expect(getTranslation('en', 'about_copied_short')).toBe('COPIED!');
      expect(getTranslation('es', 'about_copied_short')).toBe('¡COPIADO!');
    });
  });

  describe('Drive Explorer Localization Parity (US-6 / T6 / FR-18)', () => {
    const requiredExplorerKeys: TranslationKey[] = [
      'explorer_col_type',
      'explorer_col_name',
      'explorer_col_created',
      'explorer_col_size',
      'explorer_parent_folder',
      'explorer_empty_folder',
      'explorer_refresh',
      'explorer_status_counts',
      'explorer_status_total_size',
      'explorer_loading',
      'explorer_loading_more',
      'explorer_error_title',
      'explorer_retry'
    ];

    it('should have all explorer translation keys defined in both English and Spanish', () => {
      requiredExplorerKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].length).toBeGreaterThan(0);
        expect(translations.es[key].length).toBeGreaterThan(0);
      });
    });

    it('should accurately translate explorer column headers, status bar, and empty/error states (FR-18)', () => {
      expect(getTranslation('en', 'explorer_col_type')).toBe('Type');
      expect(getTranslation('es', 'explorer_col_type')).toBe('Tipo');

      expect(getTranslation('en', 'explorer_col_name')).toBe('Name');
      expect(getTranslation('es', 'explorer_col_name')).toBe('Nombre');

      expect(getTranslation('en', 'explorer_col_created')).toBe('Created');
      expect(getTranslation('es', 'explorer_col_created')).toBe('Fecha de creación');

      expect(getTranslation('en', 'explorer_col_size')).toBe('Size');
      expect(getTranslation('es', 'explorer_col_size')).toBe('Tamaño');

      expect(getTranslation('en', 'explorer_parent_folder')).toBe('Parent directory');
      expect(getTranslation('es', 'explorer_parent_folder')).toBe('Subir nivel');

      expect(getTranslation('en', 'explorer_empty_folder')).toBe('Empty folder');
      expect(getTranslation('es', 'explorer_empty_folder')).toBe('Carpeta vacía');

      expect(getTranslation('en', 'explorer_refresh')).toBe('Refresh');
      expect(getTranslation('es', 'explorer_refresh')).toBe('Actualizar');

      expect(
        getTranslation('en', 'explorer_status_total_size', { size: '14.2 MB' })
      ).toBe('Total: 14.2 MB');
      expect(
        getTranslation('es', 'explorer_status_total_size', { size: '14.2 MB' })
      ).toBe('Total: 14.2 MB');

      expect(getTranslation('en', 'explorer_loading')).toBe('Loading files...');
      expect(getTranslation('es', 'explorer_loading')).toBe('Cargando archivos...');

      expect(getTranslation('en', 'explorer_error_title')).toBe('Unable to load folder');
      expect(getTranslation('es', 'explorer_error_title')).toBe('No se pudo cargar la carpeta');

      expect(getTranslation('en', 'explorer_retry')).toBe('Retry');
      expect(getTranslation('es', 'explorer_retry')).toBe('Reintentar');
    });
  });

  describe('Theme Mode Localization Parity (Spec 005 US-5 / T5 / FR-13)', () => {
    const requiredThemeKeys: TranslationKey[] = [
      'menu_theme',
      'theme_light',
      'theme_dark',
      'theme_switch_to_dark',
      'theme_switch_to_light'
    ];

    it('should have all theme translation keys defined in both English and Spanish', () => {
      requiredThemeKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].length).toBeGreaterThan(0);
        expect(translations.es[key].length).toBeGreaterThan(0);
      });
    });

    it('should accurately translate theme menu items, options, and action tooltips in English and Spanish (FR-13)', () => {
      expect(getTranslation('en', 'menu_theme')).toBe('Theme');
      expect(getTranslation('es', 'menu_theme')).toBe('Tema');

      expect(getTranslation('en', 'theme_light')).toBe('Light');
      expect(getTranslation('es', 'theme_light')).toBe('Claro');

      expect(getTranslation('en', 'theme_dark')).toBe('Dark');
      expect(getTranslation('es', 'theme_dark')).toBe('Oscuro');

      expect(getTranslation('en', 'theme_switch_to_dark')).toBe('Switch to dark mode');
      expect(getTranslation('es', 'theme_switch_to_dark')).toBe('Cambiar a modo oscuro');

      expect(getTranslation('en', 'theme_switch_to_light')).toBe('Switch to light mode');
      expect(getTranslation('es', 'theme_switch_to_light')).toBe('Cambiar a modo claro');
    });
  });

  describe('Cloud Providers Showcase Localization Parity (Spec 008 US-4 / T4 / FR-1, FR-4, FR-5, FR-7, FR-9)', () => {
    const requiredShowcaseKeys: TranslationKey[] = [
      'welcome_subtitle',
      'connect_google_drive',
      'connect_onedrive',
      'connect_mega',
      'connect_mediafire',
      'provider_coming_soon',
      'provider_tooltip_onedrive',
      'provider_tooltip_mega',
      'provider_tooltip_mediafire'
    ];

    it('should have all showcase keys defined and non-empty in both English and Spanish', () => {
      requiredShowcaseKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].trim().length).toBeGreaterThan(0);
        expect(translations.es[key].trim().length).toBeGreaterThan(0);
      });
    });

    it('should translate cloud-agnostic subtitle and all provider labels with 100% dictionary parity', () => {
      expect(getTranslation('en', 'welcome_subtitle')).toBe(
        'Connect to your cloud storage to manage your files directly from your desktop.'
      );
      expect(getTranslation('es', 'welcome_subtitle')).toBe(
        'Conéctate a tu almacenamiento en la nube para gestionar tus archivos directamente desde tu escritorio.'
      );

      expect(getTranslation('en', 'connect_google_drive')).toBe('Connect to Google Drive');
      expect(getTranslation('es', 'connect_google_drive')).toBe('Conectarse a Google Drive');

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

  describe('Panel Visibility Toggle Controls Localization Parity (Spec 009 US-4 / T4 / FR-16)', () => {
    const requiredToggleKeys: TranslationKey[] = [
      'panel_toggle_rail_hide',
      'panel_toggle_rail_show',
      'panel_toggle_tree_hide',
      'panel_toggle_tree_show',
      'panel_toggle_sidebar_hide',
      'panel_toggle_sidebar_show'
    ];

    it('should have all 6 panel toggle tooltip keys defined and non-empty in English and Spanish', () => {
      requiredToggleKeys.forEach((key) => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.es[key]).toBeDefined();
        expect(translations.en[key].trim().length).toBeGreaterThan(0);
        expect(translations.es[key].trim().length).toBeGreaterThan(0);
      });
    });

    it('should accurately translate panel toggle tooltips in English and Spanish', () => {
      expect(getTranslation('en', 'panel_toggle_rail_hide')).toBe('Hide navigation rail');
      expect(getTranslation('es', 'panel_toggle_rail_hide')).toBe('Ocultar barra de navegación');

      expect(getTranslation('en', 'panel_toggle_rail_show')).toBe('Show navigation rail');
      expect(getTranslation('es', 'panel_toggle_rail_show')).toBe('Mostrar barra de navegación');

      expect(getTranslation('en', 'panel_toggle_tree_hide')).toBe('Hide directory tree');
      expect(getTranslation('es', 'panel_toggle_tree_hide')).toBe('Ocultar árbol de carpetas');

      expect(getTranslation('en', 'panel_toggle_tree_show')).toBe('Show directory tree');
      expect(getTranslation('es', 'panel_toggle_tree_show')).toBe('Mostrar árbol de carpetas');

      expect(getTranslation('en', 'panel_toggle_sidebar_hide')).toBe('Hide sidebar');
      expect(getTranslation('es', 'panel_toggle_sidebar_hide')).toBe('Ocultar panel lateral');

      expect(getTranslation('en', 'panel_toggle_sidebar_show')).toBe('Show sidebar');
      expect(getTranslation('es', 'panel_toggle_sidebar_show')).toBe('Mostrar panel lateral');
    });
  });
});
