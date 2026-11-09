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
      expect(fileRowSource).toContain('font-mono');
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

    it('should render framed 4px-radius monospace Refresh button and monospace metrics', () => {
      expect(statusBarSource).toContain('rounded-[4px]');
      expect(statusBarSource).toContain('font-mono');
      expect(statusBarSource).toContain('border-[#C9C6BD]');
      expect(statusBarSource).toContain('dark:border-[#2C323D]');
      expect(statusBarSource).toContain('bg-[#FFFFFF]');
      expect(statusBarSource).toContain('dark:bg-[#181C23]');
    });
  });
});
