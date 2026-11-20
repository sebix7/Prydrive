import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowDown, Check, AlertCircle } from 'lucide-react';
import type { DownloadTransferItem, LanguageCode, ThemeMode } from '../../../../shared/types';
import {
  FLOATING_TRIGGER_GRACE_MS,
  getTransferQueueSummary
} from '../../../../shared/download-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';

export interface FloatingTransferTriggerProps {
  transfers: DownloadTransferItem[];
  isModalOpen?: boolean;
  onClick?: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Floating Transfer Trigger & Hover Progress Pill (Spec 012 US-4 / T4 / FR-6, FR-8, NFR-1, EC-7).
 * Anchored at bottom-3 right-3 inside the FileExplorer canvas.
 * Renders as a 40px x 40px card at rest and expands smoothly to the left to 260px on hover.
 */
export const FloatingTransferTrigger: React.FC<FloatingTransferTriggerProps> = ({
  transfers,
  isModalOpen = false,
  onClick,
  language = 'en'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const graceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTransferCountRef = useRef(0);

  const summary = useMemo(() => getTransferQueueSummary(transfers), [transfers]);
  const { activeTransfer, currentIndex, totalCount, hasInFlight } = summary;

  const clearGraceTimer = (): void => {
    if (graceTimeoutRef.current !== null) {
      clearTimeout(graceTimeoutRef.current);
      graceTimeoutRef.current = null;
    }
  };

  // Visibility and 4-second completion grace period state machine (FR-6.3, FR-8)
  useEffect(() => {
    const newTransferAdded = transfers.length > prevTransferCountRef.current;
    prevTransferCountRef.current = transfers.length;

    if (hasInFlight) {
      clearGraceTimer();
      setIsVisible(true);
      return;
    }

    if (newTransferAdded && transfers.length > 0) {
      clearGraceTimer();
      setIsVisible(true);
    }

    if ((isVisible || newTransferAdded) && transfers.length > 0 && !hasInFlight) {
      if (isModalOpen) {
        // Freeze auto-hide grace period while queue modal is open (FR-8)
        clearGraceTimer();
      } else if (graceTimeoutRef.current === null) {
        graceTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsHovered(false);
          graceTimeoutRef.current = null;
        }, FLOATING_TRIGGER_GRACE_MS);
      }
    }

    if (transfers.length === 0) {
      clearGraceTimer();
      setIsVisible(false);
      setIsHovered(false);
    }
  }, [transfers, hasInFlight, isModalOpen, isVisible]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearGraceTimer();
    };
  }, []);

  if (!isVisible || !activeTransfer) {
    return null;
  }

  const progressPercent = activeTransfer.progressPercent;
  const isCompletedState = !hasInFlight && activeTransfer.status === 'completed';
  const isFailedState = !hasInFlight && activeTransfer.status === 'failed';
  const queueLabel =
    totalCount > 0
      ? getTranslation(language, 'transfer_queue_count', {
          current: currentIndex,
          total: totalCount
        })
      : '';

  return (
    <button
      type="button"
      data-testid="floating-transfer-trigger"
      data-expanded={isHovered ? 'true' : 'false'}
      aria-label={getTranslation(language, 'transfer_floating_active')}
      title={
        isFailedState && activeTransfer.error
          ? activeTransfer.error
          : getTranslation(language, 'transfer_floating_active')
      }
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`absolute bottom-3 right-3 z-30 h-10 ${
        isHovered ? 'w-[260px]' : 'w-10'
      } rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] shadow-md flex items-center overflow-hidden transition-all duration-200 ease-out cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] text-left`}
    >
      {/* Left 40px Icon Tile: Google Drive Emblem + Download Indicator Badge (FR-6.1) */}
      <div className="w-10 h-10 shrink-0 flex items-center justify-center relative">
        <GoogleDriveLogo className="w-5 h-5" />
        <span
          data-testid="floating-transfer-badge"
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white shadow-xs ring-1 ring-[#FFFFFF] dark:ring-[#181C23] ${
            isFailedState
              ? 'bg-[#DC2626] dark:bg-[#EF4444]'
              : isCompletedState
                ? 'bg-[#0D8A52] dark:bg-[#10B981]'
                : 'bg-[#1B44E8] dark:bg-[#3B66FF]'
          }`}
        >
          {isFailedState ? (
            <AlertCircle className="w-2.5 h-2.5 stroke-[2.75]" />
          ) : isCompletedState ? (
            <Check className="w-2.5 h-2.5 stroke-[2.75]" />
          ) : (
            <ArrowDown className="w-2.5 h-2.5 stroke-[2.75]" />
          )}
        </span>
      </div>

      {/* Expanded Horizontal Transfer Pill Content (260px total width) (FR-6.2) */}
      <div
        className={`flex-1 min-w-0 pr-3 flex flex-col justify-center gap-1 transition-opacity duration-150 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Upper Row: Active Filename + Queue Index + Percentage */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span
            data-testid="floating-transfer-filename"
            className="flex-1 min-w-0 truncate font-sans font-medium text-[11px] text-[#111315] dark:text-[#F3F4F6]"
          >
            {activeTransfer.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
            {queueLabel && (
              <span
                data-testid="floating-transfer-queue-count"
                className="text-[#7C8087] dark:text-[#6B7280]"
              >
                {queueLabel}
              </span>
            )}
            <span
              data-testid="floating-transfer-percent"
              className={`font-semibold ${
                isFailedState
                  ? 'text-[#DC2626] dark:text-[#EF4444]'
                  : isCompletedState
                    ? 'text-[#0D8A52] dark:text-[#10B981]'
                    : 'text-[#1B44E8] dark:text-[#3B66FF]'
              }`}
            >
              {isFailedState ? 'ERR' : `${progressPercent}%`}
            </span>
          </div>
        </div>

        {/* Lower Row: Animated Progress Bar */}
        <div className="h-1 w-full bg-[#ECEAE3] dark:bg-[#2C323D] rounded-full overflow-hidden">
          <div
            data-testid="floating-transfer-progress-bar"
            className={`h-full transition-all duration-200 ${
              isFailedState
                ? 'bg-[#DC2626] dark:bg-[#EF4444]'
                : isCompletedState
                  ? 'bg-[#0D8A52] dark:bg-[#10B981]'
                  : 'bg-[#1B44E8] dark:bg-[#3B66FF]'
            }`}
            style={{ width: `${isFailedState ? 100 : progressPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
};
