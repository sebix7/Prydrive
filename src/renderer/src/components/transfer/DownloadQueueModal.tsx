import React, { useEffect, useMemo } from 'react';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  ExternalLink,
  File,
  X,
  RotateCw,
  FolderOpen,
  AlertTriangle,
  Download
} from 'lucide-react';
import type {
  DownloadTransferItem,
  StorageItemType,
  LanguageCode,
  ThemeMode
} from '../../../../shared/types';
import {
  partitionTransfersByStatus,
  formatTransferBytes
} from '../../../../shared/download-helpers';
import { resolveItemCategory } from '../../../../shared/item-details';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface DownloadQueueModalProps {
  isOpen: boolean;
  transfers: DownloadTransferItem[];
  onClose: () => void;
  onCancel: (transferId: string) => void;
  onRetry: (transferId: string) => void;
  onOpenFolder: (filePath: string) => void;
  onClearCompleted: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

function renderTransferIcon(iconType: StorageItemType, isDirectory: boolean): React.ReactNode {
  if (isDirectory) {
    return <FileArchive className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF]" />;
  }
  switch (iconType) {
    case 'folder':
      return <Folder className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF]" />;
    case 'document':
      return <FileText className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF]" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-4 h-4 text-[#0D8A52] dark:text-[#10B981]" />;
    case 'presentation':
      return <Presentation className="w-4 h-4 text-[#D95D1E] dark:text-[#F97316]" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />;
    case 'image':
      return <FileImage className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    case 'video':
      return <FileVideo className="w-4 h-4 text-pink-500 dark:text-pink-400" />;
    case 'audio':
      return <FileAudio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    case 'archive':
      return <FileArchive className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    case 'shortcut':
      return <ExternalLink className="w-4 h-4 text-[#7C8087] dark:text-[#6B7280]" />;
    default:
      return <File className="w-4 h-4 text-[#7C8087] dark:text-[#6B7280]" />;
  }
}

function formatCompletionTime(timestamp?: number): string {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Centered Swiss Archive Download Queue Modal (Spec 012 US-5 / T5 / FR-7, FR-8, FR-9, EC-3, EC-4, EC-8, EC-12).
 * Presents active, queued, failed, and completed transfers with individual lifecycle controls.
 */
export const DownloadQueueModal: React.FC<DownloadQueueModalProps> = ({
  isOpen,
  transfers,
  onClose,
  onCancel,
  onRetry,
  onOpenFolder,
  onClearCompleted,
  language = 'en'
}) => {
  const partitioned = useMemo(() => partitionTransfersByStatus(transfers), [transfers]);

  // Dismiss on Escape keydown (FR-9)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const renderTransferRow = (item: DownloadTransferItem, queueIndex?: number): React.ReactNode => {
    const categoryLabel = resolveItemCategory(item.iconType, item.isDirectory, language);
    const isDownloading = item.status === 'downloading';
    const isQueued = item.status === 'queued';
    const isCompleted = item.status === 'completed';
    const isFailed = item.status === 'failed';
    const isCancelled = item.status === 'cancelled';

    const transferredFormatted = formatTransferBytes(item.transferredBytes);
    const totalFormatted =
      item.totalBytes !== null ? formatTransferBytes(item.totalBytes) : null;
    const completedTime = formatCompletionTime(item.completedAt);

    return (
      <div
        key={item.id}
        data-testid={`transfer-row-${item.id}`}
        className="min-h-[56px] px-3 py-2.5 flex items-center justify-between gap-3 border-b border-[#ECEAE3] dark:border-[#222730] last:border-b-0 transition-colors"
      >
        {/* Left: Item Icon Tile */}
        <div className="w-8 h-8 rounded-[4px] border border-[#DFDDD6] dark:border-[#222730] bg-[#FAF9F6] dark:bg-[#101216] flex items-center justify-center shrink-0">
          {renderTransferIcon(item.iconType, item.isDirectory)}
        </div>

        {/* Center: Filename, Progress Bar, and Telemetry Metadata */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span
              className="truncate font-sans font-medium text-xs text-[#111315] dark:text-[#F3F4F6]"
              title={item.name}
            >
              {item.name}
            </span>
            {isDownloading && (
              <span className="shrink-0 font-mono text-[10.5px] font-semibold text-[#1B44E8] dark:text-[#3B66FF]">
                {item.progressPercent}%
              </span>
            )}
          </div>

          {isDownloading && (
            <>
              <div className="h-1 w-full bg-[#ECEAE3] dark:bg-[#2C323D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B44E8] dark:bg-[#3B66FF] transition-all duration-200"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280]">
                <span className="truncate">{categoryLabel}</span>
                <span className="shrink-0">
                  {totalFormatted
                    ? `${transferredFormatted} / ${totalFormatted}`
                    : transferredFormatted}
                </span>
              </div>
            </>
          )}

          {isQueued && (
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280]">
              <span className="truncate">
                {categoryLabel}
                {totalFormatted ? ` · ${totalFormatted}` : ''}
              </span>
              <span className="shrink-0 px-1.5 py-0.5 rounded-[3px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-[#4A4E54] dark:text-[#9CA3AF]">
                {getTranslation(language, 'transfers_status_queued')}
                {queueIndex !== undefined ? ` #${queueIndex}` : ''}
              </span>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[#0D8A52] dark:text-[#10B981] font-semibold shrink-0">
                  {getTranslation(language, 'transfers_status_completed')}
                </span>
                {totalFormatted && <span className="shrink-0">· {totalFormatted}</span>}
                {item.warning && (
                  <span
                    className="inline-flex items-center gap-1 text-[#D95D1E] dark:text-[#F97316] truncate"
                    title={item.warning}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {getTranslation(language, 'transfers_warning_partial')}
                    </span>
                  </span>
                )}
              </div>
              {completedTime && <span className="shrink-0">{completedTime}</span>}
            </div>
          )}

          {isFailed && (
            <div
              className="font-mono text-[10px] text-[#DC2626] dark:text-[#EF4444] truncate"
              title={item.error || getTranslation(language, 'transfers_status_failed')}
            >
              {item.error || getTranslation(language, 'transfers_status_failed')}
            </div>
          )}

          {isCancelled && (
            <div className="font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280]">
              {getTranslation(language, 'transfers_status_cancelled')}
            </div>
          )}
        </div>

        {/* Right: Contextual Lifecycle Action Button */}
        <div className="shrink-0">
          {(isDownloading || isQueued) && (
            <button
              type="button"
              data-testid={`transfer-cancel-btn-${item.id}`}
              onClick={() => onCancel(item.id)}
              title={getTranslation(language, 'transfers_cancel')}
              aria-label={getTranslation(language, 'transfers_cancel')}
              className="w-7 h-7 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#DC2626] dark:hover:border-[#EF4444] hover:text-[#DC2626] dark:hover:text-[#EF4444] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              data-testid={`transfer-open-folder-btn-${item.id}`}
              onClick={() => onOpenFolder(item.destinationPath)}
              title={getTranslation(language, 'transfers_open_folder')}
              aria-label={getTranslation(language, 'transfers_open_folder')}
              className="w-7 h-7 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8]"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {(isFailed || isCancelled) && (
            <button
              type="button"
              data-testid={`transfer-retry-btn-${item.id}`}
              onClick={() => onRetry(item.id)}
              title={getTranslation(language, 'transfers_retry')}
              aria-label={getTranslation(language, 'transfers_retry')}
              className="w-7 h-7 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8]"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (
    titleKey: 'transfers_section_active' | 'transfers_section_failed' | 'transfers_section_completed',
    sectionItems: DownloadTransferItem[],
    includeQueuePosition = false
  ): React.ReactNode => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="flex flex-col">
        <div className="h-6 px-3 bg-[#FAF9F6] dark:bg-[#101216] border-b border-[#DFDDD6] dark:border-[#222730] flex items-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7C8087] dark:text-[#6B7280]">
          {getTranslation(language, titleKey)} ({sectionItems.length})
        </div>
        {sectionItems.map((item, idx) =>
          renderTransferRow(item, includeQueuePosition ? idx + 1 : undefined)
        )}
      </div>
    );
  };

  return (
    <div
      data-testid="download-queue-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        data-testid="download-queue-modal"
        role="dialog"
        aria-modal="true"
        aria-label={getTranslation(language, 'transfers_modal_title')}
        onClick={(e) => e.stopPropagation()}
        className="w-[480px] max-w-full max-h-[540px] rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] shadow-xl flex flex-col overflow-hidden transition-colors"
      >
        {/* Upper Technical Index Header Strip (FR-7.1) */}
        <div className="h-8 px-3 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-[#7C8087] dark:text-[#6B7280] shrink-0">
          <span>{getTranslation(language, 'transfers_modal_title')}</span>
          <button
            type="button"
            data-testid="download-queue-close-btn"
            onClick={onClose}
            className="font-mono text-[10.5px] px-1 py-0.5 rounded-[2px] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#111315] dark:hover:text-[#F3F4F6] transition-colors cursor-pointer focus:outline-none"
            aria-label={getTranslation(language, 'about_close')}
          >
            [ESC]
          </button>
        </div>

        {/* Scrollable Sectioned Transfers List (FR-7.2 - FR-7.6) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {transfers.length === 0 ? (
            <div
              data-testid="download-queue-empty"
              className="py-12 px-6 flex flex-col items-center justify-center gap-2.5 text-center text-[#7C8087] dark:text-[#6B7280]"
            >
              <div className="p-2.5 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E]">
                <Download className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs">
                {getTranslation(language, 'transfers_empty')}
              </span>
            </div>
          ) : (
            <>
              {renderSection('transfers_section_active', partitioned.inFlight, true)}
              {renderSection('transfers_section_failed', partitioned.failed)}
              {renderSection('transfers_section_completed', partitioned.finished)}
            </>
          )}
        </div>

        {/* Bottom Footer Strip with Summary & Clear Completed (FR-7.7) */}
        <div className="h-9 px-3 bg-[#FAF9F6] dark:bg-[#101216] border-t border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[11px] text-[#7C8087] dark:text-[#6B7280] shrink-0">
          <span data-testid="download-queue-footer-summary">
            {getTranslation(language, 'transfers_footer_summary', {
              completed: partitioned.completedCount,
              active: partitioned.activeCount
            })}
          </span>
          <button
            type="button"
            data-testid="download-queue-clear-btn"
            disabled={!partitioned.hasClearable}
            onClick={onClearCompleted}
            className="px-2 py-1 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#C9C6BD] dark:disabled:hover:border-[#2C323D] disabled:hover:text-[#111315] dark:disabled:hover:text-[#F3F4F6] transition-colors cursor-pointer font-mono text-[10.5px]"
          >
            {getTranslation(language, 'transfers_clear_completed')}
          </button>
        </div>
      </div>
    </div>
  );
};
