export type AuthState =
  | 'unauthenticated'
  | 'awaiting_authorization'
  | 'restoring_session'
  | 'authenticated'
  | 'offline';

export type LanguageCode = 'en' | 'es';

export interface UserProfile {
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number | null;
  formattedUsed: string;
  formattedTotal: string;
  percentage: number;
  isUnmetered: boolean;
}

export interface IpcResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthSessionData {
  refreshToken: string;
  email: string;
  displayName?: string;
  savedAt: number;
}
