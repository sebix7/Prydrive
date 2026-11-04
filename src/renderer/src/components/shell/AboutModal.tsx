import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { ABOUT_METADATA, formatMailtoUrl } from '../../../../shared/shell-state';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language = 'en'
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

  return (
    <div
      data-testid="about-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="about-modal-dialog"
        className="bg-[#161B22] border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={getTranslation(language, 'about_close')}
          aria-label={getTranslation(language, 'about_close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3.5 shadow-inner">
          <GoogleDriveLogo className="w-9 h-9" />
        </div>

        {/* Title and Version */}
        <h3 id="about-modal-title" className="text-xl font-bold tracking-tight text-white mb-0.5">
          {ABOUT_METADATA.appName}
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
          {ABOUT_METADATA.version}
        </span>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs">
          {getTranslation(language, 'about_description')}
        </p>

        {/* Metadata Details */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 text-left mb-4 font-mono text-[11px] flex flex-col gap-2">
          {/* Row 1: Repository */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{getTranslation(language, 'about_repository')}</span>
            <a
              href={ABOUT_METADATA.website}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Row 2: Board (Trello) */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">
              {language === 'es' ? 'Tablero:' : 'Board:'}
            </span>
            <a
              href={ABOUT_METADATA.trelloUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
              data-testid="about-trello-link"
            >
              <span>Trello</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Row 3: Contact Email */}
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 shrink-0">
              {language === 'es' ? 'Contacto:' : 'Contact:'}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <a
                href={formatMailtoUrl(ABOUT_METADATA.contactEmail)}
                className="text-slate-300 hover:text-blue-300 truncate hover:underline"
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
                    ? language === 'es'
                      ? '¡Copiado!'
                      : 'Copied!'
                    : language === 'es'
                      ? 'Copiar correo'
                      : 'Copy email'
                }
                aria-label={
                  isCopied
                    ? language === 'es'
                      ? '¡Copiado!'
                      : 'Copied!'
                    : language === 'es'
                      ? 'Copiar correo'
                      : 'Copy email'
                }
                className={`p-1 rounded transition-colors shrink-0 ${
                  isCopied
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-emerald-400 transition-transform duration-150" />
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
          className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white transition-colors border border-slate-700/60 shadow-sm"
        >
          {getTranslation(language, 'about_got_it')}
        </button>
      </div>
    </div>
  );
};
