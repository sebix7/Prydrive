import type {
  DownloadTransferItem,
  WorkspaceExportOption
} from './types';

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
