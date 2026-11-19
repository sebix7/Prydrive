import * as fs from 'fs';
import * as path from 'path';
import type { Readable } from 'stream';
import archiver from 'archiver';
import type { drive_v3 } from 'googleapis';

export interface FileDownloadOptions {
  drive: drive_v3.Drive;
  fileId: string;
  destinationPath: string;
  totalBytes?: number | null;
  exportMimeType?: string;
  onProgress?: (transferredBytes: number) => void;
  signal?: AbortSignal;
}

export interface FolderArchiveDownloadOptions {
  drive: drive_v3.Drive;
  folderId: string;
  folderName: string;
  destinationPath: string;
  onProgress?: (transferredBytes: number) => void;
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
    onProgress?.(0);
    return;
  }

  const writeStream = fs.createWriteStream(destinationPath);
  let transferredBytes = 0;

  let readStream: NodeJS.ReadableStream;

  if (exportMimeType) {
    const res = await drive.files.export(
      { fileId, mimeType: exportMimeType },
      { responseType: 'stream' }
    );
    readStream = res.data as NodeJS.ReadableStream;
  } else {
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    readStream = res.data as NodeJS.ReadableStream;
  }

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
      // Destroy active streams immediately
      if ('destroy' in readStream && typeof readStream.destroy === 'function') {
        readStream.destroy();
      }
      writeStream.destroy();
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      reject(abortErr);
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    readStream.on('data', (chunk: Buffer | string) => {
      if (completed) return;
      const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
      transferredBytes += chunkSize;
      onProgress?.(transferredBytes);
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

/**
 * Recursively fetches a Google Drive directory tree and streams it into a zip archive (FR-4, NFR-2, EC-5, EC-10).
 */
export async function streamFolderArchiveDownload(
  options: FolderArchiveDownloadOptions
): Promise<{ warnings?: string }> {
  const { drive, folderId, destinationPath, onProgress, signal } = options;

  if (signal?.aborted) {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  const archive = archiver('zip', {
    zlib: { level: 6 }
  });
  const output = fs.createWriteStream(destinationPath);
  const warnings: string[] = [];

  archive.pipe(output);

  archive.on('progress', (progressData: archiver.ProgressData) => {
    onProgress?.(progressData.fs.processedBytes);
  });

  const abortPromise = new Promise<never>((_, reject) => {
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
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

  const traversePromise = (async (): Promise<void> => {
    async function traverse(parentId: string, currentRelPath: string): Promise<void> {
      let pageToken: string | null = null;
      do {
        if (signal?.aborted) {
          const abortErr = new Error('The operation was aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }

        const listRes: { data: drive_v3.Schema$FileList } = await drive.files.list({
          q: `'${parentId}' in parents and trashed = false`,
          fields: 'nextPageToken, files(id, name, mimeType, size)',
          pageSize: 100,
          pageToken: pageToken || undefined,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        const files = listRes.data.files || [];
        pageToken = listRes.data.nextPageToken || null;

        for (const file of files) {
          if (!file.id || !file.name) continue;

          const isDir = file.mimeType === 'application/vnd.google-apps.folder';
          const itemRelPath = currentRelPath ? `${currentRelPath}/${file.name}` : file.name;

          if (isDir) {
            await traverse(file.id, itemRelPath);
          } else {
            try {
              if (file.mimeType && file.mimeType.startsWith('application/vnd.google-apps.')) {
                // Workspace doc inside folder: export as pdf
                const exportRes = await drive.files.export(
                  { fileId: file.id, mimeType: 'application/pdf' },
                  { responseType: 'stream' }
                );
                const pdfName = file.name.endsWith('.pdf') ? itemRelPath : `${itemRelPath}.pdf`;
                archive.append(exportRes.data as unknown as Readable, { name: pdfName });
              } else {
                const fileRes = await drive.files.get(
                  { fileId: file.id, alt: 'media' },
                  { responseType: 'stream' }
                );
                archive.append(fileRes.data as unknown as Readable, { name: itemRelPath });
              }
            } catch (fileErr) {
              // Partial failure resilience (EC-10): log warning and skip file
              const msg = `[Skipped] ${itemRelPath}: ${(fileErr as Error).message || 'Error fetching file'}`;
              warnings.push(msg);
            }
          }
        }
      } while (pageToken);
    }

    await traverse(folderId, '');

    // Append warnings file if any individual file was skipped (EC-10)
    if (warnings.length > 0) {
      archive.append(warnings.join('\r\n'), { name: '_descarga_advertencias.txt' });
    }

    await archive.finalize();
  })();

  await Promise.race([
    Promise.all([
      traversePromise,
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
