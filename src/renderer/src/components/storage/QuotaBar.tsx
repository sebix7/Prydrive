import React from 'react';
import { RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import type { StorageQuota } from '../../../../shared/types';

export interface QuotaBarProps {
  quota: StorageQuota | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({
  quota,
  isLoading,
  error,
  onRetry
}) => {
  // Skeleton State (FR-9)
  if (isLoading) {
    return (
      <div
        data-testid="quota-skeleton"
        className="flex items-center gap-2.5 min-w-[210px] animate-pulse"
      >
        <div className="w-4 h-4 bg-slate-200 rounded-md shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2.5 bg-slate-200 rounded-full w-24" />
          <div className="h-1.5 bg-slate-200 rounded-full w-full" />
        </div>
      </div>
    );
  }

  // Fallback Error State (FR-11)
  if (error || !quota) {
    return (
      <div
        data-testid="quota-error"
        className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/90 border border-amber-200/60 px-2.5 py-1 rounded-lg"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span className="truncate font-medium">Storage details unavailable</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            title="Retry loading storage quota"
            className="p-1 hover:bg-amber-200/50 rounded transition-colors text-amber-800"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // Progress Bar Color based on usage percentage
  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <div
      data-testid="quota-bar"
      className="flex items-center gap-2.5 min-w-[220px]"
    >
      <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
          {quota.isUnmetered ? (
            <span>{quota.formattedUsed} used (Unlimited)</span>
          ) : (
            <>
              <span>
                {quota.formattedUsed} / {quota.formattedTotal}
              </span>
              <span className="text-slate-400 font-normal">{quota.percentage}%</span>
            </>
          )}
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              quota.isUnmetered ? 'bg-blue-300 w-full opacity-60' : getProgressColor(quota.percentage)
            }`}
            style={{ width: quota.isUnmetered ? '100%' : `${quota.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
