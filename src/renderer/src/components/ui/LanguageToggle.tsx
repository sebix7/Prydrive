import React from 'react';
import { Globe } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';

export interface LanguageToggleProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  className = ''
}) => {
  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 p-0.5 rounded-lg text-xs font-semibold ${className}`}
    >
      <div className="pl-1.5 pr-0.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        data-testid="lang-btn-en"
        onClick={() => onLanguageChange('en')}
        className={`px-2 py-1 rounded-md transition-all text-[11px] ${
          currentLanguage === 'en'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
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
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={currentLanguage === 'es'}
      >
        ES
      </button>
    </div>
  );
};
