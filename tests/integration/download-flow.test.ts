import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTranslation } from '../../src/shared/i18n/translations';

describe('Download Action Button & Row Clearance Flow (Spec 012 US-1 / T1 / FR-1, FR-2, FR-3.1, FR-11, EC-1)', () => {
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

  describe('Download Action Button DOM & Swiss Archive Geometry (FR-1, FR-2, NFR-1)', () => {
    it('should render a 26px x 26px geometric button with 4px border radius and Download icon (FR-1)', () => {
      expect(fileRowSource).toContain('data-testid="item-download-btn"');
      expect(fileRowSource).toContain('w-[26px]');
      expect(fileRowSource).toContain('h-[26px]');
      expect(fileRowSource).toContain('rounded-[4px]');
      expect(fileRowSource).toContain('Download');
      expect(fileRowSource).toContain('w-3.5 h-3.5');
      expect(fileRowSource).toContain('gap-1.5');
      expect(fileRowSource).toContain('pr-16');
    });

    it('should apply Swiss Archive structural borders, elevated surfaces, and Klein Blue hover transitions (FR-1, FR-2, NFR-1)', () => {
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

  describe('Bilingual Native Tooltip & Accessibility Attributes (FR-2, FR-12, NFR-3)', () => {
    it('should retrieve localized tooltip strings in English and Spanish (FR-12)', () => {
      expect(getTranslation('en', 'download_tooltip')).toBe('Download');
      expect(getTranslation('es', 'download_tooltip')).toBe('Descargar');
    });

    it('should bind native title, aria-label, and keyboard focusability tabIndex={0} (FR-2, NFR-3)', () => {
      expect(fileRowSource).toContain("title={getTranslation(language, 'download_tooltip')}");
      expect(fileRowSource).toContain("aria-label={getTranslation(language, 'download_tooltip')}");
      expect(fileRowSource).toContain('tabIndex={0}');
      expect(fileRowSource).toContain('type="button"');
    });
  });

  describe('Event Propagation & Selection Decoupling (FR-3.1, EC-1)', () => {
    it('should stop event propagation on click and delegate to onDownload (FR-3.1)', () => {
      expect(fileRowSource).toContain('e.stopPropagation()');
      expect(fileRowSource).toContain('onDownload?.(item, e.currentTarget)');
    });

    it('should stop event propagation on double-click preventing navigation or selection reset (EC-1)', () => {
      expect(fileRowSource).toContain('onDoubleClick={(e) => {');
      expect(fileRowSource).toContain('e.stopPropagation();');
    });

    it('should activate via Enter and Space keydown stopping propagation and preventing scroll (FR-3.1, EC-1)', () => {
      expect(fileRowSource).toContain("e.key === 'Enter' || e.key === ' '");
      expect(fileRowSource).toContain('e.preventDefault()');
      expect(fileRowSource).toContain('onDownload?.(item, e.currentTarget)');
    });
  });

  describe('Parent Navigation Row Exclusion (FR-11)', () => {
    it('should ensure virtual parent row ("...") never renders any download action button', () => {
      expect(parentRowSource).not.toContain('item-download-btn');
      expect(parentRowSource).not.toContain('download_tooltip');
    });
  });

  describe('FileExplorer Wiring (US-1)', () => {
    it('should pass onDownload handler down to FileTableRow', () => {
      expect(explorerSource).toContain('onDownload=');
    });

    it('should apply pr-16 clearance to table header and parent nav row', () => {
      expect(explorerSource).toContain('pr-16');
      expect(parentRowSource).toContain('pr-16');
    });
  });
});
