import type { StorageItem, StorageItemType } from './types';

/**
 * Formats an ISO 8601 date string into DD/MM/YYYY HH:mm:ss in the local timezone (FR-1).
 */
export function formatItemCreationDate(isoDateString: string): string {
  if (!isoDateString || typeof isoDateString !== 'string') {
    return '--';
  }

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return '--';
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

/**
 * Formats byte values into human-readable units (B, KB, MB, GB).
 * Returns '--' if bytes is null, undefined, or negative (FR-1, EC-1, EC-2).
 */
export function formatItemSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return '--';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const value = bytes / Math.pow(k, i);

  return `${Number(value.toFixed(1))} ${units[i]}`;
}

/**
 * Resolves item category icon based on MIME type and folder flag (FR-1, EC-2, EC-5).
 */
export function resolveItemIconType(mimeType: string, isDirectory: boolean): StorageItemType {
  if (isDirectory || mimeType === 'application/vnd.google-apps.folder') {
    return 'folder';
  }
  if (mimeType === 'application/vnd.google-apps.shortcut') {
    return 'shortcut';
  }
  if (
    mimeType === 'application/vnd.google-apps.document' ||
    mimeType.includes('wordprocessingml')
  ) {
    return 'document';
  }
  if (
    mimeType === 'application/vnd.google-apps.spreadsheet' ||
    mimeType.includes('spreadsheetml') ||
    mimeType === 'text/csv'
  ) {
    return 'spreadsheet';
  }
  if (
    mimeType === 'application/vnd.google-apps.presentation' ||
    mimeType.includes('presentationml')
  ) {
    return 'presentation';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip') ||
    mimeType.includes('7z')
  ) {
    return 'archive';
  }
  return 'file';
}

/**
 * Sorts storage items: folders first (alphabetical A-Z), then files (alphabetical A-Z) (FR-5).
 */
export function sortStorageItems(items: StorageItem[]): StorageItem[] {
  return [...items].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

/**
 * Maps a raw Google Drive file object to a provider-agnostic StorageItem (FR-1, EC-2).
 */
export function mapGoogleDriveFileToStorageItem(
  rawFile: Record<string, unknown>
): StorageItem {
  const id = String(rawFile.id || '');
  const name = String(rawFile.name || 'Untitled');
  const mimeType = String(rawFile.mimeType || 'application/octet-stream');
  const isDirectory = mimeType === 'application/vnd.google-apps.folder';
  const isShortcut = mimeType === 'application/vnd.google-apps.shortcut';

  const rawSize = rawFile.size ?? rawFile.quotaBytesUsed;
  const parsedSize =
    rawSize !== undefined && rawSize !== null && rawSize !== '' ? Number(rawSize) : null;
  const sizeBytes = isDirectory || parsedSize === null || isNaN(parsedSize) ? null : parsedSize;

  const createdAt = String(rawFile.createdTime || '');

  return {
    id,
    name,
    mimeType,
    isDirectory,
    sizeBytes,
    formattedSize: isDirectory ? '--' : formatItemSize(sizeBytes),
    createdAt,
    formattedCreatedAt: formatItemCreationDate(createdAt),
    iconType: resolveItemIconType(mimeType, isDirectory),
    isShortcut
  };
}
