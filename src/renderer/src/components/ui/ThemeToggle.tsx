import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import { getThemeToggleMetadata } from '../../../../shared/theme';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  language?: LanguageCode;
  className?: string;
}

/**
 * Action-oriented Moon/Sun theme toggle button for pre-authentication views (FR-4, FR-5, FR-13).
 * Displays a Moon icon when in Light Mode (to switch to Dark Mode) and a Sun icon when in Dark Mode (to switch to Light Mode).
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  language = 'en',
  className = ''
}) => {
  const { iconName, tooltipKey } = getThemeToggleMetadata(theme);
  const tooltip = getTranslation(language, tooltipKey);

  return (
    <button
      type="button"
      data-testid="theme-toggle-btn"
      onClick={onToggle}
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-[4px] border transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] active:scale-95 ${
        theme === 'dark'
          ? 'bg-[#181C23] border-[#2C323D] text-[#F3F4F6] hover:bg-[#1E232C] hover:border-[#3B66FF] hover:text-[#3B66FF]'
          : 'bg-[#FFFFFF] border-[#C9C6BD] text-[#111315] hover:bg-[#ECEAE3] hover:border-[#1B44E8] hover:text-[#1B44E8]'
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
