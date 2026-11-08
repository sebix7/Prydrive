import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import { ABOUT_METADATA, formatMailtoUrl } from '../../../../shared/shell-state';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';
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

  const isDark = theme === 'dark';

  return (
    <div
      data-testid="about-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="about-modal-dialog"
        className={`border rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150 transition-colors ${
          isDark
            ? 'bg-[#161B22] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={getTranslation(language, 'about_close')}
          aria-label={getTranslation(language, 'about_close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon */}
        <div
          className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-3.5 shadow-inner ${
            isDark
              ? 'bg-blue-500/10 border-blue-500/20'
              : 'bg-blue-50 border-blue-100'
          }`}
        >
          <GoogleDriveLogo className="w-9 h-9" />
        </div>

        {/* Title and Version */}
        <h3
          id="about-modal-title"
          className={`text-xl font-bold tracking-tight mb-0.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {ABOUT_METADATA.appName}
        </h3>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border mb-3 ${
            isDark
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {ABOUT_METADATA.version}
        </span>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed mb-4 max-w-xs ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {getTranslation(language, 'about_description')}
        </p>

        {/* Metadata Details */}
        <div
          className={`w-full border rounded-xl p-3 text-left mb-4 font-mono text-[11px] flex flex-col gap-2 ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {/* Row 1: Repository */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{getTranslation(language, 'about_repository')}</span>
            <a
              href={ABOUT_METADATA.website}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1 hover:underline ${
                isDark
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Row 2: Board (Trello) */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{getTranslation(language, 'about_board')}</span>
            <a
              href={ABOUT_METADATA.trelloUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1 hover:underline ${
                isDark
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              data-testid="about-trello-link"
            >
              <span>Trello</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Row 3: Contact Email */}
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 shrink-0">
              {getTranslation(language, 'about_contact')}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <a
                href={formatMailtoUrl(ABOUT_METADATA.contactEmail)}
                className={`truncate hover:underline ${
                  isDark
                    ? 'text-slate-300 hover:text-blue-300'
                    : 'text-slate-700 hover:text-blue-600'
                }`}
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
                    ? getTranslation(language, 'about_copied')
                    : getTranslation(language, 'about_copy_email')
                }
                aria-label={
                  isCopied
                    ? getTranslation(language, 'about_copied')
                    : getTranslation(language, 'about_copy_email')
                }
                className={`p-1 rounded transition-colors shrink-0 ${
                  isCopied
                    ? isDark
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-emerald-600 bg-emerald-50'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {isCopied ? (
                  <Check
                    className={`w-3 h-3 transition-transform duration-150 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  />
                ) : (
                  <Copy className="w-3 h-3 transition-transform duration-150" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2 px-4 rounded-xl text-xs font-semibold transition-colors border shadow-sm ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white border-slate-700/60'
              : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white border-slate-900'
          }`}
        >
          {getTranslation(language, 'about_got_it')}
        </button>
      </div>
    </div>
  );
};
