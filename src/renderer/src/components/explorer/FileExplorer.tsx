import React from 'react';
import { Loader2, FolderOpen, AlertCircle, RotateCw } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import { useDriveExplorer } from '../../hooks/useDriveExplorer';
import { FileTableRow } from './FileTableRow';
import { ParentNavRow } from './ParentNavRow';
import { ExplorerStatusBar } from './ExplorerStatusBar';

export interface FileExplorerProps {
  language?: LanguageCode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ language = 'en' }) => {
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

  return (
    <div
      data-testid="file-explorer"
      className="flex-1 flex flex-col w-full h-full bg-[#0D1117] text-slate-100 select-none min-w-0 overflow-hidden"
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
          className="sticky top-0 z-10 h-9 flex items-center px-3 bg-[#161B22] border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0"
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
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-slate-400"
          >
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <span className="text-xs font-medium tracking-wide text-slate-400 animate-pulse">
              {getTranslation(language, 'explorer_loading')}
            </span>
          </div>
        ) : errorMessage ? (
          <div role="rowgroup" className="flex-1 flex flex-col">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} />
            )}
            <div
              data-testid="explorer-error-banner"
              className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div className="max-w-md space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  {getTranslation(language, 'explorer_error_title')}
                </p>
                <p className="text-xs text-slate-400">{errorMessage}</p>
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
              <ParentNavRow onNavigateUp={navigateUp} language={language} />
            )}
            {items.length === 0 ? (
              <div
                data-testid="explorer-empty-state"
                className="flex-1 flex flex-col items-center justify-center gap-2.5 p-8 text-slate-400"
              >
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                  <FolderOpen className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-xs font-medium text-slate-400">
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
                  />
                ))}
                {isLoadingMore && (
                  <div
                    data-testid="explorer-pagination-spinner"
                    className="h-9 flex items-center justify-center gap-2 text-xs text-slate-400 py-2"
                  >
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
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
      />
    </div>
  );
};
