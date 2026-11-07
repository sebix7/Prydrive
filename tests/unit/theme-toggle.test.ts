import { describe, it, expect, vi } from 'vitest';
import {
  getThemeToggleMetadata,
  toggleThemeMode,
  saveThemePreference
} from '../../src/shared/theme';

describe('Pre-Authentication Moon/Sun Theme Toggle (US-2 / T2)', () => {
  it('should display a Moon icon and target dark mode when the active theme is light (FR-4)', () => {
    const metadata = getThemeToggleMetadata('light');
    expect(metadata).toEqual({
      targetTheme: 'dark',
      iconName: 'moon',
      tooltipKey: 'theme_switch_to_dark'
    });
  });

  it('should display a Sun icon and target light mode when the active theme is dark (FR-4)', () => {
    const metadata = getThemeToggleMetadata('dark');
    expect(metadata).toEqual({
      targetTheme: 'light',
      iconName: 'sun',
      tooltipKey: 'theme_switch_to_light'
    });
  });

  it('should alternate and persist the active theme when the toggle button is clicked (FR-5)', () => {
    const mockStorage = {
      setItem: vi.fn()
    };

    const nextFromLight = toggleThemeMode('light');
    saveThemePreference(nextFromLight, mockStorage);
    expect(nextFromLight).toBe('dark');
    expect(mockStorage.setItem).toHaveBeenCalledWith('prydrive_theme', 'dark');

    const nextFromDark = toggleThemeMode(nextFromLight);
    saveThemePreference(nextFromDark, mockStorage);
    expect(nextFromDark).toBe('light');
    expect(mockStorage.setItem).toHaveBeenCalledWith('prydrive_theme', 'light');
  });
});
