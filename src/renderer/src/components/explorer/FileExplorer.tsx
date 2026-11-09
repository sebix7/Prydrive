import React from 'react';
import { Loader2, FolderOpen, AlertCircle, RotateCw } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import { useDriveExplorer } from '../../hooks/useDriveExplorer';
import { FileTableRow } from './FileTableRow';
import { ParentNavRow } from './ParentNavRow';
import { ExplorerStatusBar } from './ExplorerStatusBar';

export interface FileExplorerProps {
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  language = 'en',
  theme = 'dark'
}) => {
  const {
    atRoot,
    items,
    selectedItemId,
    isLoading,
    isLoadingMore,
    errorMessage,
    metrics,
    selectItem,
    openItem,
    navigateUp,
    refreshDirectory,
    handleScroll
  } = useDriveExplorer();

  const isDark = theme === 'dark';

  return (
    <div
      data-testid="file-explorer"
      className="flex-1 flex flex-col w-full h-full select-none min-w-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] transition-colors"
    >
      {/* Scrollable File and Folder List with Sticky Header for 100% Column Alignment */}
      <div
        role="table"
        data-testid="explorer-table-body"
        onScroll={handleScroll}
        className="flex-1 flex flex-col overflow-y-auto min-h-0"
      >
        {/* Compact Sticky Table Header */}
        <div
          role="row"
          data-testid="explorer-table-header"
          className="sticky top-0 z-10 h-9 flex items-center px-3 border-b border-[#C9C6BD] dark:border-[#2C323D] border-l-[3px] border-transparent bg-[#F2F0EA] dark:bg-[#15181E] text-[#7C8087] dark:text-[#6B7280] font-mono text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
        >
          <div className="w-10 text-center shrink-0">
            {getTranslation(language, 'explorer_col_type')}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            {getTranslation(language, 'explorer_col_name')}
          </div>
          <div className="w-44 shrink-0">
            {getTranslation(language, 'explorer_col_created')}
          </div>
          <div className="w-24 shrink-0 text-right pr-2">
            {getTranslation(language, 'explorer_col_size')}
          </div>
        </div>

        {/* Centered Loading Spinner, Error Banner, Empty Folder State, or Rows */}
        {isLoading ? (
          <div
            data-testid="explorer-loading-spinner"
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-[#7C8087] dark:text-[#6B7280]"
          >
            <div className="p-3 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B44E8] dark:text-[#3B66FF]" />
            </div>
            <span className="font-mono text-xs tracking-wider animate-pulse text-[#7C8087] dark:text-[#6B7280]">
              {getTranslation(language, 'explorer_loading')}
            </span>
          </div>
        ) : errorMessage ? (
          <div role="rowgroup" className="flex-1 flex flex-col">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} theme={theme} />
            )}
            <div
              data-testid="explorer-error-banner"
              className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <div className="p-3 rounded-[6px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] text-[#DC2626] dark:text-[#EF4444]">
                <AlertCircle className="w-6 h-6 text-[#DC2626] dark:text-[#EF4444]" />
              </div>
              <div className="max-w-md space-y-1">
                <p className="font-display text-sm font-semibold text-[#111315] dark:text-[#F3F4F6]">
                  {getTranslation(language, 'explorer_error_title')}
                </p>
                <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280]">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                data-testid="explorer-retry-button"
                onClick={refreshDirectory}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1B44E8] dark:bg-[#3B66FF] hover:bg-[#1231B5] dark:hover:bg-[#5A7FFF] text-white font-display text-xs font-semibold shadow-xs transition-colors active:scale-[0.99]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{getTranslation(language, 'explorer_retry')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div role="rowgroup" className="flex-1 flex flex-col">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} theme={theme} />
            )}
            {items.length === 0 ? (
              <div
                data-testid="explorer-empty-state"
                className="flex-1 flex flex-col items-center justify-center gap-2.5 p-8 text-[#7C8087] dark:text-[#6B7280]"
              >
                <div className="p-3 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] shadow-xs">
                  <FolderOpen className="w-6 h-6 text-[#7C8087] dark:text-[#6B7280]" />
                </div>
                <span className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280]">
                  {getTranslation(language, 'explorer_empty_folder')}
                </span>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <FileTableRow
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={selectItem}
                    onDoubleClick={openItem}
                    theme={theme}
                  />
                ))}
                {isLoadingMore && (
                  <div
                    data-testid="explorer-pagination-spinner"
                    className="h-9 flex items-center justify-center gap-2 font-mono text-xs py-2 text-[#7C8087] dark:text-[#6B7280]"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B44E8] dark:text-[#3B66FF]" />
                    <span>{getTranslation(language, 'explorer_loading_more')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Persistent Bottom Status Bar (FR-12, FR-13) */}
      <ExplorerStatusBar
        metrics={metrics}
        isLoading={isLoading}
        onRefresh={refreshDirectory}
        language={language}
        theme={theme}
      />
    </div>
  );
};
