import { describe, it, expect, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  isValidThemeMode,
  resolveInitialTheme,
  toggleThemeMode,
  loadSavedTheme,
  saveThemePreference
} from '../../src/shared/theme';

describe('Theme Resolution, OS Fallback & Persistence (US-1 / T1)', () => {
  it('should define the canonical localStorage key for theme persistence', () => {
    expect(THEME_STORAGE_KEY).toBe('prydrive_theme');
  });

  it('should validate only "light" and "dark" as valid theme modes (EC-2)', () => {
    expect(isValidThemeMode('light')).toBe(true);
    expect(isValidThemeMode('dark')).toBe(true);
    expect(isValidThemeMode('auto')).toBe(false);
    expect(isValidThemeMode('')).toBe(false);
    expect(isValidThemeMode(null)).toBe(false);
    expect(isValidThemeMode(undefined)).toBe(false);
    expect(isValidThemeMode(123)).toBe(false);
  });

  it('should detect OS color scheme on first launch when no saved preference exists (FR-1)', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
    expect(resolveInitialTheme(undefined, true)).toBe('dark');
    expect(resolveInitialTheme(undefined, false)).toBe('light');
  });

  it('should prioritize a valid persisted theme preference over OS color scheme (FR-2, FR-3)', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it('should ignore corrupted persisted values and fall back to OS color scheme (EC-2)', () => {
    expect(resolveInitialTheme('corrupted_theme', false)).toBe('light');
    expect(resolveInitialTheme('corrupted_theme', true)).toBe('dark');
  });

  it('should safely default to "dark" when OS detection is unavailable and no valid preference exists (EC-1)', () => {
    expect(resolveInitialTheme(null, undefined)).toBe('dark');
    expect(resolveInitialTheme(null, null)).toBe('dark');
    expect(resolveInitialTheme('invalid', undefined)).toBe('dark');
  });

  it('should alternate deterministically between "light" and "dark"', () => {
    expect(toggleThemeMode('light')).toBe('dark');
    expect(toggleThemeMode('dark')).toBe('light');
  });

  it('should safely read and write theme preferences without throwing when storage is restricted (FR-12)', () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: vi.fn()
    };

    expect(loadSavedTheme(mockStorage)).toBe('light');
    expect(mockStorage.getItem).toHaveBeenCalledWith('prydrive_theme');

    saveThemePreference('dark', mockStorage);
    expect(mockStorage.setItem).toHaveBeenCalledWith('prydrive_theme', 'dark');

    // Restricted / throwing storage should never throw (FR-12)
    const throwingStorage = {
      getItem: () => {
        throw new Error('Storage disabled');
      },
      setItem: () => {
        throw new Error('Quota exceeded');
      }
    };

    expect(loadSavedTheme(throwingStorage)).toBeNull();
    expect(() => saveThemePreference('light', throwingStorage)).not.toThrow();
  });
});
