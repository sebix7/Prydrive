import { describe, it, expect } from 'vitest';
import {
  calculateTransferPercent,
  resolveNextAvailableFilename,
  resolveWorkspaceExportOptions,
  resolveExportExtension,
  filterActiveTransfers,
  hasInFlightTransfers,
  upsertTransferItem,
  getTransferQueueSummary,
  partitionTransfersByStatus,
  formatTransferBytes,
  FLOATING_TRIGGER_GRACE_MS
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

    it('should map target export MIME types back to their binary file extensions', () => {
      expect(resolveExportExtension('application/pdf')).toBe('.pdf');
      expect(
        resolveExportExtension(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe('.docx');
      expect(
        resolveExportExtension(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ).toBe('.xlsx');
      expect(
        resolveExportExtension(
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
      ).toBe('.pptx');
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

  describe('Floating Transfer Trigger Helpers (Spec 012 US-4 / T4 / FR-6, EC-7)', () => {
    const baseItem = (
      id: string,
      status: DownloadTransferItem['status'],
      progressPercent = 0
    ): DownloadTransferItem => ({
      id,
      driveItemId: `drive-${id}`,
      name: `file-${id}.bin`,
      isDirectory: false,
      iconType: 'file',
      status,
      transferredBytes: progressPercent * 10,
      totalBytes: 1000,
      progressPercent,
      destinationPath: `/downloads/file-${id}.bin`
    });

    it('should define a 4000ms completion auto-hide grace period constant (FR-6.3)', () => {
      expect(FLOATING_TRIGGER_GRACE_MS).toBe(4000);
    });

    it('should upsert transfer items immutably preserving FIFO order without duplicates (EC-7)', () => {
      const t1 = baseItem('1', 'queued', 0);
      const t2 = baseItem('2', 'queued', 0);
      let list = upsertTransferItem([], t1);
      list = upsertTransferItem(list, t2);
      expect(list).toHaveLength(2);
      expect(list.map((t) => t.id)).toEqual(['1', '2']);

      const t1Updated = baseItem('1', 'downloading', 45);
      const nextList = upsertTransferItem(list, t1Updated);
      expect(nextList).toHaveLength(2);
      expect(nextList[0].status).toBe('downloading');
      expect(nextList[0].progressPercent).toBe(45);
      // Original array remains unmutated
      expect(list[0].progressPercent).toBe(0);
    });

    it('should select the actively downloading item and compute queue position (1 of 3, 2 of 3) (FR-6.2)', () => {
      const batch1 = [
        baseItem('1', 'downloading', 30),
        baseItem('2', 'queued', 0),
        baseItem('3', 'queued', 0)
      ];
      const summary1 = getTransferQueueSummary(batch1);
      expect(summary1.hasInFlight).toBe(true);
      expect(summary1.activeTransfer?.id).toBe('1');
      expect(summary1.currentIndex).toBe(1);
      expect(summary1.totalCount).toBe(3);

      const batch2 = [
        baseItem('1', 'completed', 100),
        baseItem('2', 'downloading', 60),
        baseItem('3', 'queued', 0)
      ];
      const summary2 = getTransferQueueSummary(batch2);
      expect(summary2.hasInFlight).toBe(true);
      expect(summary2.activeTransfer?.id).toBe('2');
      expect(summary2.currentIndex).toBe(2);
      expect(summary2.totalCount).toBe(3);
    });

    it('should report completed last item when queue finishes for the 4-second grace period (FR-6.3)', () => {
      const doneBatch = [
        baseItem('1', 'completed', 100),
        baseItem('2', 'completed', 100)
      ];
      const summary = getTransferQueueSummary(doneBatch);
      expect(summary.hasInFlight).toBe(false);
      expect(summary.activeTransfer?.id).toBe('2');
      expect(summary.currentIndex).toBe(2);
      expect(summary.totalCount).toBe(2);
    });

    it('should handle empty transfer list safely', () => {
      const summary = getTransferQueueSummary([]);
      expect(summary.hasInFlight).toBe(false);
      expect(summary.activeTransfer).toBeNull();
      expect(summary.currentIndex).toBe(0);
      expect(summary.totalCount).toBe(0);
    });
  });

  describe('Download Queue Modal Partitioning & Byte Formatting (Spec 012 US-5 / T5 / FR-7)', () => {
    const makeItem = (
      id: string,
      status: DownloadTransferItem['status']
    ): DownloadTransferItem => ({
      id,
      driveItemId: `d-${id}`,
      name: `item-${id}.pdf`,
      isDirectory: false,
      iconType: 'pdf',
      status,
      transferredBytes: 0,
      totalBytes: 1024,
      progressPercent: status === 'completed' ? 100 : 0,
      destinationPath: `/downloads/item-${id}.pdf`
    });

    it('should partition transfers into active/queued, failed, and completed/cancelled sections', () => {
      const list = [
        makeItem('1', 'completed'),
        makeItem('2', 'downloading'),
        makeItem('3', 'queued'),
        makeItem('4', 'failed'),
        makeItem('5', 'cancelled')
      ];

      const partitioned = partitionTransfersByStatus(list);
      expect(partitioned.inFlight.map((i) => i.id)).toEqual(['2', '3']);
      expect(partitioned.failed.map((i) => i.id)).toEqual(['4']);
      expect(partitioned.finished.map((i) => i.id)).toEqual(['1', '5']);
      expect(partitioned.completedCount).toBe(1);
      expect(partitioned.activeCount).toBe(2);
      expect(partitioned.hasClearable).toBe(true);
    });

    it('should format transfer byte sizes cleanly from 0 B up to GB', () => {
      expect(formatTransferBytes(0)).toBe('0 B');
      expect(formatTransferBytes(512)).toBe('512 B');
      expect(formatTransferBytes(1024)).toBe('1.0 KB');
      expect(formatTransferBytes(1024 * 1024 * 14.2)).toBe('14.2 MB');
      expect(formatTransferBytes(1024 * 1024 * 1024 * 2.5)).toBe('2.50 GB');
    });
  });
});
