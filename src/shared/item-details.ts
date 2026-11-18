import type { LanguageCode, StorageItemType } from './types';
import { getTranslation, type TranslationKey } from './i18n/translations';

export interface ViewportRect {
  width: number;
  height: number;
}

export interface AnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PopoverPositionResult {
  top: number;
  left: number;
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Maps item storage type and directory flag to human-readable localized category string (FR-6.2, FR-10).
 */
export function resolveItemCategory(
  iconType: StorageItemType,
  isDirectory: boolean,
  language: LanguageCode = 'en'
): string {
  if (isDirectory) {
    return getTranslation(language, 'category_folder');
  }

  const categoryKeyMap: Record<StorageItemType, TranslationKey> = {
    folder: 'category_folder',
    document: 'category_document',
    spreadsheet: 'category_spreadsheet',
    presentation: 'category_presentation',
    pdf: 'category_pdf',
    image: 'category_image',
    video: 'category_video',
    audio: 'category_audio',
    archive: 'category_archive',
    shortcut: 'category_shortcut',
    file: 'category_file'
  };

  const key = categoryKeyMap[iconType] || 'category_file';
  return getTranslation(language, key);
}

/**
 * Formats size detail guaranteeing 0-byte files display '0 B' while folders display '--' (FR-6.3, EC-8).
 */
export function formatItemSizeDetail(
  sizeBytes: number | null,
  isDirectory: boolean,
  formattedSize: string
): string {
  if (isDirectory) {
    return '--';
  }
  if (sizeBytes === 0) {
    return '0 B';
  }
  return formattedSize || '--';
}

/**
 * Calculates deterministic absolute coordinates for the popover (width 280px, max-height 320px)
 * ensuring it stays strictly within the visible viewport bounds (FR-8).
 */
export function calculatePopoverPosition(
  anchor: AnchorRect,
  viewport: ViewportRect,
  popoverWidth = 280,
  popoverHeight = 240,
  offset = 6
): PopoverPositionResult {
  // Horizontal positioning: default align right edge of popover with right edge of button
  let targetLeft = anchor.right - popoverWidth;
  let targetPlacementX: 'left' | 'right' = 'left';

  // If popover overflows left edge of viewport (e.g. narrow window)
  if (targetLeft < offset) {
    targetLeft = anchor.left; // flip to align with left edge
    targetPlacementX = 'right';
    // Clamp to prevent right overflow
    if (targetLeft + popoverWidth > viewport.width - offset) {
      targetLeft = Math.max(offset, viewport.width - popoverWidth - offset);
    }
  }

  // Vertical positioning: default anchor below the row button
  let targetTop = anchor.bottom + offset;
  let targetPlacementY: 'top' | 'bottom' = 'bottom';

  // If popover overflows bottom edge of viewport, flip above anchor button
  if (targetTop + popoverHeight > viewport.height - offset) {
    targetTop = anchor.top - popoverHeight - offset;
    targetPlacementY = 'top';
    // Clamp to prevent top overflow
    if (targetTop < offset) {
      targetTop = offset;
    }
  }

  return {
    top: targetTop,
    left: targetLeft,
    placement: `${targetPlacementY}-${targetPlacementX}` as const
  };
}
