import React from 'react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import { type ActiveNavTab, APP_VERSION } from '../../../../shared/shell-state';
import { getTechnicalIndexStrip } from '../../../../shared/theme';
import { getTranslation } from '../../../../shared/i18n/translations';
import { FileExplorer } from '../explorer/FileExplorer';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: LanguageCode;
  theme?: ThemeMode;
  onSelectNav?: (nav: ActiveNavTab) => void;
}

/**
 * Central Workspace Canvas (Spec 006 US-3, FR-5).
 * Renders FileExplorer when google-drive is active, and renders the Swiss Archive
 * PRYDRIVE // WORKSPACE framed card over .swiss-dot-matrix when prydrive is active.
 */
export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  activeNav,
  language = 'en',
  theme = 'dark',
  onSelectNav
}) => {
  const isDark = theme === 'dark';
  const strip = getTechnicalIndexStrip('workspace', APP_VERSION);

  return (
    <main
      data-testid="workspace-canvas"
      data-active-nav={activeNav}
      className={`flex-1 flex flex-col select-none min-w-0 min-h-0 overflow-hidden transition-colors ${
        activeNav === 'prydrive'
          ? 'swiss-dot-matrix bg-[#FAF9F6] dark:bg-[#101216] items-center justify-center p-8'
          : isDark
            ? 'bg-[#181C23] text-slate-100'
            : 'bg-white text-slate-900'
      }`}
    >
      {activeNav === 'google-drive' ? (
        <FileExplorer language={language} theme={theme} />
      ) : (
        <div
          data-testid="prydrive-workspace-card"
          className="max-w-[420px] w-full rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] overflow-hidden shadow-sm text-center transition-colors"
        >
          {/* Upper Technical Index Strip (FR-6) */}
          <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none">
            <span>{strip.leftLabel}</span>
            <span>{strip.rightLabel}</span>
          </div>

          <div className="p-8 flex flex-col items-center">
            <h2 className="font-display text-xl font-bold mb-2 text-[#111315] dark:text-[#F3F4F6]">
              {getTranslation(language, 'canvas_prydrive_title')}
            </h2>
            <p className="font-sans text-xs text-[#4A4E54] dark:text-[#9CA3AF] mb-6 leading-relaxed max-w-xs">
              {getTranslation(language, 'canvas_placeholder_desc')}
            </p>
            {onSelectNav && (
              <button
                type="button"
                onClick={() => onSelectNav('google-drive')}
                className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-[4px] font-display border border-[#1B44E8] dark:border-[#3B66FF] bg-[#1B44E8] dark:bg-[#3B66FF] text-white hover:bg-[#1435B8] dark:hover:bg-[#5278FF] transition-colors shadow-xs active:scale-[0.99]"
              >
                {getTranslation(language, 'nav_google_drive_tooltip')}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
