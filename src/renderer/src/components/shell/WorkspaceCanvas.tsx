import React from 'react';
import { Cloud, FolderGit2 } from 'lucide-react';
import type { ActiveNavTab } from '../../hooks/useShellState';

interface WorkspaceCanvasProps {
  activeNav: ActiveNavTab;
  language?: 'en' | 'es';
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ activeNav, language = 'en' }) => {
  const isSpanish = language === 'es';

  return (
    <main
      data-testid="workspace-canvas"
      className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0D1117] text-slate-100 select-none min-w-[480px] overflow-hidden"
    >
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-xl border border-slate-800 bg-[#161B22]/70 shadow-2xl backdrop-blur-sm">
        <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
          {activeNav === 'prydrive' ? (
            <FolderGit2 className="w-10 h-10" />
          ) : (
            <Cloud className="w-10 h-10 animate-pulse" />
          )}
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-slate-100">
          {activeNav === 'prydrive'
            ? isSpanish
              ? 'Espacio de Trabajo Prydrive'
              : 'Prydrive Workspace'
            : isSpanish
              ? 'Google Drive Conectado'
              : 'Google Drive Connected'}
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          {isSpanish
            ? 'El explorador de archivos y carpetas estará disponible en la próxima actualización. Tu conexión con la nube está activa y sincronizada.'
            : 'File and folder explorer will be available in the next release. Your cloud connection is active and synchronized.'}
        </p>

        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          <span>{isSpanish ? 'Listo para explorar' : 'Ready to explore'}</span>
        </div>
      </div>
    </main>
  );
};
