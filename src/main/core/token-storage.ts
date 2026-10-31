import { safeStorage, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { AuthSessionData } from '../../shared/types';

export class TokenStorage {
  private readonly storageFilePath: string;

  constructor(customDirectory?: string) {
    const baseDir = customDirectory || app.getPath('userData');
    this.storageFilePath = path.join(baseDir, 'auth_session.enc');
  }

  async saveSession(session: AuthSessionData): Promise<void> {
    const serialized = JSON.stringify(session);
    let bufferToSave: Buffer;

    if (safeStorage.isEncryptionAvailable()) {
      bufferToSave = safeStorage.encryptString(serialized);
    } else {
      // Fallback for environments where safeStorage is unavailable (e.g. headless CI)
      bufferToSave = Buffer.from(`plain:${serialized}`, 'utf-8');
    }

    const tempPath = `${this.storageFilePath}.tmp`;
    fs.writeFileSync(tempPath, bufferToSave);
    fs.renameSync(tempPath, this.storageFilePath);
  }

  async loadSession(): Promise<AuthSessionData | null> {
    if (!fs.existsSync(this.storageFilePath)) {
      return null;
    }

    try {
      const buffer = fs.readFileSync(this.storageFilePath);
      let jsonString: string;

      if (safeStorage.isEncryptionAvailable()) {
        jsonString = safeStorage.decryptString(buffer);
      } else {
        const text = buffer.toString('utf-8');
        if (text.startsWith('plain:')) {
          jsonString = text.substring(6);
        } else {
          throw new Error('Encryption unavailable and unencrypted header missing');
        }
      }

      const parsed = JSON.parse(jsonString) as AuthSessionData;
      if (!parsed.refreshToken || !parsed.email) {
        throw new Error('Incomplete session format');
      }

      return parsed;
    } catch {
      // If corrupted or decryption fails, clean up the bad session file
      await this.wipeSession();
      return null;
    }
  }

  async wipeSession(): Promise<void> {
    if (fs.existsSync(this.storageFilePath)) {
      try {
        fs.unlinkSync(this.storageFilePath);
      } catch {
        // Ignored if already unlinked
      }
    }
  }

  async hasSession(): Promise<boolean> {
    return fs.existsSync(this.storageFilePath);
  }
}
