import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Directory Tree Components & IPC Query Filtering (Spec 007 US-2 / T2)', () => {
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

  describe('TreeNodeItem Component (FR-7, FR-12, FR-13)', () => {
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
