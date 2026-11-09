import React from 'react';
import { Folder } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ParentNavRowProps {
  onNavigateUp: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const ParentNavRow: React.FC<ParentNavRowProps> = ({
  onNavigateUp,
  language = 'en',
  theme = 'dark'
}) => {
  const tooltip = getTranslation(language, 'explorer_parent_folder');
  const isDark = theme === 'dark';

  return (
    <div
      role="row"
      data-testid="explorer-parent-row"
      title={tooltip}
      aria-label={tooltip}
      onDoubleClick={onNavigateUp}
      className="h-9 flex items-center px-3 border-b border-b-[#DFDDD6] dark:border-b-[#222730] border-l-[3px] border-l-transparent text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-xs transition-colors cursor-default select-none"
    >
      {/* Column 1: Folder Icon */}
      <div className="w-10 flex items-center justify-center shrink-0">
        <Folder className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF] fill-[#1B44E8]/20 dark:fill-[#3B66FF]/20" />
      </div>

      {/* Column 2: "..." Parent Label */}
      <div
        className="flex-1 min-w-0 pr-4 font-mono font-bold text-[#4A4E54] dark:text-[#9CA3AF]"
      >
        ...
      </div>

      {/* Column 3: Empty Creation Date */}
      <div className="w-44 shrink-0 text-[#7C8087] dark:text-[#6B7280] font-mono text-[11px]" />

      {/* Column 4: Empty Size */}
      <div className="w-24 shrink-0 text-right text-[#7C8087] dark:text-[#6B7280] font-mono text-[11px] pr-2" />
    </div>
  );
};
