export type AuthFailureCategory = 'TOKEN_REVOKED' | 'NETWORK_OFFLINE' | 'TIMEOUT' | 'UNKNOWN';

export interface EvaluatedAuthError {
  category: AuthFailureCategory;
  shouldPurgeCredentials: boolean;
  message: string;
}

export function evaluateAuthError(error: unknown): EvaluatedAuthError {
  if (!error || typeof error !== 'object') {
    return {
      category: 'UNKNOWN',
      shouldPurgeCredentials: false,
      message: 'An unknown authentication error occurred'
    };
  }

  const err = error as {
    code?: string | number;
    message?: string;
    response?: { status?: number; data?: unknown };
  };

  const message = (err.message || '').toLowerCase();
  const code = String(err.code || '');
  const status = err.response?.status;

  // 1. Check for token expiration or external revocation (invalid_grant, 400/401 with revocation text)
  const isRevocationMessage =
    message.includes('invalid_grant') ||
    message.includes('revoked') ||
    message.includes('expired') ||
    message.includes('token has been expired');

  if (status === 401 || (status === 400 && isRevocationMessage) || isRevocationMessage) {
    return {
      category: 'TOKEN_REVOKED',
      shouldPurgeCredentials: true,
      message: 'Session expired or revoked by Google. Please sign in again.'
    };
  }

  // 2. Check for network connectivity failures (offline, DNS lookup failed, connection reset/timeout)
  const isNetworkCode =
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'EHOSTUNREACH';

  const isNetworkMessage =
    message.includes('enotfound') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('fetch failed') ||
    message.includes('connect etimedout');

  if (isNetworkCode || isNetworkMessage) {
    return {
      category: 'NETWORK_OFFLINE',
      shouldPurgeCredentials: false,
      message: 'Network offline: Unable to verify session. Check your internet connection.'
    };
  }

  // 3. Timeout check
  if (message.includes('timed out') || code === 'TIMEOUT') {
    return {
      category: 'TIMEOUT',
      shouldPurgeCredentials: false,
      message: 'Authentication request timed out.'
    };
  }

  // 4. Default fallback: do NOT purge credentials on unexpected or transient internal errors
  return {
    category: 'UNKNOWN',
    shouldPurgeCredentials: false,
    message: err.message || 'An unexpected error occurred during session verification.'
  };
}
