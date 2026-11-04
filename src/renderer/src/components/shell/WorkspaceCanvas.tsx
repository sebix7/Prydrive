import React from 'react';
import type { ActiveNavTab } from '../../hooks/useShellState';
import { FileExplorer } from '../explorer/FileExplorer';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: 'en' | 'es';
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ language = 'en' }) => {
  return (
    <main
      data-testid="workspace-canvas"
      className="flex-1 flex flex-col bg-[#0D1117] text-slate-100 select-none min-w-0 min-h-0 overflow-hidden"
    >
      <FileExplorer language={language} />
    </main>
  );
};
