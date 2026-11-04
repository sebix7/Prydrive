import React, { useState, useEffect } from 'react';
import type { StorageItem, LanguageCode } from '../../../../shared/types';
import { FileTableRow } from './FileTableRow';

export interface FileExplorerProps {
  language?: LanguageCode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ language = 'en' }) => {
  const [items, setItems] = useState<StorageItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadRootDirectory() {
      if (!window.api?.storage?.listDirectory) return;
      const result = await window.api.storage.listDirectory({ folderId: 'root' });
      if (isMounted && result.success && result.data) {
        setItems(result.data.items);
      }
    }
    loadRootDirectory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      data-testid="file-explorer"
      className="flex-1 flex flex-col w-full h-full bg-[#0D1117] text-slate-100 select-none min-w-0 overflow-hidden"
    >
      {/* Scrollable File and Folder List with Sticky Header for 100% Column Alignment */}
      <div
        role="table"
        data-testid="explorer-table-body"
        className="flex-1 overflow-y-auto min-h-0"
      >
        {/* Compact Sticky Table Header */}
        <div
          role="row"
          data-testid="explorer-table-header"
          className="sticky top-0 z-10 h-9 flex items-center px-3 bg-[#161B22] border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
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

        {/* Rows */}
        <div role="rowgroup">
          {items.map((item) => (
            <FileTableRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
