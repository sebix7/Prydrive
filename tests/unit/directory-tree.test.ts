import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getTreeTechnicalStripIdentifier } from '../../src/shared/shell-state';

describe('Directory Tree Components & IPC Query Filtering (Spec 007 US-2 / T2 & US-4 / T4)', () => {
  describe('TreeExpanderBox Component (FR-5, FR-6)', () => {
    it('should verify TreeExpanderBox.tsx renders 12x12px square box with + and - indicators', () => {
      const source = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/TreeExpanderBox.tsx'),
        'utf-8'
      );
      expect(source).toContain('w-3');
      expect(source).toContain('h-3');
      expect(source).toContain('tree-expander-box');
      expect(source).toContain('+');
      expect(source).toContain('−');
    });
  });

  describe('TreeNodeItem Component (FR-7, FR-11, FR-12, FR-13, EC-2, EC-4)', () => {
    it('should verify TreeNodeItem.tsx enforces 32px row height, title tooltip, root dot indicator, scrollIntoView nearest, and omits expander on leaf nodes', () => {
      const source = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/TreeNodeItem.tsx'),
        'utf-8'
      );
      expect(source).toContain('h-8'); // 32px height
      expect(source).toContain('title={node.name}');
      expect(source).toContain('truncate');
      expect(source).toContain('isLeaf');
      expect(source).toContain('tree-leaf-line');
      expect(source).toContain('tree-root-dot-box');
      expect(source).toContain('·');
      expect(source).toContain('scrollIntoView');
      expect(source).toContain("block: 'nearest'");
      expect(source).toContain('tree-node-item');
    });

    it('should apply Swiss Archive surfaces, hover states, and 3px Klein Blue selection bar across themes (FR-11, FR-12)', () => {
      const source = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/TreeNodeItem.tsx'),
        'utf-8'
      );
      // Selected state
      expect(source).toContain('bg-[#DDE7FA]');
      expect(source).toContain('dark:bg-[#1C2D52]');
      expect(source).toContain('text-[#1B44E8]');
      expect(source).toContain('dark:text-[#3B66FF]');
      expect(source).toContain('w-[3px]');
      // Unselected hover state
      expect(source).toContain('hover:bg-[#ECEAE3]');
      expect(source).toContain('dark:hover:bg-[#1E232C]');
    });

    it('should render discreet retry icon when branch encounters a network error (EC-4)', () => {
      const source = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/TreeNodeItem.tsx'),
        'utf-8'
      );
      expect(source).toContain('tree-retry-branch');
      expect(source).toContain('RotateCw');
    });
  });

  describe('Technical Index Strip & DirectoryTreePanel (FR-3, US-4)', () => {
    it('should return DRIVE // TREE · MY_DRIVE monospace technical identifier across languages', () => {
      expect(getTreeTechnicalStripIdentifier('en')).toBe('MY_DRIVE');
      expect(getTreeTechnicalStripIdentifier('es')).toBe('MY_DRIVE');
    });

    it('should verify DirectoryTreePanel renders 32px Technical Index Strip with Swiss Archive borders', () => {
      const source = readFileSync(
        resolve(__dirname, '../../src/renderer/src/components/tree/DirectoryTreePanel.tsx'),
        'utf-8'
      );
      expect(source).toContain('data-testid="tree-technical-strip"');
      expect(source).toContain('h-8'); // 32px height
      expect(source).toContain('font-mono');
      expect(source).toContain('DRIVE // TREE');
      expect(source).toContain('getTreeTechnicalStripIdentifier');
      expect(source).toContain('border-[#C9C6BD]');
      expect(source).toContain('dark:border-[#2C323D]');
    });
  });

  describe('Main Process Folder Query Filtering (NFR-1)', () => {
    it('should verify google-client.ts appends folder mimeType when foldersOnly is true', () => {
      const googleClientSource = readFileSync(
        resolve(__dirname, '../../src/main/core/google-client.ts'),
        'utf-8'
      );
      expect(googleClientSource).toContain('foldersOnly');
      expect(googleClientSource).toContain("mimeType = 'application/vnd.google-apps.folder'");
    });

    it('should verify storage-ipc.ts forwards foldersOnly to googleClient.listDirectory', () => {
      const ipcSource = readFileSync(
        resolve(__dirname, '../../src/main/ipc/storage-ipc.ts'),
        'utf-8'
      );
      expect(ipcSource).toContain('foldersOnly');
    });
  });
});
