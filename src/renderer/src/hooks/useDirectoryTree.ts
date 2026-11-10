import { useState, useEffect, useCallback, useRef } from 'react';
import type { TreeStateMap, FolderCrumb } from '../../../shared/types';
import {
  createInitialTree,
  addChildrenToTree,
  expandTreeNode,
  collapseTreeNode,
  syncTreeWithFolderStack,
  buildFolderHistoryFromTree,
  invalidateTreeCache,
  getVisibleTreeNodes
} from '../../../shared/tree-helpers';
import { useDriveExplorerContext } from '../context/DriveExplorerContext';

export interface UseDirectoryTreeOptions {
  rootLabel?: string;
  activeFolderId?: string;
  folderHistory?: FolderCrumb[];
  onNavigateToFolder?: (folderId: string, folderName: string, stack: FolderCrumb[]) => void;
  refreshCounter?: number;
}

/**
 * Custom React Hook governing Directory Tree state, lazy on-demand loading,
 * memory caching, and bidirectional parallel synchronization with the central table (Spec 007 US-3).
 */
export function useDirectoryTree(options?: UseDirectoryTreeOptions) {
  const explorer = useDriveExplorerContext();

  const currentFolderId = options?.activeFolderId ?? explorer.currentFolder.id;
  const folderHistory = options?.folderHistory ?? explorer.folderHistory;
  const refreshCounter = options?.refreshCounter ?? explorer.refreshCounter;
  const rootLabel = options?.rootLabel ?? (folderHistory?.[0]?.name || 'My Drive');

  const [tree, setTree] = useState<TreeStateMap>(() => createInitialTree(rootLabel));
  const prevRefreshCounter = useRef(refreshCounter);

  // Parallel Traversal Synchronization (FR-9, EC-3)
  useEffect(() => {
    if (folderHistory && folderHistory.length > 0) {
      setTree((prev) => syncTreeWithFolderStack(prev, folderHistory, currentFolderId));
    }
  }, [folderHistory, currentFolderId]);

  // Status Bar / Manual Refresh Cache Invalidation (FR-10)
  useEffect(() => {
    if (refreshCounter !== undefined && refreshCounter !== prevRefreshCounter.current) {
      prevRefreshCounter.current = refreshCounter;
      setTree((prev) => invalidateTreeCache(prev, rootLabel));
    }
  }, [refreshCounter, rootLabel]);

  const navigate = useCallback(
    (folderId: string, folderName: string, stack: FolderCrumb[]) => {
      if (options?.onNavigateToFolder) {
        options.onNavigateToFolder(folderId, folderName, stack);
      } else {
        explorer.navigateToFolderStack(stack);
      }
    },
    [options, explorer]
  );

  // Load immediate child folders from Google Drive API (FR-5, NFR-1)
  const loadBranch = useCallback(
    async (nodeId: string) => {
      const node = tree[nodeId];
      if (!node || node.isLoading) return;

      setTree((prev) => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], isLoading: true, error: null }
      }));

      try {
        if (window.api?.storage?.listDirectory) {
          const result = await window.api.storage.listDirectory({
            folderId: nodeId,
            foldersOnly: true,
            pageSize: 100
          });

          if (result.success && result.data) {
            const items = result.data.items;
            setTree((prev) => addChildrenToTree(prev, nodeId, items));
          } else {
            setTree((prev) => ({
              ...prev,
              [nodeId]: {
                ...prev[nodeId],
                isLoading: false,
                error: result.error?.message || 'Failed to load subfolders'
              }
            }));
          }
        } else {
          setTree((prev) => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], isLoading: false }
          }));
        }
      } catch (err) {
        setTree((prev) => ({
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            isLoading: false,
            error: (err as Error).message
          }
        }));
      }
    },
    [tree]
  );

  // Auto-fetch immediate subfolders for the active directory if not yet loaded (root on mount, or opened from table)
  useEffect(() => {
    const activeNode = tree[currentFolderId];
    if (
      activeNode &&
      !activeNode.hasLoadedChildren &&
      !activeNode.isLoading &&
      !activeNode.isLeaf
    ) {
      loadBranch(currentFolderId);
    }
  }, [currentFolderId, tree, loadBranch]);

  // 1-Click Folder Node Navigation & Branch Expansion (FR-8)
  const handleSelectNode = useCallback(
    async (nodeId: string) => {
      const node = tree[nodeId];
      if (!node) return;

      // 1. Navigate central table to this folder if not already there
      if (nodeId !== currentFolderId) {
        const stack = buildFolderHistoryFromTree(tree, nodeId);
        navigate(node.id, node.name, stack);
      }

      // 2. Also expand the folder branch in the tree if it is not expanded yet
      if (!node.isLeaf && !node.isExpanded) {
        if (node.hasLoadedChildren) {
          setTree((prev) => expandTreeNode(prev, nodeId));
        } else {
          await loadBranch(nodeId);
        }
      }
    },
    [tree, currentFolderId, navigate, loadBranch]
  );

  // Boxed Expander Click: Lazy load, collapse to parent, or re-expand cached (FR-5, FR-6, NFR-1)
  const handleToggleExpander = useCallback(
    async (nodeId: string) => {
      // Root is non-collapsible and permanently expanded (Decision 13)
      if (nodeId === 'root') return;

      const node = tree[nodeId];
      if (!node || node.isLoading || node.isLeaf) return;

      // 1. If currently expanded, collapse branch in the tree without navigating central table (FR-6, Decision 14)
      if (node.isExpanded) {
        const { tree: collapsedTree } = collapseTreeNode(tree, nodeId);
        setTree(collapsedTree);
        return;
      }

      // 2. If already loaded in memory, re-expand without network roundtrip (FR-9, NFR-1)
      if (node.hasLoadedChildren) {
        setTree(expandTreeNode(tree, nodeId));
        return;
      }

      // 3. Lazy load immediate child folders from Google Drive API (FR-5, NFR-1)
      await loadBranch(nodeId);
    },
    [tree, rootLabel, navigate, loadBranch]
  );

  const visibleNodes = getVisibleTreeNodes(tree);

  return {
    tree,
    visibleNodes,
    activeFolderId: currentFolderId,
    handleSelectNode,
    handleToggleExpander,
    invalidateCache: () => setTree((prev) => invalidateTreeCache(prev, rootLabel))
  };
}
