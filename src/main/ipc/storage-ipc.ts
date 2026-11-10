import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type {
  IpcResult,
  StorageQuota,
  ListDirectoryParams,
  ListDirectoryResult
} from '../../shared/types';
import { formatStorageQuota } from '../../shared/quota-formatter';
import {
  mapGoogleDriveFileToStorageItem,
  sortStorageItems
} from '../../shared/explorer-helpers';
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

    ipcMain.handle(
      IPC_CHANNELS.STORAGE_LIST_DIRECTORY,
      async (
        _event,
        params?: ListDirectoryParams
      ): Promise<IpcResult<ListDirectoryResult>> => {
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

          const folderId = params?.folderId || 'root';
          const pageToken = params?.pageToken || undefined;
          const pageSize = params?.pageSize || 50;

          const rawResult =
            params?.foldersOnly !== undefined
              ? await this.googleClient.listDirectory(
                  session.refreshToken,
                  folderId,
                  pageToken,
                  pageSize,
                  params.foldersOnly
                )
              : await this.googleClient.listDirectory(
                  session.refreshToken,
                  folderId,
                  pageToken,
                  pageSize
                );

          const mappedItems = (rawResult.files || []).map((file) =>
            mapGoogleDriveFileToStorageItem(file)
          );
          const sortedItems = sortStorageItems(mappedItems);

          return {
            success: true,
            data: {
              items: sortedItems,
              nextPageToken: rawResult.nextPageToken ?? null,
              currentFolderId: folderId
            }
          };
        } catch (err) {
          const message = (err as Error).message || 'Failed to load directory contents';
          return {
            success: false,
            error: {
              code: 'DIRECTORY_FETCH_FAILED',
              message
            }
          };
        }
      }
    );
  }
}
