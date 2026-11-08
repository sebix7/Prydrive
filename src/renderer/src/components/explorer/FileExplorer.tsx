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
      className={`flex-1 flex flex-col w-full h-full select-none min-w-0 overflow-hidden transition-colors ${
        isDark ? 'bg-[#0D1117] text-slate-100' : 'bg-white text-slate-900'
      }`}
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
          className={`sticky top-0 z-10 h-9 flex items-center px-3 border-b text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors ${
            isDark
              ? 'bg-[#161B22] border-slate-800 text-slate-400'
              : 'bg-slate-100/95 border-slate-200 text-slate-600'
          }`}
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
            className={`flex-1 flex flex-col items-center justify-center gap-3 p-8 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <div
              className={`p-3 rounded-2xl border shadow-inner ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <Loader2
                className={`w-6 h-6 animate-spin ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium tracking-wide animate-pulse ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
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
              <div
                className={`p-3 rounded-2xl border ${
                  isDark
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}
                />
              </div>
              <div className="max-w-md space-y-1">
                <p
                  className={`text-sm font-semibold ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {getTranslation(language, 'explorer_error_title')}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                data-testid="explorer-retry-button"
                onClick={refreshDirectory}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
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
                className={`flex-1 flex flex-col items-center justify-center gap-2.5 p-8 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl border ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-800'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <FolderOpen
                    className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
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
                    className={`h-9 flex items-center justify-center gap-2 text-xs py-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <Loader2
                      className={`w-3.5 h-3.5 animate-spin ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    />
                    <span>
                      {getTranslation(language, 'explorer_loading_more')}
                    </span>
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
