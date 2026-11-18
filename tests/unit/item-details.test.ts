import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  resolveItemCategory,
  formatItemSizeDetail,
  calculatePopoverPosition,
  type AnchorRect,
  type ViewportRect
} from '../../src/shared/item-details';

describe('Item Details Helpers and Boundary Positioning (Spec 011 US-3 / T3 / FR-6, FR-8, EC-2, EC-5, EC-8)', () => {
  describe('resolveItemCategory (FR-6.2, FR-10)', () => {
    it('should resolve folder category when isDirectory is true regardless of iconType', () => {
      expect(resolveItemCategory('folder', true, 'en')).toBe('Folder');
      expect(resolveItemCategory('folder', true, 'es')).toBe('Carpeta');
      expect(resolveItemCategory('file', true, 'en')).toBe('Folder');
      expect(resolveItemCategory('file', true, 'es')).toBe('Carpeta');
    });

    it('should resolve bilingual categories across all storage item types', () => {
      const typeExpectations: Array<{ type: Parameters<typeof resolveItemCategory>[0]; en: string; es: string }> = [
        { type: 'folder', en: 'Folder', es: 'Carpeta' },
        { type: 'document', en: 'Document', es: 'Documento' },
        { type: 'spreadsheet', en: 'Spreadsheet', es: 'Hoja de cálculo' },
        { type: 'presentation', en: 'Presentation', es: 'Presentación' },
        { type: 'pdf', en: 'PDF Document', es: 'Documento PDF' },
        { type: 'image', en: 'Image', es: 'Imagen' },
        { type: 'video', en: 'Video', es: 'Video' },
        { type: 'audio', en: 'Audio', es: 'Audio' },
        { type: 'archive', en: 'Compressed Archive', es: 'Archivo comprimido' },
        { type: 'shortcut', en: 'Shortcut', es: 'Acceso directo' },
        { type: 'file', en: 'File', es: 'Archivo' }
      ];

      typeExpectations.forEach(({ type, en, es }) => {
        expect(resolveItemCategory(type, false, 'en')).toBe(en);
        expect(resolveItemCategory(type, false, 'es')).toBe(es);
      });
    });
  });

  describe('formatItemSizeDetail (FR-6.3, EC-8)', () => {
    it('should return "0 B" for 0-byte non-directory files', () => {
      expect(formatItemSizeDetail(0, false, '0 B')).toBe('0 B');
      expect(formatItemSizeDetail(0, false, '--')).toBe('0 B');
    });

    it('should return "--" for directories even if sizeBytes is 0 or null', () => {
      expect(formatItemSizeDetail(null, true, '--')).toBe('--');
      expect(formatItemSizeDetail(0, true, '--')).toBe('--');
      expect(formatItemSizeDetail(1024, true, '1 KB')).toBe('--');
    });

    it('should return standard formattedSize for normal files with positive size', () => {
      expect(formatItemSizeDetail(1048576, false, '1 MB')).toBe('1 MB');
      expect(formatItemSizeDetail(347136, false, '339 KB')).toBe('339 KB');
      expect(formatItemSizeDetail(52428800, false, '50 MB')).toBe('50 MB');
    });
  });

  describe('calculatePopoverPosition (FR-8, NFR-2)', () => {
    const viewport: ViewportRect = { width: 1000, height: 800 };

    it('should place popover below and right-aligned with anchor in standard space', () => {
      const anchor: AnchorRect = { top: 200, bottom: 226, left: 600, right: 626 };
      const pos = calculatePopoverPosition(anchor, viewport, 280, 240, 6);

      expect(pos.top).toBe(232); // anchor.bottom (226) + offset (6)
      expect(pos.left).toBe(346); // anchor.right (626) - popoverWidth (280)
      expect(pos.placement).toBe('bottom-left');
    });

    it('should flip popover above anchor when overflowing bottom viewport boundary', () => {
      const anchor: AnchorRect = { top: 600, bottom: 626, left: 600, right: 626 };
      // 626 + 240 + 6 = 872 > 800 - 6 (794) -> flips above
      const pos = calculatePopoverPosition(anchor, viewport, 280, 240, 6);

      expect(pos.top).toBe(354); // anchor.top (600) - popoverHeight (240) - offset (6)
      expect(pos.left).toBe(346);
      expect(pos.placement).toBe('top-left');
    });

    it('should flip popover horizontally when overflowing left viewport boundary', () => {
      const anchor: AnchorRect = { top: 200, bottom: 226, left: 20, right: 46 };
      // 46 - 280 = -234 < offset (6) -> flips right
      const pos = calculatePopoverPosition(anchor, viewport, 280, 240, 6);

      expect(pos.top).toBe(232);
      expect(pos.left).toBe(20); // aligns with anchor.left
      expect(pos.placement).toBe('bottom-right');
    });

    it('should flip both vertically and horizontally in bottom-left corner of viewport', () => {
      const anchor: AnchorRect = { top: 650, bottom: 676, left: 30, right: 56 };
      const pos = calculatePopoverPosition(anchor, viewport, 280, 240, 6);

      expect(pos.top).toBe(404); // 650 - 240 - 6
      expect(pos.left).toBe(30); // flipped to anchor.left
      expect(pos.placement).toBe('top-right');
    });

    it('should clamp popover within offset boundaries when window is very small', () => {
      const tinyViewport: ViewportRect = { width: 300, height: 260 };
      const anchor: AnchorRect = { top: 10, bottom: 36, left: 20, right: 46 };
      const pos = calculatePopoverPosition(anchor, tinyViewport, 280, 240, 6);

      expect(pos.top).toBeGreaterThanOrEqual(6);
      expect(pos.left).toBeGreaterThanOrEqual(6);
      expect(pos.left + 280).toBeLessThanOrEqual(300);
    });
  });

  describe('ItemDetailsPopover.tsx Swiss Archive Presentation Contract (FR-6, NFR-1, NFR-3, EC-2, EC-5)', () => {
    const popoverSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ItemDetailsPopover.tsx'),
      'utf-8'
    );

    it('should render 280px wide container with max-height 320px and Swiss Archive elevated surfaces', () => {
      expect(popoverSource).toContain('w-[280px]');
      expect(popoverSource).toContain('max-h-[320px]');
      expect(popoverSource).toContain('rounded-[6px]');
      expect(popoverSource).toContain('bg-[#FFFFFF]');
      expect(popoverSource).toContain('dark:bg-[#181C23]');
      expect(popoverSource).toContain('border-[#C9C6BD]');
      expect(popoverSource).toContain('dark:border-[#2C323D]');
    });

    it('should render upper technical index strip with [ESC] button (FR-6, FR-7.2)', () => {
      expect(popoverSource).toContain('item_details_title');
      expect(popoverSource).toContain('item_details_close');
      expect(popoverSource).toContain('font-mono');
    });

    it('should render all 6 structured metadata fields with proper testids and typography', () => {
      expect(popoverSource).toContain('data-testid="item-details-name"');
      expect(popoverSource).toContain('data-testid="item-details-type"');
      expect(popoverSource).toContain('data-testid="item-details-size"');
      expect(popoverSource).toContain('data-testid="item-details-created"');
      expect(popoverSource).toContain('data-testid="item-details-mime"');
      expect(popoverSource).toContain('data-testid="item-details-id"');

      // Full Name wraps without truncation (EC-2)
      expect(popoverSource).toContain('break-words');

      // Monospace ID is selectable and breaks cleanly
      expect(popoverSource).toContain('select-all');
      expect(popoverSource).toContain('break-all');
    });
  });
});
