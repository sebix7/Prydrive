import { describe, it, expect } from 'vitest';
import {
  formatItemCreationDate,
  formatItemSize,
  resolveItemIconType,
  sortStorageItems,
  mapGoogleDriveFileToStorageItem,
  INITIAL_FOLDER_HISTORY,
  isAtRootDirectory,
  pushFolderHistory,
  popFolderHistory,
  getCurrentFolder
} from '../../src/shared/explorer-helpers';
import type { StorageItem } from '../../src/shared/types';

describe('Explorer Pure Helpers — Compact List Presentation (US-1 / T1)', () => {
  describe('formatItemCreationDate (FR-1)', () => {
    it('should format ISO date string into DD/MM/YYYY HH:mm:ss in local timezone', () => {
      // Construct a specific local time and verify exact output
      const localDate = new Date(2026, 0, 15, 9, 5, 8); // 15/01/2026 09:05:08 local
      const isoString = localDate.toISOString();

      expect(formatItemCreationDate(isoString)).toBe('15/01/2026 09:05:08');
    });

    it('should return "--" for empty or invalid date strings', () => {
      expect(formatItemCreationDate('')).toBe('--');
      expect(formatItemCreationDate('not-a-valid-date')).toBe('--');
    });
  });

  describe('formatItemSize (FR-1 / EC-1 / EC-2)', () => {
    it('should return "--" for null, undefined, or negative byte values (folders)', () => {
      expect(formatItemSize(null)).toBe('--');
      expect(formatItemSize(undefined)).toBe('--');
      expect(formatItemSize(-10)).toBe('--');
    });

    it('should format 0 bytes as "0 B" (EC-1)', () => {
      expect(formatItemSize(0)).toBe('0 B');
    });

    it('should format bytes, KB, MB, and GB accurately (FR-1 / EC-2)', () => {
      expect(formatItemSize(512)).toBe('512 B');
      expect(formatItemSize(1024)).toBe('1 KB');
      expect(formatItemSize(339 * 1024)).toBe('339 KB');
      expect(formatItemSize(Math.round(1.8 * 1024 * 1024))).toBe('1.8 MB');
      expect(formatItemSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    });
  });

  describe('resolveItemIconType (FR-1 / EC-2 / EC-5)', () => {
    it('should resolve folders and Google Workspace MIME types', () => {
      expect(resolveItemIconType('application/vnd.google-apps.folder', true)).toBe('folder');
      expect(resolveItemIconType('application/vnd.google-apps.document', false)).toBe('document');
      expect(resolveItemIconType('application/vnd.google-apps.spreadsheet', false)).toBe('spreadsheet');
      expect(resolveItemIconType('application/vnd.google-apps.presentation', false)).toBe('presentation');
      expect(resolveItemIconType('application/vnd.google-apps.shortcut', false)).toBe('shortcut');
    });

    it('should resolve common binary MIME types (PDF, media, archives)', () => {
      expect(resolveItemIconType('application/pdf', false)).toBe('pdf');
      expect(resolveItemIconType('image/png', false)).toBe('image');
      expect(resolveItemIconType('video/mp4', false)).toBe('video');
      expect(resolveItemIconType('audio/mpeg', false)).toBe('audio');
      expect(resolveItemIconType('application/zip', false)).toBe('archive');
      expect(resolveItemIconType('application/octet-stream', false)).toBe('file');
    });
  });

  describe('sortStorageItems (FR-5)', () => {
    it('should sort folders ahead of files, and alphabetically A-Z within each group', () => {
      const items: StorageItem[] = [
        {
          id: '1',
          name: 'Zebra.pdf',
          mimeType: 'application/pdf',
          isDirectory: false,
          sizeBytes: 1024,
          formattedSize: '1 KB',
          createdAt: '2026-01-01T00:00:00Z',
          formattedCreatedAt: '01/01/2026 00:00:00',
          iconType: 'pdf',
          isShortcut: false
        },
        {
          id: '2',
          name: 'Proyectos',
          mimeType: 'application/vnd.google-apps.folder',
          isDirectory: true,
          sizeBytes: null,
          formattedSize: '--',
          createdAt: '2026-01-01T00:00:00Z',
          formattedCreatedAt: '01/01/2026 00:00:00',
          iconType: 'folder',
          isShortcut: false
        },
        {
          id: '3',
          name: 'Alpha.docx',
          mimeType: 'application/vnd.google-apps.document',
          isDirectory: false,
          sizeBytes: 2048,
          formattedSize: '2 KB',
          createdAt: '2026-01-01T00:00:00Z',
          formattedCreatedAt: '01/01/2026 00:00:00',
          iconType: 'document',
          isShortcut: false
        },
        {
          id: '4',
          name: 'Archivos Base',
          mimeType: 'application/vnd.google-apps.folder',
          isDirectory: true,
          sizeBytes: null,
          formattedSize: '--',
          createdAt: '2026-01-01T00:00:00Z',
          formattedCreatedAt: '01/01/2026 00:00:00',
          iconType: 'folder',
          isShortcut: false
        }
      ];

      const sorted = sortStorageItems(items);
      expect(sorted.map((i) => i.name)).toEqual([
        'Archivos Base',
        'Proyectos',
        'Alpha.docx',
        'Zebra.pdf'
      ]);
    });
  });

  describe('mapGoogleDriveFileToStorageItem (FR-1 / EC-2)', () => {
    it('should map folder schema with "--" size and folder icon', () => {
      const localDate = new Date(2026, 2, 10, 14, 30, 0);
      const item = mapGoogleDriveFileToStorageItem({
        id: 'folder-1',
        name: 'Mis Fotos',
        mimeType: 'application/vnd.google-apps.folder',
        createdTime: localDate.toISOString()
      });

      expect(item.id).toBe('folder-1');
      expect(item.name).toBe('Mis Fotos');
      expect(item.isDirectory).toBe(true);
      expect(item.sizeBytes).toBeNull();
      expect(item.formattedSize).toBe('--');
      expect(item.formattedCreatedAt).toBe('10/03/2026 14:30:00');
      expect(item.iconType).toBe('folder');
    });

    it('should map Google Workspace file using quotaBytesUsed when size is omitted (EC-2)', () => {
      const localDate = new Date(2025, 8, 5, 10, 0, 0);
      const item = mapGoogleDriveFileToStorageItem({
        id: 'doc-1',
        name: 'Documento sin título',
        mimeType: 'application/vnd.google-apps.document',
        quotaBytesUsed: String(339 * 1024),
        createdTime: localDate.toISOString()
      });

      expect(item.isDirectory).toBe(false);
      expect(item.sizeBytes).toBe(339 * 1024);
      expect(item.formattedSize).toBe('339 KB');
      expect(item.iconType).toBe('document');
    });
  });

  describe('Folder Navigation & Parent Directory Stack (US-2 / T2)', () => {
    it('should initialize at root directory ("My Drive") and hide "..." parent row (FR-3, FR-10)', () => {
      expect(INITIAL_FOLDER_HISTORY).toEqual([{ id: 'root', name: 'My Drive' }]);
      expect(isAtRootDirectory(INITIAL_FOLDER_HISTORY)).toBe(true);
      expect(getCurrentFolder(INITIAL_FOLDER_HISTORY).id).toBe('root');
    });

    it('should push subfolder onto history stack on double-click and enable "..." parent row (FR-6, FR-8)', () => {
      let stack = INITIAL_FOLDER_HISTORY;
      stack = pushFolderHistory(stack, { id: 'folder-a', name: 'Proyectos' });

      expect(isAtRootDirectory(stack)).toBe(false);
      expect(getCurrentFolder(stack)).toEqual({ id: 'folder-a', name: 'Proyectos' });
      expect(stack.length).toBe(2);
    });

    it('should navigate deeply into nested subfolders and ascend accurately via "..." (FR-9, EC-4)', () => {
      let stack = INITIAL_FOLDER_HISTORY;
      stack = pushFolderHistory(stack, { id: 'folder-1', name: '2026' });
      stack = pushFolderHistory(stack, { id: 'folder-2', name: 'Q1' });
      stack = pushFolderHistory(stack, { id: 'folder-3', name: 'Facturas' });

      expect(getCurrentFolder(stack).id).toBe('folder-3');
      expect(isAtRootDirectory(stack)).toBe(false);

      // Ascend 1 level via "..."
      stack = popFolderHistory(stack);
      expect(getCurrentFolder(stack)).toEqual({ id: 'folder-2', name: 'Q1' });
      expect(isAtRootDirectory(stack)).toBe(false);

      // Ascend 2nd level via "..."
      stack = popFolderHistory(stack);
      expect(getCurrentFolder(stack)).toEqual({ id: 'folder-1', name: '2026' });

      // Ascend back to root
      stack = popFolderHistory(stack);
      expect(getCurrentFolder(stack)).toEqual({ id: 'root', name: 'My Drive' });
      expect(isAtRootDirectory(stack)).toBe(true);

      // Attempting to pop at root remains safely at root (FR-10)
      stack = popFolderHistory(stack);
      expect(stack).toEqual([{ id: 'root', name: 'My Drive' }]);
      expect(isAtRootDirectory(stack)).toBe(true);
    });
  });
});
