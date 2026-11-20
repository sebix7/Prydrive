import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Readable } from 'stream';
import type { drive_v3 } from 'googleapis';
import { streamFolderArchiveDownload } from '../../src/main/operations/download-stream';
import { DownloadQueueManager } from '../../src/main/core/download-queue-manager';
import { calculateTransferPercent } from '../../src/shared/download-helpers';
import type { DownloadTransferItem } from '../../src/shared/types';

describe('Folder Archive Streaming Progress & Resilience (Spec 012 US-2 / FR-4, EC-5, EC-10)', () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const filePath of tempFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    tempFiles.length = 0;
  });

  function createTempZipPath(name: string): string {
    const zipPath = path.join(os.tmpdir(), `prydrive-test-${Date.now()}-${Math.random().toString(36).slice(2)}-${name}.zip`);
    tempFiles.push(zipPath);
    return zipPath;
  }

  it('should emit incremental byte progress and exact summed totalBytes while zipping nested files (not 0% -> 100%)', async () => {
    const chunkA1 = Buffer.alloc(1000, 'a');
    const chunkA2 = Buffer.alloc(1000, 'b');
    const chunkB1 = Buffer.alloc(2000, 'c');

    const mockDrive = {
      files: {
        list: async ({ q }: { q: string }) => {
          if (q.includes("'root-folder'")) {
            return {
              data: {
                files: [
                  { id: 'file-1', name: 'part1.bin', mimeType: 'application/octet-stream', size: '2000' },
                  { id: 'sub-folder', name: 'nested', mimeType: 'application/vnd.google-apps.folder' }
                ],
                nextPageToken: null
              }
            };
          }
          return {
            data: {
              files: [
                { id: 'file-2', name: 'part2.bin', mimeType: 'application/octet-stream', size: '2000' }
              ],
              nextPageToken: null
            }
          };
        },
        get: async ({ fileId }: { fileId: string }) => {
          if (fileId === 'file-1') {
            return { data: Readable.from([chunkA1, chunkA2]) };
          }
          return { data: Readable.from([chunkB1]) };
        }
      }
    } as unknown as drive_v3.Drive;

    const progressSnapshots: Array<{ transferred: number; total: number | null | undefined; percent: number }> = [];
    const destinationPath = createTempZipPath('incremental');

    const result = await streamFolderArchiveDownload({
      drive: mockDrive,
      folderId: 'root-folder',
      folderName: 'incremental',
      destinationPath,
      onProgress: (transferred, total) => {
        progressSnapshots.push({
          transferred,
          total,
          percent: calculateTransferPercent(transferred, total ?? null)
        });
      }
    });

    expect(result.warnings).toBeUndefined();
    expect(fs.existsSync(destinationPath)).toBe(true);
    expect(fs.statSync(destinationPath).size).toBeGreaterThan(0);

    // Must report total summed size of 4000 bytes
    expect(progressSnapshots.some((s) => s.total === 4000)).toBe(true);
    // Must emit intermediate percentages strictly between 0 and 100 (e.g., 25%, 50%)
    const intermediatePercents = progressSnapshots
      .map((s) => s.percent)
      .filter((p) => p > 0 && p < 100);
    expect(intermediatePercents.length).toBeGreaterThanOrEqual(2);
    expect(intermediatePercents).toContain(25);
    expect(intermediatePercents).toContain(50);
  });

  it('should create a valid empty zip archive when downloading an empty folder (EC-5)', async () => {
    const mockDrive = {
      files: {
        list: async () => ({
          data: { files: [], nextPageToken: null }
        })
      }
    } as unknown as drive_v3.Drive;

    const destinationPath = createTempZipPath('empty');
    const result = await streamFolderArchiveDownload({
      drive: mockDrive,
      folderId: 'empty-folder',
      folderName: 'empty',
      destinationPath
    });

    expect(result.warnings).toBeUndefined();
    expect(fs.existsSync(destinationPath)).toBe(true);
    expect(fs.statSync(destinationPath).size).toBeGreaterThan(0);
  });

  it('should skip restricted files, record warnings, and complete the remaining archive (EC-10)', async () => {
    const mockDrive = {
      files: {
        list: async () => ({
          data: {
            files: [
              { id: 'ok-file', name: 'ok.txt', mimeType: 'text/plain', size: '500' },
              { id: 'denied-file', name: 'secret.txt', mimeType: 'text/plain', size: '500' }
            ],
            nextPageToken: null
          }
        }),
        get: async ({ fileId }: { fileId: string }) => {
          if (fileId === 'denied-file') {
            throw new Error('403 Permission denied');
          }
          return { data: Readable.from([Buffer.alloc(500, 'x')]) };
        }
      }
    } as unknown as drive_v3.Drive;

    const destinationPath = createTempZipPath('partial-warning');
    const result = await streamFolderArchiveDownload({
      drive: mockDrive,
      folderId: 'mixed-folder',
      folderName: 'mixed',
      destinationPath
    });

    expect(result.warnings).toContain('[Skipped] secret.txt');
    expect(result.warnings).toContain('403 Permission denied');
    expect(fs.existsSync(destinationPath)).toBe(true);
    expect(fs.statSync(destinationPath).size).toBeGreaterThan(0);
  });

  it('should emit intermediate progressPercent steps through DownloadQueueManager for a 4-file async folder download', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prydrive-qm-test-'));

    async function* asyncChunks(count: number, chunkSize: number): AsyncGenerator<Buffer> {
      for (let i = 0; i < count; i++) {
        await new Promise((r) => setTimeout(r, 5));
        yield Buffer.alloc(chunkSize, i + 1);
      }
    }

    const mockDrive = {
      files: {
        list: async () => ({
          data: {
            files: [
              { id: 'f1', name: 'vol1.cbz', mimeType: 'application/x-cbz', size: '40000' },
              { id: 'f2', name: 'vol2.cbz', mimeType: 'application/x-cbz', size: '40000' },
              { id: 'f3', name: 'vol3.cbz', mimeType: 'application/x-cbz', size: '40000' },
              { id: 'f4', name: 'vol4.cbz', mimeType: 'application/x-cbz', size: '40000' }
            ],
            nextPageToken: null
          }
        }),
        get: async () => ({
          data: Readable.from(asyncChunks(4, 10000))
        })
      }
    } as unknown as drive_v3.Drive;

    const fakeSettings = {
      getSettings: () => ({ defaultDownloadPath: tempDir })
    };
    const fakeTokenStorage = {
      loadSession: async () => ({ refreshToken: 'mock-rt', email: 'a@b.com', savedAt: Date.now() })
    };
    const fakeGoogleClient = {
      getDriveClient: () => mockDrive
    };

    const manager = new DownloadQueueManager(
      fakeSettings as never,
      fakeTokenStorage as never,
      fakeGoogleClient as never
    );

    const emitted: DownloadTransferItem[] = [];
    const donePromise = new Promise<void>((resolve) => {
      manager.onProgress((item) => {
        emitted.push(item);
        if (item.status === 'completed' || item.status === 'failed') {
          resolve();
        }
      });
    });

    manager.enqueue({
      driveItemId: 'persepolis-id',
      name: 'Persepolis',
      isDirectory: true,
      iconType: 'folder',
      totalBytes: null
    });

    await donePromise;

    const finalItem = emitted[emitted.length - 1];
    tempFiles.push(finalItem.destinationPath);

    expect(finalItem.status).toBe('completed');
    expect(finalItem.progressPercent).toBe(100);
    expect(finalItem.totalBytes).toBe(160000);

    const intermediatePercents = emitted
      .filter((e) => e.status === 'downloading')
      .map((e) => e.progressPercent)
      .filter((p) => p > 0 && p < 100);

    expect(intermediatePercents.length).toBeGreaterThanOrEqual(4);
    expect(intermediatePercents.some((p) => p >= 20 && p <= 35)).toBe(true);
    expect(intermediatePercents.some((p) => p >= 45 && p <= 60)).toBe(true);
    expect(intermediatePercents.some((p) => p >= 70 && p <= 85)).toBe(true);

    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });
});
