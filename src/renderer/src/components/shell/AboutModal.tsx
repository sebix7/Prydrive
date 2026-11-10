import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { ABOUT_METADATA, formatMailtoUrl } from '../../../../shared/shell-state';
import { getTechnicalIndexStrip } from '../../../../shared/theme';
import { PrydriveWordmark } from '../ui/PrydriveWordmark';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  theme = 'dark'
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  // Timer cleanup on unmount or dialog dismiss (EC-4)
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current as any);
      }
    };
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current as any);
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ABOUT_METADATA.contactEmail);
      }
      setIsCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      setIsCopied(false);
    }
  };

  // Listen for Escape key to close the modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const strip = getTechnicalIndexStrip('about');

  return (
    <div
      data-testid="about-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="about-modal-dialog"
        className="rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] max-w-sm w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150 transition-colors flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Upper Technical Index Strip (FR-17) */}
        <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none shrink-0">
          <span>{strip.leftLabel}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] hover:text-[#111315] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none"
            title={getTranslation(language, 'about_close')}
            aria-label={getTranslation(language, 'about_close')}
          >
            {strip.rightLabel}
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {/* Brand Wordmark replacing the "P" mark */}
          <h3 id="about-modal-title" className="mt-1 mb-2.5 flex items-center justify-center">
            <PrydriveWordmark
              className="h-7 w-auto"
              theme={theme}
              aria-label={ABOUT_METADATA.appName}
            />
            <span className="sr-only">{ABOUT_METADATA.appName}</span>
          </h3>

          {/* Version */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-mono font-medium border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-[#111315] dark:text-[#F3F4F6] mb-3">
            {ABOUT_METADATA.version}
          </span>

          {/* Description */}
          <p className="font-sans text-xs leading-relaxed mb-4 max-w-xs text-[#4A4E54] dark:text-[#9CA3AF]">
            {getTranslation(language, 'about_description')}
          </p>

          {/* Metadata Details Box */}
          <div className="w-full border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] rounded-[6px] p-3 text-left mb-5 font-mono text-[11px] flex flex-col gap-2.5">
            {/* Row 1: Repository */}
            <div className="flex justify-between items-center">
              <span className="text-[#7C8087] dark:text-[#6B7280]">
                {getTranslation(language, 'about_repository')}
              </span>
              <a
                href={ABOUT_METADATA.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#1B44E8] dark:text-[#3B66FF] hover:underline"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Row 2: Board (Trello) */}
            <div className="flex justify-between items-center">
              <span className="text-[#7C8087] dark:text-[#6B7280]">
                {getTranslation(language, 'about_board')}
              </span>
              <a
                href={ABOUT_METADATA.trelloUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#1B44E8] dark:text-[#3B66FF] hover:underline"
                data-testid="about-trello-link"
              >
                <span>Trello</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Row 3: Contact Email */}
            <div className="flex justify-between items-center gap-2">
              <span className="text-[#7C8087] dark:text-[#6B7280] shrink-0">
                {getTranslation(language, 'about_contact')}
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href={formatMailtoUrl(ABOUT_METADATA.contactEmail)}
                  className="truncate text-[#111315] dark:text-[#F3F4F6] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] hover:underline"
                  title={ABOUT_METADATA.contactEmail}
                  data-testid="about-contact-email"
                >
                  {ABOUT_METADATA.contactEmail}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  data-testid="about-copy-email-btn"
                  title={
                    isCopied
                      ? getTranslation(language, 'about_copied_short')
                      : getTranslation(language, 'about_copy_short')
                  }
                  aria-label={
                    isCopied
                      ? getTranslation(language, 'about_copied_short')
                      : getTranslation(language, 'about_copy_short')
                  }
                  className={`px-2 py-0.5 rounded-[4px] border font-mono text-[10px] uppercase font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs ${
                    isCopied
                      ? 'border-[#0D8A52] dark:border-[#10B981] bg-[rgba(13,138,82,0.08)] dark:bg-[rgba(16,185,129,0.12)] text-[#0D8A52] dark:text-[#10B981]'
                      : 'border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-[#111315] dark:text-[#F3F4F6]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      <span>{getTranslation(language, 'about_copied_short')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>{getTranslation(language, 'about_copy_short')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-[4px] font-display text-xs font-semibold border border-[#1B44E8] dark:border-[#3B66FF] bg-[#1B44E8] dark:bg-[#3B66FF] hover:bg-[#1435B8] dark:hover:bg-[#5278FF] text-white transition-colors shadow-xs active:scale-[0.99]"
          >
            {getTranslation(language, 'about_got_it')}
          </button>
        </div>
      </div>
    </div>
  );
};
