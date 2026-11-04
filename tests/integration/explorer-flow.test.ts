import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageIpcController } from '../../src/main/ipc/storage-ipc';
import { TokenStorage } from '../../src/main/core/token-storage';
import { GoogleAuthClient } from '../../src/main/core/google-client';
import { IPC_CHANNELS } from '../../src/shared/ipc-channels';
import type { IpcResult, ListDirectoryResult } from '../../src/shared/types';
import * as path from 'path';
import * as fs from 'fs';

// Mock ipcMain
type IpcHandler = (...args: unknown[]) => Promise<unknown>;
const registeredHandlers = new Map<string, IpcHandler>();

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: (channel: string, handler: IpcHandler) => {
        registeredHandlers.set(channel, handler);
      }
    },
    safeStorage: {
      isEncryptionAvailable: () => true,
      encryptString: (str: string) =>
        Buffer.from(`enc:${Buffer.from(str).toString('hex')}`, 'utf-8'),
      decryptString: (buf: Buffer) => {
        const hex = buf.toString('utf-8').replace('enc:', '');
        return Buffer.from(hex, 'hex').toString('utf-8');
      }
    },
    app: {
      getPath: () => path.join(__dirname, '../../temp_explorer_userdata')
    }
  };
});

describe('Explorer Directory Listing IPC Flow (US-1 / T1)', () => {
  const testDir = path.join(__dirname, '../../temp_explorer_userdata');
  let tokenStorage: TokenStorage;
  let googleClient: GoogleAuthClient;
  let storageController: StorageIpcController;

  beforeEach(() => {
    registeredHandlers.clear();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    tokenStorage = new TokenStorage(testDir);
    googleClient = new GoogleAuthClient('mock_client_id', 'mock_client_secret');

    storageController = new StorageIpcController(tokenStorage, googleClient);
    storageController.register();
  });

  afterEach(async () => {
    await tokenStorage.wipeSession();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should return UNAUTHENTICATED when no active session exists', async () => {
    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);
    expect(handler).toBeDefined();

    const result = (await handler!({}, { folderId: 'root' })) as IpcResult<ListDirectoryResult>;
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('UNAUTHENTICATED');
  });

  it('should fetch active root items, sort folders ahead of files, and format metadata (FR-1, FR-2, FR-3, FR-5)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    const localDate = new Date(2026, 0, 20, 12, 0, 0);
    const listSpy = vi.spyOn(googleClient, 'listDirectory').mockResolvedValueOnce({
      files: [
        {
          id: 'file-2',
          name: 'Presupuesto.xlsx',
          mimeType: 'application/vnd.google-apps.spreadsheet',
          quotaBytesUsed: String(85 * 1024),
          createdTime: localDate.toISOString()
        },
        {
          id: 'folder-1',
          name: 'Documentos',
          mimeType: 'application/vnd.google-apps.folder',
          createdTime: localDate.toISOString()
        },
        {
          id: 'file-1',
          name: 'Acta.pdf',
          mimeType: 'application/pdf',
          size: String(1024 * 1024),
          createdTime: localDate.toISOString()
        }
      ],
      nextPageToken: null
    });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);
    expect(handler).toBeDefined();

    const result = (await handler!({}, {})) as IpcResult<ListDirectoryResult>;
    expect(result.success).toBe(true);
    expect(listSpy).toHaveBeenCalledWith('mock_valid_refresh_token', 'root', undefined, 50);

    expect(result.data?.currentFolderId).toBe('root');
    expect(result.data?.items.map((i) => i.name)).toEqual([
      'Documentos',
      'Acta.pdf',
      'Presupuesto.xlsx'
    ]);
    expect(result.data?.items[0].isDirectory).toBe(true);
    expect(result.data?.items[0].formattedSize).toBe('--');
    expect(result.data?.items[1].formattedSize).toBe('1 MB');
    expect(result.data?.items[2].formattedSize).toBe('85 KB');
    expect(result.data?.items[1].formattedCreatedAt).toBe('20/01/2026 12:00:00');
  });
});
