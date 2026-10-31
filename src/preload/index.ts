import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { IpcResult, UserProfile, AuthState } from '../shared/types';

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
    }
  }
};

contextBridge.exposeInMainWorld('api', api);
