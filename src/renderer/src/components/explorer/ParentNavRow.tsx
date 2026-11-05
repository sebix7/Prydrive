import React from 'react';
import { Folder } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ParentNavRowProps {
  onNavigateUp: () => void;
  language?: LanguageCode;
}

export const ParentNavRow: React.FC<ParentNavRowProps> = ({
  onNavigateUp,
  language = 'en'
}) => {
  const tooltip = getTranslation(language, 'explorer_parent_folder');

  return (
    <div
      role="row"
      data-testid="explorer-parent-row"
      title={tooltip}
      aria-label={tooltip}
      onDoubleClick={onNavigateUp}
      className="h-9 flex items-center px-3 border-b border-slate-800/50 text-xs text-slate-200 hover:bg-slate-800/50 transition-colors cursor-default select-none"
    >
      {/* Column 1: Folder Icon */}
      <div className="w-10 flex items-center justify-center shrink-0">
        <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />
      </div>

      {/* Column 2: "..." Parent Label */}
      <div className="flex-1 min-w-0 pr-4 font-mono font-bold text-slate-300">
        ...
      </div>

      {/* Column 3: Empty Creation Date */}
      <div className="w-44 shrink-0 text-slate-500 font-mono text-[11px]" />

      {/* Column 4: Empty Size */}
      <div className="w-24 shrink-0 text-right text-slate-500 font-mono text-[11px] pr-2" />
    </div>
  );
};
