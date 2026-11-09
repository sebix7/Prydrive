import React, { useEffect, useState } from 'react';
import { Loader2, ExternalLink, XCircle } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTechnicalIndexStrip } from '../../../../shared/theme';
import { getTranslation } from '../../../../shared/i18n/translations';

interface AwaitingAuthModalProps {
  isOpen: boolean;
  onCancel: () => Promise<void>;
  totalSeconds?: number;
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const AwaitingAuthModal: React.FC<AwaitingAuthModalProps> = ({
  isOpen,
  onCancel,
  totalSeconds = 60,
  language = 'en',
  theme = 'light'
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(totalSeconds);
      setIsCanceling(false);
      return;
    }

    setSecondsRemaining(totalSeconds);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, totalSeconds]);

  if (!isOpen) return null;

  const handleCancel = async () => {
    if (isCanceling) return;
    setIsCanceling(true);
    try {
      await onCancel();
    } finally {
      setIsCanceling(false);
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));
  const strip = getTechnicalIndexStrip('awaiting_auth');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div
        data-testid="awaiting-auth-modal"
        className="rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] max-w-sm w-full overflow-hidden shadow-2xl flex flex-col transition-colors"
      >
        {/* Upper Technical Index Strip (FR-17) */}
        <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none shrink-0">
          <span>{strip.leftLabel}</span>
          <span>{strip.rightLabel}</span>
        </div>

        <div className="p-6 text-center flex flex-col items-center">
          {/* Animated Spinner Icon Badge */}
          <div className="w-14 h-14 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] flex items-center justify-center mb-4 text-[#1B44E8] dark:text-[#3B66FF] shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>

          <h3 className="font-display text-lg font-bold mb-1.5 text-[#111315] dark:text-[#F3F4F6]">
            {getTranslation(language, 'awaiting_title')}
          </h3>

          <p className="font-sans text-xs mb-5 leading-relaxed text-[#4A4E54] dark:text-[#9CA3AF]">
            {getTranslation(language, 'awaiting_desc')}
          </p>

          {/* Progress bar & Timer */}
          <div className="w-full rounded-[2px] h-1.5 mb-2 overflow-hidden bg-[#DFDDD6] dark:bg-[#222730]">
            <div
              className="bg-[#1B44E8] dark:bg-[#3B66FF] h-1.5 rounded-[2px] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#7C8087] dark:text-[#6B7280] font-medium mb-6">
            {secondsRemaining}s
          </span>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2">
            <button
              type="button"
              disabled={isCanceling}
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-[#111315] dark:text-[#F3F4F6] font-display transition-colors disabled:opacity-50 active:scale-[0.99] shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5 text-[#7C8087] dark:text-[#6B7280]" />
              <span>
                {isCanceling
                  ? getTranslation(language, 'validating_session')
                  : getTranslation(language, 'awaiting_cancel')}
              </span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-[#7C8087] dark:text-[#6B7280]">
            <ExternalLink className="w-3 h-3" />
            <span>Google Accounts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
