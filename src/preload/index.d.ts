import type { IpcResult, UserProfile, AuthState, StorageQuota } from '../shared/types';

export interface ElectronApi {
  auth: {
    initiateLogin: () => Promise<IpcResult<UserProfile>>;
    cancelLogin: () => Promise<IpcResult<void>>;
    restoreSession: () => Promise<IpcResult<{ profile?: UserProfile; state: AuthState }>>;
  };
  storage: {
    getQuota: () => Promise<IpcResult<StorageQuota>>;
  };
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
