import React from 'react';
import type { ActiveNavTab } from '../../../../shared/shell-state';
import { getNavButtonStyles } from '../../../../shared/shell-state';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';

export interface NavigationRailProps {
  activeNav: ActiveNavTab;
  onSelectNav: (nav: ActiveNavTab) => void;
}

/**
 * Custom SVG icon representing the Prydrive brand mark.
 */
const PrydriveLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
    <path
      d="M7 6H13.5C15.9853 6 18 8.01472 18 10.5C18 12.9853 15.9853 15 13.5 15H10V18.5H7V6Z"
      fill="currentColor"
    />
    <circle cx="13" cy="10.5" r="2" fill="#0D1117" />
  </svg>
);


/**
 * Left navigation rail hosting interactive brand and provider buttons.
 * Adheres to 64px width, 1px structural dividers, and distinctive active surface styling.
 */
export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeNav,
  onSelectNav
}) => {
  const isPrydriveActive = activeNav === 'prydrive';
  const isGoogleDriveActive = activeNav === 'google-drive';

  const prydriveStyles = getNavButtonStyles(isPrydriveActive);
  const googleDriveStyles = getNavButtonStyles(isGoogleDriveActive);

  return (
    <aside
      data-testid="shell-nav-rail-zone"
      className="w-16 border-r border-slate-800 bg-[#161B22] flex flex-col items-center py-3 gap-2.5 z-20 shrink-0 h-full select-none"
      aria-label="Application navigation"
    >
      {/* 1. Prydrive Brand Button */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left active vertical indicator bar */}
        <span
          className={`absolute left-0 w-1 h-6 rounded-r bg-blue-500 transition-all duration-200 ${prydriveStyles.indicator}`}
          aria-hidden="true"
        />
        <button
          type="button"
          data-testid="nav-btn-prydrive"
          onClick={() => onSelectNav('prydrive')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${prydriveStyles.container}`}
          title="Prydrive"
          aria-label="Prydrive"
          aria-pressed={isPrydriveActive}
        >
          <PrydriveLogoIcon className="w-5 h-5 transition-transform duration-150 group-active:scale-95" />
        </button>
      </div>

      {/* Subtle structural rail divider */}
      <div className="w-7 h-px bg-slate-800/80 my-0.5" role="separator" />

      {/* 2. Google Drive Provider Button */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left active vertical indicator bar */}
        <span
          className={`absolute left-0 w-1 h-6 rounded-r bg-blue-500 transition-all duration-200 ${googleDriveStyles.indicator}`}
          aria-hidden="true"
        />
        <button
          type="button"
          data-testid="nav-btn-google-drive"
          onClick={() => onSelectNav('google-drive')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${googleDriveStyles.container}`}
          title="Google Drive"
          aria-label="Google Drive"
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
