import { describe, it, expect, afterEach } from 'vitest';
import { OAuthServer } from '../../src/main/core/oauth-server';
import http from 'http';

describe('OAuthServer (Loopback RFC 8252)', () => {
  let server: OAuthServer | null = null;

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = null;
    }
  });

  it('should start loopback listener on dynamic port and generate valid auth URL', async () => {
    server = new OAuthServer();
    const { authUrl, port } = await server.start('test-client-id');

    expect(port).toBeGreaterThan(0);
    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=test-client-id');
    expect(authUrl).toContain(`redirect_uri=${encodeURIComponent(`http://127.0.0.1:${port}`)}`);
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('access_type=offline');
  });

  it('should capture authorization code from incoming loopback HTTP request', async () => {
    server = new OAuthServer();
    const { port } = await server.start('test-client-id');

    // Make request simulating Google redirect
    const codePromise = server.waitForCode();

    http.get(`http://127.0.0.1:${port}/?code=mock_auth_code_12345`, (res) => {
      expect(res.statusCode).toBe(200);
    });

    const receivedCode = await codePromise;
    expect(receivedCode).toBe('mock_auth_code_12345');
  });

  it('should handle user cancellation or denial in Google callback', async () => {
    server = new OAuthServer();
    const { port } = await server.start('test-client-id');

    const codePromise = server.waitForCode();

    http.get(`http://127.0.0.1:${port}/?error=access_denied`, (res) => {
      expect(res.statusCode).toBe(200);
    });

    await expect(codePromise).rejects.toThrow('Authentication denied by user: access_denied');
  });

  it('should automatically abort and reject with timeout error after specified timeoutMs', async () => {
    server = new OAuthServer();
    await server.start('test-client-id');

    // Specify short 50ms timeout for test speed
    const codePromise = server.waitForCode(50);

    await expect(codePromise).rejects.toThrow('Authentication timed out after 60 seconds');
    // Ensure server was stopped automatically on timeout
    expect(server.getPort()).toBe(0);
  });

  it('should reject with cancellation error when cancel() is explicitly called', async () => {
    server = new OAuthServer();
    await server.start('test-client-id');

    const codePromise = server.waitForCode();
    await server.cancel();

    await expect(codePromise).rejects.toThrow('Authentication cancelled by user');
    expect(server.getPort()).toBe(0);
  });

  it('should close server cleanly and release port', async () => {
    server = new OAuthServer();
    const { port } = await server.start('test-client-id');

    await server.stop();

    // Verify port is released by creating a new server on it
    const testServer = http.createServer();
    await new Promise<void>((resolve, reject) => {
      testServer.listen(port, '127.0.0.1', () => {
        testServer.close(() => resolve());
      });
      testServer.on('error', reject);
    });
  });
});
