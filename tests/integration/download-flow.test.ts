import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTranslation } from '../../src/shared/i18n/translations';

describe('Download Action Button & Row Clearance Flow (Spec 012 US-1 / T1 / FR-1, FR-2, FR-3.1, FR-11, EC-1)', () => {
  const fileRowSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/FileTableRow.tsx'),
    'utf-8'
  );
  const parentRowSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/ParentNavRow.tsx'),
    'utf-8'
  );
  const explorerSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/explorer/FileExplorer.tsx'),
    'utf-8'
  );

  describe('Download Action Button DOM & Swiss Archive Geometry (FR-1, FR-2, NFR-1)', () => {
    it('should render a 26px x 26px geometric button with 4px border radius and Download icon (FR-1)', () => {
      expect(fileRowSource).toContain('data-testid="item-download-btn"');
      expect(fileRowSource).toContain('w-[26px]');
      expect(fileRowSource).toContain('h-[26px]');
      expect(fileRowSource).toContain('rounded-[4px]');
      expect(fileRowSource).toContain('Download');
      expect(fileRowSource).toContain('w-3.5 h-3.5');
      expect(fileRowSource).toContain('gap-1.5');
      expect(fileRowSource).toContain('pr-16');
    });

    it('should apply Swiss Archive structural borders, elevated surfaces, and Klein Blue hover transitions (FR-1, FR-2, NFR-1)', () => {
      expect(fileRowSource).toContain('border-[#C9C6BD]');
      expect(fileRowSource).toContain('dark:border-[#2C323D]');
      expect(fileRowSource).toContain('bg-[#FFFFFF]');
      expect(fileRowSource).toContain('dark:bg-[#181C23]');
      expect(fileRowSource).toContain('hover:border-[#1B44E8]');
      expect(fileRowSource).toContain('dark:hover:border-[#3B66FF]');
      expect(fileRowSource).toContain('hover:bg-[#ECEAE3]');
      expect(fileRowSource).toContain('dark:hover:bg-[#1E232C]');
      expect(fileRowSource).toContain('text-[#7C8087]');
      expect(fileRowSource).toContain('dark:text-[#6B7280]');
      expect(fileRowSource).toContain('hover:text-[#1B44E8]');
      expect(fileRowSource).toContain('dark:hover:text-[#3B66FF]');
    });
  });

  describe('Bilingual Native Tooltip & Accessibility Attributes (FR-2, FR-12, NFR-3)', () => {
    it('should retrieve localized tooltip strings in English and Spanish (FR-12)', () => {
      expect(getTranslation('en', 'download_tooltip')).toBe('Download');
      expect(getTranslation('es', 'download_tooltip')).toBe('Descargar');
    });

    it('should bind native title, aria-label, and keyboard focusability tabIndex={0} (FR-2, NFR-3)', () => {
      expect(fileRowSource).toContain("title={getTranslation(language, 'download_tooltip')}");
      expect(fileRowSource).toContain("aria-label={getTranslation(language, 'download_tooltip')}");
      expect(fileRowSource).toContain('tabIndex={0}');
      expect(fileRowSource).toContain('type="button"');
    });
  });

  describe('Event Propagation & Selection Decoupling (FR-3.1, EC-1)', () => {
    it('should stop event propagation on click and delegate to onDownload (FR-3.1)', () => {
      expect(fileRowSource).toContain('e.stopPropagation()');
      expect(fileRowSource).toContain('onDownload?.(item, e.currentTarget)');
    });

    it('should stop event propagation on double-click preventing navigation or selection reset (EC-1)', () => {
      expect(fileRowSource).toContain('onDoubleClick={(e) => {');
      expect(fileRowSource).toContain('e.stopPropagation();');
    });

    it('should activate via Enter and Space keydown stopping propagation and preventing scroll (FR-3.1, EC-1)', () => {
      expect(fileRowSource).toContain("e.key === 'Enter' || e.key === ' '");
      expect(fileRowSource).toContain('e.preventDefault()');
      expect(fileRowSource).toContain('onDownload?.(item, e.currentTarget)');
    });
  });

  describe('Parent Navigation Row Exclusion (FR-11)', () => {
    it('should ensure virtual parent row ("...") never renders any download action button', () => {
      expect(parentRowSource).not.toContain('item-download-btn');
      expect(parentRowSource).not.toContain('download_tooltip');
    });
  });

  describe('FileExplorer Wiring (US-1)', () => {
    it('should pass onDownload handler down to FileTableRow', () => {
      expect(explorerSource).toContain('onDownload=');
    });

    it('should apply pr-16 clearance to table header and parent nav row', () => {
      expect(explorerSource).toContain('pr-16');
      expect(parentRowSource).toContain('pr-16');
    });
  });

  describe('Main Process Sequential Streaming Pipeline & Queue Manager (Spec 012 US-2 / T2 / FR-3.2, FR-3.3, FR-3.4, FR-4, NFR-2, NFR-3, EC-2, EC-5, EC-6, EC-10)', () => {
    const queueManagerSource = (() => {
      try {
        return readFileSync(resolve(__dirname, '../../src/main/core/download-queue-manager.ts'), 'utf-8');
      } catch {
        return '';
      }
    })();
    const streamSource = (() => {
      try {
        return readFileSync(resolve(__dirname, '../../src/main/operations/download-stream.ts'), 'utf-8');
      } catch {
        return '';
      }
    })();
    const ipcSource = (() => {
      try {
        return readFileSync(resolve(__dirname, '../../src/main/ipc/download-ipc.ts'), 'utf-8');
      } catch {
        return '';
      }
    })();
    const preloadSource = readFileSync(
      resolve(__dirname, '../../src/preload/index.ts'),
      'utf-8'
    );
    const preloadDtsSource = readFileSync(
      resolve(__dirname, '../../src/preload/index.d.ts'),
      'utf-8'
    );
    const ipcChannelsSource = readFileSync(
      resolve(__dirname, '../../src/shared/ipc-channels.ts'),
      'utf-8'
    );

    it('should define strongly typed download IPC channels in ipc-channels.ts', () => {
      expect(ipcChannelsSource).toContain('DOWNLOAD_START');
      expect(ipcChannelsSource).toContain('DOWNLOAD_CANCEL');
      expect(ipcChannelsSource).toContain('DOWNLOAD_RETRY');
      expect(ipcChannelsSource).toContain('DOWNLOAD_OPEN_FOLDER');
      expect(ipcChannelsSource).toContain('DOWNLOAD_GET_SETTINGS');
      expect(ipcChannelsSource).toContain('DOWNLOAD_SET_SETTINGS');
      expect(ipcChannelsSource).toContain('DOWNLOAD_SELECT_DIRECTORY');
      expect(ipcChannelsSource).toContain('DOWNLOAD_PROGRESS_EVENT');
    });

    it('should expose typed window.api.download bridge in preload', () => {
      expect(preloadSource).toContain('download:');
      expect(preloadSource).toContain('startDownload:');
      expect(preloadSource).toContain('cancelDownload:');
      expect(preloadSource).toContain('retryDownload:');
      expect(preloadSource).toContain('openContainingFolder:');
      expect(preloadSource).toContain('getSettings:');
      expect(preloadSource).toContain('setSettings:');
      expect(preloadSource).toContain('selectDownloadDirectory:');
      expect(preloadSource).toContain('onProgress:');

      expect(preloadDtsSource).toContain('download: {');
      expect(preloadDtsSource).toContain('startDownload:');
      expect(preloadDtsSource).toContain('cancelDownload:');
      expect(preloadDtsSource).toContain('retryDownload:');
    });

    it('should enforce sequential FIFO execution with 1 active download at a time in DownloadQueueManager (FR-3.3)', () => {
      expect(queueManagerSource).toContain('class DownloadQueueManager');
      expect(queueManagerSource).toContain('activeTransfer');
      expect(queueManagerSource).toContain('status === \'queued\'');
      expect(queueManagerSource).toContain('processQueue');
    });

    it('should handle cancellation by aborting active streams and cleaning up partial files (EC-3)', () => {
      expect(queueManagerSource).toContain('cancel(');
      expect(queueManagerSource).toContain('abort(');
      expect(queueManagerSource).toContain('unlinkSync');
    });

    it('should implement folder streaming compression via archiver with error resilience logging (FR-4, EC-5, EC-10)', () => {
      expect(streamSource).toContain('archiver');
      expect(streamSource).toContain('createWriteStream');
      expect(streamSource).toContain('_descarga_advertencias.txt');
    });

    it('should implement filename collision resolution in queue manager (EC-6)', () => {
      expect(queueManagerSource).toContain('resolveNextAvailableFilename');
    });

    it('should register IPC handlers for all download operations in download-ipc.ts', () => {
      expect(ipcSource).toContain('IPC_CHANNELS.DOWNLOAD_START');
      expect(ipcSource).toContain('IPC_CHANNELS.DOWNLOAD_CANCEL');
      expect(ipcSource).toContain('IPC_CHANNELS.DOWNLOAD_RETRY');
      expect(ipcSource).toContain('IPC_CHANNELS.DOWNLOAD_OPEN_FOLDER');
    });
  });

  describe('Google Workspace Export Format Selection Menu (Spec 012 US-3 / T3 / FR-5, FR-12)', () => {
    const exportMenuSource = (() => {
      try {
        return readFileSync(resolve(__dirname, '../../src/renderer/src/components/explorer/WorkspaceExportMenu.tsx'), 'utf-8');
      } catch {
        return '';
      }
    })();

    it('should render WorkspaceExportMenu component with Swiss Archive styling and data-testid attributes (FR-5, NFR-1)', () => {
      expect(exportMenuSource).toContain('data-testid="workspace-export-menu"');
      expect(exportMenuSource).toContain('export-option-');
      expect(exportMenuSource).toContain('resolveWorkspaceExportOptions');
      expect(exportMenuSource).toContain('calculatePopoverPosition');
    });

    it('should declare bilingual translations for all export formats in English and Spanish (FR-12)', () => {
      expect(getTranslation('en', 'export_menu_title')).toBe('Format');
      expect(getTranslation('es', 'export_menu_title')).toBe('Formato');
      expect(getTranslation('en', 'export_format_pdf')).toContain('PDF');
      expect(getTranslation('es', 'export_format_pdf')).toContain('PDF');
      expect(getTranslation('en', 'export_format_docx')).toContain('Word');
      expect(getTranslation('es', 'export_format_docx')).toContain('Word');
      expect(getTranslation('en', 'export_format_xlsx')).toContain('Excel');
      expect(getTranslation('es', 'export_format_xlsx')).toContain('Excel');
      expect(getTranslation('en', 'export_format_pptx')).toContain('PowerPoint');
      expect(getTranslation('es', 'export_format_pptx')).toContain('PowerPoint');
    });

    it('should wire WorkspaceExportMenu in FileExplorer on Google Workspace document rows (FR-5)', () => {
      expect(explorerSource).toContain('WorkspaceExportMenu');
      expect(explorerSource).toContain('exportMenuTarget');
      expect(explorerSource).toContain('resolveWorkspaceExportOptions');
    });

    it('should dynamically re-anchor WorkspaceExportMenu on window resize, maximize, and table layout changes', () => {
      expect(explorerSource).toContain('exportTriggerRef.current.getBoundingClientRect()');
      expect(explorerSource).toContain('triggerElement={exportTriggerRef.current}');
    });
  });

  describe('Floating Transfer Trigger & Hover Expansion (Spec 012 US-4 / T4 / FR-6, NFR-1, EC-7)', () => {
    const floatingTriggerSource = (() => {
      try {
        return readFileSync(
          resolve(__dirname, '../../src/renderer/src/components/transfer/FloatingTransferTrigger.tsx'),
          'utf-8'
        );
      } catch {
        return '';
      }
    })();

    const downloadContextSource = (() => {
      try {
        return readFileSync(
          resolve(__dirname, '../../src/renderer/src/context/DownloadContext.tsx'),
          'utf-8'
        );
      } catch {
        return '';
      }
    })();

    const appShellSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/AppShell.tsx'),
      'utf-8'
    );

    it('should render FloatingTransferTrigger at bottom-3 right-3 in resting 40px x 40px state with Drive emblem and download badge (FR-6.1, NFR-1)', () => {
      expect(floatingTriggerSource).toContain('data-testid="floating-transfer-trigger"');
      expect(floatingTriggerSource).toContain('bottom-3');
      expect(floatingTriggerSource).toContain('right-3');
      expect(floatingTriggerSource).toContain('w-10');
      expect(floatingTriggerSource).toContain('h-10');
      expect(floatingTriggerSource).toContain('rounded-[6px]');
      expect(floatingTriggerSource).toContain('GoogleDriveLogo');
      expect(floatingTriggerSource).toContain('border-[#C9C6BD]');
      expect(floatingTriggerSource).toContain('dark:border-[#2C323D]');
      expect(floatingTriggerSource).toContain('bg-[#FFFFFF]');
      expect(floatingTriggerSource).toContain('dark:bg-[#181C23]');
    });

    it('should expand horizontally to the left to 260px on hover displaying active filename, progress bar, percentage, and queue counter (FR-6.2)', () => {
      expect(floatingTriggerSource).toContain('w-[260px]');
      expect(floatingTriggerSource).toContain('onMouseEnter');
      expect(floatingTriggerSource).toContain('onMouseLeave');
      expect(floatingTriggerSource).toContain('data-testid="floating-transfer-progress-bar"');
      expect(floatingTriggerSource).toContain('bg-[#1B44E8]');
      expect(floatingTriggerSource).toContain('dark:bg-[#3B66FF]');
      expect(floatingTriggerSource).toContain('transfer_queue_count');
      expect(floatingTriggerSource).toContain('progressPercent');
    });

    it('should auto-hide after 4-second grace period on completion and freeze timer while modal is open (FR-6.3, FR-8)', () => {
      expect(floatingTriggerSource).toContain('FLOATING_TRIGGER_GRACE_MS');
      expect(floatingTriggerSource).toContain('setTimeout');
      expect(floatingTriggerSource).toContain('clearTimeout');
      expect(floatingTriggerSource).toContain('isModalOpen');
    });

    it('should declare bilingual translations for floating transfer trigger and queue counter (FR-6.2, FR-12)', () => {
      expect(getTranslation('en', 'transfer_floating_active')).toBe('Active downloads');
      expect(getTranslation('es', 'transfer_floating_active')).toBe('Descargas activas');
      expect(getTranslation('en', 'transfer_queue_count', { current: 1, total: 3 })).toBe('1 of 3');
      expect(getTranslation('es', 'transfer_queue_count', { current: 1, total: 3 })).toBe('1 de 3');
    });

    it('should provide DownloadContext subscribing to window.api.download.onProgress and wrap AppShell (FR-6, EC-7)', () => {
      expect(downloadContextSource).toContain('DownloadProvider');
      expect(downloadContextSource).toContain('useDownloadContext');
      expect(downloadContextSource).toContain('onProgress');
      expect(downloadContextSource).toContain('upsertTransferItem');
      expect(appShellSource).toContain('DownloadProvider');
    });

    it('should mount FloatingTransferTrigger inside FileExplorer canvas and connect download actions to DownloadContext (FR-6)', () => {
      expect(explorerSource).toContain('FloatingTransferTrigger');
      expect(explorerSource).toContain('useDownloadContext');
    });
  });

  describe('Centered Download Queue Modal & Lifecycle Controls (Spec 012 US-5 / T5 / FR-7, FR-8, FR-9, EC-3, EC-4, EC-8, EC-12)', () => {
    const queueModalSource = (() => {
      try {
        return readFileSync(
          resolve(__dirname, '../../src/renderer/src/components/transfer/DownloadQueueModal.tsx'),
          'utf-8'
        );
      } catch {
        return '';
      }
    })();

    const appShellSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/AppShell.tsx'),
      'utf-8'
    );

    it('should render centered Swiss Archive DownloadQueueModal with technical strip [ESC] and backdrop dismissal (FR-7.1, FR-9, NFR-1, EC-8)', () => {
      expect(queueModalSource).toContain('data-testid="download-queue-modal-overlay"');
      expect(queueModalSource).toContain('data-testid="download-queue-modal"');
      expect(queueModalSource).toContain('data-testid="download-queue-close-btn"');
      expect(queueModalSource).toContain('w-[480px]');
      expect(queueModalSource).toContain('max-h-[540px]');
      expect(queueModalSource).toContain('[ESC]');
      expect(queueModalSource).toContain("e.key === 'Escape'");
      expect(queueModalSource).toContain('border-[#C9C6BD]');
      expect(queueModalSource).toContain('dark:border-[#2C323D]');
      expect(queueModalSource).toContain('bg-[#FFFFFF]');
      expect(queueModalSource).toContain('dark:bg-[#181C23]');
    });

    it('should provide individual Cancel, Retry, Open Containing Folder, and global Clear Completed controls (FR-7.3 - FR-7.7, EC-3, EC-4)', () => {
      expect(queueModalSource).toContain('transfer-cancel-btn-');
      expect(queueModalSource).toContain('transfer-retry-btn-');
      expect(queueModalSource).toContain('transfer-open-folder-btn-');
      expect(queueModalSource).toContain('data-testid="download-queue-clear-btn"');
      expect(queueModalSource).toContain('partitionTransfersByStatus');
      expect(queueModalSource).toContain('formatTransferBytes');
    });

    it('should declare bilingual modal titles, status badges, and action labels in English and Spanish (FR-7, FR-12)', () => {
      expect(getTranslation('en', 'transfers_modal_title')).toBe('TRANSFERS // DOWNLOADS');
      expect(getTranslation('es', 'transfers_modal_title')).toBe('TRANSFERENCIAS // DESCARGAS');
      expect(getTranslation('en', 'transfers_cancel')).toBe('Cancel');
      expect(getTranslation('es', 'transfers_cancel')).toBe('Cancelar');
      expect(getTranslation('en', 'transfers_retry')).toBe('Retry');
      expect(getTranslation('es', 'transfers_retry')).toBe('Reintentar');
      expect(getTranslation('en', 'transfers_open_folder')).toBe('Show in folder');
      expect(getTranslation('es', 'transfers_open_folder')).toBe('Mostrar en carpeta');
      expect(getTranslation('en', 'transfers_clear_completed')).toBe('Clear completed');
      expect(getTranslation('es', 'transfers_clear_completed')).toBe('Limpiar completados');
    });

    it('should mount DownloadQueueModal in AppShell wired to DownloadContext (FR-7, FR-8)', () => {
      expect(appShellSource).toContain('DownloadQueueModal');
      expect(appShellSource).toContain('useDownloadContext');
      expect(appShellSource).toContain('isQueueModalOpen');
      expect(appShellSource).toContain('closeQueueModal');
    });
  });

  describe('Configurable Default Download Directory & MenuBar Settings (Spec 012 US-6 / T6 / FR-10, NFR-3, EC-11)', () => {
    const settingsModalSource = (() => {
      try {
        return readFileSync(
          resolve(__dirname, '../../src/renderer/src/components/settings/DownloadSettingsModal.tsx'),
          'utf-8'
        );
      } catch {
        return '';
      }
    })();

    const menuBarSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/MenuBar.tsx'),
      'utf-8'
    );

    const appShellSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/AppShell.tsx'),
      'utf-8'
    );

    const downloadContextSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/context/DownloadContext.tsx'),
      'utf-8'
    );

    const settingsStorageSource = readFileSync(
      resolve(__dirname, '../../src/main/core/download-settings-storage.ts'),
      'utf-8'
    );

    it('should render Settings gear button in MenuBar strictly between ThemeToggle and About (FR-10)', () => {
      const themePos = menuBarSource.indexOf('<ThemeToggle');
      const settingsPos = menuBarSource.indexOf('data-testid="settings-btn"');
      const aboutPos = menuBarSource.indexOf('data-testid="about-btn"');

      expect(menuBarSource).toContain('Settings');
      expect(settingsPos).toBeGreaterThan(-1);
      expect(themePos).toBeLessThan(settingsPos);
      expect(settingsPos).toBeLessThan(aboutPos);
    });

    it('should render centered Swiss Archive DownloadSettingsModal with monospace path input, Browse, and Reset controls (FR-10.1 - FR-10.4, NFR-1)', () => {
      expect(settingsModalSource).toContain('data-testid="download-settings-modal-overlay"');
      expect(settingsModalSource).toContain('data-testid="download-settings-modal"');
      expect(settingsModalSource).toContain('w-[440px]');
      expect(settingsModalSource).toContain('data-testid="settings-download-path-input"');
      expect(settingsModalSource).toContain('font-mono');
      expect(settingsModalSource).toContain('select-text');
      expect(settingsModalSource).toContain('data-testid="settings-browse-btn"');
      expect(settingsModalSource).toContain('data-testid="settings-reset-btn"');
      expect(settingsModalSource).toContain('[ESC]');
      expect(settingsModalSource).toContain("e.key === 'Escape'");
    });

    it('should expose settings state and native directory picker actions in DownloadContext and wire DownloadSettingsModal in AppShell (FR-10, NFR-3)', () => {
      expect(downloadContextSource).toContain('isSettingsModalOpen');
      expect(downloadContextSource).toContain('openSettingsModal');
      expect(downloadContextSource).toContain('closeSettingsModal');
      expect(downloadContextSource).toContain('browseDownloadDirectory');
      expect(downloadContextSource).toContain('resetDownloadDirectory');
      expect(downloadContextSource).toContain('selectDownloadDirectory');

      expect(appShellSource).toContain('DownloadSettingsModal');
      expect(appShellSource).toContain('onOpenSettings={openSettingsModal}');
      expect(settingsStorageSource).toContain('systemDefaultDownloadPath');
    });

    it('should declare bilingual translations for settings button and DownloadSettingsModal (FR-10, FR-12)', () => {
      expect(getTranslation('en', 'menu_settings')).toBe('Settings');
      expect(getTranslation('es', 'menu_settings')).toBe('Ajustes');
      expect(getTranslation('en', 'settings_modal_title')).toBe('SETTINGS // DOWNLOADS');
      expect(getTranslation('es', 'settings_modal_title')).toBe('AJUSTES // DESCARGAS');
      expect(getTranslation('en', 'settings_browse_button')).toBe('Browse...');
      expect(getTranslation('es', 'settings_browse_button')).toBe('Examinar...');
      expect(getTranslation('en', 'settings_reset_button')).toBe('Reset');
      expect(getTranslation('es', 'settings_reset_button')).toBe('Restablecer');
    });
  });
});
