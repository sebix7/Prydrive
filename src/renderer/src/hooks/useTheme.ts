import { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../../../shared/types';
import {
  type ThemeToggleMetadata,
  THEME_STORAGE_KEY,
  isValidThemeMode,
  resolveInitialTheme,
  toggleThemeMode,
  getThemeToggleMetadata,
  loadSavedTheme,
  saveThemePreference
} from '../../../shared/theme';

export type { ThemeMode, ThemeToggleMetadata };
export {
  THEME_STORAGE_KEY,
  isValidThemeMode,
  resolveInitialTheme,
  toggleThemeMode,
  getThemeToggleMetadata,
  loadSavedTheme,
  saveThemePreference
};

function detectSystemPrefersDark(): boolean | null {
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Hook managing application-wide Light/Dark theme state, one-time startup OS fallback detection,
 * localStorage persistence, and root document element synchronization (FR-1, FR-2, FR-3, FR-12, EC-5).
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = loadSavedTheme();
    const systemPrefersDark = detectSystemPrefersDark();
    return resolveInitialTheme(saved, systemPrefersDark);
  });

  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    saveThemePreference(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = toggleThemeMode(prev);
      saveThemePreference(next);
      return next;
    });
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme
  };
}
