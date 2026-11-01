import 'dotenv/config';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { UserProfile } from '../../shared/types';

export class GoogleAuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private oauth2Client: OAuth2Client | null = null;

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

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ refreshToken: string; accessToken: string }> {
    const client = this.createOAuthClient(redirectUri);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      // In OAuth desktop loopback with prompt=consent, refresh_token is returned.
      // If missing in test scenarios, handle or fallback
      throw new Error('No refresh token returned by Google OAuth');
    }

    return {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token || ''
    };
  }

  async fetchUserProfile(refreshToken: string): Promise<UserProfile> {
    const client = this.createOAuthClient('http://127.0.0.1');
    client.setCredentials({ refresh_token: refreshToken });

    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userinfo = await oauth2.userinfo.get();

    return {
      email: userinfo.data.email || 'unknown@google.com',
      displayName: userinfo.data.name || undefined,
      avatarUrl: userinfo.data.picture || undefined
    };
  }

  async fetchStorageQuota(refreshToken: string): Promise<{ usage: string | number; limit?: string | number | null }> {
    const client = this.createOAuthClient('http://127.0.0.1');
    client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: 'v3', auth: client });
    const about = await drive.about.get({
      fields: 'storageQuota'
    });

    const quota = about.data.storageQuota;
    return {
      usage: quota?.usage ?? 0,
      limit: quota?.limit ?? null
    };
  }
}
