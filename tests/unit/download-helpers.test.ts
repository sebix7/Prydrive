import { describe, it, expect } from 'vitest';
import {
  calculateTransferPercent,
  resolveNextAvailableFilename,
  resolveWorkspaceExportOptions,
  filterActiveTransfers,
  hasInFlightTransfers
} from '../../src/shared/download-helpers';
import type { DownloadTransferItem } from '../../src/shared/types';

describe('Download Pure Helpers (Spec 012 US-2 / T2 / FR-3.4, FR-4, FR-5, EC-2, EC-6)', () => {
  describe('calculateTransferPercent (FR-3.4, FR-6.2)', () => {
    it('should compute deterministic integer progress percentage between 0 and 100', () => {
      expect(calculateTransferPercent(0, 1000)).toBe(0);
      expect(calculateTransferPercent(250, 1000)).toBe(25);
      expect(calculateTransferPercent(500, 1000)).toBe(50);
      expect(calculateTransferPercent(999, 1000)).toBe(100);
      expect(calculateTransferPercent(1000, 1000)).toBe(100);
    });

    it('should clamp values at 100% even if transferred bytes exceed total bytes', () => {
      expect(calculateTransferPercent(1500, 1000)).toBe(100);
    });

    it('should safely handle 0-byte files or null total bytes (EC-2)', () => {
      expect(calculateTransferPercent(0, 0)).toBe(0);
      expect(calculateTransferPercent(100, 0)).toBe(100);
      expect(calculateTransferPercent(0, null)).toBe(0);
      expect(calculateTransferPercent(500, null)).toBe(100);
    });
  });

  describe('resolveNextAvailableFilename (EC-6)', () => {
    it('should return original filename when no collision exists in target folder', () => {
      const existing = ['document.pdf', 'notes.txt'];
      expect(resolveNextAvailableFilename(existing, 'report.docx')).toBe('report.docx');
    });

    it('should append incremental counter in parentheses before extension when collision occurs', () => {
      const existing = ['report.docx', 'report (1).docx'];
      expect(resolveNextAvailableFilename(existing, 'report.docx')).toBe('report (2).docx');
    });

    it('should handle filenames without extension correctly', () => {
      const existing = ['Archive', 'Archive (1)'];
      expect(resolveNextAvailableFilename(existing, 'Archive')).toBe('Archive (2)');
    });

    it('should handle filenames with multiple dots correctly', () => {
      const existing = ['archive.tar.gz'];
      expect(resolveNextAvailableFilename(existing, 'archive.tar.gz')).toBe('archive.tar (1).gz');
    });
  });

  describe('resolveWorkspaceExportOptions (FR-5)', () => {
    it('should map Google Docs MIME type to PDF and DOCX options', () => {
      const options = resolveWorkspaceExportOptions('application/vnd.google-apps.document');
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({
        format: 'pdf',
        extension: '.pdf',
        mimeType: 'application/pdf',
        labelKey: 'export_format_pdf'
      });
      expect(options[1]).toEqual({
        format: 'docx',
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        labelKey: 'export_format_docx'
      });
    });

    it('should map Google Sheets MIME type to XLSX and PDF options', () => {
      const options = resolveWorkspaceExportOptions('application/vnd.google-apps.spreadsheet');
      expect(options).toHaveLength(2);
      expect(options[0].format).toBe('xlsx');
      expect(options[1].format).toBe('pdf');
    });

    it('should map Google Slides MIME type to PPTX and PDF options', () => {
      const options = resolveWorkspaceExportOptions('application/vnd.google-apps.presentation');
      expect(options).toHaveLength(2);
      expect(options[0].format).toBe('pptx');
      expect(options[1].format).toBe('pdf');
    });

    it('should return empty array for non-workspace standard MIME types', () => {
      expect(resolveWorkspaceExportOptions('image/png')).toEqual([]);
      expect(resolveWorkspaceExportOptions('application/zip')).toEqual([]);
    });
  });

  describe('filterActiveTransfers & hasInFlightTransfers (FR-6.1, FR-6.3)', () => {
    const mockTransfers: DownloadTransferItem[] = [
      {
        id: 't-1',
        driveItemId: 'item-1',
        name: 'completed.pdf',
        isDirectory: false,
        iconType: 'pdf',
        status: 'completed',
        transferredBytes: 100,
        totalBytes: 100,
        progressPercent: 100,
        destinationPath: '/downloads/completed.pdf'
      },
      {
        id: 't-2',
        driveItemId: 'item-2',
        name: 'active.zip',
        isDirectory: true,
        iconType: 'folder',
        status: 'downloading',
        transferredBytes: 50,
        totalBytes: 100,
        progressPercent: 50,
        destinationPath: '/downloads/active.zip'
      },
      {
        id: 't-3',
        driveItemId: 'item-3',
        name: 'queued.docx',
        isDirectory: false,
        iconType: 'document',
        status: 'queued',
        transferredBytes: 0,
        totalBytes: 200,
        progressPercent: 0,
        destinationPath: '/downloads/queued.docx'
      }
    ];

    it('should filter items that are currently downloading or queued', () => {
      const active = filterActiveTransfers(mockTransfers);
      expect(active).toHaveLength(2);
      expect(active.map((t) => t.id)).toEqual(['t-2', 't-3']);
    });

    it('should detect when in-flight transfers exist', () => {
      expect(hasInFlightTransfers(mockTransfers)).toBe(true);
      expect(hasInFlightTransfers([mockTransfers[0]])).toBe(false);
      expect(hasInFlightTransfers([])).toBe(false);
    });
  });
});
