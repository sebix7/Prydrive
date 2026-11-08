import React from 'react';
import type { ThemeMode } from '../../../../shared/types';
import { resolveWorkspaceView, type ActiveNavTab } from '../../hooks/useShellState';
import { FileExplorer } from '../explorer/FileExplorer';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: 'en' | 'es';
  theme?: ThemeMode;
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  activeNav,
  language = 'en',
  theme = 'dark'
}) => {
  const activeView = resolveWorkspaceView(activeNav);
  const isDark = theme === 'dark';

  return (
    <main
      data-testid="workspace-canvas"
      data-active-view={activeView}
      className={`flex-1 flex flex-col select-none min-w-0 min-h-0 overflow-hidden transition-colors ${
        isDark ? 'bg-[#0D1117] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {activeView === 'google-drive' && <FileExplorer language={language} theme={theme} />}
    </main>
  );
};
