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

export type StorageItemType =
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'shortcut'
  | 'file';

export interface StorageItem {
  id: string;
  name: string;
  mimeType: string;
  isDirectory: boolean;
  sizeBytes: number | null;
  formattedSize: string;
  createdAt: string;
  formattedCreatedAt: string;
  iconType: StorageItemType;
  isShortcut: boolean;
}

export interface ListDirectoryParams {
  folderId?: string;
  pageToken?: string;
  pageSize?: number;
}

export interface ListDirectoryResult {
  items: StorageItem[];
  nextPageToken: string | null;
  currentFolderId: string;
  parentFolderId?: string | null;
}

