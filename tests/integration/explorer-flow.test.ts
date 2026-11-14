import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageIpcController } from '../../src/main/ipc/storage-ipc';
import { TokenStorage } from '../../src/main/core/token-storage';
import { GoogleAuthClient } from '../../src/main/core/google-client';
import { IPC_CHANNELS } from '../../src/shared/ipc-channels';
import {
  calculateFolderMetrics,
  initialExplorerState,
  explorerReducer,
  isAtRootDirectory,
  shouldTriggerScrollPagination
} from '../../src/shared/explorer-helpers';
import type { IpcResult, ListDirectoryResult } from '../../src/shared/types';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Mock ipcMain
type IpcHandler = (...args: unknown[]) => Promise<unknown>;
const registeredHandlers = new Map<string, IpcHandler>();

const testDir = path.join(os.tmpdir(), 'prydrive_explorer_flow_test');

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
      getPath: () => testDir
    }
  };
});

describe('Explorer Directory Listing IPC Flow (US-1 / T1)', () => {
  let tokenStorage: TokenStorage;
  let googleClient: GoogleAuthClient;
  let storageController: StorageIpcController;

  beforeEach(() => {
    registeredHandlers.clear();
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    } else {
      for (const file of fs.readdirSync(testDir)) {
        try {
          fs.rmSync(path.join(testDir, file), { recursive: true, force: true });
        } catch {}
      }
    }

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

  it('should navigate into a target subfolder and return its immediate contents (US-2 / T2 / FR-6)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    const localDate = new Date(2026, 1, 10, 8, 30, 0);
    const listSpy = vi.spyOn(googleClient, 'listDirectory').mockResolvedValueOnce({
      files: [
        {
          id: 'nested-file-1',
          name: 'Contrato.pdf',
          mimeType: 'application/pdf',
          size: String(512 * 1024),
          createdTime: localDate.toISOString()
        }
      ],
      nextPageToken: null
    });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);
    const result = (await handler!(
      {},
      { folderId: 'subfolder-id-99' }
    )) as IpcResult<ListDirectoryResult>;

    expect(result.success).toBe(true);
    expect(listSpy).toHaveBeenCalledWith(
      'mock_valid_refresh_token',
      'subfolder-id-99',
      undefined,
      50
    );
    expect(result.data?.currentFolderId).toBe('subfolder-id-99');
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0].name).toBe('Contrato.pdf');
  });

  it('should re-fetch updated directory contents on manual refresh and compute accurate status bar metrics (US-4 / T4 / FR-12, FR-13)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    const localDate = new Date(2026, 2, 1, 10, 0, 0);
    const listSpy = vi
      .spyOn(googleClient, 'listDirectory')
      .mockResolvedValueOnce({
        files: [
          {
            id: 'folder-a',
            name: 'Clientes',
            mimeType: 'application/vnd.google-apps.folder',
            createdTime: localDate.toISOString()
          }
        ],
        nextPageToken: null
      })
      .mockResolvedValueOnce({
        files: [
          {
            id: 'folder-a',
            name: 'Clientes',
            mimeType: 'application/vnd.google-apps.folder',
            createdTime: localDate.toISOString()
          },
          {
            id: 'file-new',
            name: 'Propuesta.pdf',
            mimeType: 'application/pdf',
            size: String(2 * 1024 * 1024),
            createdTime: localDate.toISOString()
          }
        ],
        nextPageToken: null
      });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);

    // Initial fetch
    const firstResult = (await handler!(
      {},
      { folderId: 'root' }
    )) as IpcResult<ListDirectoryResult>;
    expect(firstResult.success).toBe(true);
    const firstMetrics = calculateFolderMetrics(firstResult.data!.items);
    expect(firstMetrics.folderCount).toBe(1);
    expect(firstMetrics.fileCount).toBe(0);
    expect(firstMetrics.formattedTotalSize).toBe('0 B');

    // Manual refresh re-fetch (FR-13)
    const refreshResult = (await handler!(
      {},
      { folderId: 'root' }
    )) as IpcResult<ListDirectoryResult>;
    expect(refreshResult.success).toBe(true);
    expect(listSpy).toHaveBeenCalledTimes(2);

    const refreshedMetrics = calculateFolderMetrics(refreshResult.data!.items);
    expect(refreshedMetrics.folderCount).toBe(1);
    expect(refreshedMetrics.fileCount).toBe(1);
    expect(refreshedMetrics.formattedTotalSize).toBe('2 MB');
  });

  it('should handle empty subfolder state while preserving parent navigation and zero folder count (US-5 / T5 / FR-14)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    vi.spyOn(googleClient, 'listDirectory').mockResolvedValueOnce({
      files: [],
      nextPageToken: null
    });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);
    const result = (await handler!(
      {},
      { folderId: 'empty-subfolder-id' }
    )) as IpcResult<ListDirectoryResult>;

    expect(result.success).toBe(true);
    expect(result.data?.items).toEqual([]);

    let state = explorerReducer(initialExplorerState, {
      type: 'DOUBLE_CLICK_ITEM',
      payload: {
        id: 'empty-subfolder-id',
        name: 'Carpeta Vacía Test',
        mimeType: 'application/vnd.google-apps.folder',
        isDirectory: true,
        sizeBytes: null,
        formattedSize: '--',
        createdAt: '',
        formattedCreatedAt: '--',
        iconType: 'folder',
        isShortcut: false
      }
    });

    state = explorerReducer(state, {
      type: 'SET_DIRECTORY_DATA',
      payload: {
        items: result.data!.items,
        nextPageToken: result.data!.nextPageToken
      }
    });

    // In a subfolder: "..." parent row is enabled (!isAtRootDirectory), items is empty, and folder count is 0
    expect(isAtRootDirectory(state.folderHistory)).toBe(false);
    expect(state.items).toHaveLength(0);
    expect(calculateFolderMetrics(state.items).folderCount).toBe(0);
  });

  it('should support incremental scroll pagination via pageToken and append batches seamlessly (US-5 / T5 / FR-16)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    const localDate = new Date(2026, 3, 10, 9, 0, 0);
    const listSpy = vi
      .spyOn(googleClient, 'listDirectory')
      .mockResolvedValueOnce({
        files: [
          {
            id: 'page1-file',
            name: 'Archivo_A.pdf',
            mimeType: 'application/pdf',
            size: '1024',
            createdTime: localDate.toISOString()
          }
        ],
        nextPageToken: 'next-page-token-2'
      })
      .mockResolvedValueOnce({
        files: [
          {
            id: 'page2-folder',
            name: 'Carpeta_B',
            mimeType: 'application/vnd.google-apps.folder',
            createdTime: localDate.toISOString()
          }
        ],
        nextPageToken: null
      });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);

    // Fetch Page 1
    const page1Result = (await handler!(
      {},
      { folderId: 'root', pageSize: 50 }
    )) as IpcResult<ListDirectoryResult>;
    expect(page1Result.success).toBe(true);
    expect(page1Result.data?.nextPageToken).toBe('next-page-token-2');

    let state = explorerReducer(initialExplorerState, {
      type: 'SET_DIRECTORY_DATA',
      payload: {
        items: page1Result.data!.items,
        nextPageToken: page1Result.data!.nextPageToken
      }
    });
    expect(state.nextPageToken).toBe('next-page-token-2');

    // Verify scroll threshold detection triggers pagination near bottom
    expect(
      shouldTriggerScrollPagination(1000, 560, 400, state.nextPageToken, state.isLoading, state.isLoadingMore)
    ).toBe(true);

    // Fetch Page 2 using nextPageToken
    const page2Result = (await handler!(
      {},
      { folderId: 'root', pageToken: state.nextPageToken!, pageSize: 50 }
    )) as IpcResult<ListDirectoryResult>;
    expect(page2Result.success).toBe(true);
    expect(listSpy).toHaveBeenLastCalledWith(
      'mock_valid_refresh_token',
      'root',
      'next-page-token-2',
      50
    );

    state = explorerReducer(state, {
      type: 'APPEND_DIRECTORY_PAGE',
      payload: {
        items: page2Result.data!.items,
        nextPageToken: page2Result.data!.nextPageToken
      }
    });

    expect(state.items.map((i) => i.name)).toEqual(['Carpeta_B', 'Archivo_A.pdf']);
    expect(state.nextPageToken).toBeNull();
    expect(state.isLoadingMore).toBe(false);
  });

  it('should return structured error on network/API failure and preserve navigation history on retry (US-5 / T5 / FR-17, EC-6)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_refresh_token',
      email: 'user@example.com',
      savedAt: Date.now()
    });

    const localDate = new Date(2026, 3, 12, 15, 0, 0);
    vi.spyOn(googleClient, 'listDirectory')
      .mockRejectedValueOnce(new Error('Network timeout while contacting Google Drive'))
      .mockResolvedValueOnce({
        files: [
          {
            id: 'recovered-file',
            name: 'Recuperado.docx',
            mimeType: 'application/vnd.google-apps.document',
            quotaBytesUsed: '2048',
            createdTime: localDate.toISOString()
          }
        ],
        nextPageToken: null
      });

    const handler = registeredHandlers.get(IPC_CHANNELS.STORAGE_LIST_DIRECTORY);

    // User is inside a subfolder when network fails
    let state = explorerReducer(initialExplorerState, {
      type: 'DOUBLE_CLICK_ITEM',
      payload: {
        id: 'subfolder-network-test',
        name: 'Subcarpeta Crítica',
        mimeType: 'application/vnd.google-apps.folder',
        isDirectory: true,
        sizeBytes: null,
        formattedSize: '--',
        createdAt: '',
        formattedCreatedAt: '--',
        iconType: 'folder',
        isShortcut: false
      }
    });

    const failedResult = (await handler!(
      {},
      { folderId: 'subfolder-network-test' }
    )) as IpcResult<ListDirectoryResult>;
    expect(failedResult.success).toBe(false);
    expect(failedResult.error?.code).toBe('DIRECTORY_FETCH_FAILED');
    expect(failedResult.error?.message).toContain('Network timeout');

    state = explorerReducer(state, {
      type: 'SET_DIRECTORY_ERROR',
      payload: failedResult.error!.message
    });

    // Error state is recorded while preserving subfolder navigation history (FR-17)
    expect(state.errorMessage).toContain('Network timeout');
    expect(state.isLoading).toBe(false);
    expect(state.folderHistory).toEqual([
      { id: 'root', name: 'My Drive' },
      { id: 'subfolder-network-test', name: 'Subcarpeta Crítica' }
    ]);

    // Retry action clears error and re-fetches same subfolder
    state = explorerReducer(state, { type: 'RETRY_CURRENT_DIRECTORY' });
    expect(state.errorMessage).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.folderHistory).toHaveLength(2);

    // Refresh action from status bar returns back to root My Drive
    const refreshedToRoot = explorerReducer(state, { type: 'REFRESH_DIRECTORY' });
    expect(refreshedToRoot.folderHistory).toEqual([{ id: 'root', name: 'My Drive' }]);

    const retryResult = (await handler!(
      {},
      { folderId: 'subfolder-network-test' }
    )) as IpcResult<ListDirectoryResult>;
    expect(retryResult.success).toBe(true);

    state = explorerReducer(state, {
      type: 'SET_DIRECTORY_DATA',
      payload: {
        items: retryResult.data!.items,
        nextPageToken: retryResult.data!.nextPageToken
      }
    });
    expect(state.errorMessage).toBeNull();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Recuperado.docx');
  });
});
