import React, { useEffect, useState } from 'react';
import { Loader2, ExternalLink, XCircle } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
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
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        data-testid="awaiting-auth-modal"
        className={`rounded-2xl shadow-2xl border max-w-sm w-full p-6 text-center flex flex-col items-center transition-colors ${
          isDark
            ? 'bg-[#161B22] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-100 text-slate-900'
        }`}
      >
        {/* Animated Spinner Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 relative ${
            isDark
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <h3
          className={`text-lg font-bold mb-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          {getTranslation(language, 'awaiting_title')}
        </h3>

        <p
          className={`text-xs mb-5 leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {getTranslation(language, 'awaiting_desc')}
        </p>

        {/* Progress bar & Timer */}
        <div
          className={`w-full rounded-full h-1.5 mb-2 overflow-hidden ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}
        >
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] text-slate-400 font-medium mb-6">
          {secondsRemaining}s
        </span>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            disabled={isCanceling}
            onClick={handleCancel}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 ${
              isDark
                ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>
              {isCanceling
                ? getTranslation(language, 'validating_session')
                : getTranslation(language, 'awaiting_cancel')}
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Google Accounts</span>
        </div>
      </div>
    </div>
  );
};
