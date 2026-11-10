import 'dotenv/config';
import { existsSync } from 'fs';
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { AuthIpcController } from './ipc/auth-ipc';
import { StorageIpcController } from './ipc/storage-ipc';

let mainWindow: BrowserWindow | null = null;

function getAppIcon(): string | undefined {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  const devIcon = join(__dirname, '../../resources', iconName);
  if (existsSync(devIcon)) return devIcon;
  const prodIcon = join(process.resourcesPath, iconName);
  if (existsSync(prodIcon)) return prodIcon;
  const fallbackPng = join(__dirname, '../../resources/icon.png');
  if (existsSync(fallbackPng)) return fallbackPng;
  return undefined;
}

function createWindow(): void {
  const appIcon = getAppIcon();
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 720,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    ...(appIcon ? { icon: appIcon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Register IPC controllers
  const authController = new AuthIpcController();
  authController.register();

  const storageController = new StorageIpcController();
  storageController.register();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
