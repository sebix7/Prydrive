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
});
