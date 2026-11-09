import React, { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import {
  getTechnicalIndexStrip,
  getGoogleSignInButtonClasses,
  SWISS_CONTROL_LAYOUT
} from '../../../../shared/theme';
import { APP_VERSION } from '../../../../shared/shell-state';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PrydriveLogo } from '../ui/PrydriveLogo';

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

  return (
    <div
      data-testid="welcome-screen"
      className="relative flex-1 flex flex-col items-center justify-center w-full h-full p-6 select-none overflow-hidden swiss-dot-matrix bg-[#FAF9F6] dark:bg-[#101216] text-[#111315] dark:text-[#F3F4F6] transition-colors"
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
        className="max-w-[420px] w-full rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] overflow-hidden shadow-sm transition-colors"
      >
        {/* Swiss Archive Technical Index Strip (FR-6) */}
        <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none">
          <span>{strip.leftLabel}</span>
          <span>{strip.rightLabel}</span>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-[#1B44E8] dark:text-[#3B66FF] flex items-center justify-center mb-5 shadow-xs"
          >
            <PrydriveLogo
              className="w-8 h-8"
              cutoutColor={theme === 'dark' ? '#15181E' : '#F2F0EA'}
            />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111315] dark:text-[#F3F4F6] mb-2">
            {getTranslation(language, 'welcome_title')}
          </h1>
          <p className="font-sans text-sm text-[#4A4E54] dark:text-[#9CA3AF] mb-6 max-w-xs leading-relaxed">
            {getTranslation(language, 'welcome_subtitle')}
          </p>

          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={handleClick}
            className={getGoogleSignInButtonClasses(theme, isButtonDisabled)}
          >
            {/* Official Google 'G' Icon inside crisp white badge */}
            <span className="w-6 h-6 rounded-[3px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
            </span>
            <span className="font-display font-semibold">{getTranslation(language, 'sign_in_google')}</span>
            <ArrowRight className="w-4 h-4 ml-auto text-[#7C8087] dark:text-[#6B7280] group-hover:text-white transition-colors" />
          </button>

          <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280] mt-5 text-center leading-normal">
            {getTranslation(language, 'browser_notice')}
          </p>
        </div>
      </div>
    </div>
  );
};
