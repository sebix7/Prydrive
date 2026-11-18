import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTranslation } from '../../src/shared/i18n/translations';

describe('Item Details Action Button & Selection Decoupling Flow (Spec 011 US-2 / T2 / FR-3, FR-4, FR-5, EC-1, EC-7)', () => {
  const fileRowSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/FileTableRow.tsx'),
    'utf-8'
  );
  const parentRowSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/ParentNavRow.tsx'),
    'utf-8'
  );
  const explorerSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
    'utf-8'
  );

  describe('Details Action Button DOM & Swiss Archive Geometry (FR-3, FR-4, NFR-1)', () => {
    it('should render a 26px x 26px geometric button with 4px border radius and Info icon (FR-3)', () => {
      expect(fileRowSource).toContain('data-testid="item-details-btn"');
      expect(fileRowSource).toContain('w-[26px]');
      expect(fileRowSource).toContain('h-[26px]');
      expect(fileRowSource).toContain('rounded-[4px]');
      expect(fileRowSource).toContain('Info');
      expect(fileRowSource).toContain('w-3.5 h-3.5');
      expect(fileRowSource).toContain('pr-9');
    });

    it('should apply Swiss Archive structural borders, elevated surfaces, and Klein Blue hover transitions (FR-3, FR-4, NFR-1)', () => {
      expect(fileRowSource).toContain('border-[#C9C6BD]');
      expect(fileRowSource).toContain('dark:border-[#2C323D]');
      expect(fileRowSource).toContain('bg-[#FFFFFF]');
      expect(fileRowSource).toContain('dark:bg-[#181C23]');
      expect(fileRowSource).toContain('hover:border-[#1B44E8]');
      expect(fileRowSource).toContain('dark:hover:border-[#3B66FF]');
      expect(fileRowSource).toContain('hover:bg-[#ECEAE3]');
      expect(fileRowSource).toContain('dark:hover:bg-[#1E232C]');
      expect(fileRowSource).toContain('text-[#7C8087]');
      expect(fileRowSource).toContain('dark:text-[#6B7280]');
      expect(fileRowSource).toContain('hover:text-[#1B44E8]');
      expect(fileRowSource).toContain('dark:hover:text-[#3B66FF]');
    });
  });

  describe('Bilingual Native Tooltip & Accessibility Attributes (FR-3, FR-10, NFR-3)', () => {
    it('should retrieve localized tooltip strings in English and Spanish (FR-10)', () => {
      expect(getTranslation('en', 'item_details_tooltip')).toBe('View details');
      expect(getTranslation('es', 'item_details_tooltip')).toBe('Ver detalles');
    });

    it('should bind native title, aria-label, and keyboard focusability tabIndex={0} (FR-3, NFR-3)', () => {
      expect(fileRowSource).toContain("title={getTranslation(language, 'item_details_tooltip')}");
      expect(fileRowSource).toContain("aria-label={getTranslation(language, 'item_details_tooltip')}");
      expect(fileRowSource).toContain('tabIndex={0}');
      expect(fileRowSource).toContain('type="button"');
    });
  });

  describe('Event Propagation & Selection Decoupling (FR-5, EC-1, EC-7, EC-9)', () => {
    it('should stop event propagation on click and delegate to onOpenDetails (FR-5.1, EC-9)', () => {
      expect(fileRowSource).toContain('e.stopPropagation()');
      expect(fileRowSource).toContain('onOpenDetails?.(item, e.currentTarget)');
    });

    it('should stop event propagation on double-click preventing navigation or selection reset (EC-1)', () => {
      expect(fileRowSource).toContain('onDoubleClick={(e) => {');
      expect(fileRowSource).toContain('e.stopPropagation();');
    });

    it('should activate via Enter and Space keydown stopping propagation and preventing scroll (FR-5, EC-7)', () => {
      expect(fileRowSource).toContain("e.key === 'Enter' || e.key === ' '");
      expect(fileRowSource).toContain('e.preventDefault()');
      expect(fileRowSource).toContain('onOpenDetails?.(item, e.currentTarget)');
    });
  });

  describe('Parent Navigation Row Exclusion (FR-9, EC-3)', () => {
    it('should ensure virtual parent row ("...") never renders any details action button', () => {
      expect(parentRowSource).not.toContain('item-details-btn');
      expect(parentRowSource).not.toContain('item_details_tooltip');
      expect(parentRowSource).not.toContain('Info');
    });
  });

  describe('FileExplorer Wiring (US-2)', () => {
    it('should pass language down to FileTableRow', () => {
      expect(explorerSource).toContain('language={language}');
    });
  });

  describe('Single Popover Cardinality & Fluid Dismissal Machine (Spec 011 US-4 / T4 / FR-5, FR-7, EC-4, EC-6, EC-7, EC-9)', () => {
    it('should import ItemDetailsPopover and AnchorRect in FileExplorer', () => {
      expect(explorerSource).toContain("import { ItemDetailsPopover } from './ItemDetailsPopover'");
      expect(explorerSource).toContain("import type { AnchorRect } from '../../../../shared/item-details'");
    });

    it('should declare activeDetailsItemId and activeAnchorRect state in FileExplorer (FR-5.2, FR-5.3)', () => {
      expect(explorerSource).toContain('const [activeDetailsItemId, setActiveDetailsItemId] = React.useState<string | null>(null)');
      expect(explorerSource).toContain('const [activeAnchorRect, setActiveAnchorRect] = React.useState<AnchorRect | null>(null)');
      expect(explorerSource).toContain('anchorElementRef');
    });

    it('should wire onOpenDetails callback on FileTableRow enforcing single popover cardinality (FR-5.2, EC-9)', () => {
      expect(explorerSource).toContain('onOpenDetails={(item, targetElement) => {');
      expect(explorerSource).toContain('setActiveDetailsItemId(item.id)');
      expect(explorerSource).toContain('setActiveAnchorRect(');
    });

    it('should dismiss popover immediately upon table scrolling (FR-7.3, EC-4)', () => {
      expect(explorerSource).toContain('onScroll={onTableScroll}');
      expect(explorerSource).toContain('const onTableScroll');
      expect(explorerSource).toContain('activeDetailsItemId !== null');
      expect(explorerSource).toContain('setActiveDetailsItemId(null)');
      expect(explorerSource).toContain('handleScroll(e)');
    });

    it('should dismiss popover and reset state on folder navigation (FR-7.4, EC-6)', () => {
      expect(explorerSource).toMatch(/\[currentFolder\.id\][\s\S]*setActiveDetailsItemId\(null\)/);
    });

    it('should dismiss popover on Escape keydown and restore focus to trigger button (FR-7.2, EC-7)', () => {
      expect(explorerSource).toContain("e.key === 'Escape'");
      expect(explorerSource).toContain('anchorElementRef.current?.focus()');
    });

    it('should dismiss popover on outside mousedown clicks (FR-7.1)', () => {
      expect(explorerSource).toContain("addEventListener('mousedown'");
      expect(explorerSource).toContain('item-details-popover');
    });

    it('should re-anchor popover dynamically on window resize, maximize, and table layout changes', () => {
      expect(explorerSource).toContain("window.addEventListener('resize', updateAnchorPosition)");
      expect(explorerSource).toContain('ResizeObserver');
      expect(explorerSource).toContain('updateAnchorPosition');
      expect(explorerSource).toContain('anchorElementRef.current.getBoundingClientRect()');
    });

    it('should render ItemDetailsPopover when activeDetailsItemId is present with selected item and anchor rect', () => {
      expect(explorerSource).toContain('<ItemDetailsPopover');
      expect(explorerSource).toContain('item={activeItem}');
      expect(explorerSource).toContain('anchorRect={activeAnchorRect}');
      expect(explorerSource).toContain('onClose=');
    });
  });
});
