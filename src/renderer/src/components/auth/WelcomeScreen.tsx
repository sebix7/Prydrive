import React, { useState } from 'react';
import { Cloud, ArrowRight } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';

interface WelcomeScreenProps {
  onSignIn: () => Promise<void>;
  disabled?: boolean;
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSignIn,
  disabled = false,
  language = 'en',
  onLanguageChange,
  theme = 'light',
  onToggleTheme
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
  const isDark = theme === 'dark';

  return (
    <div
      data-testid="welcome-screen"
      className={`relative flex-1 flex flex-col items-center justify-center w-full h-full p-6 select-none overflow-hidden transition-colors ${
        isDark ? 'bg-[#0D1117] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top right theme & language switches (FR-4, FR-5) */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
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
        className={`max-w-md w-full rounded-2xl p-8 text-center flex flex-col items-center border transition-colors ${
          isDark
            ? 'bg-[#161B22] border-slate-800 shadow-2xl shadow-black/50'
            : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${
            isDark
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-blue-50 text-blue-600 border-blue-100/50'
          }`}
        >
          <Cloud className="w-9 h-9" />
        </div>

        <h1
          className={`text-2xl font-bold tracking-tight mb-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          {getTranslation(language, 'welcome_title')}
        </h1>
        <p
          className={`text-sm mb-8 leading-relaxed max-w-xs ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {getTranslation(language, 'welcome_subtitle')}
        </p>

        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={handleClick}
          className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold rounded-xl border transition-all duration-200 shadow-sm ${
            isButtonDisabled
              ? isDark
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : isDark
                ? 'bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]'
          }`}
        >
          {/* Official Google 'G' Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>{getTranslation(language, 'sign_in_google')}</span>
          <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
        </button>

        <p className={`text-xs mt-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {getTranslation(language, 'browser_notice')}
        </p>
      </div>
    </div>
  );
};
