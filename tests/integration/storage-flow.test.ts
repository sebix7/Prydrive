import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageIpcController } from '../../src/main/ipc/storage-ipc';
import { TokenStorage } from '../../src/main/core/token-storage';
import { GoogleAuthClient } from '../../src/main/core/google-client';
import { IPC_CHANNELS } from '../../src/shared/ipc-channels';
import type { IpcResult, StorageQuota } from '../../src/shared/types';
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
      encryptString: (str: string) => Buffer.from(`enc:${Buffer.from(str).toString('hex')}`, 'utf-8'),
      decryptString: (buf: Buffer) => {
        const hex = buf.toString('utf-8').replace('enc:', '');
        return Buffer.from(hex, 'hex').toString('utf-8');
      }
    },
    app: {
      getPath: () => path.join(__dirname, '../../temp_storage_userdata')
    }
  };
});

describe('Storage Quota IPC Flow (US-4 / T4)', () => {
  const testDir = path.join(__dirname, '../../temp_storage_userdata');
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

  it('should retrieve and format storage quota for metered user (FR-10)', async () => {
    // Save session
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    // Mock 5 GB of 15 GB
    const usedBytes = 5 * 1073741824;
    const limitBytes = 15 * 1073741824;
    vi.spyOn(googleClient, 'fetchStorageQuota').mockResolvedValueOnce({
      usage: usedBytes,
      limit: limitBytes
    });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_GET_QUOTA);
    expect(handler).toBeDefined();

    const result = (await handler!()) as IpcResult<StorageQuota>;
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.formattedUsed).toBe('5 GB');
    expect(result.data?.formattedTotal).toBe('15 GB');
    expect(result.data?.percentage).toBe(33.3);
    expect(result.data?.isUnmetered).toBe(false);
  });

  it('should adapt to unmetered storage quota gracefully (EC-3)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'corp@enterprise.com',
      savedAt: Date.now()
    });

    // Unlimited limit
    vi.spyOn(googleClient, 'fetchStorageQuota').mockResolvedValueOnce({
      usage: 25 * 1073741824, // 25 GB used
      limit: null
    });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_GET_QUOTA);
    const result = (await handler!()) as IpcResult<StorageQuota>;

    expect(result.success).toBe(true);
    expect(result.data?.formattedUsed).toBe('25 GB');
    expect(result.data?.formattedTotal).toBe('Unlimited');
    expect(result.data?.isUnmetered).toBe(true);
    expect(result.data?.percentage).toBe(0);
  });

  it('should fail with UNAUTHENTICATED error when no session is stored', async () => {
    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_GET_QUOTA);
    const result = (await handler!()) as IpcResult<StorageQuota>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('UNAUTHENTICATED');
  });

  it('should return QUOTA_FETCH_FAILED error when Google Drive API fails (FR-11)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    vi.spyOn(googleClient, 'fetchStorageQuota').mockRejectedValueOnce(
      new Error('Rate limit exceeded on about.get')
    );

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_GET_QUOTA);
    const result = (await handler!()) as IpcResult<StorageQuota>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('QUOTA_FETCH_FAILED');
    expect(result.error?.message).toContain('Rate limit exceeded');
  });
});
