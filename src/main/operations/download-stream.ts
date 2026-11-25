import * as fs from 'fs';
import { Transform, type Readable } from 'stream';
import archiver from 'archiver';
import type { drive_v3 } from 'googleapis';

export interface FileDownloadOptions {
  drive: drive_v3.Drive;
  fileId: string;
  destinationPath: string;
  totalBytes?: number | null;
  exportMimeType?: string;
  onProgress?: (transferredBytes: number, resolvedTotalBytes?: number | null) => void;
  signal?: AbortSignal;
}

export interface FolderArchiveDownloadOptions {
  drive: drive_v3.Drive;
  folderId: string;
  folderName: string;
  destinationPath: string;
  onProgress?: (transferredBytes: number, resolvedTotalBytes?: number | null) => void;
  signal?: AbortSignal;
}

/**
 * Streams a binary file or Google Workspace export directly to local disk (FR-3, NFR-2, EC-2).
 */
export async function streamFileDownload(options: FileDownloadOptions): Promise<void> {
  const { drive, fileId, destinationPath, totalBytes, exportMimeType, onProgress, signal } = options;

  if (signal?.aborted) {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  // Handle 0-byte file (EC-2)
  if (totalBytes === 0) {
    fs.writeFileSync(destinationPath, Buffer.alloc(0));
    onProgress?.(0, 0);
    return;
  }

  let transferredBytes = 0;
  let readStream: NodeJS.ReadableStream;
  let resolvedTotalBytes: number | null = totalBytes ?? null;

  if (exportMimeType) {
    const res = await drive.files.export(
      { fileId, mimeType: exportMimeType },
      { responseType: 'stream' }
    );
    const contentLength = res.headers?.['content-length'];
    if (resolvedTotalBytes === null && contentLength) {
      const parsed = Number(contentLength);
      if (Number.isFinite(parsed) && parsed > 0) {
        resolvedTotalBytes = parsed;
      }
    }
    readStream = res.data as NodeJS.ReadableStream;
  } else {
    const res = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );
    const contentLength = res.headers?.['content-length'];
    if (resolvedTotalBytes === null && contentLength) {
      const parsed = Number(contentLength);
      if (Number.isFinite(parsed) && parsed > 0) {
        resolvedTotalBytes = parsed;
      }
    }
    readStream = res.data as NodeJS.ReadableStream;
  }

  if (signal?.aborted) {
    if ('destroy' in readStream && typeof readStream.destroy === 'function') {
      readStream.destroy();
    }
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  const writeStream = fs.createWriteStream(destinationPath);

  return new Promise<void>((resolve, reject) => {
    let completed = false;

    const cleanup = (): void => {
      completed = true;
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    const onAbort = (): void => {
      if (completed) return;
      cleanup();
      // Destroy active streams immediately and wait for write stream fd release before rejecting
      if ('destroy' in readStream && typeof readStream.destroy === 'function') {
        readStream.destroy();
      }
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      if (writeStream.closed || writeStream.destroyed) {
        reject(abortErr);
        return;
      }
      writeStream.once('close', () => reject(abortErr));
      writeStream.destroy();
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    readStream.on('data', (chunk: Buffer | string) => {
      if (completed) return;
      const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
      transferredBytes += chunkSize;
      onProgress?.(transferredBytes, resolvedTotalBytes);
    });

    readStream.on('error', (err: Error) => {
      if (completed) return;
      cleanup();
      writeStream.destroy();
      reject(err);
    });

    writeStream.on('error', (err: Error) => {
      if (completed) return;
      cleanup();
      reject(err);
    });

    writeStream.on('finish', () => {
      if (completed) return;
      cleanup();
      resolve();
    });

    readStream.pipe(writeStream);
  });
}

interface ArchiveManifestEntry {
  id: string;
  name: string;
  mimeType: string;
  relativePath: string;
  sizeBytes: number;
}

/**
 * Recursively fetches a Google Drive directory tree and streams it into a zip archive (FR-4, NFR-2, EC-5, EC-10).
 * Phase 1 indexes nested file metadata to compute totalKnownBytes for accurate live progress.
 * Phase 2 streams files sequentially through a byte-counting Transform into archiver with full backpressure.
 */
export async function streamFolderArchiveDownload(
  options: FolderArchiveDownloadOptions
): Promise<{ warnings?: string }> {
  const { drive, folderId, destinationPath, onProgress, signal } = options;

  const throwIfAborted = (): void => {
    if (signal?.aborted) {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
  };

  throwIfAborted();

  // Phase 1: Collect recursive file manifest and compute total expected bytes
  const manifest: ArchiveManifestEntry[] = [];

  async function collectManifest(parentId: string, currentRelPath: string): Promise<void> {
    let pageToken: string | null = null;
    do {
      throwIfAborted();

      const listRes: { data: drive_v3.Schema$FileList } = await drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, quotaBytesUsed)',
        pageSize: 100,
        pageToken: pageToken || undefined,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      const files = listRes.data.files || [];
      pageToken = listRes.data.nextPageToken || null;

      for (const file of files) {
        if (!file.id || !file.name) continue;

        const mimeType = file.mimeType || 'application/octet-stream';
        const isDir = mimeType === 'application/vnd.google-apps.folder';
        const itemRelPath = currentRelPath ? `${currentRelPath}/${file.name}` : file.name;

        if (isDir) {
          await collectManifest(file.id, itemRelPath);
        } else {
          const rawSize = file.size ?? file.quotaBytesUsed;
          const parsedSize = rawSize ? Number(rawSize) : 0;
          manifest.push({
            id: file.id,
            name: file.name,
            mimeType,
            relativePath: itemRelPath,
            sizeBytes: Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 0
          });
        }
      }
    } while (pageToken);
  }

  await collectManifest(folderId, '');
  throwIfAborted();

  let totalKnownBytes = manifest.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  let transferredBytes = 0;

  if (totalKnownBytes > 0) {
    onProgress?.(0, totalKnownBytes);
  } else if (manifest.length > 0) {
    // Fallback when folder contains only Workspace docs without reported byte sizes
    onProgress?.(0, manifest.length);
  }

  // Phase 2: Stream each file sequentially into archiver with backpressure-safe progress metering
  const archive = archiver('zip', {
    zlib: { level: 6 },
    forceZip64: totalKnownBytes > 3_500_000_000
  });
  const output = fs.createWriteStream(destinationPath);
  const warnings: string[] = [];
  let activeReadStream: Readable | null = null;

  archive.pipe(output);

  const abortPromise = new Promise<never>((_, reject) => {
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          if (activeReadStream && typeof activeReadStream.destroy === 'function') {
            activeReadStream.destroy();
          }
          archive.abort();
          output.destroy();
          const abortErr = new Error('The operation was aborted');
          abortErr.name = 'AbortError';
          reject(abortErr);
        },
        { once: true }
      );
    }
  });

  const streamEntriesPromise = (async (): Promise<void> => {
    let completedEntries = 0;

    for (const entry of manifest) {
      throwIfAborted();

      try {
        let sourceStream: Readable;
        let archiveEntryName = entry.relativePath;

        if (entry.mimeType.startsWith('application/vnd.google-apps.')) {
          const exportRes = await drive.files.export(
            { fileId: entry.id, mimeType: 'application/pdf' },
            { responseType: 'stream' }
          );
          archiveEntryName = entry.name.endsWith('.pdf')
            ? entry.relativePath
            : `${entry.relativePath}.pdf`;
          sourceStream = exportRes.data as unknown as Readable;
        } else {
          const fileRes = await drive.files.get(
            { fileId: entry.id, alt: 'media', supportsAllDrives: true },
            { responseType: 'stream' }
          );
          sourceStream = fileRes.data as unknown as Readable;
        }

        activeReadStream = sourceStream;

        await new Promise<void>((resolveEntry, rejectEntry) => {
          let settled = false;
          const finishEntry = (err?: Error): void => {
            if (settled) return;
            settled = true;
            activeReadStream = null;
            if (err) {
              rejectEntry(err);
            } else {
              resolveEntry();
            }
          };

          const meter = new Transform({
            transform(chunk: Buffer, _encoding, callback) {
              transferredBytes += chunk.length;
              if (totalKnownBytes > 0) {
                onProgress?.(transferredBytes, totalKnownBytes);
              }
              callback(null, chunk);
            }
          });

          sourceStream.on('error', (err: Error) => {
            meter.destroy();
            finishEntry(err);
          });

          meter.on('error', (err: Error) => {
            finishEntry(err);
          });

          meter.on('end', () => {
            finishEntry();
          });

          sourceStream.pipe(meter);
          archive.append(meter, { name: archiveEntryName });
        });

        completedEntries++;
        if (totalKnownBytes === 0 && manifest.length > 0) {
          onProgress?.(completedEntries, manifest.length);
        }
      } catch (fileErr) {
        if (signal?.aborted || (fileErr as Error).name === 'AbortError') {
          throw fileErr;
        }
        // Partial failure resilience (EC-10): log warning, adjust denominator, and skip file
        const msg = `[Skipped] ${entry.relativePath}: ${(fileErr as Error).message || 'Error fetching file'}`;
        warnings.push(msg);
        if (entry.sizeBytes > 0 && totalKnownBytes > entry.sizeBytes) {
          totalKnownBytes -= entry.sizeBytes;
          onProgress?.(transferredBytes, totalKnownBytes);
        }
      }
    }

    // Append warnings file if any individual file was skipped (EC-10)
    if (warnings.length > 0) {
      archive.append(warnings.join('\r\n'), { name: '_descarga_advertencias.txt' });
    }

    await archive.finalize();
  })();

  await Promise.race([
    Promise.all([
      streamEntriesPromise,
      new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        output.on('error', reject);
        archive.on('error', reject);
      })
    ]),
    abortPromise
  ]);

  return {
    warnings: warnings.length > 0 ? warnings.join('; ') : undefined
  };
}
