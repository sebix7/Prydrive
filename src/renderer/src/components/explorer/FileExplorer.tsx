import React from 'react';
import { Loader2 } from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import { useDriveExplorer } from '../../hooks/useDriveExplorer';
import { FileTableRow } from './FileTableRow';
import { ParentNavRow } from './ParentNavRow';

export interface FileExplorerProps {
  language?: LanguageCode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ language = 'en' }) => {
  const {
    atRoot,
    items,
    selectedItemId,
    isLoading,
    selectItem,
    openItem,
    navigateUp
  } = useDriveExplorer();

  return (
    <div
      data-testid="file-explorer"
      className="flex-1 flex flex-col w-full h-full bg-[#0D1117] text-slate-100 select-none min-w-0 overflow-hidden"
    >
      {/* Scrollable File and Folder List with Sticky Header for 100% Column Alignment */}
      <div
        role="table"
        data-testid="explorer-table-body"
        className="flex-1 flex flex-col overflow-y-auto min-h-0"
      >
        {/* Compact Sticky Table Header */}
        <div
          role="row"
          data-testid="explorer-table-header"
          className="sticky top-0 z-10 h-9 flex items-center px-3 bg-[#161B22] border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0"
        >
          <div className="w-10 text-center shrink-0">
            {language === 'es' ? 'Tipo' : 'Type'}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            {language === 'es' ? 'Nombre' : 'Name'}
          </div>
          <div className="w-44 shrink-0">
            {language === 'es' ? 'Fecha de creación' : 'Created'}
          </div>
          <div className="w-24 shrink-0 text-right pr-2">
            {language === 'es' ? 'Tamaño' : 'Size'}
          </div>
        </div>

        {/* Centered Loading Spinner or Rows */}
        {isLoading ? (
          <div
            data-testid="explorer-loading-spinner"
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-slate-400"
          >
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <span className="text-xs font-medium tracking-wide text-slate-400 animate-pulse">
              {language === 'es' ? 'Cargando archivos...' : 'Loading files...'}
            </span>
          </div>
        ) : (
          <div role="rowgroup">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} />
            )}
            {items.map((item) => (
              <FileTableRow
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={selectItem}
                onDoubleClick={openItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
