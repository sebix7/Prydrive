import { ipcMain, shell, dialog, type BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type {
  IpcResult,
  DownloadStartParams,
  DownloadTransferItem,
  DownloadSettings
} from '../../shared/types';
import { DownloadQueueManager } from '../core/download-queue-manager';
import { DownloadSettingsStorage } from '../core/download-settings-storage';

export class DownloadIpcController {
  private readonly queueManager: DownloadQueueManager;
  private readonly settingsStorage: DownloadSettingsStorage;
  private mainWindow: BrowserWindow | null = null;
  private unsubscribeProgress: (() => void) | null = null;

  constructor(
    queueManager?: DownloadQueueManager,
    settingsStorage?: DownloadSettingsStorage
  ) {
    this.queueManager = queueManager || new DownloadQueueManager();
    this.settingsStorage = settingsStorage || new DownloadSettingsStorage();
  }

  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window;
  }

  register(): void {
    // Forward queue progress events to the Renderer window
    if (!this.unsubscribeProgress) {
      this.unsubscribeProgress = this.queueManager.onProgress((item: DownloadTransferItem) => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send(IPC_CHANNELS.DOWNLOAD_PROGRESS_EVENT, item);
        }
      });
    }

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_START,
      async (
        _event,
        params: DownloadStartParams
      ): Promise<IpcResult<DownloadTransferItem>> => {
        try {
          const item = this.queueManager.enqueue(params);
          return {
            success: true,
            data: item
          };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'DOWNLOAD_ENQUEUE_FAILED',
              message: (err as Error).message || 'Failed to enqueue download'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_CANCEL,
      async (_event, transferId: string): Promise<IpcResult<void>> => {
        try {
          this.queueManager.cancel(transferId);
          return { success: true };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'DOWNLOAD_CANCEL_FAILED',
              message: (err as Error).message || 'Failed to cancel download'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_RETRY,
      async (_event, transferId: string): Promise<IpcResult<void>> => {
        try {
          this.queueManager.retry(transferId);
          return { success: true };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'DOWNLOAD_RETRY_FAILED',
              message: (err as Error).message || 'Failed to retry download'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_OPEN_FOLDER,
      async (_event, filePath: string): Promise<IpcResult<void>> => {
        try {
          shell.showItemInFolder(filePath);
          return { success: true };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'OPEN_FOLDER_FAILED',
              message: (err as Error).message || 'Failed to open containing folder'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_GET_SETTINGS,
      async (): Promise<IpcResult<DownloadSettings>> => {
        try {
          const settings = this.settingsStorage.getSettings();
          return {
            success: true,
            data: settings
          };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'GET_SETTINGS_FAILED',
              message: (err as Error).message || 'Failed to read download settings'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_SET_SETTINGS,
      async (_event, settings: DownloadSettings): Promise<IpcResult<void>> => {
        try {
          this.settingsStorage.saveSettings(settings);
          return { success: true };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'SAVE_SETTINGS_FAILED',
              message: (err as Error).message || 'Failed to save download settings'
            }
          };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DOWNLOAD_SELECT_DIRECTORY,
      async (): Promise<IpcResult<string | null>> => {
        try {
          const result = await dialog.showOpenDialog(this.mainWindow!, {
            properties: ['openDirectory', 'createDirectory']
          });

          if (result.canceled || result.filePaths.length === 0) {
            return {
              success: true,
              data: null
            };
          }

          return {
            success: true,
            data: result.filePaths[0]
          };
        } catch (err) {
          return {
            success: false,
            error: {
              code: 'SELECT_DIRECTORY_FAILED',
              message: (err as Error).message || 'Failed to open directory picker'
            }
          };
        }
      }
    );
  }
}
