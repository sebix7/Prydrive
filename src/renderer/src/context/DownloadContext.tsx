import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  DownloadTransferItem,
  DownloadStartParams,
  DownloadSettings
} from '../../../shared/types';
import { upsertTransferItem } from '../../../shared/download-helpers';

export interface DownloadContextType {
  transfers: DownloadTransferItem[];
  isQueueModalOpen: boolean;
  settings: DownloadSettings | null;
  isSettingsModalOpen: boolean;
  settingsError: string | null;
  startDownload: (params: DownloadStartParams) => Promise<void>;
  cancelDownload: (transferId: string) => Promise<void>;
  retryDownload: (transferId: string) => Promise<void>;
  openContainingFolder: (filePath: string) => Promise<void>;
  clearCompleted: () => void;
  setQueueModalOpen: (isOpen: boolean) => void;
  openQueueModal: () => void;
  closeQueueModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  refreshSettings: () => Promise<void>;
  browseDownloadDirectory: () => Promise<void>;
  resetDownloadDirectory: () => Promise<void>;
}

const defaultDownloadContext: DownloadContextType = {
  transfers: [],
  isQueueModalOpen: false,
  settings: null,
  isSettingsModalOpen: false,
  settingsError: null,
  startDownload: async () => {},
  cancelDownload: async () => {},
  retryDownload: async () => {},
  openContainingFolder: async () => {},
  clearCompleted: () => {},
  setQueueModalOpen: () => {},
  openQueueModal: () => {},
  closeQueueModal: () => {},
  openSettingsModal: () => {},
  closeSettingsModal: () => {},
  refreshSettings: async () => {},
  browseDownloadDirectory: async () => {},
  resetDownloadDirectory: async () => {}
};

export const DownloadContext = createContext<DownloadContextType>(defaultDownloadContext);

export interface DownloadProviderProps {
  children: React.ReactNode;
}

/**
 * Global Download Transfers Context Provider (Spec 012 US-4, US-5 / FR-6, FR-7, EC-7).
 * Subscribes to Main Process IPC progress events and maintains immutable FIFO transfer state.
 */
export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children }) => {
  const [transfers, setTransfers] = useState<DownloadTransferItem[]>([]);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [settings, setSettings] = useState<DownloadSettings | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const refreshSettings = useCallback(async (): Promise<void> => {
    if (!window.api?.download?.getSettings) {
      return;
    }
    try {
      const result = await window.api.download.getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setSettingsError(null);
      } else if (result.error) {
        setSettingsError(result.error.message);
      }
    } catch (err) {
      setSettingsError((err as Error).message || 'Failed to read download settings');
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (!window.api?.download?.onProgress) {
      return;
    }

    const unsubscribe = window.api.download.onProgress((incoming: DownloadTransferItem) => {
      setTransfers((prev) => upsertTransferItem(prev, incoming));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startDownload = useCallback(async (params: DownloadStartParams): Promise<void> => {
    if (!window.api?.download?.startDownload) {
      return;
    }

    const result = await window.api.download.startDownload(params);
    if (result.success && result.data) {
      const initialItem = result.data;
      setTransfers((prev) => {
        // Avoid overwriting newer progress events that may have arrived before invoke resolved
        if (prev.some((t) => t.id === initialItem.id)) {
          return prev;
        }
        return upsertTransferItem(prev, initialItem);
      });
    }
  }, []);

  const cancelDownload = useCallback(async (transferId: string): Promise<void> => {
    if (!window.api?.download?.cancelDownload) {
      return;
    }
    await window.api.download.cancelDownload(transferId);
  }, []);

  const retryDownload = useCallback(async (transferId: string): Promise<void> => {
    if (!window.api?.download?.retryDownload) {
      return;
    }
    await window.api.download.retryDownload(transferId);
  }, []);

  const openContainingFolder = useCallback(async (filePath: string): Promise<void> => {
    if (!window.api?.download?.openContainingFolder) {
      return;
    }
    await window.api.download.openContainingFolder(filePath);
  }, []);

  const clearCompleted = useCallback((): void => {
    setTransfers((prev) =>
      prev.filter((item) => item.status !== 'completed' && item.status !== 'cancelled')
    );
  }, []);

  const openQueueModal = useCallback((): void => {
    setIsQueueModalOpen(true);
  }, []);

  const closeQueueModal = useCallback((): void => {
    setIsQueueModalOpen(false);
  }, []);

  const openSettingsModal = useCallback((): void => {
    setSettingsError(null);
    setIsSettingsModalOpen(true);
    void refreshSettings();
  }, [refreshSettings]);

  const closeSettingsModal = useCallback((): void => {
    setIsSettingsModalOpen(false);
    setSettingsError(null);
  }, []);

  const browseDownloadDirectory = useCallback(async (): Promise<void> => {
    if (!window.api?.download?.selectDownloadDirectory || !window.api?.download?.setSettings) {
      return;
    }
    try {
      const pickResult = await window.api.download.selectDownloadDirectory();
      if (!pickResult.success) {
        setSettingsError(pickResult.error?.message || 'Failed to select directory');
        return;
      }
      if (!pickResult.data) {
        return;
      }
      const saveResult = await window.api.download.setSettings({
        defaultDownloadPath: pickResult.data
      });
      if (!saveResult.success) {
        setSettingsError(saveResult.error?.message || 'Failed to save download settings');
        return;
      }
      await refreshSettings();
    } catch (err) {
      setSettingsError((err as Error).message || 'Failed to update download folder');
    }
  }, [refreshSettings]);

  const resetDownloadDirectory = useCallback(async (): Promise<void> => {
    if (!window.api?.download?.setSettings) {
      return;
    }
    try {
      const saveResult = await window.api.download.setSettings({
        defaultDownloadPath: settings?.systemDefaultDownloadPath || ''
      });
      if (!saveResult.success) {
        setSettingsError(saveResult.error?.message || 'Failed to reset download folder');
        return;
      }
      await refreshSettings();
    } catch (err) {
      setSettingsError((err as Error).message || 'Failed to reset download folder');
    }
  }, [refreshSettings, settings?.systemDefaultDownloadPath]);

  return (
    <DownloadContext.Provider
      value={{
        transfers,
        isQueueModalOpen,
        settings,
        isSettingsModalOpen,
        settingsError,
        startDownload,
        cancelDownload,
        retryDownload,
        openContainingFolder,
        clearCompleted,
        setQueueModalOpen: setIsQueueModalOpen,
        openQueueModal,
        closeQueueModal,
        openSettingsModal,
        closeSettingsModal,
        refreshSettings,
        browseDownloadDirectory,
        resetDownloadDirectory
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export function useDownloadContext(): DownloadContextType {
  return useContext(DownloadContext);
}
