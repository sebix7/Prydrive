import React from 'react';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  ExternalLink,
  File
} from 'lucide-react';
import type { StorageItem, StorageItemType, ThemeMode } from '../../../../shared/types';
import { getRowSelectionClasses } from '../../../../shared/explorer-helpers';

export interface FileTableRowProps {
  item: StorageItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDoubleClick?: (item: StorageItem) => void;
  theme?: ThemeMode;
}

function renderItemIcon(iconType: StorageItemType): React.ReactNode {
  switch (iconType) {
    case 'folder':
      return <Folder className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF] fill-[#1B44E8]/20 dark:fill-[#3B66FF]/20" />;
    case 'document':
      return <FileText className="w-4 h-4 text-[#1B44E8] dark:text-[#3B66FF]" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-4 h-4 text-[#0D8A52] dark:text-[#10B981]" />;
    case 'presentation':
      return <Presentation className="w-4 h-4 text-[#D95D1E] dark:text-[#F97316]" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />;
    case 'image':
      return <FileImage className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    case 'video':
      return <FileVideo className="w-4 h-4 text-pink-500 dark:text-pink-400" />;
    case 'audio':
      return <FileAudio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    case 'archive':
      return <FileArchive className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    case 'shortcut':
      return <ExternalLink className="w-4 h-4 text-[#7C8087] dark:text-[#6B7280]" />;
    default:
      return <File className="w-4 h-4 text-[#7C8087] dark:text-[#6B7280]" />;
  }
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
  item,
  isSelected = false,
  onSelect,
  onDoubleClick,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const metaTextClass = isSelected
    ? 'text-inherit'
    : isDark
      ? 'text-[#6B7280]'
      : 'text-[#7C8087]';

  return (
    <div
      role="row"
      aria-selected={isSelected}
      data-testid={`explorer-row-${item.id}`}
      onClick={() => onSelect?.(item.id)}
      onDoubleClick={() => onDoubleClick?.(item)}
      className={`h-9 flex items-center px-3 border-b border-b-[#DFDDD6] dark:border-b-[#222730] text-xs transition-colors cursor-default select-none ${getRowSelectionClasses(isSelected, theme)}`}
    >
      {/* Column 1: Type Icon */}
      <div className="w-10 flex items-center justify-center shrink-0">
        {renderItemIcon(item.iconType)}
      </div>

      {/* Column 2: Name (Truncated with Tooltip for EC-3) */}
      <div
        className="flex-1 min-w-0 pr-4 truncate font-sans font-medium"
        title={item.name}
      >
        {item.name}
      </div>

      {/* Column 3: Creation Date (DD/MM/YYYY HH:mm:ss local) */}
      <div className={`w-44 shrink-0 ${metaTextClass} font-mono text-[11px]`}>
        {item.formattedCreatedAt}
      </div>

      {/* Column 4: File Size */}
      <div className={`w-24 shrink-0 text-right ${metaTextClass} font-mono text-[11px] pr-2`}>
        {item.formattedSize}
      </div>
    </div>
  );
};
