import 'dotenv/config';
import { google, type drive_v3 } from 'googleapis';
import type { UserProfile } from '../../shared/types';

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export class GoogleAuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private oauth2Client: OAuth2Client | null = null;
  private cachedAuthClient: OAuth2Client | null = null;
  private cachedRefreshToken: string | null = null;

  constructor(clientId?: string, clientSecret?: string) {
    this.clientId = clientId || process.env.GOOGLE_CLIENT_ID || 'mock_client_id.apps.googleusercontent.com';
    this.clientSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret';
  }

  createOAuthClient(redirectUri: string): OAuth2Client {
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      redirectUri
    );
    return this.oauth2Client;
  }

  getClientId(): string {
    return this.clientId;
  }

  /**
   * Returns a cached in-memory OAuth2Client keyed by refreshToken so googleapis reuses
   * valid access tokens across Drive operations without redundant token exchanges (FR-13.1).
   */
  getAuthenticatedClient(refreshToken: string): OAuth2Client {
    if (this.cachedAuthClient && this.cachedRefreshToken === refreshToken) {
      return this.cachedAuthClient;
    }

    const client = this.createOAuthClient('http://127.0.0.1');
    client.setCredentials({ refresh_token: refreshToken });
    this.cachedAuthClient = client;
    this.cachedRefreshToken = refreshToken;
    return client;
  }

  /**
   * Clears the cached in-memory OAuth2Client immediately on disconnect or auth invalidation (FR-13.2).
   */
  clearCachedClient(): void {
    this.cachedAuthClient = null;
    this.cachedRefreshToken = null;
  }

  private isAuthInvalidationError(err: unknown): boolean {
    if (!err || typeof err !== 'object') {
      return false;
    }
    const candidate = err as {
      code?: number | string;
      status?: number;
      response?: { status?: number };
      message?: string;
    };
    const status = candidate.status ?? candidate.response?.status ?? candidate.code;
    if (status === 401 || status === '401') {
      return true;
    }
    const message = (candidate.message || '').toLowerCase();
    return (
      message.includes('invalid_grant') ||
      message.includes('invalid_token') ||
      message.includes('unauthorized')
    );
  }

  getDriveClient(refreshToken: string): drive_v3.Drive {
    const client = this.getAuthenticatedClient(refreshToken);
    return google.drive({ version: 'v3', auth: client });
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ refreshToken: string; accessToken: string }> {
    const client = this.createOAuthClient(redirectUri);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      // In OAuth desktop loopback with prompt=consent, refresh_token is returned.
      // If missing in test scenarios, handle or fallback
      throw new Error('No refresh token returned by Google OAuth');
    }

    // Seed in-memory client cache with freshly issued access and refresh tokens (FR-13.1)
    this.cachedAuthClient = client;
    this.cachedRefreshToken = tokens.refresh_token;

    return {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token || ''
    };
  }

  async fetchUserProfile(refreshToken: string): Promise<UserProfile> {
    const client = this.getAuthenticatedClient(refreshToken);

    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const userinfo = await oauth2.userinfo.get();

      return {
        email: userinfo.data.email || 'unknown@google.com',
        displayName: userinfo.data.name || undefined,
        avatarUrl: userinfo.data.picture || undefined
      };
    } catch (err) {
      if (this.isAuthInvalidationError(err)) {
        this.clearCachedClient();
      }
      throw err;
    }
  }

  async fetchStorageQuota(refreshToken: string): Promise<{ usage: string | number; limit?: string | number | null }> {
    const client = this.getAuthenticatedClient(refreshToken);

    try {
      const drive = google.drive({ version: 'v3', auth: client });
      const about = await drive.about.get({
        fields: 'storageQuota'
      });

      const quota = about.data.storageQuota;
      return {
        usage: quota?.usage ?? 0,
        limit: quota?.limit ?? null
      };
    } catch (err) {
      if (this.isAuthInvalidationError(err)) {
        this.clearCachedClient();
      }
      throw err;
    }
  }

  async listDirectory(
    refreshToken: string,
    folderId = 'root',
    pageToken?: string,
    pageSize = 50,
    foldersOnly = false
  ): Promise<{ files: Array<Record<string, unknown>>; nextPageToken: string | null }> {
    const client = this.getAuthenticatedClient(refreshToken);

    const folderFilter = foldersOnly ? " and mimeType = 'application/vnd.google-apps.folder'" : '';
    const q = `'${folderId}' in parents and trashed = false${folderFilter}`;

    try {
      const drive = google.drive({ version: 'v3', auth: client });
      const response = await drive.files.list({
        q,
        fields:
          'nextPageToken, files(id, name, mimeType, size, quotaBytesUsed, createdTime, shortcutDetails, trashed)',
        pageSize,
        pageToken: pageToken || undefined,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      return {
        files: (response.data.files as Array<Record<string, unknown>>) || [],
        nextPageToken: response.data.nextPageToken || null
      };
    } catch (err) {
      if (this.isAuthInvalidationError(err)) {
        this.clearCachedClient();
      }
      throw err;
    }
  }
}
