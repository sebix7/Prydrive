import type {
  DownloadTransferItem,
  WorkspaceExportOption
} from './types';

export type { WorkspaceExportOption };

/**
 * Computes deterministic progress percentage between 0 and 100 (FR-3.4, FR-6.2).
 */
export function calculateTransferPercent(
  transferredBytes: number,
  totalBytes: number | null
): number {
  if (totalBytes === null || totalBytes <= 0) {
    return transferredBytes > 0 ? 100 : 0;
  }
  const ratio = (transferredBytes / totalBytes) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}

/**
 * Automatically appends an incremental counter (e.g. 'file (1).txt') if target exists (EC-6).
 */
export function resolveNextAvailableFilename(
  existingFilenames: string[],
  desiredFilename: string
): string {
  if (!existingFilenames.includes(desiredFilename)) {
    return desiredFilename;
  }

  const lastDot = desiredFilename.lastIndexOf('.');
  const baseName = lastDot !== -1 ? desiredFilename.substring(0, lastDot) : desiredFilename;
  const ext = lastDot !== -1 ? desiredFilename.substring(lastDot) : '';

  let counter = 1;
  while (true) {
    const candidate = `${baseName} (${counter})${ext}`;
    if (!existingFilenames.includes(candidate)) {
      return candidate;
    }
    counter++;
  }
}

/**
 * Maps Google Docs, Sheets, and Slides MIME types to supported export options (FR-5).
 */
export function resolveWorkspaceExportOptions(mimeType: string): WorkspaceExportOption[] {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return [
        {
          format: 'pdf',
          extension: '.pdf',
          mimeType: 'application/pdf',
          labelKey: 'export_format_pdf'
        },
        {
          format: 'docx',
          extension: '.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          labelKey: 'export_format_docx'
        }
      ];
    case 'application/vnd.google-apps.spreadsheet':
      return [
        {
          format: 'xlsx',
          extension: '.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          labelKey: 'export_format_xlsx'
        },
        {
          format: 'pdf',
          extension: '.pdf',
          mimeType: 'application/pdf',
          labelKey: 'export_format_pdf'
        }
      ];
    case 'application/vnd.google-apps.presentation':
      return [
        {
          format: 'pptx',
          extension: '.pptx',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          labelKey: 'export_format_pptx'
        },
        {
          format: 'pdf',
          extension: '.pdf',
          mimeType: 'application/pdf',
          labelKey: 'export_format_pdf'
        }
      ];
    default:
      return [];
  }
}

/**
 * Maps a target binary export MIME type to its corresponding file extension.
 */
export function resolveExportExtension(exportMimeType: string): string {
  switch (exportMimeType) {
    case 'application/pdf':
      return '.pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '.docx';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return '.xlsx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return '.pptx';
    default:
      return '.pdf';
  }
}

/**
 * Filters items that are in-flight (currently downloading or queued) (FR-6.1).
 */
export function filterActiveTransfers(transfers: DownloadTransferItem[]): DownloadTransferItem[] {
  return transfers.filter((t) => t.status === 'downloading' || t.status === 'queued');
}

/**
 * Checks whether any transfers are actively in flight (FR-6.1, FR-6.3).
 */
export function hasInFlightTransfers(transfers: DownloadTransferItem[]): boolean {
  return filterActiveTransfers(transfers).length > 0;
}

/**
 * Duration in milliseconds before the floating transfer trigger hides after all transfers finish (FR-6.3).
 */
export const FLOATING_TRIGGER_GRACE_MS = 4000;

export interface TransferQueueSummary {
  activeTransfer: DownloadTransferItem | null;
  currentIndex: number;
  totalCount: number;
  hasInFlight: boolean;
}

/**
 * Immutably upserts a transfer item into the FIFO list by id, preserving order and preventing duplicates (EC-7).
 */
export function upsertTransferItem(
  transfers: DownloadTransferItem[],
  incoming: DownloadTransferItem
): DownloadTransferItem[] {
  const existingIndex = transfers.findIndex((item) => item.id === incoming.id);
  if (existingIndex === -1) {
    return [...transfers, incoming];
  }
  const next = [...transfers];
  next[existingIndex] = incoming;
  return next;
}

/**
 * Computes the active item, 1-based queue index, and total count for the floating hover pill (FR-6.2, FR-6.3).
 */
export function getTransferQueueSummary(transfers: DownloadTransferItem[]): TransferQueueSummary {
  const hasInFlight = hasInFlightTransfers(transfers);
  if (transfers.length === 0) {
    return {
      activeTransfer: null,
      currentIndex: 0,
      totalCount: 0,
      hasInFlight: false
    };
  }

  const nonCancelled = transfers.filter((item) => item.status !== 'cancelled');
  const totalCount = nonCancelled.length;

  const downloading = nonCancelled.find((item) => item.status === 'downloading');
  if (downloading) {
    return {
      activeTransfer: downloading,
      currentIndex: nonCancelled.findIndex((item) => item.id === downloading.id) + 1,
      totalCount,
      hasInFlight
    };
  }

  const firstQueued = nonCancelled.find((item) => item.status === 'queued');
  if (firstQueued) {
    return {
      activeTransfer: firstQueued,
      currentIndex: nonCancelled.findIndex((item) => item.id === firstQueued.id) + 1,
      totalCount,
      hasInFlight
    };
  }

  if (nonCancelled.length > 0) {
    return {
      activeTransfer: nonCancelled[nonCancelled.length - 1],
      currentIndex: nonCancelled.length,
      totalCount,
      hasInFlight: false
    };
  }

  return {
    activeTransfer: transfers[transfers.length - 1],
    currentIndex: 0,
    totalCount: 0,
    hasInFlight: false
  };
}
