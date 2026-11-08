import React from 'react';
import { Globe } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';

export interface LanguageToggleProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  theme?: ThemeMode;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  theme = 'light',
  className = ''
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 p-0.5 rounded-lg text-xs font-semibold border transition-colors ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80'
          : 'bg-slate-100/90 border-slate-200/80'
      } ${className}`}
    >
      <div className={`pl-1.5 pr-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        data-testid="lang-btn-en"
        onClick={() => onLanguageChange('en')}
        className={`px-2 py-1 rounded-md transition-all text-[11px] ${
          currentLanguage === 'en'
            ? isDark
              ? 'bg-slate-700 text-white shadow-xs font-bold'
              : 'bg-white text-slate-900 shadow-xs font-bold'
            : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={currentLanguage === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        data-testid="lang-btn-es"
        onClick={() => onLanguageChange('es')}
        className={`px-2 py-1 rounded-md transition-all text-[11px] ${
          currentLanguage === 'es'
            ? isDark
              ? 'bg-slate-700 text-white shadow-xs font-bold'
              : 'bg-white text-slate-900 shadow-xs font-bold'
            : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={currentLanguage === 'es'}
      >
        ES
      </button>
    </div>
  );
};
