import React from 'react';
import { resolveWorkspaceView, type ActiveNavTab } from '../../hooks/useShellState';
import { FileExplorer } from '../explorer/FileExplorer';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: 'en' | 'es';
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  activeNav,
  language = 'en'
}) => {
  const activeView = resolveWorkspaceView(activeNav);

  return (
    <main
      data-testid="workspace-canvas"
      data-active-view={activeView}
      className="flex-1 flex flex-col bg-[#0D1117] text-slate-100 select-none min-w-0 min-h-0 overflow-hidden"
    >
      {activeView === 'google-drive' && <FileExplorer language={language} />}
    </main>
  );
};
