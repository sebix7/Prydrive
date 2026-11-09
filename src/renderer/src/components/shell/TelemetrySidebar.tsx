import React from 'react';
import { ChevronLeft, ChevronRight, HardDrive, LogOut } from 'lucide-react';
import type { StorageQuota, LanguageCode, ThemeMode } from '../../../../shared/types';
import { truncateEmail, getSidebarClasses } from '../../../../shared/shell-state';
import { getTranslation } from '../../../../shared/i18n/translations';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';
import { QuotaBar } from '../storage/QuotaBar';

export interface TelemetrySidebarProps {
  userEmail: string;
  storageQuota: StorageQuota | null;
  isLoadingQuota?: boolean;
  quotaError?: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onRefreshQuota: () => void;
  onDisconnect?: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Swiss Archive Collapsible Right Telemetry Sidebar (Spec 006 FR-15, FR-16).
 * Houses Google Drive provider status, Account card, Storage quota card,
 * and the bottom-pinned full-width danger Disconnect button when expanded.
 */
export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({
  userEmail,
  storageQuota,
  isLoadingQuota = false,
  quotaError = null,
  isExpanded,
  onToggle,
  onRefreshQuota,
  onDisconnect,
  language = 'en',
  theme = 'dark'
}) => {
  const sidebarStyles = getSidebarClasses(isExpanded, theme);
  const truncatedEmail = truncateEmail(userEmail, 24);
  const isDark = theme === 'dark';
  const toggleTooltip = getTranslation(
    language,
    isExpanded ? 'sidebar_collapse_tooltip' : 'sidebar_expand_tooltip'
  );

  return (
    <aside
      data-testid="shell-sidebar-zone"
      className={`h-full flex flex-col relative shrink-0 select-none bg-[#F2F0EA] dark:bg-[#15181E] ${sidebarStyles.container}`}
      aria-label="Storage telemetry sidebar"
    >
      {/* Floating Circular Divider Toggle Button (FR-15) */}
      <button
        type="button"
        data-testid="sidebar-toggle-btn"
        onClick={onToggle}
        title={toggleTooltip}
        aria-label={toggleTooltip}
        aria-expanded={isExpanded}
        className={`absolute top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] shadow-md flex items-center justify-center transition-all duration-200 hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] active:scale-95 ${
          isExpanded ? '-left-3.5' : '-left-9'
        }`}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 transition-transform duration-150" />
        ) : (
          <ChevronLeft className="w-4 h-4 transition-transform duration-150" />
        )}
      </button>

      {/* Internal Content Container (260px fixed width, clipped during collapse) */}
      <div
        className={`w-[260px] h-full flex-1 flex flex-col justify-between p-4 overflow-hidden ${sidebarStyles.inner}`}
      >
        {/* Upper Telemetry Section */}
        <div className="flex flex-col gap-3.5">
          {/* 1. Provider Branding Section */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#DFDDD6] dark:border-[#222730]">
            <div className="w-10 h-10 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] flex items-center justify-center shrink-0 shadow-xs">
              <GoogleDriveLogo className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold font-display tracking-tight leading-snug text-[#111315] dark:text-[#F3F4F6]">
                Google Drive
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#0D8A52] dark:text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#0D8A52] dark:bg-[#10B981]" />
                <span>{getTranslation(language, 'sidebar_connected')}</span>
              </div>
            </div>
          </div>

          {/* 2. User Account Card (FR-15) */}
          <div className="border border-[#C9C6BD] dark:border-[#2C323D] rounded-[6px] p-3.5 bg-[#FFFFFF] dark:bg-[#181C23] flex flex-col gap-1 shadow-xs transition-colors">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
              {getTranslation(language, 'sidebar_account')}
            </span>
            <div
              data-testid="sidebar-user-email"
              className="text-xs font-mono truncate cursor-default text-[#111315] dark:text-[#F3F4F6]"
              title={userEmail}
            >
              {truncatedEmail}
            </div>
          </div>

          {/* 3. Storage Quota Telemetry Section (FR-15) */}
          <div className="border border-[#C9C6BD] dark:border-[#2C323D] rounded-[6px] p-3.5 bg-[#FFFFFF] dark:bg-[#181C23] flex flex-col gap-2 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-[#7C8087] dark:text-[#6B7280]" />
                <span>{getTranslation(language, 'sidebar_storage')}</span>
              </span>
            </div>
            <QuotaBar
              quota={storageQuota}
              isLoading={isLoadingQuota}
              error={quotaError}
              language={language}
              onRetry={onRefreshQuota}
              variant={theme}
            />
          </div>
        </div>

        {/* 4. Bottom-Pinned Disconnect Button (FR-16) */}
        {onDisconnect && (
          <div className="pt-3 mt-auto">
            <button
              type="button"
              data-testid="sidebar-disconnect-btn"
              onClick={onDisconnect}
              className="w-full py-2.5 px-3 rounded-[4px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] dark:hover:bg-[#EF4444] hover:text-white font-display text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.99]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'disconnect')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
