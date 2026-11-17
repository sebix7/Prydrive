import React from 'react';
import type { FolderMetrics, LanguageCode, ThemeMode } from '../../../../shared/types';
import { formatStatusCounts } from '../../../../shared/explorer-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ExplorerStatusBarProps {
  metrics: FolderMetrics;
  isLoading?: boolean;
  onRefresh?: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Persistent bottom telemetry bar inside the central workspace canvas (FR-12, FR-14).
 * Displays real folder/file counts on the left and aggregate file size on the right.
 */
export const ExplorerStatusBar: React.FC<ExplorerStatusBarProps> = ({
  metrics,
  language = 'en'
}) => {
  const countsLabel = formatStatusCounts(metrics, language);
  const totalSizeLabel = getTranslation(language, 'explorer_status_total_size', {
    size: metrics.formattedTotalSize
  });

  return (
    <footer
      data-testid="explorer-status-bar"
      className="h-9 px-3 border-t border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] flex items-center justify-between text-xs shrink-0 select-none transition-colors"
    >
      {/* Left: Real Folder and File Counts (strictly excluding "...") */}
      <div
        data-testid="explorer-status-counts"
        className="text-[11px] font-mono text-[#7C8087] dark:text-[#6B7280] truncate"
      >
        {countsLabel}
      </div>

      {/* Right: Aggregate File Size */}
      <div
        data-testid="explorer-status-total-size"
        className="text-[11px] font-mono text-[#7C8087] dark:text-[#6B7280] shrink-0"
      >
        {totalSizeLabel}
      </div>
    </footer>
  );
};
