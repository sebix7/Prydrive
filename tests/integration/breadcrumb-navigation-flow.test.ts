import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  initialExplorerState,
  explorerReducer,
  truncateFolderStack,
  isAtRootDirectory,
  getCurrentFolder,
  type FolderCrumb
} from '../../src/shared/explorer-helpers';
import type { StorageItem } from '../../src/shared/types';
import {
  createInitialTree,
  addChildrenToTree,
  syncTreeWithFolderStack,
  buildFolderHistoryFromTree
} from '../../src/shared/tree-helpers';

describe('Breadcrumb Navigation Flow & Stack Truncation (Spec 010 US-2 / T2 / FR-5, FR-6, FR-7, FR-13)', () => {
  const rootCrumb: FolderCrumb = { id: 'root', name: 'My Drive' };
  const docsCrumb: FolderCrumb = { id: 'folder_docs', name: 'Documents' };
  const archiveCrumb: FolderCrumb = { id: 'folder_archive', name: 'Archive 2026' };
  const taxesCrumb: FolderCrumb = { id: 'folder_taxes', name: 'Tax Returns' };

  const deepStack: FolderCrumb[] = [rootCrumb, docsCrumb, archiveCrumb, taxesCrumb];

  describe('truncateFolderStack Pure Logic (FR-5)', () => {
    it('should slice the navigation stack up to the clicked ancestor folder ID', () => {
      const truncatedToDocs = truncateFolderStack(deepStack, 'folder_docs');
      expect(truncatedToDocs).toEqual([rootCrumb, docsCrumb]);
      expect(truncatedToDocs).toHaveLength(2);

      const truncatedToArchive = truncateFolderStack(deepStack, 'folder_archive');
      expect(truncatedToArchive).toEqual([rootCrumb, docsCrumb, archiveCrumb]);
      expect(truncatedToArchive).toHaveLength(3);
    });

    it('should truncate all the way back to root when the root crumb is clicked', () => {
      const truncatedToRoot = truncateFolderStack(deepStack, 'root');
      expect(truncatedToRoot).toEqual([rootCrumb]);
      expect(truncatedToRoot).toHaveLength(1);
    });

    it('should return the stack unchanged if the target folder is already the active folder', () => {
      const unchanged = truncateFolderStack(deepStack, 'folder_taxes');
      expect(unchanged).toEqual(deepStack);
      expect(unchanged).toHaveLength(4);
    });

    it('should return the stack unchanged if the target ID is not found in history', () => {
      const unchanged = truncateFolderStack(deepStack, 'non_existent_id');
      expect(unchanged).toEqual(deepStack);
    });

    it('should safely fall back to baseline root history if stack is empty or corrupted', () => {
      const fallback = truncateFolderStack([], 'any_id');
      expect(fallback).toEqual([{ id: 'root', name: 'My Drive' }]);
    });
  });

  describe('Full Navigation State Integration: Ancestor Click & Reducer (FR-5, FR-6)', () => {
    it('should navigate directly to ancestor folder and truncate subsequent history in explorer state', () => {
      // Setup state standing in deeply nested folder
      const currentState = {
        ...initialExplorerState,
        folderHistory: deepStack,
        selectedItemId: 'item_123',
        isLoading: false,
        items: [
          {
            id: 'item_123',
            name: 'W2_Form.pdf',
            mimeType: 'application/pdf',
            isDirectory: false,
            sizeBytes: 1024,
            formattedSize: '1 KB',
            createdAt: '2026-01-01',
            formattedCreatedAt: '01/01/2026',
            iconType: 'pdf',
            isShortcut: false
          } as StorageItem
        ]
      };

      // User clicks 'Documents' ancestor in breadcrumbs
      const truncatedStack = truncateFolderStack(currentState.folderHistory, 'folder_docs');
      const nextState = explorerReducer(currentState, {
        type: 'NAVIGATE_TO_FOLDER_STACK',
        payload: truncatedStack
      });

      expect(nextState.folderHistory).toEqual([rootCrumb, docsCrumb]);
      expect(getCurrentFolder(nextState.folderHistory).id).toBe('folder_docs');
      expect(nextState.isLoading).toBe(true);
      expect(nextState.selectedItemId).toBeNull();
      expect(nextState.items).toEqual([]);
    });

    it('should ignore redundant navigation if clicked crumb is the currently active crumb (FR-6)', () => {
      const currentState = {
        ...initialExplorerState,
        folderHistory: deepStack,
        isLoading: false
      };

      // Clicking active crumb taxesCrumb ('folder_taxes')
      const targetStack = truncateFolderStack(currentState.folderHistory, 'folder_taxes');
      const nextState = explorerReducer(currentState, {
        type: 'NAVIGATE_TO_FOLDER_STACK',
        payload: targetStack
      });

      // State reference is completely preserved without triggering loading or clearing items
      expect(nextState).toBe(currentState);
      expect(nextState.isLoading).toBe(false);
    });
  });

  describe('Complementary "..." Virtual Parent Row Navigation (FR-9, FR-13, EC-8)', () => {
    it('should pop active crumb when NAVIGATE_UP is dispatched (simulating "..." double-click)', () => {
      const currentState = {
        ...initialExplorerState,
        folderHistory: [rootCrumb, docsCrumb, archiveCrumb]
      };

      // Double-clicking parent row '...' dispatches NAVIGATE_UP
      const nextState = explorerReducer(currentState, { type: 'NAVIGATE_UP' });

      expect(nextState.folderHistory).toEqual([rootCrumb, docsCrumb]);
      expect(getCurrentFolder(nextState.folderHistory).id).toBe('folder_docs');
      expect(isAtRootDirectory(nextState.folderHistory)).toBe(false);

      // Ascending once more to root
      const rootState = explorerReducer(nextState, { type: 'NAVIGATE_UP' });
      expect(rootState.folderHistory).toEqual([rootCrumb]);
      expect(getCurrentFolder(rootState.folderHistory).id).toBe('root');
      expect(isAtRootDirectory(rootState.folderHistory)).toBe(true);
    });

    it('should prevent ascending beyond root directory when NAVIGATE_UP is triggered at root', () => {
      const rootState = {
        ...initialExplorerState,
        folderHistory: [rootCrumb]
      };

      const result = explorerReducer(rootState, { type: 'NAVIGATE_UP' });
      expect(result).toBe(rootState);
      expect(result.folderHistory).toEqual([rootCrumb]);
    });
  });

  describe('Directory Tree & Breadcrumb Lineage Synchronization (FR-13, EC-7)', () => {
    it('should sync tree node selection to breadcrumb history and vice versa', () => {
      let tree = createInitialTree('My Drive');
      const docsItem: StorageItem = {
        id: 'folder_docs',
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
      const archiveItem: StorageItem = {
        id: 'folder_archive',
        name: 'Archive 2026',
        mimeType: 'application/vnd.google-apps.folder',
        isDirectory: true,
        sizeBytes: null,
        formattedSize: '--',
        createdAt: '2026-01-02',
        formattedCreatedAt: '02/01/2026',
        iconType: 'folder',
        isShortcut: false
      };

      tree = addChildrenToTree(tree, 'root', [docsItem]);
      tree = addChildrenToTree(tree, 'folder_docs', [archiveItem]);

      // 1. When tree node 'folder_archive' is selected, breadcrumb builds full lineage
      const lineageFromTree = buildFolderHistoryFromTree(tree, 'folder_archive');
      expect(lineageFromTree).toEqual([rootCrumb, docsCrumb, archiveCrumb]);

      // 2. When breadcrumb jumps back to 'folder_docs', tree branches auto-expand to target
      const breadcrumbTruncated = truncateFolderStack(lineageFromTree, 'folder_docs');
      const updatedTree = syncTreeWithFolderStack(tree, breadcrumbTruncated, 'folder_docs');
      expect(updatedTree['root'].isExpanded).toBe(true);
      expect(updatedTree['folder_docs'].isExpanded).toBe(true);
      expect(updatedTree['folder_docs'].parentId).toBe('root');
    });
  });

  describe('Component Architecture & Interaction Wireup (FR-5, FR-6, FR-7)', () => {
    const breadcrumbComponentSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/ExplorerBreadcrumbBar.tsx'),
      'utf-8'
    );
    const explorerComponentSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
      'utf-8'
    );

    it('should wire ancestor crumb button click to onNavigateToCrumb with folder ID (FR-5, FR-7)', () => {
      expect(breadcrumbComponentSource).toContain('onClick={() => onNavigateToCrumb(crumb.id)}');
      expect(breadcrumbComponentSource).toContain('type="button"');
      expect(breadcrumbComponentSource).toContain('data-testid={`breadcrumb-crumb-${crumb.id}`}');
    });

    it('should render active crumb as non-clickable text with aria-current="page" (FR-6)', () => {
      expect(breadcrumbComponentSource).toContain('aria-current="page"');
      expect(breadcrumbComponentSource).toContain('data-testid="breadcrumb-active-crumb"');
      expect(breadcrumbComponentSource).not.toMatch(/<button[^>]*data-testid="breadcrumb-active-crumb"/);
    });

    it('should connect ExplorerBreadcrumbBar in FileExplorer to truncateFolderStack and navigateToFolderStack', () => {
      expect(explorerComponentSource).toContain('truncateFolderStack(folderHistory, targetId)');
      expect(explorerComponentSource).toContain('navigateToFolderStack(newStack)');
    });
  });
});
