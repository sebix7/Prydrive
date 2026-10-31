import React, { useEffect, useState } from 'react';
import { Loader2, ExternalLink, XCircle } from 'lucide-react';

interface AwaitingAuthModalProps {
  isOpen: boolean;
  onCancel: () => Promise<void>;
  totalSeconds?: number;
}

export const AwaitingAuthModal: React.FC<AwaitingAuthModalProps> = ({
  isOpen,
  onCancel,
  totalSeconds = 60
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center flex flex-col items-center">
        {/* Animated Spinner Icon */}
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 relative">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Waiting for Authorization
        </h3>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          We opened a tab in your default web browser. Please choose your Google account and grant permissions to continue.
        </p>

        {/* Progress bar & Timer */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] text-slate-400 font-medium mb-6">
          Timeout in {secondsRemaining}s
        </span>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            disabled={isCanceling}
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>{isCanceling ? 'Canceling...' : 'Cancel Authorization'}</span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Check your browser window</span>
        </div>
      </div>
    </div>
  );
};
