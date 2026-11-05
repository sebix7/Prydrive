import React from 'react';
import { RotateCw } from 'lucide-react';
import type { FolderMetrics, LanguageCode } from '../../../../shared/types';
import { formatStatusCounts } from '../../../../shared/explorer-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ExplorerStatusBarProps {
  metrics: FolderMetrics;
  isLoading?: boolean;
  onRefresh: () => void;
  language?: LanguageCode;
}

/**
 * Persistent bottom telemetry bar inside the central workspace canvas (FR-12, FR-13).
 * Displays manual refresh control, real folder/file counts (excluding "..."), and aggregate file size.
 */
export const ExplorerStatusBar: React.FC<ExplorerStatusBarProps> = ({
  metrics,
  isLoading = false,
  onRefresh,
  language = 'en'
}) => {
  const refreshLabel = getTranslation(language, 'explorer_refresh');
  const countsLabel = formatStatusCounts(metrics, language);
  const totalSizeLabel = getTranslation(language, 'explorer_status_total_size', {
    size: metrics.formattedTotalSize
  });

  return (
    <footer
      data-testid="explorer-status-bar"
      className="h-9 px-3 bg-[#161B22] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 select-none"
    >
      {/* Left: Manual Refresh Action */}
      <div className="flex items-center">
        <button
          type="button"
          data-testid="explorer-refresh-button"
          onClick={onRefresh}
          disabled={isLoading}
          title={refreshLabel}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
        >
          <RotateCw
            className={`w-3.5 h-3.5 text-blue-400 ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          <span>{refreshLabel}</span>
        </button>
      </div>

      {/* Center: Real Folder and File Counts (strictly excluding "...") */}
      <div
        data-testid="explorer-status-counts"
        className="text-[11px] font-medium text-slate-300 truncate px-3"
      >
        {countsLabel}
      </div>

      {/* Right: Aggregate File Size */}
      <div
        data-testid="explorer-status-total-size"
        className="text-[11px] font-mono text-slate-300 shrink-0"
      >
        {totalSizeLabel}
      </div>
    </footer>
  );
};
