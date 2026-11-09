import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { getTechnicalIndexStrip } from '../../../../shared/theme';
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

  const strip = getTechnicalIndexStrip('disconnect');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        data-testid="disconnect-modal-dialog"
        className="rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] max-w-sm w-full overflow-hidden shadow-2xl flex flex-col transition-colors"
      >
        {/* Upper Technical Index Strip (FR-17) */}
        <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none shrink-0">
          <span>{strip.leftLabel}</span>
          <span>{strip.rightLabel}</span>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-[6px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] text-[#DC2626] dark:text-[#EF4444] flex items-center justify-center mb-4 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          {/* Modal Heading & Description */}
          <h3
            id="disconnect-modal-title"
            className="font-display text-base font-bold mb-1.5 text-[#111315] dark:text-[#F3F4F6]"
          >
            {getTranslation(language, 'disconnect_modal_title')}
          </h3>
          <p className="font-sans text-xs mb-6 leading-relaxed text-[#4A4E54] dark:text-[#9CA3AF]">
            {getTranslation(language, 'disconnect_modal_desc')}
          </p>

          {/* Action Buttons (FR-17) */}
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              data-testid="cancel-disconnect-btn"
              disabled={isDisconnecting}
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-xs font-semibold rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-[#111315] dark:text-[#F3F4F6] font-display transition-colors disabled:opacity-50 active:scale-[0.99] shadow-xs"
            >
              {getTranslation(language, 'disconnect_modal_cancel')}
            </button>
            <button
              type="button"
              data-testid="confirm-disconnect-btn"
              disabled={isDisconnecting}
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] dark:bg-[#EF4444] hover:bg-[#B91C1C] dark:hover:bg-[#DC2626] border border-[#DC2626] dark:border-[#EF4444] rounded-[4px] font-display transition-colors shadow-xs active:scale-[0.99] disabled:opacity-50"
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
    </div>
  );
};
