import { describe, it, expect } from 'vitest';
import {
  initialExplorerState,
  explorerReducer,
  getRowSelectionClasses
} from '../../src/shared/explorer-helpers';
import { resolveWorkspaceView } from '../../src/shared/shell-state';
import type { StorageItem } from '../../src/shared/types';

const sampleFolder: StorageItem = {
  id: 'folder-projects',
  name: 'Projects 2026',
  mimeType: 'application/vnd.google-apps.folder',
  isDirectory: true,
  sizeBytes: null,
  formattedSize: '--',
  createdAt: '2026-01-10T10:00:00.000Z',
  formattedCreatedAt: '10/01/2026 07:00:00',
  iconType: 'folder',
  isShortcut: false
};

const sampleFile: StorageItem = {
  id: 'file-budget',
  name: 'Budget.xlsx',
  mimeType: 'application/vnd.google-apps.spreadsheet',
  isDirectory: false,
  sizeBytes: 347136,
  formattedSize: '339 KB',
  createdAt: '2026-01-12T14:30:00.000Z',
  formattedCreatedAt: '12/01/2026 11:30:00',
  iconType: 'spreadsheet',
  isShortcut: false
};

const sampleShortcut: StorageItem = {
  id: 'shortcut-shared',
  name: 'Shared Roadmap Shortcut',
  mimeType: 'application/vnd.google-apps.shortcut',
  isDirectory: false,
  sizeBytes: null,
  formattedSize: '--',
  createdAt: '2026-01-15T09:00:00.000Z',
  formattedCreatedAt: '15/01/2026 06:00:00',
  iconType: 'shortcut',
  isShortcut: true
};

describe('Drive Explorer State, Selection & Unified Rail Access (US-3 / T3)', () => {
  it('should highlight a file or folder row when single-clicked (FR-11)', () => {
    expect(initialExplorerState.selectedItemId).toBeNull();

    // Select a file row
    const afterFileClick = explorerReducer(initialExplorerState, {
      type: 'SELECT_ITEM',
      payload: sampleFile.id
    });
    expect(afterFileClick.selectedItemId).toBe('file-budget');

    // Switch selection to a folder row
    const afterFolderClick = explorerReducer(afterFileClick, {
      type: 'SELECT_ITEM',
      payload: sampleFolder.id
    });
    expect(afterFolderClick.selectedItemId).toBe('folder-projects');
  });

  it('should return distinct visual classes for selected vs unselected rows (FR-11, NFR-2)', () => {
    const selectedClasses = getRowSelectionClasses(true);
    const unselectedClasses = getRowSelectionClasses(false);

    expect(selectedClasses).toContain('bg-blue-600/20');
    expect(selectedClasses).toContain('text-white');
    expect(unselectedClasses).toContain('text-slate-200');
    expect(unselectedClasses).not.toContain('bg-blue-600/20');
  });

  it('should clear active selection when double-clicking a folder to navigate inside (FR-6)', () => {
    const stateWithSelection = {
      ...initialExplorerState,
      items: [sampleFolder, sampleFile],
      selectedItemId: sampleFolder.id,
      isLoading: false
    };

    const nextState = explorerReducer(stateWithSelection, {
      type: 'DOUBLE_CLICK_ITEM',
      payload: sampleFolder
    });

    expect(nextState.selectedItemId).toBeNull();
    expect(nextState.folderHistory).toHaveLength(2);
    expect(nextState.folderHistory[1]).toEqual({
      id: 'folder-projects',
      name: 'Projects 2026'
    });
    expect(nextState.isLoading).toBe(true);
    expect(nextState.items).toEqual([]);
  });

  it('should clear active selection when ascending to parent folder via "..." (FR-9)', () => {
    const stateInSubfolder = {
      ...initialExplorerState,
      folderHistory: [
        { id: 'root', name: 'My Drive' },
        { id: 'folder-projects', name: 'Projects 2026' }
      ],
      items: [sampleFile],
      selectedItemId: sampleFile.id,
      isLoading: false
    };

    const nextState = explorerReducer(stateInSubfolder, {
      type: 'NAVIGATE_UP'
    });

    expect(nextState.selectedItemId).toBeNull();
    expect(nextState.folderHistory).toHaveLength(1);
    expect(nextState.folderHistory[0].id).toBe('root');
    expect(nextState.isLoading).toBe(true);
    expect(nextState.items).toEqual([]);
  });

  it('should perform a safe no-op when double-clicking a regular file or shortcut (FR-7, EC-5)', () => {
    const populatedState = {
      ...initialExplorerState,
      items: [sampleFolder, sampleFile, sampleShortcut],
      selectedItemId: sampleFile.id,
      isLoading: false
    };

    // Double-clicking a regular file does nothing
    const afterFileDoubleClick = explorerReducer(populatedState, {
      type: 'DOUBLE_CLICK_ITEM',
      payload: sampleFile
    });
    expect(afterFileDoubleClick).toEqual(populatedState);
    expect(afterFileDoubleClick.folderHistory).toHaveLength(1);
    expect(afterFileDoubleClick.selectedItemId).toBe(sampleFile.id);
    expect(afterFileDoubleClick.isLoading).toBe(false);

    // Double-clicking a shortcut does nothing (EC-5)
    const afterShortcutDoubleClick = explorerReducer(populatedState, {
      type: 'DOUBLE_CLICK_ITEM',
      payload: sampleShortcut
    });
    expect(afterShortcutDoubleClick).toEqual(populatedState);
    expect(afterShortcutDoubleClick.folderHistory).toHaveLength(1);
    expect(afterShortcutDoubleClick.isLoading).toBe(false);
  });

  it('should display the unified Google Drive file explorer for both Prydrive and Google Drive navigation rail buttons (FR-4)', () => {
    expect(resolveWorkspaceView('prydrive')).toBe('google-drive');
    expect(resolveWorkspaceView('google-drive')).toBe('google-drive');
  });
});
