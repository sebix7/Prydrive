import { ipcMain, shell } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { IpcResult, UserProfile } from '../../shared/types';
import { OAuthServer } from '../core/oauth-server';
import { TokenStorage } from '../core/token-storage';
import { GoogleAuthClient } from '../core/google-client';

export class AuthIpcController {
  private isAwaitingAuth = false;
  private currentOAuthServer: OAuthServer | null = null;
  private readonly tokenStorage: TokenStorage;
  private readonly googleClient: GoogleAuthClient;

  constructor(tokenStorage?: TokenStorage, googleClient?: GoogleAuthClient) {
    this.tokenStorage = tokenStorage || new TokenStorage();
    this.googleClient = googleClient || new GoogleAuthClient();
  }

  register(): void {
    ipcMain.handle(IPC_CHANNELS.AUTH_INITIATE, async (): Promise<IpcResult<UserProfile>> => {
      if (this.isAwaitingAuth) {
        return {
          success: false,
          error: {
            code: 'ALREADY_IN_PROGRESS',
            message: 'Authentication is already in progress'
          }
        };
      }

      this.isAwaitingAuth = true;
      const oauthServer = new OAuthServer();
      this.currentOAuthServer = oauthServer;

      try {
        const { authUrl, port } = await oauthServer.start(this.googleClient.getClientId());
        const redirectUri = `http://127.0.0.1:${port}`;

        // Launch external browser
        await shell.openExternal(authUrl);

        // Wait for incoming callback
        const code = await oauthServer.waitForCode();
        await oauthServer.stop();
        this.currentOAuthServer = null;

        // Exchange code for tokens
        const { refreshToken } = await this.googleClient.exchangeCodeForTokens(code, redirectUri);
        const profile = await this.googleClient.fetchUserProfile(refreshToken);

        // Encrypt and persist
        await this.tokenStorage.saveSession({
          refreshToken,
          email: profile.email,
          displayName: profile.displayName,
          savedAt: Date.now()
        });

        this.isAwaitingAuth = false;
        return {
          success: true,
          data: profile
        };
      } catch (err) {
        if (this.currentOAuthServer) {
          await this.currentOAuthServer.stop();
          this.currentOAuthServer = null;
        }
        this.isAwaitingAuth = false;

        const errMsg = (err as Error).message || '';
        let errorCode = 'AUTH_FAILED';
        if (errMsg.toLowerCase().includes('cancelled') || errMsg.toLowerCase().includes('denied')) {
          errorCode = 'AUTH_CANCELLED';
        } else if (errMsg.toLowerCase().includes('timed out')) {
          errorCode = 'AUTH_TIMEOUT';
        }

        return {
          success: false,
          error: {
            code: errorCode,
            message: errMsg || 'Authentication failed'
          }
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.AUTH_CANCEL, async (): Promise<IpcResult<void>> => {
      if (this.currentOAuthServer) {
        await this.currentOAuthServer.cancel();
        this.currentOAuthServer = null;
      }
      this.isAwaitingAuth = false;
      return { success: true };
    });
  }

  isAwaiting(): boolean {
    return this.isAwaitingAuth;
  }
}
