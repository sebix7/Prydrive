import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type { StorageItem, FolderCrumb, FolderMetrics } from '../../../shared/types';
import {
  type ExplorerState,
  type ExplorerAction,
  initialExplorerState,
  explorerReducer,
  isAtRootDirectory,
  getCurrentFolder,
  getRowSelectionClasses,
  calculateFolderMetrics,
  formatStatusCounts
} from '../../../shared/explorer-helpers';

export type { ExplorerState, ExplorerAction, FolderCrumb, FolderMetrics };
export {
  initialExplorerState,
  explorerReducer,
  isAtRootDirectory,
  getCurrentFolder,
  getRowSelectionClasses,
  calculateFolderMetrics,
  formatStatusCounts
};

export function useDriveExplorer() {
  const [state, dispatch] = useReducer(explorerReducer, initialExplorerState);

  const currentFolder = getCurrentFolder(state.folderHistory);
  const atRoot = isAtRootDirectory(state.folderHistory);
  const metrics = useMemo(
    () => calculateFolderMetrics(state.items),
    [state.items]
  );

  useEffect(() => {
    let isMounted = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    async function loadDirectory() {
      if (!window.api?.storage?.listDirectory) {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        return;
      }

      const result = await window.api.storage.listDirectory({
        folderId: currentFolder.id
      });

      if (isMounted) {
        if (result.success && result.data) {
          dispatch({
            type: 'SET_DIRECTORY_DATA',
            payload: { items: result.data.items }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }

    loadDirectory();
    return () => {
      isMounted = false;
    };
  }, [currentFolder.id, state.refreshCounter]);

  const selectItem = useCallback((id: string) => {
    dispatch({ type: 'SELECT_ITEM', payload: id });
  }, []);

  const openItem = useCallback((item: StorageItem) => {
    dispatch({ type: 'DOUBLE_CLICK_ITEM', payload: item });
  }, []);

  const navigateUp = useCallback(() => {
    dispatch({ type: 'NAVIGATE_UP' });
  }, []);

  const refreshDirectory = useCallback(() => {
    dispatch({ type: 'REFRESH_DIRECTORY' });
  }, []);

  return {
    folderHistory: state.folderHistory,
    currentFolder,
    atRoot,
    items: state.items,
    selectedItemId: state.selectedItemId,
    isLoading: state.isLoading,
    metrics,
    selectItem,
    openItem,
    navigateUp,
    refreshDirectory
  };
}
