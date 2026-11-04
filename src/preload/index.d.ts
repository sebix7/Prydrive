import type {
  IpcResult,
  UserProfile,
  AuthState,
  StorageQuota,
  ListDirectoryParams,
  ListDirectoryResult
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
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
