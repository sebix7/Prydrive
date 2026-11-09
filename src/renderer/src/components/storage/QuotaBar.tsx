import React from 'react';
import { RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import type { StorageQuota, LanguageCode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';
import { getQuotaProgressColorClass } from '../../../../shared/shell-state';

export interface QuotaBarProps {
  quota: StorageQuota | null;
  isLoading: boolean;
  error: string | null;
  language?: LanguageCode;
  onRetry?: () => void;
  variant?: 'light' | 'dark';
}

export const QuotaBar: React.FC<QuotaBarProps> = ({
  quota,
  isLoading,
  error,
  language = 'en',
  onRetry,
  variant = 'dark'
}) => {
  const isDark = variant === 'dark';

  // Skeleton State (FR-9)
  if (isLoading) {
    return (
      <div
        data-testid="quota-skeleton"
        className="flex items-center gap-2.5 min-w-[210px] animate-pulse"
      >
        <div
          className={`w-4 h-4 rounded-md shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
        />
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className={`h-2.5 rounded-full w-24 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
          />
          <div
            className={`h-1.5 rounded-full w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
          />
        </div>
      </div>
    );
  }

  // Fallback Error State (FR-11)
  if (error || !quota) {
    return (
      <div
        data-testid="quota-error"
        className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${
          isDark
            ? 'text-amber-300 bg-amber-950/30 border-amber-800/50'
            : 'text-amber-700 bg-amber-50/90 border-amber-200/60'
        }`}
      >
        <AlertCircle
          className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
        />
        <span className="truncate font-medium flex-1">
          {getTranslation(language, 'quota_unavailable')}
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            title={getTranslation(language, 'quota_retry_tooltip')}
            className={`p-1 rounded transition-colors ${
              isDark
                ? 'hover:bg-amber-900/40 text-amber-300 hover:text-amber-200'
                : 'hover:bg-amber-200/50 text-amber-800'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="quota-bar"
      className="flex items-center gap-2.5 min-w-[200px] w-full"
    >
      <HardDrive className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#6B7280]' : 'text-[#7C8087]'}`} />
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div
          className={`flex items-center justify-between font-mono text-[11px] ${
            isDark ? 'text-[#9CA3AF]' : 'text-[#4A4E54]'
          }`}
        >
          {quota.isUnmetered ? (
            <span className="truncate">
              {getTranslation(language, 'quota_unmetered', { used: quota.formattedUsed })}
            </span>
          ) : (
            <>
              <span className="truncate">
                {getTranslation(language, 'quota_usage_format', {
                  used: quota.formattedUsed,
                  total: quota.formattedTotal
                })}
              </span>
              <span className={`font-mono text-[10px] ml-1 shrink-0 ${isDark ? 'text-[#6B7280]' : 'text-[#7C8087]'}`}>
                {quota.percentage}%
              </span>
            </>
          )}
        </div>
        <div
          className={`w-full h-1.5 rounded-[2px] overflow-hidden border ${
            isDark ? 'bg-[#15181E] border-[#2C323D]' : 'bg-[#F2F0EA] border-[#C9C6BD]'
          }`}
        >
          <div
            className={`h-full rounded-[1px] transition-all duration-300 ${getQuotaProgressColorClass(
              quota.percentage,
              quota.isUnmetered,
              variant
            )}`}
            style={{ width: quota.isUnmetered ? '100%' : `${quota.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
