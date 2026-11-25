import * as fs from 'fs';
import * as path from 'path';
import type {
  DownloadTransferItem,
  DownloadStartParams
} from '../../shared/types';
import {
  calculateTransferPercent,
  resolveNextAvailableFilename,
  resolveExportExtension,
  findExistingQueuedTransfer
} from '../../shared/download-helpers';
import { DownloadSettingsStorage } from './download-settings-storage';
import { TokenStorage } from './token-storage';
import { GoogleAuthClient } from './google-client';
import {
  streamFileDownload,
  streamFolderArchiveDownload
} from '../operations/download-stream';

export class DownloadQueueManager {
  private queue: DownloadTransferItem[] = [];
  private activeTransfer: DownloadTransferItem | null = null;
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly listeners: Array<(item: DownloadTransferItem) => void> = [];

  private readonly settingsStorage: DownloadSettingsStorage;
  private readonly tokenStorage: TokenStorage;
  private readonly googleClient: GoogleAuthClient;

  constructor(
    settingsStorage?: DownloadSettingsStorage,
    tokenStorage?: TokenStorage,
    googleClient?: GoogleAuthClient
  ) {
    this.settingsStorage = settingsStorage || new DownloadSettingsStorage();
    this.tokenStorage = tokenStorage || new TokenStorage();
    this.googleClient = googleClient || new GoogleAuthClient();
  }

  onProgress(listener: (item: DownloadTransferItem) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }

  private emitProgress(item: DownloadTransferItem): void {
    const snapshot = { ...item };
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
        // Suppress listener errors
      }
    }
  }

  getQueue(): DownloadTransferItem[] {
    return [...this.queue];
  }

  enqueue(params: DownloadStartParams): DownloadTransferItem {
    // Omit duplicate requests for items already waiting in queued status (FR-14.1, FR-14.2)
    const existingQueued = findExistingQueuedTransfer(
      this.queue,
      params.driveItemId,
      params.exportMimeType
    );
    if (existingQueued) {
      return existingQueued;
    }

    const settings = this.settingsStorage.getSettings();
    const destDir = settings.defaultDownloadPath;

    try {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
    } catch {
      // Ignore if directory creation cannot be completed here; will fail during write stream
    }

    let desiredFilename = params.name;
    if (params.isDirectory) {
      desiredFilename = `${params.name}.zip`;
    } else if (params.exportMimeType) {
      const ext = resolveExportExtension(params.exportMimeType);
      if (!desiredFilename.toLowerCase().endsWith(ext)) {
        desiredFilename = `${params.name}${ext}`;
      }
    }

    let existingFiles: string[] = [];
    try {
      existingFiles = fs.readdirSync(destDir);
    } catch {
      existingFiles = [];
    }

    // Include filenames reserved by in-flight transfers targeting the same directory so active downloads are never overwritten (FR-14.3)
    const normalizedDestDir = path.resolve(destDir);
    const reservedInFlightNames = this.queue
      .filter(
        (entry) =>
          (entry.status === 'downloading' || entry.status === 'queued') &&
          path.resolve(path.dirname(entry.destinationPath)) === normalizedDestDir
      )
      .map((entry) => path.basename(entry.destinationPath));

    const finalFilename = resolveNextAvailableFilename(
      [...existingFiles, ...reservedInFlightNames],
      desiredFilename
    );
    const destinationPath = path.join(destDir, finalFilename);

    const item: DownloadTransferItem = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      driveItemId: params.driveItemId,
      name: finalFilename,
      isDirectory: params.isDirectory,
      iconType: params.iconType,
      status: 'queued',
      transferredBytes: 0,
      totalBytes: params.totalBytes ?? null,
      progressPercent: 0,
      destinationPath,
      exportMimeType: params.exportMimeType
    };

    this.queue.push(item);
    this.emitProgress(item);

    // Trigger queue processing asynchronously
    void this.processQueue();

    return item;
  }

  async processQueue(): Promise<void> {
    if (this.activeTransfer !== null) {
      // Strictly sequential: 1 download at a time (FR-3.3)
      return;
    }

    const nextItem = this.queue.find((item) => item.status === 'queued');
    if (!nextItem) {
      return;
    }

    this.activeTransfer = nextItem;
    nextItem.status = 'downloading';
    nextItem.startedAt = Date.now();
    this.emitProgress(nextItem);

    const controller = new AbortController();
    this.abortControllers.set(nextItem.id, controller);

    try {
      const session = await this.tokenStorage.loadSession();
      if (!session) {
        throw new Error('No active session found.');
      }

      const drive = this.googleClient.getDriveClient(session.refreshToken);

      let lastEmitAt = 0;
      let lastEmittedPercent = -1;

      const onProgress = (transferred: number, resolvedTotalBytes?: number | null): void => {
        if (resolvedTotalBytes !== undefined && resolvedTotalBytes !== null) {
          nextItem.totalBytes = resolvedTotalBytes;
        }
        nextItem.transferredBytes = transferred;
        const computedPercent = calculateTransferPercent(transferred, nextItem.totalBytes);
        // Keep active progress capped at 99% until stream & disk flush completely finalize
        const livePercent =
          nextItem.totalBytes && nextItem.totalBytes > 0
            ? Math.min(99, computedPercent)
            : computedPercent;
        nextItem.progressPercent = livePercent;

        const now = Date.now();
        if (livePercent !== lastEmittedPercent || now - lastEmitAt >= 150) {
          lastEmittedPercent = livePercent;
          lastEmitAt = now;
          this.emitProgress(nextItem);
        }
      };

      if (nextItem.isDirectory) {
        const result = await streamFolderArchiveDownload({
          drive,
          folderId: nextItem.driveItemId,
          folderName: nextItem.name,
          destinationPath: nextItem.destinationPath,
          onProgress,
          signal: controller.signal
        });
        if (result.warnings) {
          nextItem.warning = result.warnings;
        }
      } else {
        await streamFileDownload({
          drive,
          fileId: nextItem.driveItemId,
          destinationPath: nextItem.destinationPath,
          totalBytes: nextItem.totalBytes,
          exportMimeType: nextItem.exportMimeType,
          onProgress,
          signal: controller.signal
        });
      }

      nextItem.status = 'completed';
      nextItem.progressPercent = 100;
      nextItem.completedAt = Date.now();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        nextItem.status = 'cancelled';
        try {
          if (fs.existsSync(nextItem.destinationPath)) {
            fs.unlinkSync(nextItem.destinationPath);
          }
        } catch {
          // Ignore partial file cleanup failures
        }
      } else {
        console.error('[DownloadQueueManager] Download failed:', (err as Error).message || err);
        nextItem.status = 'failed';
        nextItem.error = (err as Error).message || 'Download failed';
        try {
          if (fs.existsSync(nextItem.destinationPath)) {
            fs.unlinkSync(nextItem.destinationPath);
          }
        } catch {
          // Ignore partial file cleanup failures
        }
      }
    } finally {
      this.abortControllers.delete(nextItem.id);
      if (this.queue.includes(nextItem)) {
        this.emitProgress(nextItem);
      }
      if (this.activeTransfer === nextItem) {
        this.activeTransfer = null;
      }
      // Continue next queued item in FIFO order
      void this.processQueue();
    }
  }

  cancel(transferId: string): void {
    const item = this.queue.find((i) => i.id === transferId);
    if (!item) return;

    if (item.status === 'downloading') {
      const controller = this.abortControllers.get(transferId);
      if (controller) {
        controller.abort();
      }
      try {
        if (fs.existsSync(item.destinationPath)) {
          fs.unlinkSync(item.destinationPath);
        }
      } catch {
        // Ignore partial file unlink failures
      }
      item.status = 'cancelled';
      this.emitProgress(item);
    } else if (item.status === 'queued') {
      item.status = 'cancelled';
      this.emitProgress(item);
    }
  }

  retry(transferId: string): void {
    const item = this.queue.find((i) => i.id === transferId);
    if (!item) return;

    if (item.status === 'failed' || item.status === 'cancelled') {
      item.status = 'queued';
      item.error = undefined;
      item.warning = undefined;
      item.transferredBytes = 0;
      item.progressPercent = 0;
      this.emitProgress(item);
      void this.processQueue();
    }
  }

  clearCompleted(): void {
    this.queue = this.queue.filter(
      (item) => item.status === 'downloading' || item.status === 'queued'
    );
  }

  /**
   * Immediately aborts any active transfer, removes partial files, cancels queued items,
   * and empties the in-memory queue (e.g. on account disconnect) (FR-15, EC-18, EC-19, EC-20).
   */
  cancelAllAndClear(): void {
    for (const item of this.queue) {
      if (item.status === 'downloading') {
        const controller = this.abortControllers.get(item.id);
        if (controller) {
          controller.abort();
        }
        item.status = 'cancelled';
        try {
          if (fs.existsSync(item.destinationPath)) {
            fs.unlinkSync(item.destinationPath);
          }
        } catch {
          // File descriptor may still be closing; processQueue catch block cleans up after close
        }
      } else if (item.status === 'queued') {
        item.status = 'cancelled';
      }
    }
    this.abortControllers.clear();
    this.activeTransfer = null;
    this.queue = [];
  }
}
