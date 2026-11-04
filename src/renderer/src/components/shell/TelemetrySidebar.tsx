import React from 'react';
import { ChevronLeft, ChevronRight, HardDrive } from 'lucide-react';
import type { StorageQuota, LanguageCode } from '../../../../shared/types';
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
  language?: LanguageCode;
}

export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({
  userEmail,
  storageQuota,
  isLoadingQuota = false,
  quotaError = null,
  isExpanded,
  onToggle,
  onRefreshQuota,
  language = 'en'
}) => {
  const sidebarStyles = getSidebarClasses(isExpanded);
  const truncatedEmail = truncateEmail(userEmail, 24);
  const toggleTooltip = getTranslation(
    language,
    isExpanded ? 'sidebar_collapse_tooltip' : 'sidebar_expand_tooltip'
  );

  return (
    <aside
      data-testid="shell-sidebar-zone"
      className={`bg-[#161B22] relative shrink-0 select-none ${sidebarStyles.container}`}
      aria-label="Storage telemetry sidebar"
    >
      {/* Floating Circular Divider Toggle Button (FR-11 / FR-12) */}
      <button
        type="button"
        data-testid="sidebar-toggle-btn"
        onClick={onToggle}
        title={toggleTooltip}
        aria-label={toggleTooltip}
        aria-expanded={isExpanded}
        className={`absolute top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-[#161B22] border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 ${
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
        className={`w-[260px] h-full flex flex-col p-4 space-y-5 overflow-hidden ${sidebarStyles.inner}`}
      >
        {/* 1. Provider Branding Section */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
            <GoogleDriveLogo className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-slate-100 tracking-tight leading-snug">
              Google Drive
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{getTranslation(language, 'sidebar_connected')}</span>
            </div>
          </div>
        </div>

        {/* 2. User Account Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            {getTranslation(language, 'sidebar_account')}
          </span>
          <div
            data-testid="sidebar-user-email"
            className="text-xs text-slate-200 font-mono truncate cursor-default"
            title={userEmail}
          >
            {truncatedEmail}
          </div>
        </div>

        {/* 3. Storage Quota Telemetry Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{getTranslation(language, 'sidebar_storage')}</span>
            </span>
          </div>
          <QuotaBar
            quota={storageQuota}
            isLoading={isLoadingQuota}
            error={quotaError}
            language={language}
            onRetry={onRefreshQuota}
            variant="dark"
          />
        </div>
      </div>
    </aside>
  );
};
