import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
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
  formatStatusCounts,
  shouldTriggerScrollPagination
} from '../../../shared/explorer-helpers';

export type { ExplorerState, ExplorerAction, FolderCrumb, FolderMetrics };
export {
  initialExplorerState,
  explorerReducer,
  isAtRootDirectory,
  getCurrentFolder,
  getRowSelectionClasses,
  calculateFolderMetrics,
  formatStatusCounts,
  shouldTriggerScrollPagination
};

export interface UseDriveExplorerOptions {
  onRefreshQuota?: () => void;
}

export function useDriveExplorer(options?: UseDriveExplorerOptions) {
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
        folderId: currentFolder.id,
        pageSize: 50
      });

      if (isMounted) {
        if (result.success && result.data) {
          dispatch({
            type: 'SET_DIRECTORY_DATA',
            payload: {
              items: result.data.items,
              nextPageToken: result.data.nextPageToken
            }
          });
        } else {
          dispatch({
            type: 'SET_DIRECTORY_ERROR',
            payload: result.error?.message || 'Failed to load directory contents'
          });
        }
      }
    }

    loadDirectory();
    return () => {
      isMounted = false;
    };
  }, [currentFolder.id, state.refreshCounter]);

  const loadMoreItems = useCallback(async () => {
    if (
      !state.nextPageToken ||
      state.isLoading ||
      state.isLoadingMore ||
      !window.api?.storage?.listDirectory
    ) {
      return;
    }

    dispatch({ type: 'SET_LOADING_MORE', payload: true });
    const result = await window.api.storage.listDirectory({
      folderId: currentFolder.id,
      pageToken: state.nextPageToken,
      pageSize: 50
    });

    if (result.success && result.data) {
      dispatch({
        type: 'APPEND_DIRECTORY_PAGE',
        payload: {
          items: result.data.items,
          nextPageToken: result.data.nextPageToken
        }
      });
    } else {
      dispatch({
        type: 'SET_DIRECTORY_ERROR',
        payload: result.error?.message || 'Failed to load additional items'
      });
    }
  }, [
    currentFolder.id,
    state.nextPageToken,
    state.isLoading,
    state.isLoadingMore
  ]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      if (
        shouldTriggerScrollPagination(
          target.scrollHeight,
          target.scrollTop,
          target.clientHeight,
          state.nextPageToken,
          state.isLoading,
          state.isLoadingMore
        )
      ) {
        loadMoreItems();
      }
    },
    [
      state.nextPageToken,
      state.isLoading,
      state.isLoadingMore,
      loadMoreItems
    ]
  );

  const selectItem = useCallback((id: string) => {
    dispatch({ type: 'SELECT_ITEM', payload: id });
  }, []);

  const openItem = useCallback((item: StorageItem) => {
    dispatch({ type: 'DOUBLE_CLICK_ITEM', payload: item });
  }, []);

  const navigateUp = useCallback(() => {
    dispatch({ type: 'NAVIGATE_UP' });
  }, []);

  const navigateToFolderStack = useCallback((stack: FolderCrumb[]) => {
    dispatch({ type: 'NAVIGATE_TO_FOLDER_STACK', payload: stack });
  }, []);

  const refreshDirectory = useCallback(() => {
    dispatch({ type: 'REFRESH_DIRECTORY' });
    if (options?.onRefreshQuota) {
      options.onRefreshQuota();
    }
  }, [options?.onRefreshQuota]);

  const retryCurrentDirectory = useCallback(() => {
    dispatch({ type: 'RETRY_CURRENT_DIRECTORY' });
  }, []);

  return {
    folderHistory: state.folderHistory,
    currentFolder,
    atRoot,
    items: state.items,
    selectedItemId: state.selectedItemId,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    nextPageToken: state.nextPageToken,
    errorMessage: state.errorMessage,
    refreshCounter: state.refreshCounter,
    metrics,
    selectItem,
    openItem,
    navigateUp,
    navigateToFolderStack,
    refreshDirectory,
    retryCurrentDirectory,
    loadMoreItems,
    handleScroll
  };
}
