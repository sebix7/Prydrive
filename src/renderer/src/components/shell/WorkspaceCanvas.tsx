import React from 'react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import { type ActiveNavTab, resolveWorkspaceView } from '../../../../shared/shell-state';
import { FileExplorer } from '../explorer/FileExplorer';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: LanguageCode;
  theme?: ThemeMode;
  onSelectNav?: (nav: ActiveNavTab) => void;
}

/**
 * Central Workspace Canvas.
 * Renders the unified Google Drive FileExplorer when either 'prydrive' or 'google-drive'
 * navigation button is selected in the left rail (FR-4, FR-5).
 */
export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  activeNav,
  language = 'en',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const resolvedView = resolveWorkspaceView(activeNav);

  return (
    <main
      data-testid="workspace-canvas"
      data-active-nav={activeNav}
      className={`flex-1 flex flex-col select-none min-w-0 min-h-0 overflow-hidden transition-colors ${
        isDark ? 'bg-[#181C23] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {resolvedView === 'google-drive' && (
        <FileExplorer language={language} theme={theme} />
      )}
    </main>
  );
};
