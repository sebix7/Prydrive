import type {
  StorageItem,
  StorageItemType,
  FolderCrumb,
  FolderMetrics,
  LanguageCode,
  ThemeMode
} from './types';

export const INITIAL_FOLDER_HISTORY: FolderCrumb[] = [
  { id: 'root', name: 'My Drive' }
];

export interface ExplorerState {
  folderHistory: FolderCrumb[];
  items: StorageItem[];
  selectedItemId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  nextPageToken: string | null;
  errorMessage: string | null;
  refreshCounter: number;
}

export type ExplorerAction =
  | { type: 'SELECT_ITEM'; payload: string | null }
  | { type: 'DOUBLE_CLICK_ITEM'; payload: StorageItem }
  | { type: 'NAVIGATE_UP' }
  | { type: 'REFRESH_DIRECTORY' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | {
      type: 'SET_DIRECTORY_DATA';
      payload: { items: StorageItem[]; nextPageToken?: string | null };
    }
  | {
      type: 'APPEND_DIRECTORY_PAGE';
      payload: { items: StorageItem[]; nextPageToken?: string | null };
    }
  | { type: 'SET_DIRECTORY_ERROR'; payload: string };

export const initialExplorerState: ExplorerState = {
  folderHistory: INITIAL_FOLDER_HISTORY,
  items: [],
  selectedItemId: null,
  isLoading: true,
  isLoadingMore: false,
  nextPageToken: null,
  errorMessage: null,
  refreshCounter: 0
};

/**
 * Pure reducer governing explorer selection, folder navigation stack, pagination, error handling, manual refresh, and no-op file double-clicks.
 */
export function explorerReducer(
  state: ExplorerState,
  action: ExplorerAction
): ExplorerState {
  switch (action.type) {
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItemId: action.payload
      };
    case 'DOUBLE_CLICK_ITEM': {
      const item = action.payload;
      if (!item.isDirectory || item.isShortcut) {
        return state;
      }
      return {
        ...state,
        selectedItemId: null,
        isLoading: true,
        isLoadingMore: false,
        nextPageToken: null,
        errorMessage: null,
        items: [],
        folderHistory: pushFolderHistory(state.folderHistory, {
          id: item.id,
          name: item.name
        })
      };
    }
    case 'NAVIGATE_UP': {
      if (isAtRootDirectory(state.folderHistory)) {
        return state;
      }
      return {
        ...state,
        selectedItemId: null,
        isLoading: true,
        isLoadingMore: false,
        nextPageToken: null,
        errorMessage: null,
        items: [],
        folderHistory: popFolderHistory(state.folderHistory)
      };
    }
    case 'REFRESH_DIRECTORY':
      return {
        ...state,
        selectedItemId: null,
        isLoading: true,
        isLoadingMore: false,
        nextPageToken: null,
        errorMessage: null,
        items: [],
        refreshCounter: (state.refreshCounter ?? 0) + 1
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_LOADING_MORE':
      return {
        ...state,
        isLoadingMore: action.payload
      };
    case 'SET_DIRECTORY_DATA':
      return {
        ...state,
        items: action.payload.items,
        nextPageToken: action.payload.nextPageToken ?? null,
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null
      };
    case 'APPEND_DIRECTORY_PAGE': {
      const existingIds = new Set(state.items.map((item) => item.id));
      const newUniqueItems = action.payload.items.filter(
        (item) => !existingIds.has(item.id)
      );
      const mergedSorted = sortStorageItems([...state.items, ...newUniqueItems]);
      return {
        ...state,
        items: mergedSorted,
        nextPageToken: action.payload.nextPageToken ?? null,
        isLoadingMore: false,
        errorMessage: null
      };
    }
    case 'SET_DIRECTORY_ERROR':
      return {
        ...state,
        errorMessage: action.payload,
        isLoading: false,
        isLoadingMore: false
      };
    default:
      return state;
  }
}

/**
 * Pure helper to determine whether scrolling near the bottom should trigger next page fetch (FR-16).
 */
export function shouldTriggerScrollPagination(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  nextPageToken: string | null,
  isLoading: boolean,
  isLoadingMore: boolean
): boolean {
  if (!nextPageToken || isLoading || isLoadingMore) {
    return false;
  }
  return scrollHeight - scrollTop <= clientHeight + 50;
}

/**
 * Resolves Swiss Archive row classes for selected and unselected states across Light and Dark modes (Spec 006 FR-12, FR-13, EC-4).
 * Selected rows receive the selected surface ('bg-[#DDE7FA]' / 'bg-[#1C2D52]'), Klein Blue text ('text-[#1B44E8]' / 'text-[#3B66FF]'),
 * and a 3px left Klein Blue indicator bar. Unselected rows use primary ink with hover surfaces and transparent 3px left border.
 */
export function getRowSelectionClasses(
  isSelected: boolean,
  theme: ThemeMode = 'dark'
): string {
  if (theme === 'light') {
    return isSelected
      ? 'bg-[#DDE7FA] text-[#1B44E8] border-l-[3px] border-l-[#1B44E8] border-[#1B44E8]'
      : 'text-[#111315] hover:bg-[#ECEAE3] border-l-[3px] border-l-transparent border-transparent';
  }
  return isSelected
    ? 'bg-[#1C2D52] text-[#3B66FF] border-l-[3px] border-l-[#3B66FF] border-[#3B66FF]'
    : 'text-[#F3F4F6] hover:bg-[#1E232C] border-l-[3px] border-l-transparent border-transparent';
}

/**
 * Returns true if the navigation stack is currently at the root directory ("My Drive") (FR-10).
 */
export function isAtRootDirectory(stack: FolderCrumb[]): boolean {
  if (!stack || stack.length <= 1) {
    return true;
  }
  return stack[stack.length - 1].id === 'root';
}

/**
 * Returns the active folder at the top of the navigation stack.
 */
export function getCurrentFolder(stack: FolderCrumb[]): FolderCrumb {
  if (!stack || stack.length === 0) {
    return { id: 'root', name: 'My Drive' };
  }
  return stack[stack.length - 1];
}

/**
 * Pushes a subfolder onto the navigation history stack (FR-6, EC-4).
 */
export function pushFolderHistory(
  stack: FolderCrumb[],
  folder: FolderCrumb
): FolderCrumb[] {
  const baseStack = stack && stack.length > 0 ? stack : INITIAL_FOLDER_HISTORY;
  return [...baseStack, { id: folder.id, name: folder.name }];
}

/**
 * Pops the top folder off the navigation stack to ascend one level (FR-9, FR-10, EC-4).
 * Never pops below the root directory.
 */
export function popFolderHistory(stack: FolderCrumb[]): FolderCrumb[] {
  if (!stack || stack.length <= 1) {
    return INITIAL_FOLDER_HISTORY;
  }
  return stack.slice(0, stack.length - 1);
}


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
 * Calculates real folder count, file count, and aggregate file size for the bottom status bar.
 * Strictly excludes any virtual parent navigation entry ('...') from counts (FR-12).
 */
export function calculateFolderMetrics(items: StorageItem[]): FolderMetrics {
  let folderCount = 0;
  let fileCount = 0;
  let totalSizeBytes = 0;

  for (const item of items) {
    if (item.name === '...' || item.id === '__parent__') {
      continue;
    }
    if (item.isDirectory) {
      folderCount += 1;
    } else {
      fileCount += 1;
      if (item.sizeBytes !== null && item.sizeBytes > 0) {
        totalSizeBytes += item.sizeBytes;
      }
    }
  }

  return {
    folderCount,
    fileCount,
    totalSizeBytes,
    formattedTotalSize: formatItemSize(totalSizeBytes)
  };
}

/**
 * Formats folder and file breakdown counts for the status bar (FR-12).
 */
export function formatStatusCounts(
  metrics: FolderMetrics,
  language: LanguageCode = 'en'
): string {
  const { folderCount, fileCount } = metrics;
  if (language === 'es') {
    const folderLabel = folderCount === 1 ? '1 carpeta' : `${folderCount} carpetas`;
    const fileLabel = fileCount === 1 ? '1 archivo' : `${fileCount} archivos`;
    return `${folderLabel}, ${fileLabel}`;
  }
  const folderLabel = folderCount === 1 ? '1 folder' : `${folderCount} folders`;
  const fileLabel = fileCount === 1 ? '1 file' : `${fileCount} files`;
  return `${folderLabel}, ${fileLabel}`;
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
