import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface DisconnectModalProps {
  isOpen: boolean;
  isDisconnecting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const DisconnectModal: React.FC<DisconnectModalProps> = ({
  isOpen,
  isDisconnecting = false,
  onConfirm,
  onCancel,
  language = 'en',
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        data-testid="disconnect-modal-dialog"
        className={`rounded-2xl max-w-sm w-full p-6 shadow-xl border flex flex-col items-center text-center transition-colors ${
          isDark
            ? 'bg-[#161B22] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-100 text-slate-900'
        }`}
      >
        {/* Warning Icon Badge */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
            isDark
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Modal Heading & Description */}
        <h3
          id="disconnect-modal-title"
          className={`text-base font-bold mb-1.5 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          {getTranslation(language, 'disconnect_modal_title')}
        </h3>
        <p
          className={`text-xs mb-6 leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {getTranslation(language, 'disconnect_modal_desc')}
        </p>

        {/* Action Buttons (FR-13, FR-14) */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            data-testid="cancel-disconnect-btn"
            disabled={isDisconnecting}
            onClick={onCancel}
            className={`flex-1 px-4 py-2 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 ${
              isDark
                ? 'text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700'
                : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {getTranslation(language, 'disconnect_modal_cancel')}
          </button>
          <button
            type="button"
            data-testid="confirm-disconnect-btn"
            disabled={isDisconnecting}
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{getTranslation(language, 'disconnecting')}</span>
              </>
            ) : (
              <span>{getTranslation(language, 'disconnect_modal_confirm')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
