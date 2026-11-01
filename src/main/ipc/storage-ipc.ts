import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { IpcResult, StorageQuota } from '../../shared/types';
import { formatStorageQuota } from '../../shared/quota-formatter';
import { TokenStorage } from '../core/token-storage';
import { GoogleAuthClient } from '../core/google-client';

export class StorageIpcController {
  private readonly tokenStorage: TokenStorage;
  private readonly googleClient: GoogleAuthClient;

  constructor(tokenStorage?: TokenStorage, googleClient?: GoogleAuthClient) {
    this.tokenStorage = tokenStorage || new TokenStorage();
    this.googleClient = googleClient || new GoogleAuthClient();
  }

  register(): void {
    ipcMain.handle(
      IPC_CHANNELS.STORAGE_GET_QUOTA,
      async (): Promise<IpcResult<StorageQuota>> => {
        try {
          const session = await this.tokenStorage.loadSession();
          if (!session) {
            return {
              success: false,
              error: {
                code: 'UNAUTHENTICATED',
                message: 'No active session found.'
              }
            };
          }

          if (process.env.SIMULATE_QUOTA_ERROR === 'true') {
            throw new Error('Simulated Google Drive API quota failure (rate limit / permission restriction)');
          }

          const rawQuota = await this.googleClient.fetchStorageQuota(session.refreshToken);
          const formatted = formatStorageQuota(rawQuota.usage, rawQuota.limit);

          return {
            success: true,
            data: formatted
          };
        } catch (err) {
          const message = (err as Error).message || 'Storage details unavailable';
          return {
            success: false,
            error: {
              code: 'QUOTA_FETCH_FAILED',
              message
            }
          };
        }
      }
    );
  }
}
