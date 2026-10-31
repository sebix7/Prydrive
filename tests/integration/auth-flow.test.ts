import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthIpcController } from '../../src/main/ipc/auth-ipc';
import { TokenStorage } from '../../src/main/core/token-storage';
import { GoogleAuthClient } from '../../src/main/core/google-client';
import { IPC_CHANNELS } from '../../src/shared/ipc-channels';
import type { IpcResult, UserProfile } from '../../src/shared/types';
import * as path from 'path';
import * as fs from 'fs';
import http from 'http';
import dns from 'dns';

// In-memory mock for ipcMain
type IpcHandler = (...args: unknown[]) => Promise<unknown>;
const registeredHandlers = new Map<string, IpcHandler>();

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: (channel: string, handler: IpcHandler) => {
        registeredHandlers.set(channel, handler);
      }
    },
    shell: {
      openExternal: vi.fn().mockResolvedValue(undefined)
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
      getPath: () => path.join(__dirname, '../../temp_integration_userdata')
    }
  };
});

describe('Auth Flow Integration (US-1 / T1)', () => {
  const testDir = path.join(__dirname, '../../temp_integration_userdata');
  let tokenStorage: TokenStorage;
  let googleClient: GoogleAuthClient;
  let authController: AuthIpcController;
  let isNetworkOnline = true;

  beforeEach(() => {
    registeredHandlers.clear();
    isNetworkOnline = true;
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    tokenStorage = new TokenStorage(testDir);
    googleClient = new GoogleAuthClient('mock_client_id', 'mock_client_secret');

    // Mock token exchange and user profile
    vi.spyOn(googleClient, 'exchangeCodeForTokens').mockResolvedValue({
      refreshToken: 'mock_valid_refresh_token_789',
      accessToken: 'mock_access_token'
    });
    vi.spyOn(googleClient, 'fetchUserProfile').mockResolvedValue({
      email: 'alex@example.com',
      displayName: 'Alex Smith'
    });

    authController = new AuthIpcController(
      tokenStorage,
      googleClient,
      async () => isNetworkOnline
    );
    authController.register();
  });

  afterEach(async () => {
    await tokenStorage.wipeSession();
    if (authController.isAwaiting()) {
      const cancelHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_CANCEL);
      if (cancelHandler) await cancelHandler();
    }
  });

  it('should complete single-click login with loopback exchange and encrypted storage', async () => {
    const initiateHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_INITIATE);
    expect(initiateHandler).toBeDefined();

    // Start initiate handler
    const loginPromise = initiateHandler!() as Promise<IpcResult<UserProfile>>;

    // Give server a moment to bind and obtain shell.openExternal call
    await new Promise((r) => setTimeout(r, 100));

    const { shell } = await import('electron');
    expect(shell.openExternal).toHaveBeenCalled();
    const openedUrl = (shell.openExternal as unknown as { mock: { calls: [string][] } }).mock.calls[0][0];

    // Extract dynamic port from opened auth URL redirect_uri
    const urlObj = new URL(openedUrl);
    const redirectUri = urlObj.searchParams.get('redirect_uri');
    expect(redirectUri).toBeDefined();
    const port = new URL(redirectUri!).port;

    // Simulate browser redirect with auth code
    await new Promise<void>((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/?code=mock_code_abc`, (res) => {
        expect(res.statusCode).toBe(200);
        resolve();
      }).on('error', reject);
    });

    const result = await loginPromise;
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('alex@example.com');

    // Verify token was saved and encrypted
    const saved = await tokenStorage.loadSession();
    expect(saved).not.toBeNull();
    expect(saved?.refreshToken).toBe('mock_valid_refresh_token_789');
    expect(saved?.email).toBe('alex@example.com');
  });

  it('should prevent concurrent login initiations (EC-6 debounce protection)', async () => {
    const initiateHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_INITIATE);

    // First initiate
    const firstPromise = initiateHandler!() as Promise<IpcResult<UserProfile>>;

    // Give server a brief tick to start
    await new Promise((r) => setTimeout(r, 50));

    // Second initiate while first is awaiting
    const secondResult = (await initiateHandler!()) as IpcResult<UserProfile>;

    expect(secondResult.success).toBe(false);
    expect(secondResult.error?.code).toBe('ALREADY_IN_PROGRESS');

    // Clean up first promise by canceling
    const cancelHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_CANCEL);
    await cancelHandler!();
    const firstResult = await firstPromise;
    expect(firstResult.success).toBe(false);
  });

  it('should handle manual cancellation via AUTH_CANCEL cleanly (FR-3, US-2)', async () => {
    const initiateHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_INITIATE);
    const cancelHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_CANCEL);

    const loginPromise = initiateHandler!() as Promise<IpcResult<UserProfile>>;
    await new Promise((r) => setTimeout(r, 50));

    expect(authController.isAwaiting()).toBe(true);

    const cancelResult = (await cancelHandler!()) as IpcResult<void>;
    expect(cancelResult.success).toBe(true);

    const loginResult = await loginPromise;
    expect(loginResult.success).toBe(false);
    expect(loginResult.error?.code).toBe('AUTH_CANCELLED');
    expect(authController.isAwaiting()).toBe(false);
  });

  it('should silently restore session on startup when saved session is valid (FR-6, US-3)', async () => {
    // Save existing session to disk
    await tokenStorage.saveSession({
      refreshToken: 'mock_saved_token',
      email: 'alex@example.com',
      displayName: 'Alex Smith',
      savedAt: Date.now()
    });

    const restoreHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_RESTORE_SESSION);
    expect(restoreHandler).toBeDefined();

    const result = (await restoreHandler!()) as IpcResult<{ profile: UserProfile; state: string }>;
    expect(result.success).toBe(true);
    expect(result.data?.state).toBe('authenticated');
    expect(result.data?.profile.email).toBe('alex@example.com');
  });

  it('should purge credentials and report revocation when provider returns invalid_grant (FR-7, US-3)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_revoked_token',
      email: 'alex@example.com',
      savedAt: Date.now()
    });

    // Make fetchUserProfile fail with invalid_grant
    vi.spyOn(googleClient, 'fetchUserProfile').mockRejectedValueOnce({
      message: 'invalid_grant: Token has been expired or revoked.',
      response: { status: 400 }
    });

    const restoreHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_RESTORE_SESSION);
    const result = (await restoreHandler!()) as IpcResult<{ profile: UserProfile; state: string }>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('TOKEN_REVOKED');

    // Confirm credentials were wiped from disk
    const saved = await tokenStorage.loadSession();
    expect(saved).toBeNull();
  });

  it('should preserve credentials and report offline state on network failure (FR-8, EC-5, US-3)', async () => {
    await tokenStorage.saveSession({
      refreshToken: 'mock_valid_token',
      email: 'alex@example.com',
      savedAt: Date.now()
    });

    // Make fetchUserProfile fail with network offline error
    vi.spyOn(googleClient, 'fetchUserProfile').mockRejectedValueOnce({
      code: 'ENOTFOUND',
      message: 'getaddrinfo ENOTFOUND accounts.google.com'
    });

    const restoreHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_RESTORE_SESSION);
    const result = (await restoreHandler!()) as IpcResult<{ profile: UserProfile; state: string }>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_OFFLINE');
    expect(result.data?.profile?.email).toBe('alex@example.com');

    // Confirm credentials were NOT wiped from disk
    const saved = await tokenStorage.loadSession();
    expect(saved).not.toBeNull();
    expect(saved?.refreshToken).toBe('mock_valid_token');
  });

  it('should abort and NOT launch browser when offline prior to initiating login (EC-2)', async () => {
    isNetworkOnline = false;

    const { shell } = await import('electron');
    vi.mocked(shell.openExternal).mockClear();

    const initiateHandler = registeredHandlers.get(IPC_CHANNELS.AUTH_INITIATE);
    const result = (await initiateHandler!()) as IpcResult<UserProfile>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_OFFLINE');
    expect(shell.openExternal).not.toHaveBeenCalled();
    expect(authController.isAwaiting()).toBe(false);
  });
});
