import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { google } from 'googleapis';
import { GoogleAuthClient } from '../../src/main/core/google-client';

describe('GoogleAuthClient In-Memory OAuth2Client Caching (Spec 012 US-8 / T8 / FR-13, EC-13, EC-14)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should reuse the identical OAuth2Client instance for consecutive calls with the same refreshToken (FR-13.1)', () => {
    const authClient = new GoogleAuthClient('test-id', 'test-secret');

    const first = authClient.getAuthenticatedClient('refresh-token-account-a');
    const second = authClient.getAuthenticatedClient('refresh-token-account-a');

    expect(first).toBe(second);
    expect(first.credentials.refresh_token).toBe('refresh-token-account-a');
  });

  it('should immediately replace the cached OAuth2Client when called with a different refreshToken (FR-13.2, EC-13)', () => {
    const authClient = new GoogleAuthClient('test-id', 'test-secret');

    const accountA = authClient.getAuthenticatedClient('refresh-token-account-a');
    const accountB = authClient.getAuthenticatedClient('refresh-token-account-b');

    expect(accountB).not.toBe(accountA);
    expect(accountB.credentials.refresh_token).toBe('refresh-token-account-b');
    expect(authClient.getAuthenticatedClient('refresh-token-account-b')).toBe(accountB);
  });

  it('should invalidate cached OAuth2Client immediately when clearCachedClient() is called (FR-13.2, EC-13)', () => {
    const authClient = new GoogleAuthClient('test-id', 'test-secret');

    const beforeDisconnect = authClient.getAuthenticatedClient('refresh-token-account-a');
    authClient.clearCachedClient();
    const afterReconnect = authClient.getAuthenticatedClient('refresh-token-account-a');

    expect(afterReconnect).not.toBe(beforeDisconnect);
  });

  it('should clear cached OAuth2Client when listDirectory encounters a 401 or invalid_grant auth error (FR-13.3)', async () => {
    const authClient = new GoogleAuthClient('test-id', 'test-secret');
    const initialClient = authClient.getAuthenticatedClient('refresh-token-revoked');

    const authError = Object.assign(new Error('invalid_grant: Token has been expired or revoked.'), {
      code: 401
    });

    vi.spyOn(google, 'drive').mockReturnValue({
      files: {
        list: vi.fn().mockRejectedValue(authError)
      }
    } as unknown as ReturnType<typeof google.drive>);

    await expect(authClient.listDirectory('refresh-token-revoked')).rejects.toThrow('invalid_grant');

    // Cached client must have been invalidated after auth error
    const nextClient = authClient.getAuthenticatedClient('refresh-token-revoked');
    expect(nextClient).not.toBe(initialClient);
  });

  it('should preserve cached OAuth2Client on non-auth transient errors (e.g. 500 or network timeout)', async () => {
    const authClient = new GoogleAuthClient('test-id', 'test-secret');
    const initialClient = authClient.getAuthenticatedClient('refresh-token-valid');

    const transientError = Object.assign(new Error('Service Unavailable'), {
      code: 503
    });

    vi.spyOn(google, 'drive').mockReturnValue({
      files: {
        list: vi.fn().mockRejectedValue(transientError)
      }
    } as unknown as ReturnType<typeof google.drive>);

    await expect(authClient.listDirectory('refresh-token-valid')).rejects.toThrow('Service Unavailable');

    // Valid cached client remains reusable for retries
    const nextClient = authClient.getAuthenticatedClient('refresh-token-valid');
    expect(nextClient).toBe(initialClient);
  });

  it('should wire a single shared GoogleAuthClient across Main IPC controllers and clear cache on disconnect (FR-13)', () => {
    const mainIndexSource = readFileSync(
      resolve(__dirname, '../../src/main/index.ts'),
      'utf-8'
    );
    const authIpcSource = readFileSync(
      resolve(__dirname, '../../src/main/ipc/auth-ipc.ts'),
      'utf-8'
    );

    expect(mainIndexSource).toContain('GoogleAuthClient');
    expect(mainIndexSource).toContain('DownloadQueueManager');
    expect(authIpcSource).toContain('clearCachedClient()');
  });
});
