import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenStorage } from '../../src/main/core/token-storage';
import type { AuthSessionData } from '../../src/shared/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock electron safeStorage and app
vi.mock('electron', () => {
  return {
    safeStorage: {
      isEncryptionAvailable: () => true,
      encryptString: (plainText: string) => {
        // Obfuscate / encrypt so plaintext substrings are not present
        const reversedHex = Buffer.from(plainText, 'utf-8').toString('hex').split('').reverse().join('');
        return Buffer.from(`enc:${reversedHex}`, 'utf-8');
      },
      decryptString: (cipherText: Buffer) => {
        const str = cipherText.toString('utf-8');
        if (!str.startsWith('enc:')) {
          throw new Error('Decryption failed: corrupted data');
        }
        const hex = str.replace('enc:', '').split('').reverse().join('');
        return Buffer.from(hex, 'hex').toString('utf-8');
      }
    },
    app: {
      getPath: () => path.join(__dirname, '../../temp_test_userdata')
    }
  };
});

describe('TokenStorage (safeStorage Native Encryption)', () => {
  const testDir = path.join(__dirname, '../../temp_test_userdata');
  let tokenStorage: TokenStorage;

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    tokenStorage = new TokenStorage(testDir);
  });

  it('should encrypt and persist session credentials to disk', async () => {
    const sessionData: AuthSessionData = {
      refreshToken: 'mock_refresh_token_xyz',
      email: 'test@example.com',
      displayName: 'Test User',
      savedAt: Date.now()
    };

    await tokenStorage.saveSession(sessionData);

    const sessionFilePath = path.join(testDir, 'auth_session.enc');
    expect(fs.existsSync(sessionFilePath)).toBe(true);

    const rawFileContent = fs.readFileSync(sessionFilePath);
    // Raw file must be encrypted and not contain plain-text refresh token
    expect(rawFileContent.includes(Buffer.from('mock_refresh_token_xyz'))).toBe(false);

    const retrievedSession = await tokenStorage.loadSession();
    expect(retrievedSession).not.toBeNull();
    expect(retrievedSession?.refreshToken).toBe('mock_refresh_token_xyz');
    expect(retrievedSession?.email).toBe('test@example.com');
  });

  it('should return null when no session file exists', async () => {
    const session = await tokenStorage.loadSession();
    expect(session).toBeNull();
  });

  it('should purge session file cleanly on wipeSession', async () => {
    const sessionData: AuthSessionData = {
      refreshToken: 'mock_refresh_token_xyz',
      email: 'test@example.com',
      savedAt: Date.now()
    };

    await tokenStorage.saveSession(sessionData);
    expect(await tokenStorage.hasSession()).toBe(true);

    await tokenStorage.wipeSession();
    expect(await tokenStorage.hasSession()).toBe(false);
    expect(await tokenStorage.loadSession()).toBeNull();
  });

  it('should handle corrupted session file by returning null and cleaning up', async () => {
    const sessionFilePath = path.join(testDir, 'auth_session.enc');
    fs.writeFileSync(sessionFilePath, Buffer.from('corrupted_garbage_bytes'));

    const session = await tokenStorage.loadSession();
    expect(session).toBeNull();
    // Corrupted file should be purged
    expect(fs.existsSync(sessionFilePath)).toBe(false);
  });
});
