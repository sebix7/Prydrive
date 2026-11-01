import type { StorageQuota } from './types';

/**
 * Converts a raw byte count into a human-readable string with units.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // If decimal is clean (e.g. 1.0), show integer, else 1 decimal place
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${sizes[i]}`;
}

/**
 * Calculates storage percentage clamped between 0 and 100.
 * Returns 0 if total is unavailable or unmetered.
 */
export function calculateQuotaPercentage(
  usedBytes: number,
  totalBytes?: number | null
): number {
  if (!totalBytes || totalBytes <= 0) {
    return 0;
  }
  if (usedBytes <= 0) {
    return 0;
  }

  const rawPercent = (usedBytes / totalBytes) * 100;
  const clamped = Math.min(100, Math.max(0, rawPercent));
  return Math.round(clamped * 10) / 10;
}

/**
 * Pure formatter for Google Drive storage quota metrics (FR-10, EC-3).
 */
export function formatStorageQuota(
  used: number | string,
  total?: number | string | null
): StorageQuota {
  const usedBytes = typeof used === 'string' ? parseInt(used, 10) || 0 : used;
  const totalNum = total != null ? (typeof total === 'string' ? parseInt(total, 10) || 0 : total) : null;
  const isUnmetered = totalNum === null || totalNum <= 0;

  const totalBytes = isUnmetered ? null : totalNum;
  const formattedUsed = formatBytes(Math.max(0, usedBytes));
  const formattedTotal = isUnmetered ? 'Unlimited' : formatBytes(totalBytes!);
  const percentage = calculateQuotaPercentage(usedBytes, totalBytes);

  return {
    usedBytes,
    totalBytes,
    formattedUsed,
    formattedTotal,
    percentage,
    isUnmetered
  };
}
