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
      defaultDownloadPath: defaultPath
    };
  }

  getSettings(): DownloadSettings {
    if (!fs.existsSync(this.settingsFilePath)) {
      return this.getDefaultSettings();
    }

    try {
      const content = fs.readFileSync(this.settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content) as DownloadSettings;
      if (parsed.defaultDownloadPath && typeof parsed.defaultDownloadPath === 'string') {
        return parsed;
      }
    } catch {
      // Fallback on corrupt settings
    }

    return this.getDefaultSettings();
  }

  saveSettings(settings: DownloadSettings): void {
    const serialized = JSON.stringify(settings, null, 2);
    const tempPath = `${this.settingsFilePath}.tmp`;
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, this.settingsFilePath);
  }
}
