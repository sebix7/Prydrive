import React from 'react';
import { RotateCw } from 'lucide-react';
import type { FolderMetrics, LanguageCode, ThemeMode } from '../../../../shared/types';
import { formatStatusCounts } from '../../../../shared/explorer-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ExplorerStatusBarProps {
  metrics: FolderMetrics;
  isLoading?: boolean;
  onRefresh: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Persistent bottom telemetry bar inside the central workspace canvas (FR-12, FR-13).
 * Displays manual refresh control, real folder/file counts (excluding "..."), and aggregate file size.
 */
export const ExplorerStatusBar: React.FC<ExplorerStatusBarProps> = ({
  metrics,
  isLoading = false,
  onRefresh,
  language = 'en',
  theme = 'dark'
}) => {
  const refreshLabel = getTranslation(language, 'explorer_refresh');
  const countsLabel = formatStatusCounts(metrics, language);
  const totalSizeLabel = getTranslation(language, 'explorer_status_total_size', {
    size: metrics.formattedTotalSize
  });
  const isDark = theme === 'dark';

  return (
    <footer
      data-testid="explorer-status-bar"
      className="h-9 px-3 border-t border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] flex items-center justify-between text-xs shrink-0 select-none transition-colors"
    >
      {/* Left: Manual Refresh Action */}
      <div className="flex items-center">
        <button
          type="button"
          data-testid="explorer-refresh-button"
          onClick={onRefresh}
          disabled={isLoading}
          title={refreshLabel}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-[#111315] dark:text-[#F3F4F6] text-[11px] font-mono font-medium shadow-xs active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF]"
        >
          <RotateCw
            className={`w-3.5 h-3.5 text-[#1B44E8] dark:text-[#3B66FF] ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          <span>{refreshLabel}</span>
        </button>
      </div>

      {/* Center: Real Folder and File Counts (strictly excluding "...") */}
      <div
        data-testid="explorer-status-counts"
        className="text-[11px] font-mono text-[#7C8087] dark:text-[#6B7280] truncate px-3"
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
