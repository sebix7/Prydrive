import React from 'react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import type { ActiveNavTab } from '../../../../shared/shell-state';
import {
  getNavButtonStyles,
  getPrydriveLogoCutoutColor
} from '../../../../shared/shell-state';
import { getTranslation } from '../../../../shared/i18n/translations';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';
import { PrydriveLogo as PrydriveLogoIcon } from '../ui/PrydriveLogo';

export interface NavigationRailProps {
  activeNav: ActiveNavTab;
  onSelectNav: (nav: ActiveNavTab) => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}


/**
 * Left navigation rail hosting interactive brand and provider buttons.
 * Adheres to 64px width, 1px structural dividers, and distinctive active surface styling.
 */
export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeNav,
  onSelectNav,
  language = 'en',
  theme = 'dark'
}) => {
  const isPrydriveActive = activeNav === 'prydrive';
  const isGoogleDriveActive = activeNav === 'google-drive';
  const isDark = theme === 'dark';

  const prydriveStyles = getNavButtonStyles(isPrydriveActive, theme);
  const googleDriveStyles = getNavButtonStyles(isGoogleDriveActive, theme);
  const prydriveCutoutColor = getPrydriveLogoCutoutColor(isPrydriveActive, theme);

  return (
    <aside
      data-testid="shell-nav-rail-zone"
      className="w-16 border-r border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] flex flex-col items-center py-3 gap-2.5 z-20 shrink-0 h-full select-none transition-colors"
      aria-label="Application navigation"
    >
      {/* 1. Prydrive Brand Button */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left active vertical indicator bar (3px wide) */}
        <span
          className={`absolute left-0 w-[3px] h-6 rounded-r bg-[#1B44E8] dark:bg-[#3B66FF] transition-all duration-200 ${prydriveStyles.indicator}`}
          aria-hidden="true"
        />
        <button
          type="button"
          data-testid="nav-btn-prydrive"
          onClick={() => onSelectNav('prydrive')}
          className={`group relative w-10 h-10 rounded-[6px] flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] ${prydriveStyles.container}`}
          title={getTranslation(language, 'nav_prydrive_tooltip')}
          aria-label={getTranslation(language, 'nav_prydrive_tooltip')}
          aria-pressed={isPrydriveActive}
        >
          <PrydriveLogoIcon
            className="w-5 h-5 transition-transform duration-150 group-active:scale-95"
            cutoutColor={prydriveCutoutColor}
          />
        </button>
      </div>

      {/* Subtle structural rail divider */}
      <div
        className="w-7 h-px my-0.5 bg-[#DFDDD6] dark:bg-[#222730]"
        role="separator"
      />

      {/* 2. Google Drive Provider Button */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left active vertical indicator bar (3px wide) */}
        <span
          className={`absolute left-0 w-[3px] h-6 rounded-r bg-[#1B44E8] dark:bg-[#3B66FF] transition-all duration-200 ${googleDriveStyles.indicator}`}
          aria-hidden="true"
        />
        <button
          type="button"
          data-testid="nav-btn-google-drive"
          onClick={() => onSelectNav('google-drive')}
          className={`group relative w-10 h-10 rounded-[6px] flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] ${googleDriveStyles.container}`}
          title={getTranslation(language, 'nav_google_drive_tooltip')}
          aria-label={getTranslation(language, 'nav_google_drive_tooltip')}
          aria-pressed={isGoogleDriveActive}
        >
          <div className="w-5 h-5 flex items-center justify-center transition-transform duration-150 group-active:scale-95">
            <GoogleDriveLogo className="w-5 h-5" />
          </div>
        </button>
      </div>
    </aside>
  );
};
