import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import type { StorageItem, ThemeMode, LanguageCode } from '../../../../shared/types';
import {
  resolveItemCategory,
  formatItemSizeDetail,
  calculatePopoverPosition,
  type AnchorRect,
  type ViewportRect
} from '../../../../shared/item-details';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface ItemDetailsPopoverProps {
  item: StorageItem;
  anchorRect: AnchorRect;
  onClose: () => void;
  language?: LanguageCode;
  theme?: ThemeMode;
  viewport?: ViewportRect;
}

/**
 * Swiss Archive Item Details Popover (Spec 011 US-3 / FR-6, FR-8, NFR-1, NFR-3, EC-2, EC-5).
 * Floating elevated card anchored to the item row details button presenting 6 structured metadata fields.
 */
export const ItemDetailsPopover: React.FC<ItemDetailsPopoverProps> = ({
  item,
  anchorRect,
  onClose,
  language = 'en',
  viewport
}) => {
  const currentViewport: ViewportRect = useMemo(() => {
    if (viewport) return viewport;
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1024, height: 768 };
  }, [viewport]);

  const position = useMemo(() => {
    return calculatePopoverPosition(anchorRect, currentViewport, 280, 260, 6);
  }, [anchorRect, currentViewport]);

  const category = resolveItemCategory(item.iconType, item.isDirectory, language);
  const sizeDetail = formatItemSizeDetail(item.sizeBytes, item.isDirectory, item.formattedSize);

  return (
    <div
      role="dialog"
      aria-label={getTranslation(language, 'item_details_title')}
      data-testid="item-details-popover"
      data-placement={position.placement}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      className="fixed z-50 w-[280px] max-h-[320px] rounded-[6px] flex flex-col bg-[#FFFFFF] dark:bg-[#181C23] border border-[#C9C6BD] dark:border-[#2C323D] shadow-lg select-none overflow-hidden"
    >
      {/* Upper Technical Index Strip (FR-6) */}
      <div
        data-testid="item-details-strip"
        className="h-7 px-2.5 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10px] tracking-wider shrink-0 select-none"
      >
        <span className="font-semibold text-[#7C8087] dark:text-[#6B7280] uppercase">
          {getTranslation(language, 'item_details_title')}
        </span>
        <button
          type="button"
          data-testid="item-details-close-btn"
          onClick={onClose}
          title={getTranslation(language, 'item_details_close')}
          aria-label={getTranslation(language, 'item_details_close')}
          className="flex items-center gap-1 text-[#7C8087] dark:text-[#6B7280] hover:text-[#111315] dark:hover:text-[#F3F4F6] transition-colors focus:outline-none cursor-pointer"
        >
          <span>[ESC]</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Structured Fields List (6 items per FR-6) */}
      <div className="p-3 flex flex-col gap-2.5 overflow-y-auto text-xs">
        {/* 1. Full Name (wraps without truncation per EC-2) */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_name')}
          </span>
          <div
            data-testid="item-details-name"
            className="font-sans text-xs font-semibold text-[#111315] dark:text-[#F3F4F6] break-words"
          >
            {item.name}
          </div>
        </div>

        {/* 2. Item Type / Category */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_type')}
          </span>
          <div
            data-testid="item-details-type"
            className="font-mono text-[11px] text-[#1B44E8] dark:text-[#3B66FF] font-medium"
          >
            {category}
          </div>
        </div>

        {/* 3. File Size (0 B for empty files, -- for folders per EC-8) */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_size')}
          </span>
          <div
            data-testid="item-details-size"
            className="font-mono text-[11px] text-[#111315] dark:text-[#F3F4F6]"
          >
            {sizeDetail}
          </div>
        </div>

        {/* 4. Creation Date */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_created')}
          </span>
          <div
            data-testid="item-details-created"
            className="font-mono text-[11px] text-[#111315] dark:text-[#F3F4F6]"
          >
            {item.formattedCreatedAt}
          </div>
        </div>

        {/* 5. MIME Type */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_mime')}
          </span>
          <div
            data-testid="item-details-mime"
            className="font-mono text-[10px] text-[#7C8087] dark:text-[#6B7280] break-all select-all"
          >
            {item.mimeType}
          </div>
        </div>

        {/* 6. Drive ID (Passive, selectable monospace text per Clarification Finding 9) */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-[#7C8087] dark:text-[#6B7280] tracking-wider">
            {getTranslation(language, 'item_details_field_id')}
          </span>
          <div
            data-testid="item-details-id"
            className="font-mono text-[10px] bg-[#FAF9F6] dark:bg-[#101216] p-1.5 rounded-[3px] border border-[#DFDDD6] dark:border-[#222730] select-all break-all text-[#111315] dark:text-[#F3F4F6]"
          >
            {item.id}
          </div>
        </div>
      </div>
    </div>
  );
};
