import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createInitialTree,
  addChildrenToTree,
  expandTreeNode,
  collapseTreeNode,
  syncTreeWithFolderStack,
  buildFolderHistoryFromTree,
  getVisibleTreeNodes
} from '../../src/shared/tree-helpers';
import {
  initialExplorerState,
  explorerReducer,
  pushFolderHistory,
  popFolderHistory
} from '../../src/shared/explorer-helpers';
import type { StorageItem, FolderCrumb } from '../../src/shared/types';

describe('Tree Navigation Flow & Bidirectional Synchronization (Spec 007 US-3 / T3)', () => {
  const folderDocuments: StorageItem = {
    id: 'folder-documents',
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

  const folderProjects: StorageItem = {
    id: 'folder-projects',
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

  const folderPrydrive: StorageItem = {
    id: 'folder-prydrive',
    name: 'Prydrive',
    mimeType: 'application/vnd.google-apps.folder',
    isDirectory: true,
    sizeBytes: null,
    formattedSize: '--',
    createdAt: '2026-01-03',
    formattedCreatedAt: '03/01/2026',
    iconType: 'folder',
    isShortcut: false
  };

  describe('Pure Navigation State & History Builder (FR-8, FR-9)', () => {
    it('should build full ancestor folder history stack from any nested tree node', () => {
      let tree = createInitialTree('My Drive');
      tree = addChildrenToTree(tree, 'root', [folderProjects]);
      tree = addChildrenToTree(tree, 'folder-projects', [folderPrydrive]);

      // Path for deeply nested folder-prydrive -> root > folder-projects > folder-prydrive
      const stack = buildFolderHistoryFromTree(tree, 'folder-prydrive');
      expect(stack).toHaveLength(3);
      expect(stack[0]).toEqual({ id: 'root', name: 'My Drive' });
      expect(stack[1]).toEqual({ id: 'folder-projects', name: 'Projects' });
      expect(stack[2]).toEqual({ id: 'folder-prydrive', name: 'Prydrive' });
    });

    it('should build single root stack when targeting root node', () => {
      const tree = createInitialTree('My Drive');
      const stack = buildFolderHistoryFromTree(tree, 'root');
      expect(stack).toEqual([{ id: 'root', name: 'My Drive' }]);
    });

    it('should return visible tree nodes respecting collapsed/expanded branch visibility', () => {
      let tree = createInitialTree('My Drive');
      tree = addChildrenToTree(tree, 'root', [folderDocuments, folderProjects]);
      tree = addChildrenToTree(tree, 'folder-projects', [folderPrydrive]);

      // When root is expanded and folder-projects is expanded
      const visibleAll = getVisibleTreeNodes(tree);
      expect(visibleAll.map((n) => n.id)).toEqual([
        'root',
        'folder-documents',
        'folder-projects',
        'folder-prydrive'
      ]);

      // Collapse folder-projects branch
      const collapsedResult = collapseTreeNode(tree, 'folder-projects');
      const visibleCollapsed = getVisibleTreeNodes(collapsedResult.tree);
      expect(visibleCollapsed.map((n) => n.id)).toEqual([
        'root',
        'folder-documents',
        'folder-projects'
      ]);
    });
  });

  describe('Explorer Reducer NAVIGATE_TO_FOLDER_STACK Integration (FR-8)', () => {
    it('should navigate central explorer to target folder stack when tree node is selected', () => {
      let state = { ...initialExplorerState, isLoading: false, items: [folderDocuments] };

      const targetStack: FolderCrumb[] = [
        { id: 'root', name: 'My Drive' },
        { id: 'folder-projects', name: 'Projects' }
      ];

      state = explorerReducer(state, {
        type: 'NAVIGATE_TO_FOLDER_STACK',
        payload: targetStack
      });

      expect(state.isLoading).toBe(true);
      expect(state.items).toEqual([]);
      expect(state.folderHistory).toEqual(targetStack);
      expect(state.selectedItemId).toBeNull();
    });

    it('should ignore NAVIGATE_TO_FOLDER_STACK if already standing at the target folder', () => {
      const stateAtRoot = {
        ...initialExplorerState,
        isLoading: false,
        items: [folderDocuments]
      };

      const sameRootStack: FolderCrumb[] = [{ id: 'root', name: 'My Drive' }];

      const result = explorerReducer(stateAtRoot, {
        type: 'NAVIGATE_TO_FOLDER_STACK',
        payload: sameRootStack
      });

      // Must remain unchanged without resetting to loading or wiping items
      expect(result).toBe(stateAtRoot);
      expect(result.isLoading).toBe(false);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('Bidirectional Traversal Synchronization (FR-9, EC-3)', () => {
    it('should auto-expand ancestor branches when central table drills into nested folder', () => {
      let tree = createInitialTree('My Drive');
      // Root is permanently expanded by default (Decision 13)
      expect(tree['root'].isExpanded).toBe(true);

      const folderStack: FolderCrumb[] = [
        { id: 'root', name: 'My Drive' },
        { id: 'folder-projects', name: 'Projects' },
        { id: 'folder-prydrive', name: 'Prydrive' }
      ];

      // Central table is currently at folder-prydrive
      const syncedTree = syncTreeWithFolderStack(tree, folderStack, 'folder-prydrive');

      // Root and Projects must be auto-expanded
      expect(syncedTree['root'].isExpanded).toBe(true);
      expect(syncedTree['folder-projects'].isExpanded).toBe(true);
      // Active current folder is also expanded in the tree
      expect(syncedTree['folder-prydrive'].isExpanded).toBe(true);
      expect(syncedTree['folder-prydrive'].depth).toBe(2);
      expect(syncedTree['folder-prydrive'].parentId).toBe('folder-projects');
    });

    it('should smoothly return to root when navigating up or clicking breadcrumb to root (EC-3)', () => {
      let tree = createInitialTree('My Drive');
      const folderStack: FolderCrumb[] = [
        { id: 'root', name: 'My Drive' },
        { id: 'folder-projects', name: 'Projects' }
      ];
      tree = syncTreeWithFolderStack(tree, folderStack, 'folder-projects');

      // Now table navigates back up to root
      const rootStack: FolderCrumb[] = [{ id: 'root', name: 'My Drive' }];
      const syncedToRoot = syncTreeWithFolderStack(tree, rootStack, 'root');

      expect(syncedToRoot['root']).toBeDefined();
      expect(syncedToRoot['folder-projects'].parentId).toBe('root');
    });
  });

  describe('Collapsing Branch with [-] Navigates Table to Parent (FR-6)', () => {
    it('should return parent folder id when collapsing an expanded branch', () => {
      let tree = createInitialTree('My Drive');
      tree = addChildrenToTree(tree, 'root', [folderProjects]);
      tree = addChildrenToTree(tree, 'folder-projects', [folderPrydrive]);

      const result = collapseTreeNode(tree, 'folder-projects');
      expect(result.tree['folder-projects'].isExpanded).toBe(false);
      expect(result.navigateToParentId).toBe('root');

      // Simulate table navigation to the parent
      const parentStack = buildFolderHistoryFromTree(result.tree, result.navigateToParentId);
      expect(parentStack).toEqual([{ id: 'root', name: 'My Drive' }]);
    });
  });

  describe('Lazy Folder Querying with foldersOnly & In-Memory Caching (FR-5, NFR-1)', () => {
    beforeEach(() => {
      // Mock window.api
      (global as any).window = {
        api: {
          storage: {
            listDirectory: vi.fn()
          }
        }
      };
    });

    it('should query storage provider with foldersOnly=true on expander click', async () => {
      const mockList = vi.fn().mockResolvedValue({
        success: true,
        data: {
          items: [folderDocuments, folderProjects],
          nextPageToken: null
        }
      });
      (global as any).window.api.storage.listDirectory = mockList;

      let tree = createInitialTree('My Drive');
      expect(tree['root'].hasLoadedChildren).toBe(false);

      // Simulate lazy loading root
      const res = await (global as any).window.api.storage.listDirectory({
        folderId: 'root',
        foldersOnly: true,
        pageSize: 100
      });

      expect(mockList).toHaveBeenCalledWith({
        folderId: 'root',
        foldersOnly: true,
        pageSize: 100
      });

      tree = addChildrenToTree(tree, 'root', res.data.items);
      expect(tree['root'].hasLoadedChildren).toBe(true);
      expect(tree['root'].isExpanded).toBe(true);
      expect(tree['root'].childrenIds).toEqual(['folder-documents', 'folder-projects']);

      // Root cannot be collapsed; collapse nested child folder-projects instead
      const rootCollapseAttempt = collapseTreeNode(tree, 'root');
      expect(rootCollapseAttempt.tree['root'].isExpanded).toBe(true);

      const collapsed = collapseTreeNode(tree, 'folder-projects');
      expect(collapsed.tree['folder-projects'].isExpanded).toBe(false);
      expect(collapsed.tree['folder-projects'].hasLoadedChildren).toBe(false);

      // Re-expanding a node
      const reExpanded = expandTreeNode(collapsed.tree, 'folder-projects');
      expect(reExpanded['folder-projects'].isExpanded).toBe(true);
      expect(mockList).toHaveBeenCalledTimes(1); // Still only 1 call
    });
  });

  describe('Status Bar Refresh Flow (FR-10, US-4)', () => {
    it('should compress all folders, invalidate tree cache, and return tree and table to My Drive', () => {
      // 1. Setup tree with nested expanded branches
      let tree = createInitialTree('My Drive');
      tree = addChildrenToTree(tree, 'root', [folderProjects]);
      tree = addChildrenToTree(tree, 'folder-projects', [folderPrydrive]);
      expect(tree['folder-projects'].isExpanded).toBe(true);

      // 2. Setup explorer state standing inside nested folder
      let explorerState: any = {
        ...initialExplorerState,
        folderHistory: [
          { id: 'root', name: 'My Drive' },
          { id: 'folder-projects', name: 'Projects' },
          { id: 'folder-prydrive', name: 'Prydrive' }
        ],
        items: [folderPrydrive],
        selectedItemId: 'folder-prydrive',
        isLoading: false
      };

      // 3. User clicks "Actualizar" (Refresh) in status bar -> dispatches REFRESH_DIRECTORY
      explorerState = explorerReducer(explorerState, { type: 'REFRESH_DIRECTORY' });

      // Explorer resets back to root My Drive
      expect(explorerState.folderHistory).toEqual([{ id: 'root', name: 'My Drive' }]);
      expect(explorerState.items).toEqual([]);
      expect(explorerState.selectedItemId).toBeNull();
      expect(explorerState.isLoading).toBe(true);
      expect(explorerState.refreshCounter).toBe(1);

      // Tree cache is invalidated upon refreshCounter change
      const refreshedTree = syncTreeWithFolderStack(
        createInitialTree('My Drive'),
        explorerState.folderHistory,
        explorerState.folderHistory[0].id
      );

      // Tree now only has root node permanently expanded with [·] and no subfolders yet
      expect(Object.keys(refreshedTree)).toEqual(['root']);
      expect(refreshedTree['root'].isExpanded).toBe(true);
      expect(refreshedTree['root'].hasLoadedChildren).toBe(false);

      // Once root's immediate children are reloaded from Drive, they start compressed (isExpanded=false)
      const reloadedTree = addChildrenToTree(refreshedTree, 'root', [folderProjects]);
      expect(reloadedTree['folder-projects'].isExpanded).toBe(false);
    });
  });
});
