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

export interface ElectronApi {
  auth: {
    initiateLogin: () => Promise<IpcResult<UserProfile>>;
    cancelLogin: () => Promise<IpcResult<void>>;
    restoreSession: () => Promise<IpcResult<{ profile?: UserProfile; state: AuthState }>>;
    disconnect: () => Promise<IpcResult<void>>;
  };
  storage: {
    getQuota: () => Promise<IpcResult<StorageQuota>>;
    listDirectory: (params?: ListDirectoryParams) => Promise<IpcResult<ListDirectoryResult>>;
  };
  download: {
    startDownload: (params: DownloadStartParams) => Promise<IpcResult<DownloadTransferItem>>;
    cancelDownload: (transferId: string) => Promise<IpcResult<void>>;
    retryDownload: (transferId: string) => Promise<IpcResult<void>>;
    openContainingFolder: (filePath: string) => Promise<IpcResult<void>>;
    getSettings: () => Promise<IpcResult<DownloadSettings>>;
    setSettings: (settings: DownloadSettings) => Promise<IpcResult<void>>;
    selectDownloadDirectory: () => Promise<IpcResult<string | null>>;
    onProgress: (callback: (item: DownloadTransferItem) => void) => () => void;
  };
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
