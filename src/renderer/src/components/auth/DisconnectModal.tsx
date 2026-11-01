import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface DisconnectModalProps {
  isOpen: boolean;
  isDisconnecting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  language?: LanguageCode;
}

export const DisconnectModal: React.FC<DisconnectModalProps> = ({
  isOpen,
  isDisconnecting = false,
  onConfirm,
  onCancel,
  language = 'en'
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Modal Heading & Description */}
        <h3
          id="disconnect-modal-title"
          className="text-base font-bold text-slate-900 mb-1.5"
        >
          {getTranslation(language, 'disconnect_modal_title')}
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {getTranslation(language, 'disconnect_modal_desc')}
        </p>

        {/* Action Buttons (FR-13, FR-14) */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            data-testid="cancel-disconnect-btn"
            disabled={isDisconnecting}
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
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
