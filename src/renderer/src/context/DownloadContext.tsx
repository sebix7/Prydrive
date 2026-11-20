import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  DownloadTransferItem,
  DownloadStartParams
} from '../../../shared/types';
import { upsertTransferItem } from '../../../shared/download-helpers';

export interface DownloadContextType {
  transfers: DownloadTransferItem[];
  isQueueModalOpen: boolean;
  startDownload: (params: DownloadStartParams) => Promise<void>;
  cancelDownload: (transferId: string) => Promise<void>;
  retryDownload: (transferId: string) => Promise<void>;
  openContainingFolder: (filePath: string) => Promise<void>;
  clearCompleted: () => void;
  setQueueModalOpen: (isOpen: boolean) => void;
  openQueueModal: () => void;
  closeQueueModal: () => void;
}

const defaultDownloadContext: DownloadContextType = {
  transfers: [],
  isQueueModalOpen: false,
  startDownload: async () => {},
  cancelDownload: async () => {},
  retryDownload: async () => {},
  openContainingFolder: async () => {},
  clearCompleted: () => {},
  setQueueModalOpen: () => {},
  openQueueModal: () => {},
  closeQueueModal: () => {}
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
      prev.filter((item) => item.status === 'downloading' || item.status === 'queued')
    );
  }, []);

  const openQueueModal = useCallback((): void => {
    setIsQueueModalOpen(true);
  }, []);

  const closeQueueModal = useCallback((): void => {
    setIsQueueModalOpen(false);
  }, []);

  return (
    <DownloadContext.Provider
      value={{
        transfers,
        isQueueModalOpen,
        startDownload,
        cancelDownload,
        retryDownload,
        openContainingFolder,
        clearCompleted,
        setQueueModalOpen: setIsQueueModalOpen,
        openQueueModal,
        closeQueueModal
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export function useDownloadContext(): DownloadContextType {
  return useContext(DownloadContext);
}
