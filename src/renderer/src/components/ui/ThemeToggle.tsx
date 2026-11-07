import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import { getThemeToggleMetadata } from '../../../../shared/theme';

export interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  language?: LanguageCode;
  className?: string;
}

/**
 * Action-oriented Moon/Sun theme toggle button for pre-authentication views (FR-4, FR-5).
 * Displays a Moon icon when in Light Mode (to switch to Dark Mode) and a Sun icon when in Dark Mode (to switch to Light Mode).
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  language = 'en',
  className = ''
}) => {
  const { iconName } = getThemeToggleMetadata(theme);
  const tooltip =
    iconName === 'moon'
      ? language === 'es'
        ? 'Cambiar a modo oscuro'
        : 'Switch to dark mode'
      : language === 'es'
        ? 'Cambiar a modo claro'
        : 'Switch to light mode';

  return (
    <button
      type="button"
      data-testid="theme-toggle-btn"
      onClick={onToggle}
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 ${
        theme === 'dark'
          ? 'bg-slate-800/90 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
          : 'bg-slate-100/90 border-slate-200/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
      } ${className}`}
    >
      {iconName === 'moon' ? (
        <Moon className="w-3.5 h-3.5" data-testid="theme-icon-moon" />
      ) : (
        <Sun className="w-3.5 h-3.5" data-testid="theme-icon-sun" />
      )}
    </button>
  );
};
