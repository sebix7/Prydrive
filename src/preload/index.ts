import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type {
  IpcResult,
  UserProfile,
  AuthState,
  StorageQuota,
  ListDirectoryParams,
  ListDirectoryResult,
  DownloadStartParams,
  DownloadTransferItem,
  DownloadSettings
} from '../shared/types';

export const api = {
  auth: {
    initiateLogin: (): Promise<IpcResult<UserProfile>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AUTH_INITIATE);
    },
    cancelLogin: (): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AUTH_CANCEL);
    },
    restoreSession: (): Promise<IpcResult<{ profile?: UserProfile; state: AuthState }>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AUTH_RESTORE_SESSION);
    },
    disconnect: (): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.AUTH_DISCONNECT);
    }
  },
  storage: {
    getQuota: (): Promise<IpcResult<StorageQuota>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.STORAGE_GET_QUOTA);
    },
    listDirectory: (params?: ListDirectoryParams): Promise<IpcResult<ListDirectoryResult>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LIST_DIRECTORY, params);
    }
  },
  download: {
    startDownload: (params: DownloadStartParams): Promise<IpcResult<DownloadTransferItem>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_START, params);
    },
    cancelDownload: (transferId: string): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_CANCEL, transferId);
    },
    retryDownload: (transferId: string): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_RETRY, transferId);
    },
    openContainingFolder: (filePath: string): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_OPEN_FOLDER, filePath);
    },
    getSettings: (): Promise<IpcResult<DownloadSettings>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_GET_SETTINGS);
    },
    setSettings: (settings: DownloadSettings): Promise<IpcResult<void>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_SET_SETTINGS, settings);
    },
    selectDownloadDirectory: (): Promise<IpcResult<string | null>> => {
      return ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_SELECT_DIRECTORY);
    },
    onProgress: (callback: (item: DownloadTransferItem) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, item: DownloadTransferItem): void => {
        callback(item);
      };
      ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, listener);
      };
    }
  }
};

contextBridge.exposeInMainWorld('api', api);
