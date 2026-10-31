import type { IpcResult, UserProfile, AuthState } from '../shared/types';

export interface ElectronApi {
  auth: {
    initiateLogin: () => Promise<IpcResult<UserProfile>>;
    cancelLogin: () => Promise<IpcResult<void>>;
    restoreSession: () => Promise<IpcResult<{ profile?: UserProfile; state: AuthState }>>;
  };
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
