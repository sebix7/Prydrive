import React, { useMemo, useEffect, useRef } from 'react';
import type { StorageItem, ThemeMode, LanguageCode, WorkspaceExportOption } from '../../../../shared/types';
import {
  calculatePopoverPosition,
  type AnchorRect,
  type ViewportRect
} from '../../../../shared/item-details';
import {
  resolveWorkspaceExportOptions
} from '../../../../shared/download-helpers';
import { getTranslation, type TranslationKey } from '../../../../shared/i18n/translations';

export interface WorkspaceExportMenuProps {
  item: StorageItem;
  anchorRect: AnchorRect;
  triggerElement?: HTMLElement | null;
  onSelectFormat: (option: WorkspaceExportOption) => void;
  onClose: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
  viewport?: ViewportRect;
}

/**
 * Swiss Archive Workspace Export Menu (Spec 012 US-3 / T3 / FR-5, FR-12, NFR-1).
 * Compact anchored popover displaying format choices for Google Docs, Sheets, and Slides.
 */
export const WorkspaceExportMenu: React.FC<WorkspaceExportMenuProps> = ({
  item,
  anchorRect,
  triggerElement,
  onSelectFormat,
  onClose,
  language = 'en',
  viewport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => resolveWorkspaceExportOptions(item.mimeType), [item.mimeType]);

  const [windowViewport, setWindowViewport] = React.useState<ViewportRect>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1024, height: 768 };
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentViewport: ViewportRect = useMemo(() => {
    if (viewport) return viewport;
    return windowViewport;
  }, [viewport, windowViewport]);

  // Width 220px, calculated height based on options count (~36px per option + 28px header)
  const menuHeight = 28 + options.length * 36;
  const position = useMemo(() => {
    return calculatePopoverPosition(anchorRect, currentViewport, 220, menuHeight, 6);
  }, [anchorRect, currentViewport, menuHeight]);

  // Dismiss on outside mousedown clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (triggerElement && triggerElement.contains(target)) return;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose, triggerElement]);

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label={getTranslation(language, 'export_menu_title')}
      data-testid="workspace-export-menu"
      data-placement={position.placement}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      className="fixed z-50 w-[220px] rounded-[6px] flex flex-col bg-[#FFFFFF] dark:bg-[#181C23] border border-[#C9C6BD] dark:border-[#2C323D] shadow-lg select-none overflow-hidden"
    >
      {/* Upper Technical Header Strip */}
      <div className="h-7 px-2.5 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7C8087] dark:text-[#6B7280]">
        <span>{getTranslation(language, 'export_menu_title')}</span>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[9px] px-1 py-0.5 rounded-[2px] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#111315] dark:hover:text-[#F3F4F6] text-[#7C8087] dark:text-[#6B7280] transition-colors cursor-pointer"
          aria-label={getTranslation(language, 'about_close')}
        >
          [ESC]
        </button>
      </div>

      {/* Export Options List */}
      <div className="flex flex-col py-1">
        {options.map((option) => (
          <button
            key={option.format}
            type="button"
            role="menuitem"
            data-testid={`export-option-${option.format}`}
            onClick={() => onSelectFormat(option)}
            className="h-8 px-3 flex items-center justify-between text-xs font-sans text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] transition-colors cursor-pointer"
          >
            <span className="truncate pr-2">
              {getTranslation(language, option.labelKey as TranslationKey)}
            </span>
            <span className="font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280] uppercase shrink-0">
              {option.extension}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
