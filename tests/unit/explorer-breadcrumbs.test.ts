import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  formatCrumbDisplayName,
  truncateFolderStack,
  type FolderCrumb
} from '../../src/shared/explorer-helpers';
import {
  getBreadcrumbBarClasses,
  getBreadcrumbCrumbClasses,
  getBreadcrumbSeparatorClasses
} from '../../src/shared/theme';

describe('Explorer Navigation Breadcrumbs (Spec 010 US-1, US-2 / T1, T2 / FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-9, FR-13, NFR-1)', () => {
  describe('formatCrumbDisplayName — Root Localization & Name Formatting (FR-2, EC-3)', () => {
    const rootCrumb: FolderCrumb = { id: 'root', name: 'My Drive' };
    const customRootCrumb: FolderCrumb = { id: 'root', name: 'Random Remote Name' };
    const subfolderCrumb: FolderCrumb = { id: 'folder_123', name: 'Client Documents 2026' };

    it('should localize root directory crumb name to "Mi unidad" for Spanish (es)', () => {
      expect(formatCrumbDisplayName(rootCrumb, true, 'es')).toBe('Mi unidad');
      expect(formatCrumbDisplayName(customRootCrumb, true, 'es')).toBe('Mi unidad');
      expect(formatCrumbDisplayName(rootCrumb, false, 'es')).toBe('Mi unidad');
    });

    it('should localize root directory crumb name to "My Drive" for English (en)', () => {
      expect(formatCrumbDisplayName(rootCrumb, true, 'en')).toBe('My Drive');
      expect(formatCrumbDisplayName(customRootCrumb, true, 'en')).toBe('My Drive');
      expect(formatCrumbDisplayName(rootCrumb, false, 'en')).toBe('My Drive');
    });

    it('should return exact subfolder name without artificial character truncation for non-root crumbs', () => {
      expect(formatCrumbDisplayName(subfolderCrumb, false, 'es')).toBe('Client Documents 2026');
      expect(formatCrumbDisplayName(subfolderCrumb, false, 'en')).toBe('Client Documents 2026');
    });

    it('should safely fall back to "Untitled" if subfolder name is missing', () => {
      const emptyCrumb: FolderCrumb = { id: 'folder_empty', name: '' };
      expect(formatCrumbDisplayName(emptyCrumb, false, 'en')).toBe('Untitled');
    });
  });

  describe('Theme Class Resolvers — 32px Bar & Swiss Archive Palette (FR-1, FR-8, FR-11, FR-12)', () => {
    it('should resolve Light Mode breadcrumb bar classes with 32px height, #F2F0EA surface, and scrollbar-none', () => {
      const lightBar = getBreadcrumbBarClasses('light');
      expect(lightBar).toContain('h-8');
      expect(lightBar).toContain('bg-[#F2F0EA]');
      expect(lightBar).toContain('border-[#C9C6BD]');
      expect(lightBar).toContain('scrollbar-none');
      expect(lightBar).toContain('overflow-x-auto');
    });

    it('should resolve Dark Mode breadcrumb bar classes with 32px height, #15181E surface, and scrollbar-none', () => {
      const darkBar = getBreadcrumbBarClasses('dark');
      expect(darkBar).toContain('h-8');
      expect(darkBar).toContain('bg-[#15181E]');
      expect(darkBar).toContain('border-[#2C323D]');
      expect(darkBar).toContain('scrollbar-none');
      expect(darkBar).toContain('overflow-x-auto');
    });

    it('should resolve active crumb classes with prominent font-semibold and primary ink', () => {
      const lightActive = getBreadcrumbCrumbClasses(true, 'light');
      expect(lightActive).toContain('font-semibold');
      expect(lightActive).toContain('text-[#111315]');
      expect(lightActive).toContain('cursor-default');

      const darkActive = getBreadcrumbCrumbClasses(true, 'dark');
      expect(darkActive).toContain('font-semibold');
      expect(darkActive).toContain('text-[#F3F4F6]');
      expect(darkActive).toContain('cursor-default');
    });

    it('should resolve ancestor crumb classes with pointer cursor and Klein Blue hover accents', () => {
      const lightAncestor = getBreadcrumbCrumbClasses(false, 'light');
      expect(lightAncestor).toContain('cursor-pointer');
      expect(lightAncestor).toContain('text-[#7C8087]');
      expect(lightAncestor).toContain('hover:text-[#1B44E8]');

      const darkAncestor = getBreadcrumbCrumbClasses(false, 'dark');
      expect(darkAncestor).toContain('cursor-pointer');
      expect(darkAncestor).toContain('text-[#9CA3AF]');
      expect(darkAncestor).toContain('hover:text-[#3B66FF]');
    });

    it('should resolve typographical slash separator classes with muted contrast', () => {
      const lightSep = getBreadcrumbSeparatorClasses('light');
      expect(lightSep).toContain('font-mono');
      expect(lightSep).toContain('text-[#A0A4A8]');

      const darkSep = getBreadcrumbSeparatorClasses('dark');
      expect(darkSep).toContain('font-mono');
      expect(darkSep).toContain('text-[#4B5563]');
    });
  });

  describe('FileExplorer.tsx Integration & Component Structure (FR-1, FR-9)', () => {
    const explorerSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
      'utf-8'
    );

    it('should import and render ExplorerBreadcrumbBar in FileExplorer.tsx', () => {
      expect(explorerSource).toContain('ExplorerBreadcrumbBar');
    });

    it('should place ExplorerBreadcrumbBar immediately above the table header', () => {
      const breadcrumbIndex = explorerSource.indexOf('<ExplorerBreadcrumbBar');
      const headerIndex = explorerSource.indexOf('data-testid="explorer-table-header"');
      expect(breadcrumbIndex).toBeGreaterThan(-1);
      expect(headerIndex).toBeGreaterThan(-1);
      expect(breadcrumbIndex).toBeLessThan(headerIndex);
    });

    it('should preserve ParentNavRow (...) inside the file table', () => {
      expect(explorerSource).toContain('ParentNavRow');
    });
  });

  describe('truncateFolderStack Pure Slicing (US-2 / T2 / FR-5, FR-13)', () => {
    const stack: FolderCrumb[] = [
      { id: 'root', name: 'My Drive' },
      { id: 'f-work', name: 'Work' },
      { id: 'f-clients', name: 'Clients' },
      { id: 'f-acme', name: 'Acme Corp' }
    ];

    it('should truncate stack up to the target ancestor crumb', () => {
      const truncated = truncateFolderStack(stack, 'f-work');
      expect(truncated).toEqual([
        { id: 'root', name: 'My Drive' },
        { id: 'f-work', name: 'Work' }
      ]);
      expect(truncated).toHaveLength(2);
    });

    it('should truncate all levels to root when target is root', () => {
      const truncated = truncateFolderStack(stack, 'root');
      expect(truncated).toEqual([{ id: 'root', name: 'My Drive' }]);
      expect(truncated).toHaveLength(1);
    });

    it('should leave stack unchanged if target is the active crumb', () => {
      const unchanged = truncateFolderStack(stack, 'f-acme');
      expect(unchanged).toEqual(stack);
    });

    it('should return original stack if target id is not found in history', () => {
      const notFound = truncateFolderStack(stack, 'f-unknown');
      expect(notFound).toEqual(stack);
    });

    it('should safely fall back to root crumb if input stack is empty', () => {
      const fallback = truncateFolderStack([], 'f-any');
      expect(fallback).toEqual([{ id: 'root', name: 'My Drive' }]);
    });
  });

  describe('ExplorerBreadcrumbBar.tsx Component Contract (US-2 / T2 / FR-5, FR-6, FR-7)', () => {
    const barSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ExplorerBreadcrumbBar.tsx'),
      'utf-8'
    );

    it('should render ancestor crumbs as interactive clickable buttons', () => {
      expect(barSource).toContain('type="button"');
      expect(barSource).toContain('onClick={() => onNavigateToCrumb(crumb.id)}');
      expect(barSource).toContain('data-testid={`breadcrumb-crumb-${crumb.id}`}');
    });

    it('should render active crumb as non-clickable span with aria-current="page"', () => {
      expect(barSource).toContain('aria-current="page"');
      expect(barSource).toContain('data-testid="breadcrumb-active-crumb"');
      expect(barSource).not.toMatch(/<button[^>]*data-testid="breadcrumb-active-crumb"/);
    });
  });
});

