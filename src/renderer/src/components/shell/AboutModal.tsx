import React, { useEffect } from 'react';
import { X, ExternalLink, Code2 } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { ABOUT_METADATA } from '../../../../shared/shell-state';
import { GoogleDriveLogo } from '../ui/GoogleDriveLogo';

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
  const isSpanish = language === 'es';

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
          title={isSpanish ? 'Cerrar' : 'Close'}
          aria-label={isSpanish ? 'Cerrar' : 'Close'}
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
          {isSpanish
            ? 'Gestor de escritorio visual, rápido y nativo para tus archivos de Google Drive.'
            : ABOUT_METADATA.description}
        </p>

        {/* Metadata Details */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 text-left mb-4 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{isSpanish ? 'Repositorio:' : 'Repository:'}</span>
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
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white transition-colors border border-slate-700/60 shadow-sm"
        >
          {isSpanish ? 'Entendido' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
