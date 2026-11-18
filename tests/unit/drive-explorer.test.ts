import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getRowSelectionClasses } from '../../src/shared/explorer-helpers';

describe('Swiss Archive Drive Explorer Table & Selection Helper (Spec 006 US-4, FR-12, FR-13, FR-14)', () => {
  describe('getRowSelectionClasses (FR-13, EC-4)', () => {
    it('should return Swiss Archive light mode selected classes with #DDE7FA surface, Klein Blue text, and 3px left indicator bar', () => {
      const selectedLight = getRowSelectionClasses(true, 'light');
      expect(selectedLight).toContain('bg-[#DDE7FA]');
      expect(selectedLight).toContain('text-[#1B44E8]');
      expect(selectedLight).toContain('border-l-[3px]');
      expect(selectedLight).toContain('border-[#1B44E8]');
    });

    it('should return Swiss Archive light mode unselected classes with #111315 text and #ECEAE3 hover surface', () => {
      const unselectedLight = getRowSelectionClasses(false, 'light');
      expect(unselectedLight).toContain('text-[#111315]');
      expect(unselectedLight).toContain('hover:bg-[#ECEAE3]');
      expect(unselectedLight).toContain('border-l-[3px]');
      expect(unselectedLight).toContain('border-transparent');
    });

    it('should return Swiss Archive dark mode selected classes with #1C2D52 surface, Klein Blue text, and 3px left indicator bar', () => {
      const selectedDark = getRowSelectionClasses(true, 'dark');
      expect(selectedDark).toContain('bg-[#1C2D52]');
      expect(selectedDark).toContain('text-[#3B66FF]');
      expect(selectedDark).toContain('border-l-[3px]');
      expect(selectedDark).toContain('border-[#3B66FF]');
    });

    it('should return Swiss Archive dark mode unselected classes with #F3F4F6 text and #1E232C hover surface', () => {
      const unselectedDark = getRowSelectionClasses(false, 'dark');
      expect(unselectedDark).toContain('text-[#F3F4F6]');
      expect(unselectedDark).toContain('hover:bg-[#1E232C]');
      expect(unselectedDark).toContain('border-l-[3px]');
      expect(unselectedDark).toContain('border-transparent');
    });
  });

  describe('FileExplorer.tsx Swiss Archive Implementation (FR-12, EC-2)', () => {
    const explorerSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
      'utf-8'
    );

    it('should render elevated table container with #FFFFFF (light) and #181C23 (dark)', () => {
      expect(explorerSource).toContain('bg-[#FFFFFF]');
      expect(explorerSource).toContain('dark:bg-[#181C23]');
    });

    it('should render 36px sticky header with uppercase monospace typography and secondary surface', () => {
      expect(explorerSource).toContain('sticky top-0');
      expect(explorerSource).toContain('h-9');
      expect(explorerSource).toContain('font-mono');
      expect(explorerSource).toContain('uppercase');
      expect(explorerSource).toContain('bg-[#F2F0EA]');
      expect(explorerSource).toContain('dark:bg-[#15181E]');
      expect(explorerSource).toContain('border-[#C9C6BD]');
      expect(explorerSource).toContain('dark:border-[#2C323D]');
    });

    it('should render Swiss Archive empty, loading, and error states with 6px-radius badges and Klein Blue retry button', () => {
      expect(explorerSource).toContain('rounded-[6px]');
      expect(explorerSource).toContain('bg-[#1B44E8]');
      expect(explorerSource).toContain('dark:bg-[#3B66FF]');
    });
  });

  describe('FileTableRow.tsx & ParentNavRow.tsx Swiss Archive Rows (FR-12, FR-13)', () => {
    const fileRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileTableRow.tsx'),
      'utf-8'
    );
    const parentRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ParentNavRow.tsx'),
      'utf-8'
    );

    it('should render FileTableRow with 36px (h-9) height and subtle horizontal rules #DFDDD6 / #222730', () => {
      expect(fileRowSource).toContain('h-9');
      expect(fileRowSource).toContain('border-b-[#DFDDD6]');
      expect(fileRowSource).toContain('dark:border-b-[#222730]');
      expect(fileRowSource).toContain('font-sans');
    });

    it('should render ParentNavRow with 36px (h-9) height, subtle horizontal rules #DFDDD6 / #222730, and monospace "..." label', () => {
      expect(parentRowSource).toContain('h-9');
      expect(parentRowSource).toContain('border-b-[#DFDDD6]');
      expect(parentRowSource).toContain('dark:border-b-[#222730]');
      expect(parentRowSource).toContain('font-mono');
      expect(parentRowSource).toContain('...');
    });
  });

  describe('ExplorerStatusBar.tsx Swiss Archive Footer (FR-14)', () => {
    const statusBarSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ExplorerStatusBar.tsx'),
      'utf-8'
    );

    it('should render 36px secondary footer with #F2F0EA / #15181E and strong border rule #C9C6BD / #2C323D', () => {
      expect(statusBarSource).toContain('h-9');
      expect(statusBarSource).toContain('bg-[#F2F0EA]');
      expect(statusBarSource).toContain('dark:bg-[#15181E]');
      expect(statusBarSource).toContain('border-[#C9C6BD]');
      expect(statusBarSource).toContain('dark:border-[#2C323D]');
    });

    it('should render monospace metrics with left-aligned counts and right-aligned total size, without refresh button (FR-14, Spec 006 T7)', () => {
      expect(statusBarSource).toContain('data-testid="explorer-status-counts"');
      expect(statusBarSource).toContain('data-testid="explorer-status-total-size"');
      expect(statusBarSource).toContain('font-mono');
      expect(statusBarSource).not.toContain('explorer-refresh-button');
      expect(statusBarSource).not.toContain('RotateCw');

      const countsPos = statusBarSource.indexOf('data-testid="explorer-status-counts"');
      const totalSizePos = statusBarSource.indexOf('data-testid="explorer-status-total-size"');
      expect(countsPos).toBeLessThan(totalSizePos);
    });
  });

  describe('Spec 011 Two-Column Table Layout (US-1, FR-1, FR-2)', () => {
    const explorerSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
      'utf-8'
    );
    const fileRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileTableRow.tsx'),
      'utf-8'
    );
    const parentRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ParentNavRow.tsx'),
      'utf-8'
    );

    it('should eliminate creation date and size columns from sticky header and rows (FR-1, FR-2)', () => {
      expect(explorerSource).not.toContain('explorer_col_created');
      expect(explorerSource).not.toContain('explorer_col_size');
      expect(fileRowSource).not.toContain('formattedCreatedAt');
      expect(fileRowSource).not.toContain('formattedSize');
      expect(parentRowSource).not.toContain('w-44');
      expect(parentRowSource).not.toContain('w-24');
    });

    it('should render two-column sticky header: Icon w-10 and Name flex-1 (FR-2)', () => {
      expect(explorerSource).toContain('w-10 text-center shrink-0');
      expect(explorerSource).toContain('flex-1 min-w-0');
      expect(explorerSource).toContain('explorer_col_name');
    });
  });

  describe('Spec 011 Details Action Button (US-2, FR-3, FR-4, FR-5, EC-1, EC-7)', () => {
    const fileRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileTableRow.tsx'),
      'utf-8'
    );
    const parentRowSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ParentNavRow.tsx'),
      'utf-8'
    );

    it('should render 26px x 26px geometric button with Info icon and Swiss Archive borders in FileTableRow (FR-3, FR-4)', () => {
      expect(fileRowSource).toContain('data-testid="item-details-btn"');
      expect(fileRowSource).toContain('w-[26px]');
      expect(fileRowSource).toContain('h-[26px]');
      expect(fileRowSource).toContain('rounded-[4px]');
      expect(fileRowSource).toContain('border-[#C9C6BD]');
      expect(fileRowSource).toContain('dark:border-[#2C323D]');
      expect(fileRowSource).toContain('Info');
      expect(fileRowSource).toContain('item_details_tooltip');
    });

    it('should not render details button in ParentNavRow (FR-9, EC-3)', () => {
      expect(parentRowSource).not.toContain('item-details-btn');
      expect(parentRowSource).not.toContain('item_details_tooltip');
      expect(parentRowSource).not.toContain('Info');
    });
  });
});
