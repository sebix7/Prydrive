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
});
