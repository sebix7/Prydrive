import React, { useState, useEffect } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import {
  getTechnicalIndexStrip,
  getGoogleSignInButtonClasses,
  getGoogleDriveConnectButtonClasses,
  getUpcomingProviderButtonClasses,
  getRoadmapBadgeClasses,
  SWISS_CONTROL_LAYOUT
} from '../../../../shared/theme';
import {
  APP_VERSION,
  UPCOMING_PROVIDERS,
  type UpcomingProviderDefinition,
  isWelcomeCompactHeight
} from '../../../../shared/shell-state';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PrydriveLogo } from '../ui/PrydriveLogo';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';
import { OneDriveLogo } from '../ui/OneDriveLogo';
import { MegaLogo } from '../ui/MegaLogo';
import { MediaFireLogo } from '../ui/MediaFireLogo';

interface WelcomeScreenProps {
  onSignIn: () => Promise<void>;
  disabled?: boolean;
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenAbout?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSignIn,
  disabled = false,
  language = 'en',
  onLanguageChange,
  theme = 'light',
  onToggleTheme,
  onOpenAbout
}) => {
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = async () => {
    if (isClicking || disabled) return;
    setIsClicking(true);
    try {
      await onSignIn();
    } finally {
      setIsClicking(false);
    }
  };

  const isButtonDisabled = disabled || isClicking;
  const strip = getTechnicalIndexStrip('welcome', APP_VERSION);

  const [isCompact, setIsCompact] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.innerHeight === 'number') {
      return isWelcomeCompactHeight(window.innerHeight);
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(isWelcomeCompactHeight(window.innerHeight));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderUpcomingLogo = (id: UpcomingProviderDefinition['id']) => {
    switch (id) {
      case 'onedrive':
        return <OneDriveLogo className="w-4 h-4" />;
      case 'mega':
        return <MegaLogo className="w-4 h-4" />;
      case 'mediafire':
        return <MediaFireLogo className="w-4 h-4" />;
    }
  };

  return (
    <div
      data-testid="welcome-screen"
      className="relative flex-1 flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 select-none overflow-y-auto swiss-dot-matrix bg-[#FAF9F6] dark:bg-[#101216] text-[#111315] dark:text-[#F3F4F6] transition-colors"
    >
      {/* Top right theme, language, and about switches (FR-4, FR-5, FR-7) */}
      <div className={SWISS_CONTROL_LAYOUT.topRightClusterClass}>
        {onOpenAbout && (
          <button
            type="button"
            data-testid="about-btn"
            onClick={onOpenAbout}
            title={getTranslation(language, 'about_title')}
            aria-label={getTranslation(language, 'about_title')}
            className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] active:scale-95"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
        {onToggleTheme && (
          <ThemeToggle
            theme={theme}
            onToggle={onToggleTheme}
            language={language}
          />
        )}
        {onLanguageChange && (
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
            theme={theme}
          />
        )}
      </div>

      <div
        className="max-w-[420px] w-full my-auto rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] overflow-hidden shadow-sm transition-colors"
      >
        {/* Swiss Archive Technical Index Strip (FR-6) */}
        <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none">
          <span>{strip.leftLabel}</span>
          <span>{strip.rightLabel}</span>
        </div>

        <div className="px-6 py-5 sm:px-7 sm:py-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-3 flex items-center justify-center">
            <PrydriveLogo
              className="w-12 h-12 shadow-xs"
              theme={theme}
            />
          </div>

          <h1 className="font-display text-xl font-bold tracking-tight text-[#111315] dark:text-[#F3F4F6] mb-1.5">
            {getTranslation(language, 'welcome_title')}
          </h1>
          <p className="font-sans text-xs text-[#4A4E54] dark:text-[#9CA3AF] mb-4 max-w-xs leading-normal">
            {getTranslation(language, 'welcome_subtitle')}
          </p>

          {/* Adaptive Provider Showcase (FR-3, FR-4, FR-5) */}
          {isCompact ? (
            /* Compact 2x2 Grid View (Height < 620px) (FR-4) */
            <div className="grid grid-cols-2 gap-2" data-testid="provider-showcase-grid">
              {/* 1. Google Drive (Primary Active) */}
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleClick}
                className={getGoogleDriveConnectButtonClasses(theme, isButtonDisabled, 'compact')}
                title={getTranslation(language, 'connect_google_drive')}
                aria-label={getTranslation(language, 'connect_google_drive')}
                data-testid="connect-btn-google-drive"
              >
                {/* Official Google Drive Icon inside crisp standardized white badge */}
                <span className="w-6 h-6 rounded-[3px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                  <GoogleDriveLogo className="w-4 h-4" />
                </span>
                <ArrowRight className="w-4 h-4 ml-auto text-[#7C8087] dark:text-[#6B7280] group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* 2. Upcoming Providers (OneDrive, MEGA, MediaFire) */}
              {UPCOMING_PROVIDERS.map((provider) => {
                const tooltip = getTranslation(language, provider.tooltipKey);

                return (
                  <div
                    key={provider.id}
                    title={tooltip}
                    className="relative"
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-disabled="true"
                      aria-label={tooltip}
                      className={getUpcomingProviderButtonClasses(theme, 'compact')}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                      data-testid={`connect-btn-${provider.id}`}
                    >
                      <span className="w-6 h-6 rounded-[3px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                        {renderUpcomingLogo(provider.id)}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-auto opacity-40 shrink-0 text-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Standard Full-Width Vertical List View (Height >= 620px) (FR-3) */
            <div className="w-full flex flex-col gap-1.5" data-testid="provider-showcase-list">
              {/* 1. Google Drive (Primary Active) */}
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleClick}
                className={getGoogleDriveConnectButtonClasses(theme, isButtonDisabled, 'full')}
                data-testid="connect-btn-google-drive"
              >
                {/* Official Google Drive Icon inside crisp standardized white badge */}
                <span className="w-6 h-6 rounded-[3px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                  <GoogleDriveLogo className="w-4 h-4" />
                </span>
                <span className="font-display font-semibold">{getTranslation(language, 'connect_google_drive')}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-[#7C8087] dark:text-[#6B7280] group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* 2. Upcoming Providers (OneDrive, MEGA, MediaFire) */}
              {UPCOMING_PROVIDERS.map((provider) => {
                const label = getTranslation(language, provider.labelKey);
                const badge = getTranslation(language, provider.badgeKey);
                const tooltip = getTranslation(language, provider.tooltipKey);

                return (
                  <div
                    key={provider.id}
                    title={tooltip}
                    className="w-full relative"
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-disabled="true"
                      aria-label={`${label} (${badge})`}
                      className={getUpcomingProviderButtonClasses(theme, 'full')}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                      data-testid={`connect-btn-${provider.id}`}
                    >
                      <span className="w-6 h-6 rounded-[3px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
                        {renderUpcomingLogo(provider.id)}
                      </span>
                      <span className="font-display font-medium">{label}</span>
                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        <span className={getRoadmapBadgeClasses(theme)}>
                          {badge}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-40 shrink-0 text-current" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280] mt-3.5 text-center leading-normal">
            {getTranslation(language, 'browser_notice')}
          </p>
        </div>
      </div>
    </div>
  );
};
