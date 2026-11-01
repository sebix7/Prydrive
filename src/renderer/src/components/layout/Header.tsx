import React from 'react';
import { Cloud, LogOut, User } from 'lucide-react';
import type { UserProfile, StorageQuota, LanguageCode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import { QuotaBar } from '../storage/QuotaBar';
import { LanguageToggle } from '../ui/LanguageToggle';

export interface HeaderProps {
  userProfile: UserProfile;
  quota: StorageQuota | null;
  isLoadingQuota: boolean;
  quotaError: string | null;
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onRetryQuota?: () => void;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  quota,
  isLoadingQuota,
  quotaError,
  language = 'en',
  onLanguageChange,
  onRetryQuota,
  onDisconnect
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm tracking-tight leading-none">
            {getTranslation(language, 'app_name')}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
            {getTranslation(language, 'service_name')}
          </span>
        </div>
      </div>

      {/* Right Controls: Quota, Language Toggle, User Badge & Disconnect */}
      <div className="flex items-center gap-5">
        {/* Storage Quota Indicator (FR-9, FR-10, FR-11, EC-3) */}
        <QuotaBar
          quota={quota}
          isLoading={isLoadingQuota}
          error={quotaError}
          language={language}
          onRetry={onRetryQuota}
        />

        <div className="h-6 w-px bg-slate-200" />

        {/* Language Switch Control (FR-15, US-6) */}
        {onLanguageChange && (
          <LanguageToggle
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
        )}

        <div className="h-6 w-px bg-slate-200" />

        {/* User Identity & Disconnect */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200/70 rounded-full">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span
              data-testid="user-email"
              className="text-xs font-medium text-slate-700 max-w-[180px] truncate"
              title={userProfile.email}
            >
              {userProfile.email}
            </span>
          </div>

          {onDisconnect && (
            <button
              type="button"
              data-testid="disconnect-button"
              onClick={onDisconnect}
              title={getTranslation(language, 'disconnect')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'disconnect')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
