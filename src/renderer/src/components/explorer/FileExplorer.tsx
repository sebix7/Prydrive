import React from 'react';
import { Loader2, FolderOpen, AlertCircle, RotateCw } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import type { AnchorRect } from '../../../../shared/item-details';
import { truncateFolderStack } from '../../../../shared/explorer-helpers';
import { getTranslation } from '../../../../shared/i18n/translations';
import { useDriveExplorerContext } from '../../context/DriveExplorerContext';
import { FileTableRow } from './FileTableRow';
import { ParentNavRow } from './ParentNavRow';
import { ExplorerStatusBar } from './ExplorerStatusBar';
import { ExplorerBreadcrumbBar } from './ExplorerBreadcrumbBar';
import { ItemDetailsPopover } from './ItemDetailsPopover';

export interface FileExplorerProps {
  language?: LanguageCode;
  theme?: ThemeMode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  language = 'en',
  theme = 'dark'
}) => {
  const {
    currentFolder,
    atRoot,
    items,
    selectedItemId,
    isLoading,
    isLoadingMore,
    errorMessage,
    metrics,
    folderHistory,
    navigateToFolderStack,
    selectItem,
    openItem,
    navigateUp,
    refreshDirectory,
    retryCurrentDirectory,
    handleScroll
  } = useDriveExplorerContext();

  const isDark = theme === 'dark';
  const tableBodyRef = React.useRef<HTMLDivElement>(null);
  const anchorElementRef = React.useRef<HTMLElement | null>(null);

  // Single popover cardinality state (Spec 011 US-4 / FR-5.2, FR-5.3)
  const [activeDetailsItemId, setActiveDetailsItemId] = React.useState<string | null>(null);
  const [activeAnchorRect, setActiveAnchorRect] = React.useState<AnchorRect | null>(null);

  const activeItem = React.useMemo(() => {
    if (!activeDetailsItemId) return null;
    return items.find((item) => item.id === activeDetailsItemId) || null;
  }, [items, activeDetailsItemId]);

  // Reset table scroll position and active popover when changing folders (FR-7.4, EC-6)
  React.useEffect(() => {
    if (tableBodyRef.current) {
      tableBodyRef.current.scrollTop = 0;
    }
    setActiveDetailsItemId(null);
    setActiveAnchorRect(null);
    anchorElementRef.current = null;
  }, [currentFolder.id]);

  // Clean up popover if active item disappears from directory items
  React.useEffect(() => {
    if (activeDetailsItemId && !items.some((i) => i.id === activeDetailsItemId)) {
      setActiveDetailsItemId(null);
      setActiveAnchorRect(null);
      anchorElementRef.current = null;
    }
  }, [items, activeDetailsItemId]);

  // Global dismissal machine: Escape key & Outside mousedown (FR-7.1, FR-7.2, EC-7)
  React.useEffect(() => {
    if (!activeDetailsItemId) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If clicked inside the popover dialog, do not dismiss
      const popoverEl = document.querySelector('[data-testid="item-details-popover"]');
      if (popoverEl && popoverEl.contains(target)) return;
      // If clicked on the trigger button itself, let button toggle handle it
      if (anchorElementRef.current && anchorElementRef.current.contains(target)) return;

      setActiveDetailsItemId(null);
      setActiveAnchorRect(null);
      anchorElementRef.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setActiveDetailsItemId(null);
        setActiveAnchorRect(null);
        anchorElementRef.current?.focus();
        anchorElementRef.current = null;
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDetailsItemId]);

  // Re-anchor active popover on window resize, maximize, or table layout changes
  React.useEffect(() => {
    if (!activeDetailsItemId) return;

    const updateAnchorPosition = () => {
      if (anchorElementRef.current && document.body.contains(anchorElementRef.current)) {
        const rect = anchorElementRef.current.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setActiveDetailsItemId(null);
          setActiveAnchorRect(null);
          anchorElementRef.current = null;
          return;
        }
        setActiveAnchorRect({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right
        });
      } else {
        setActiveDetailsItemId(null);
        setActiveAnchorRect(null);
        anchorElementRef.current = null;
      }
    };

    window.addEventListener('resize', updateAnchorPosition);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && tableBodyRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateAnchorPosition();
      });
      resizeObserver.observe(tableBodyRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateAnchorPosition);
      resizeObserver?.disconnect();
    };
  }, [activeDetailsItemId]);

  // Instant dismissal on table scroll (FR-7.3, EC-4)
  const onTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (activeDetailsItemId !== null) {
      setActiveDetailsItemId(null);
      setActiveAnchorRect(null);
      anchorElementRef.current = null;
    }
    handleScroll(e);
  };

  return (
    <div
      data-testid="file-explorer"
      className="flex-1 flex flex-col w-full h-full select-none min-w-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] transition-colors"
    >
      {/* Persistent 32px Explorer Breadcrumb Bar (Spec 010 FR-1, FR-2, FR-3, FR-4, FR-10) */}
      <ExplorerBreadcrumbBar
        folderHistory={folderHistory}
        onNavigateToCrumb={(targetId) => {
          const newStack = truncateFolderStack(folderHistory, targetId);
          navigateToFolderStack(newStack);
        }}
        language={language}
        theme={theme}
      />

      {/* Scrollable File and Folder List with Sticky Header for 100% Column Alignment */}
      <div
        ref={tableBodyRef}
        role="table"
        data-testid="explorer-table-body"
        onScroll={onTableScroll}
        className="flex-1 flex flex-col overflow-y-auto min-h-0"
      >
        {/* Compact Sticky Table Header: Strictly Two Columns (Icon and Name per Spec 011 FR-2) */}
        <div
          role="row"
          data-testid="explorer-table-header"
          className="sticky top-0 z-10 h-9 flex items-center px-3 border-b border-[#C9C6BD] dark:border-[#2C323D] border-l-[3px] border-transparent bg-[#F2F0EA] dark:bg-[#15181E] text-[#7C8087] dark:text-[#6B7280] font-mono text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
        >
          <div className="w-10 text-center shrink-0">
            {getTranslation(language, 'explorer_col_type')}
          </div>
          <div className="flex-1 min-w-0 pr-9">
            {getTranslation(language, 'explorer_col_name')}
          </div>
        </div>

        {/* Centered Loading Spinner, Error Banner, Empty Folder State, or Rows */}
        {isLoading ? (
          <div
            data-testid="explorer-loading-spinner"
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-[#7C8087] dark:text-[#6B7280]"
          >
            <div className="p-3 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B44E8] dark:text-[#3B66FF]" />
            </div>
            <span className="font-mono text-xs tracking-wider animate-pulse text-[#7C8087] dark:text-[#6B7280]">
              {getTranslation(language, 'explorer_loading')}
            </span>
          </div>
        ) : errorMessage ? (
          <div role="rowgroup" className="flex-1 flex flex-col">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} theme={theme} />
            )}
            <div
              data-testid="explorer-error-banner"
              className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <div className="p-3 rounded-[6px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] text-[#DC2626] dark:text-[#EF4444]">
                <AlertCircle className="w-6 h-6 text-[#DC2626] dark:text-[#EF4444]" />
              </div>
              <div className="max-w-md space-y-1">
                <p className="font-display text-sm font-semibold text-[#111315] dark:text-[#F3F4F6]">
                  {getTranslation(language, 'explorer_error_title')}
                </p>
                <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280]">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                data-testid="explorer-retry-button"
                onClick={retryCurrentDirectory}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1B44E8] dark:bg-[#3B66FF] hover:bg-[#1231B5] dark:hover:bg-[#5A7FFF] text-white font-display text-xs font-semibold shadow-xs transition-colors active:scale-[0.99]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{getTranslation(language, 'explorer_retry')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div role="rowgroup" className="flex-1 flex flex-col">
            {!atRoot && (
              <ParentNavRow onNavigateUp={navigateUp} language={language} theme={theme} />
            )}
            {items.length === 0 ? (
              <div
                data-testid="explorer-empty-state"
                className="flex-1 flex flex-col items-center justify-center gap-2.5 p-8 text-[#7C8087] dark:text-[#6B7280]"
              >
                <div className="p-3 rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] shadow-xs">
                  <FolderOpen className="w-6 h-6 text-[#7C8087] dark:text-[#6B7280]" />
                </div>
                <span className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280]">
                  {getTranslation(language, 'explorer_empty_folder')}
                </span>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <FileTableRow
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={selectItem}
                    onDoubleClick={openItem}
                    onOpenDetails={(item, targetElement) => {
                      if (activeDetailsItemId === item.id) {
                        setActiveDetailsItemId(null);
                        setActiveAnchorRect(null);
                        anchorElementRef.current = null;
                      } else {
                        const rect = targetElement.getBoundingClientRect();
                        anchorElementRef.current = targetElement;
                        setActiveDetailsItemId(item.id);
                        setActiveAnchorRect({
                          top: rect.top,
                          bottom: rect.bottom,
                          left: rect.left,
                          right: rect.right
                        });
                      }
                    }}
                    theme={theme}
                    language={language}
                  />
                ))}
                {isLoadingMore && (
                  <div
                    data-testid="explorer-pagination-spinner"
                    className="h-9 flex items-center justify-center gap-2 font-mono text-xs py-2 text-[#7C8087] dark:text-[#6B7280]"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B44E8] dark:text-[#3B66FF]" />
                    <span>{getTranslation(language, 'explorer_loading_more')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Persistent Bottom Status Bar (FR-12, FR-14) */}
      <ExplorerStatusBar
        metrics={metrics}
        language={language}
        theme={theme}
      />

      {/* Floating Item Details Popover (Spec 011 US-3, US-4 / FR-5, FR-6, FR-7) */}
      {activeDetailsItemId && activeItem && activeAnchorRect && (
        <ItemDetailsPopover
          item={activeItem}
          anchorRect={activeAnchorRect}
          onClose={() => {
            setActiveDetailsItemId(null);
            setActiveAnchorRect(null);
            anchorElementRef.current?.focus();
            anchorElementRef.current = null;
          }}
          language={language}
          theme={theme}
        />
      )}
    </div>
  );
};
