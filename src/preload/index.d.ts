import type { IpcResult, UserProfile } from '../shared/types';

export interface ElectronApi {
  auth: {
    initiateLogin: () => Promise<IpcResult<UserProfile>>;
    cancelLogin: () => Promise<IpcResult<void>>;
  };
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
