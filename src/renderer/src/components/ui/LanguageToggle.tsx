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
      className={`inline-flex items-center gap-0.5 p-0.5 h-[30px] rounded-[4px] border font-mono text-[11px] transition-colors ${
        isDark
          ? 'bg-[#15181E] border-[#2C323D]'
          : 'bg-[#F2F0EA] border-[#C9C6BD]'
      } ${className}`}
    >
      <div className={`px-1.5 flex items-center justify-center ${isDark ? 'text-[#6B7280]' : 'text-[#7C8087]'}`}>
        <Globe className="w-3 h-3" />
      </div>
      <button
        type="button"
        data-testid="lang-btn-en"
        onClick={() => onLanguageChange('en')}
        className={`px-2 h-6 rounded-[3px] font-mono text-[11px] transition-all ${
          currentLanguage === 'en'
            ? isDark
              ? 'bg-[#181C23] text-[#3B66FF] border border-[#2C323D] font-bold shadow-xs'
              : 'bg-[#FFFFFF] text-[#1B44E8] border border-[#C9C6BD] font-bold shadow-xs'
            : isDark
              ? 'text-[#9CA3AF] hover:text-[#F3F4F6] border border-transparent'
              : 'text-[#4A4E54] hover:text-[#111315] border border-transparent'
        }`}
        aria-pressed={currentLanguage === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        data-testid="lang-btn-es"
        onClick={() => onLanguageChange('es')}
        className={`px-2 h-6 rounded-[3px] font-mono text-[11px] transition-all ${
          currentLanguage === 'es'
            ? isDark
              ? 'bg-[#181C23] text-[#3B66FF] border border-[#2C323D] font-bold shadow-xs'
              : 'bg-[#FFFFFF] text-[#1B44E8] border border-[#C9C6BD] font-bold shadow-xs'
            : isDark
              ? 'text-[#9CA3AF] hover:text-[#F3F4F6] border border-transparent'
              : 'text-[#4A4E54] hover:text-[#111315] border border-transparent'
        }`}
        aria-pressed={currentLanguage === 'es'}
      >
        ES
      </button>
    </div>
  );
};
