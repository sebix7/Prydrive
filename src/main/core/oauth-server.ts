import http from 'http';
import { URL } from 'url';

export interface OAuthStartResult {
  authUrl: string;
  port: number;
}

export class OAuthServer {
  private server: http.Server | null = null;
  private port = 0;
  private codeResolver: ((code: string) => void) | null = null;
  private codeRejecter: ((reason: Error) => void) | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;

  async start(clientId: string, maxRetries = 3): Promise<OAuthStartResult> {
    let attempts = 0;
    let bound = false;

    while (attempts < maxRetries && !bound) {
      try {
        await this.bindServer();
        bound = true;
      } catch (err) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error(`Failed to bind loopback server after ${maxRetries} attempts: ${(err as Error).message}`);
        }
      }
    }

    const redirectUri = `http://127.0.0.1:${this.port}`;
    const scopes = [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    return { authUrl, port: this.port };
  }

  private bindServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const srv = http.createServer((req, res) => {
        this.handleHttpRequest(req, res);
      });

      srv.listen(0, '127.0.0.1', () => {
        const address = srv.address();
        if (address && typeof address === 'object') {
          this.port = address.port;
          this.server = srv;
          resolve();
        } else {
          srv.close(() => reject(new Error('Invalid server address structure')));
        }
      });

      srv.on('error', (err) => {
        reject(err);
      });
    });
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (!req.url) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    try {
      const parsedUrl = new URL(req.url, `http://127.0.0.1:${this.port}`);
      const code = parsedUrl.searchParams.get('code');
      const error = parsedUrl.searchParams.get('error');

      this.clearTimeoutTimer();

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Prydrive Authorization</title></head>
            <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
              <h2 style="color: #059669;">Authentication Successful!</h2>
              <p style="color: #475569;">You may close this browser tab and return to Prydrive.</p>
            </body>
          </html>
        `);
        if (this.codeResolver) {
          this.codeResolver(code);
        }
      } else if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Prydrive Authorization</title></head>
            <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
              <h2 style="color: #dc2626;">Authentication Cancelled</h2>
              <p style="color: #475569;">You denied permissions or closed authorization. You may close this tab.</p>
            </body>
          </html>
        `);
        if (this.codeRejecter) {
          this.codeRejecter(new Error(`Authentication denied by user: ${error}`));
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (err) {
      this.clearTimeoutTimer();
      res.writeHead(500);
      res.end('Internal Server Error');
      if (this.codeRejecter) {
        this.codeRejecter(err as Error);
      }
    }
  }

  waitForCode(timeoutMs = 60000): Promise<string> {
    if (!this.server) {
      return Promise.reject(new Error('Authentication server stopped or cancelled'));
    }

    return new Promise((resolve, reject) => {
      this.codeResolver = resolve;
      this.codeRejecter = reject;

      this.timeoutTimer = setTimeout(async () => {
        this.timeoutTimer = null;
        const rejectFn = this.codeRejecter;
        this.codeResolver = null;
        this.codeRejecter = null;

        await this.stop();

        if (rejectFn) {
          rejectFn(new Error('Authentication timed out after 60 seconds'));
        }
      }, timeoutMs);
    });
  }

  async cancel(): Promise<void> {
    this.clearTimeoutTimer();
    const rejectFn = this.codeRejecter;
    this.codeResolver = null;
    this.codeRejecter = null;

    await this.stop();

    if (rejectFn) {
      rejectFn(new Error('Authentication cancelled by user'));
    }
  }

  async stop(): Promise<void> {
    this.clearTimeoutTimer();
    const rejectFn = this.codeRejecter;
    this.codeResolver = null;
    this.codeRejecter = null;

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server?.close(() => {
          this.server = null;
          this.port = 0;
          resolve();
        });
      });
    }

    if (rejectFn) {
      rejectFn(new Error('Authentication server stopped or cancelled'));
    }
  }

  private clearTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  getPort(): number {
    return this.port;
  }
}
