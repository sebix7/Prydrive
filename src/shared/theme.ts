import type { ThemeMode } from './types';

export type { ThemeMode };

export const THEME_STORAGE_KEY = 'prydrive_theme';

export interface MinimalStorage {
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
}

/**
 * Type guard verifying if an unknown value is a valid ThemeMode ('light' | 'dark') (EC-2).
 */
export function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/**
 * Resolves the initial theme mode once at startup (FR-1, FR-2, FR-3, EC-1, EC-2):
 * 1. If savedValue is a valid ThemeMode ('light' | 'dark'), returns it.
 * 2. Otherwise, if systemPrefersDark is a boolean, returns 'dark' when true or 'light' when false.
 * 3. Otherwise (when OS detection is unavailable), safely defaults to 'dark' (EC-1).
 */
export function resolveInitialTheme(
  savedValue: unknown,
  systemPrefersDark?: boolean | null
): ThemeMode {
  if (isValidThemeMode(savedValue)) {
    return savedValue;
  }
  if (typeof systemPrefersDark === 'boolean') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Alternates between 'light' and 'dark' theme modes (FR-5).
 */
export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export interface ThemeToggleMetadata {
  targetTheme: ThemeMode;
  iconName: 'moon' | 'sun';
  tooltipKey: 'theme_switch_to_dark' | 'theme_switch_to_light';
}

/**
 * Resolves action-oriented toggle button metadata (FR-4, FR-13):
 * - When activeTheme is 'light' -> Moon icon + 'theme_switch_to_dark'.
 * - When activeTheme is 'dark'  -> Sun icon  + 'theme_switch_to_light'.
 */
export function getThemeToggleMetadata(activeTheme: ThemeMode): ThemeToggleMetadata {
  if (activeTheme === 'light') {
    return {
      targetTheme: 'dark',
      iconName: 'moon',
      tooltipKey: 'theme_switch_to_dark'
    };
  }
  return {
    targetTheme: 'light',
    iconName: 'sun',
    tooltipKey: 'theme_switch_to_light'
  };
}

export interface ThemeSurfacePalette {
  canvasBg: string;
  secondaryBg: string;
  cardBg: string;
  modalBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

/**
 * Resolves standardized semantic surface and typography classes for Light and Dark modes (FR-9, FR-10, NFR-2).
 */
export function getThemeSurfaceClasses(theme: ThemeMode): ThemeSurfacePalette {
  if (theme === 'light') {
    return {
      canvasBg: 'bg-white',
      secondaryBg: 'bg-slate-100/90',
      cardBg: 'bg-white',
      modalBg: 'bg-white',
      border: 'border-slate-200',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-700',
      textMuted: 'text-slate-500'
    };
  }
  return {
    canvasBg: 'bg-[#0D1117]',
    secondaryBg: 'bg-[#161B22]',
    cardBg: 'bg-[#161B22]',
    modalBg: 'bg-[#161B22]',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400'
  };
}

/**
 * Safely reads the persisted theme preference from storage without throwing on restricted environments (FR-12).
 */
export function loadSavedTheme(storage?: MinimalStorage | null): ThemeMode | null {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof localStorage !== 'undefined'
          ? localStorage
          : null;
    if (!targetStorage?.getItem) {
      return null;
    }
    const raw = targetStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Safely persists the user's theme preference without throwing on restricted environments (FR-2, FR-12).
 */
export function saveThemePreference(
  theme: ThemeMode,
  storage?: MinimalStorage | null
): void {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof localStorage !== 'undefined'
          ? localStorage
          : null;
    targetStorage?.setItem?.(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors and continue operating in memory (FR-12)
  }
}
