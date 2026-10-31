import { describe, it, expect } from 'vitest';
import { evaluateAuthError } from '../../src/main/core/error-evaluator';

describe('Error Evaluator (US-3 / T3)', () => {
  it('should categorize revoked or expired token (invalid_grant) and require credential purge', () => {
    const error = {
      message: 'invalid_grant: Token has been expired or revoked.',
      response: { status: 400 }
    };

    const result = evaluateAuthError(error);
    expect(result.category).toBe('TOKEN_REVOKED');
    expect(result.shouldPurgeCredentials).toBe(true);
    expect(result.message).toContain('Session expired or revoked');
  });

  it('should categorize 401 unauthorized as revoked token and require credential purge', () => {
    const error = {
      response: { status: 401, data: { error: 'unauthorized' } }
    };

    const result = evaluateAuthError(error);
    expect(result.category).toBe('TOKEN_REVOKED');
    expect(result.shouldPurgeCredentials).toBe(true);
  });

  it('should categorize network failure (ENOTFOUND) as offline and NOT purge credentials', () => {
    const error = {
      code: 'ENOTFOUND',
      message: 'getaddrinfo ENOTFOUND accounts.google.com'
    };

    const result = evaluateAuthError(error);
    expect(result.category).toBe('NETWORK_OFFLINE');
    expect(result.shouldPurgeCredentials).toBe(false);
    expect(result.message).toContain('offline');
  });

  it('should categorize connection timeout (ETIMEDOUT) as offline and NOT purge credentials', () => {
    const error = {
      code: 'ETIMEDOUT',
      message: 'connect ETIMEDOUT 142.250.190.42:443'
    };

    const result = evaluateAuthError(error);
    expect(result.category).toBe('NETWORK_OFFLINE');
    expect(result.shouldPurgeCredentials).toBe(false);
  });

  it('should handle generic / unknown errors without purging credentials', () => {
    const error = new Error('Unexpected internal parsing issue');

    const result = evaluateAuthError(error);
    expect(result.category).toBe('UNKNOWN');
    expect(result.shouldPurgeCredentials).toBe(false);
  });
});
