import React, { useEffect } from 'react';
import { FolderOpen, RotateCcw } from 'lucide-react';
import type { DownloadSettings, LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface DownloadSettingsModalProps {
  isOpen: boolean;
  settings: DownloadSettings | null;
  errorMessage?: string | null;
  onBrowse: () => void;
  onReset: () => void;
  onClose: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Centered Swiss Archive Download Settings Modal (Spec 012 US-6 / T6 / FR-10, NFR-1, NFR-3, EC-11).
 * Enables inspecting, changing (via native OS folder picker), or resetting the default download directory.
 */
export const DownloadSettingsModal: React.FC<DownloadSettingsModalProps> = ({
  isOpen,
  settings,
  errorMessage = null,
  onBrowse,
  onReset,
  onClose,
  language = 'en'
}) => {
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

  const currentPath = settings?.defaultDownloadPath || '';
  const systemDefaultPath = settings?.systemDefaultDownloadPath || '';
  const isAtSystemDefault = Boolean(
    currentPath && systemDefaultPath && currentPath === systemDefaultPath
  );

  return (
    <div
      data-testid="download-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        data-testid="download-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label={getTranslation(language, 'settings_modal_title')}
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] max-w-full rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] shadow-xl flex flex-col overflow-hidden transition-colors"
      >
        {/* Upper Technical Index Header Strip (FR-10.1, NFR-1) */}
        <div className="h-8 px-3 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-[#7C8087] dark:text-[#6B7280] shrink-0">
          <span>{getTranslation(language, 'settings_modal_title')}</span>
          <button
            type="button"
            data-testid="download-settings-close-btn"
            onClick={onClose}
            className="font-mono text-[10.5px] px-1 py-0.5 rounded-[2px] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#111315] dark:hover:text-[#F3F4F6] transition-colors cursor-pointer focus:outline-none"
            aria-label={getTranslation(language, 'about_close')}
          >
            [ESC]
          </button>
        </div>

        {/* Main Content Body (FR-10.2 - FR-10.4) */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-download-path-input"
              className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#7C8087] dark:text-[#6B7280]"
            >
              {getTranslation(language, 'settings_download_path_label')}
            </label>

            <input
              id="settings-download-path-input"
              data-testid="settings-download-path-input"
              type="text"
              readOnly
              value={currentPath}
              title={currentPath}
              className="w-full h-9 px-2.5 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FAF9F6] dark:bg-[#101216] font-mono text-xs text-[#111315] dark:text-[#F3F4F6] select-text cursor-text focus:outline-none focus:border-[#1B44E8] dark:focus:border-[#3B66FF]"
            />

            <p className="font-sans text-[11px] text-[#7C8087] dark:text-[#6B7280] leading-relaxed">
              {getTranslation(language, 'settings_download_path_hint')}
            </p>
          </div>

          {errorMessage && (
            <div
              data-testid="settings-error-banner"
              className="px-2.5 py-2 rounded-[4px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] font-mono text-[11px] text-[#DC2626] dark:text-[#EF4444]"
            >
              {errorMessage}
            </div>
          )}

          {/* Action Controls: Browse & Reset */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="settings-browse-btn"
              onClick={onBrowse}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#1B44E8] dark:border-[#3B66FF] bg-[#1B44E8] dark:bg-[#3B66FF] hover:bg-[#1435B8] dark:hover:bg-[#5278FF] text-white font-display text-xs font-semibold transition-colors cursor-pointer active:scale-[0.99]"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'settings_browse_button')}</span>
            </button>

            <button
              type="button"
              data-testid="settings-reset-btn"
              disabled={isAtSystemDefault}
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-display text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'settings_reset_button')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Footer Strip */}
        <div className="h-10 px-3 bg-[#FAF9F6] dark:bg-[#101216] border-t border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-end shrink-0">
          <button
            type="button"
            data-testid="settings-done-btn"
            onClick={onClose}
            className="px-3 py-1 rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] font-mono text-[11px] transition-colors cursor-pointer"
          >
            {getTranslation(language, 'about_close')}
          </button>
        </div>
      </div>
    </div>
  );
};
