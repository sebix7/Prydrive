import { describe, it, expect } from 'vitest';
import {
  createInitialTree,
  addChildrenToTree,
  expandTreeNode,
  collapseTreeNode,
  invalidateTreeCache
} from '../../src/shared/tree-helpers';
import type { StorageItem } from '../../src/shared/types';

describe('Tree Helpers & Pure Algorithms (Spec 007 US-2 / T2)', () => {
  const mockFolderA: StorageItem = {
    id: 'folder-a',
    name: 'Documents',
    mimeType: 'application/vnd.google-apps.folder',
    isDirectory: true,
    sizeBytes: null,
    formattedSize: '--',
    createdAt: '2026-01-01',
    formattedCreatedAt: '01/01/2026',
    iconType: 'folder',
    isShortcut: false
  };

  const mockFolderB: StorageItem = {
    id: 'folder-b',
    name: 'Projects',
    mimeType: 'application/vnd.google-apps.folder',
    isDirectory: true,
    sizeBytes: null,
    formattedSize: '--',
    createdAt: '2026-01-02',
    formattedCreatedAt: '02/01/2026',
    iconType: 'folder',
    isShortcut: false
  };

  describe('createInitialTree (FR-4)', () => {
    it('should initialize single root node with depth 0 and default My Drive label permanently expanded', () => {
      const tree = createInitialTree();
      expect(tree['root']).toBeDefined();
      expect(tree['root'].id).toBe('root');
      expect(tree['root'].name).toBe('My Drive');
      expect(tree['root'].depth).toBe(0);
      expect(tree['root'].parentId).toBeNull();
      expect(tree['root'].isExpanded).toBe(true);
      expect(tree['root'].isLeaf).toBe(false);
      expect(tree['root'].hasLoadedChildren).toBe(false);
      expect(tree['root'].childrenIds).toEqual([]);
    });

    it('should allow custom localized root label', () => {
      const tree = createInitialTree('Mi unidad');
      expect(tree['root'].name).toBe('Mi unidad');
    });
  });

  describe('addChildrenToTree & Leaf Detection (FR-5, FR-7)', () => {
    it('should merge subfolders into parent node with incremented depth and expand branch', () => {
      const initial = createInitialTree();
      const tree = addChildrenToTree(initial, 'root', [mockFolderA, mockFolderB]);

      expect(tree['root'].isExpanded).toBe(true);
      expect(tree['root'].hasLoadedChildren).toBe(true);
      expect(tree['root'].isLeaf).toBe(false);
      expect(tree['root'].childrenIds).toEqual(['folder-a', 'folder-b']);

      expect(tree['folder-a']).toBeDefined();
      expect(tree['folder-a'].name).toBe('Documents');
      expect(tree['folder-a'].depth).toBe(1);
      expect(tree['folder-a'].parentId).toBe('root');
      expect(tree['folder-a'].hasLoadedChildren).toBe(false);

      expect(tree['folder-b']).toBeDefined();
      expect(tree['folder-b'].name).toBe('Projects');
      expect(tree['folder-b'].depth).toBe(1);
    });

    it('should mark node as isLeaf=true and isExpanded=false when child list is empty', () => {
      const initial = createInitialTree();
      const withChild = addChildrenToTree(initial, 'root', [mockFolderA]);
      const withEmptyLeaf = addChildrenToTree(withChild, 'folder-a', []);

      expect(withEmptyLeaf['folder-a'].isLeaf).toBe(true);
      expect(withEmptyLeaf['folder-a'].isExpanded).toBe(false);
      expect(withEmptyLeaf['folder-a'].hasLoadedChildren).toBe(true);
      expect(withEmptyLeaf['folder-a'].childrenIds).toEqual([]);
    });
  });

  describe('expandTreeNode & collapseTreeNode with Parent Navigation (FR-5, FR-6)', () => {
    it('should set isExpanded to true when expanding', () => {
      const initial = createInitialTree();
      const expanded = expandTreeNode(initial, 'root');
      expect(expanded['root'].isExpanded).toBe(true);
    });

    it('should set isExpanded to false and return parent id for navigation on collapse (FR-6)', () => {
      const initial = createInitialTree();
      const withChildren = addChildrenToTree(initial, 'root', [mockFolderA]);
      const withSubChildren = addChildrenToTree(withChildren, 'folder-a', [mockFolderB]);

      // Collapse folder-a -> should navigate to root (its parent)
      const result = collapseTreeNode(withSubChildren, 'folder-a');
      expect(result.tree['folder-a'].isExpanded).toBe(false);
      expect(result.navigateToParentId).toBe('root');
    });

    it('should keep root permanently expanded and return root id when collapsing the root node (Decision 13)', () => {
      const initial = createInitialTree();
      const result = collapseTreeNode(initial, 'root');
      expect(result.tree['root'].isExpanded).toBe(true);
      expect(result.navigateToParentId).toBe('root');
    });
  });

  describe('invalidateTreeCache (FR-10)', () => {
    it('should reset loaded state and purge cached descendants back to root', () => {
      const initial = createInitialTree();
      const withChildren = addChildrenToTree(initial, 'root', [mockFolderA, mockFolderB]);
      expect(Object.keys(withChildren).length).toBe(3);

      const invalidated = invalidateTreeCache(withChildren);
      expect(Object.keys(invalidated).length).toBe(1);
      expect(invalidated['root']).toBeDefined();
      expect(invalidated['root'].hasLoadedChildren).toBe(false);
      expect(invalidated['root'].childrenIds).toEqual([]);
    });
  });
});
