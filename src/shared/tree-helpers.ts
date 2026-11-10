import type { TreeNode, TreeStateMap, StorageItem, FolderCrumb } from './types';

/**
 * Initializes the normalized tree state with the root "My Drive" node (FR-4).
 */
export function createInitialTree(rootLabel: string = 'My Drive'): TreeStateMap {
  return {
    root: {
      id: 'root',
      name: rootLabel,
      parentId: null,
      depth: 0,
      isExpanded: true,
      isLoading: false,
      hasLoadedChildren: false,
      isLeaf: false,
      childrenIds: []
    }
  };
}

/**
 * Merges loaded child folders into a parent node's branch (FR-5, FR-7).
 * When folders array is empty, marks the node as a leaf without expander boxes (FR-7).
 */
export function addChildrenToTree(
  tree: TreeStateMap,
  parentId: string,
  folders: StorageItem[]
): TreeStateMap {
  const parent = tree[parentId];
  if (!parent) return tree;

  const newTree: TreeStateMap = { ...tree };

  if (folders.length === 0) {
    newTree[parentId] = {
      ...parent,
      isLoading: false,
      hasLoadedChildren: true,
      isLeaf: true,
      isExpanded: false,
      childrenIds: []
    };
    return newTree;
  }

  const childIds: string[] = [];

  for (const item of folders) {
    childIds.push(item.id);
    const existing = newTree[item.id];
    newTree[item.id] = {
      id: item.id,
      name: item.name,
      parentId,
      depth: parent.depth + 1,
      isExpanded: existing?.isExpanded ?? false,
      isLoading: false,
      hasLoadedChildren: existing?.hasLoadedChildren ?? false,
      isLeaf: existing?.isLeaf ?? false,
      childrenIds: existing?.childrenIds ?? []
    };
  }

  newTree[parentId] = {
    ...parent,
    isLoading: false,
    hasLoadedChildren: true,
    isLeaf: false,
    isExpanded: true,
    childrenIds: childIds
  };

  return newTree;
}

/**
 * Expands a tree node branch (FR-5).
 */
export function expandTreeNode(tree: TreeStateMap, nodeId: string): TreeStateMap {
  const node = tree[nodeId];
  if (!node || node.isExpanded) return tree;

  return {
    ...tree,
    [nodeId]: {
      ...node,
      isExpanded: true
    }
  };
}

/**
 * Collapses an expanded folder node and resolves parent navigation target (FR-6).
 * Clicking [-] navigates the central table to the parent folder.
 */
export function collapseTreeNode(
  tree: TreeStateMap,
  nodeId: string
): { tree: TreeStateMap; navigateToParentId: string } {
  const node = tree[nodeId];
  if (!node || nodeId === 'root') {
    return { tree, navigateToParentId: 'root' };
  }

  const updatedTree: TreeStateMap = {
    ...tree,
    [nodeId]: {
      ...node,
      isExpanded: false
    }
  };

  const navigateToParentId = node.parentId ?? 'root';
  return {
    tree: updatedTree,
    navigateToParentId
  };
}

/**
 * Invalidates the entire folder tree cache upon manual Refresh, preserving the root node (FR-10).
 */
export function invalidateTreeCache(
  tree: TreeStateMap,
  rootLabel?: string
): TreeStateMap {
  const rootName = rootLabel || tree['root']?.name || 'My Drive';
  return createInitialTree(rootName);
}

/**
 * Dynamically reflects breadcrumb folder stack traversal in the tree (FR-9).
 * Ensures all ancestor branches are expanded and present.
 */
export function syncTreeWithFolderStack(
  tree: TreeStateMap,
  folderStack: FolderCrumb[],
  currentFolderId: string
): TreeStateMap {
  let updated = { ...tree };

  for (let i = 0; i < folderStack.length; i++) {
    const crumb = folderStack[i];
    const parentId = i === 0 ? null : folderStack[i - 1].id;

    if (!updated[crumb.id]) {
      updated[crumb.id] = {
        id: crumb.id,
        name: crumb.name,
        parentId,
        depth: i,
        isExpanded: true,
        isLoading: false,
        hasLoadedChildren: false,
        isLeaf: false,
        childrenIds: []
      };

      if (parentId && updated[parentId]) {
        if (!updated[parentId].childrenIds.includes(crumb.id)) {
          updated[parentId] = {
            ...updated[parentId],
            childrenIds: [...updated[parentId].childrenIds, crumb.id]
          };
        }
      }
    } else {
      if (!updated[crumb.id].isLeaf) {
        updated[crumb.id] = {
          ...updated[crumb.id],
          isExpanded: true
        };
      }
    }
  }

  return updated;
}

/**
 * Reconstructs the full ancestor breadcrumb folder stack from any tree node (FR-8, FR-9).
 * Enables 1-click navigation in the central table from the directory tree.
 */
export function buildFolderHistoryFromTree(
  tree: TreeStateMap,
  targetFolderId: string
): FolderCrumb[] {
  const crumbs: FolderCrumb[] = [];
  let currId: string | null = targetFolderId;
  const visited = new Set<string>();

  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const node: TreeNode | undefined = tree[currId];
    if (!node) {
      crumbs.unshift({ id: currId, name: currId });
      break;
    }
    crumbs.unshift({ id: node.id, name: node.name });
    currId = node.parentId;
  }

  // Ensure root is always first crumb in the breadcrumb path
  if (crumbs.length === 0 || crumbs[0].id !== 'root') {
    const rootName = tree['root']?.name || 'My Drive';
    crumbs.unshift({ id: 'root', name: rootName });
  }

  return crumbs;
}

/**
 * Returns a flattened array of visible tree nodes in pre-order traversal (FR-5, FR-6).
 * Only traverses into children when parent node isExpanded is true.
 */
export function getVisibleTreeNodes(
  tree: TreeStateMap,
  rootId: string = 'root'
): TreeNode[] {
  const visible: TreeNode[] = [];

  function traverse(nodeId: string) {
    const node: TreeNode | undefined = tree[nodeId];
    if (!node) return;

    visible.push(node);

    if (node.isExpanded && node.childrenIds && node.childrenIds.length > 0) {
      for (const childId of node.childrenIds) {
        traverse(childId);
      }
    }
  }

  traverse(rootId);
  return visible;
}

