import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { DownloadSettings } from '../../shared/types';

export class DownloadSettingsStorage {
  private readonly settingsFilePath: string;

  constructor(customDirectory?: string) {
    const baseDir = customDirectory || app.getPath('userData');
    this.settingsFilePath = path.join(baseDir, 'download-settings.json');
  }

  getDefaultSettings(): DownloadSettings {
    let defaultPath = '';
    try {
      defaultPath = app.getPath('downloads');
    } catch {
      defaultPath = process.env.USERPROFILE
        ? path.join(process.env.USERPROFILE, 'Downloads')
        : process.cwd();
    }
    return {
      defaultDownloadPath: defaultPath,
      systemDefaultDownloadPath: defaultPath
    };
  }

  getSettings(): DownloadSettings {
    const defaults = this.getDefaultSettings();
    if (!fs.existsSync(this.settingsFilePath)) {
      return defaults;
    }

    try {
      const content = fs.readFileSync(this.settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content) as DownloadSettings;
      if (parsed.defaultDownloadPath && typeof parsed.defaultDownloadPath === 'string') {
        return {
          defaultDownloadPath: parsed.defaultDownloadPath,
          systemDefaultDownloadPath: defaults.systemDefaultDownloadPath
        };
      }
    } catch {
      // Fallback on corrupt settings
    }

    return defaults;
  }

  saveSettings(settings: DownloadSettings): void {
    const defaults = this.getDefaultSettings();
    const targetPath =
      settings.defaultDownloadPath && settings.defaultDownloadPath.trim().length > 0
        ? settings.defaultDownloadPath.trim()
        : defaults.defaultDownloadPath;

    const payload: DownloadSettings = {
      defaultDownloadPath: targetPath
    };
    const serialized = JSON.stringify(payload, null, 2);
    const tempPath = `${this.settingsFilePath}.tmp`;
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, this.settingsFilePath);
  }
}
