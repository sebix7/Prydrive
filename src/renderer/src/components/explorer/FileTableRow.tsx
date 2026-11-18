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
  File,
  Info
} from 'lucide-react';
import type { StorageItem, StorageItemType, ThemeMode, LanguageCode } from '../../../../shared/types';
import { getRowSelectionClasses } from '../../../../shared/explorer-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface FileTableRowProps {
  item: StorageItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDoubleClick?: (item: StorageItem) => void;
  onOpenDetails?: (item: StorageItem, targetElement: HTMLElement) => void;
  theme?: ThemeMode;
  language?: LanguageCode;
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
  onOpenDetails,
  theme = 'dark',
  language = 'en'
}) => {
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

      {/* Column 2: Name & Details Action Button (Two-Column Layout with pr-9 clearing sidebar toggle button) */}
      <div className="flex-1 min-w-0 pr-9 flex items-center justify-between">
        <span
          className="truncate font-sans font-medium text-xs"
          title={item.name}
        >
          {item.name}
        </span>

        <div className="shrink-0 ml-2">
          <button
            type="button"
            data-testid="item-details-btn"
            title={getTranslation(language, 'item_details_tooltip')}
            aria-label={getTranslation(language, 'item_details_tooltip')}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails?.(item, e.currentTarget);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onOpenDetails?.(item, e.currentTarget);
              }
            }}
            className="w-[26px] h-[26px] rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#7C8087] dark:text-[#6B7280] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1B44E8] dark:focus:ring-[#3B66FF]"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
