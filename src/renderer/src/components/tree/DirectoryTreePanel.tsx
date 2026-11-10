import React from 'react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import {
  getTreePanelClasses,
  getTreeTechnicalStripIdentifier
} from '../../../../shared/shell-state';
import { TreeNodeItem } from './TreeNodeItem';
import { useDirectoryTree } from '../../hooks/useDirectoryTree';

export interface DirectoryTreePanelProps {
  isExpanded: boolean;
  theme?: ThemeMode;
  language?: LanguageCode;
  children?: React.ReactNode;
}

/**
 * Collapsible Directory Tree Navigation Panel (Spec 007 US-1, US-3, US-4).
 * Positioned between the navigation rail and central table.
 */
export const DirectoryTreePanel: React.FC<DirectoryTreePanelProps> = ({
  isExpanded,
  theme = 'dark',
  language = 'en',
  children
}) => {
  const classes = getTreePanelClasses(isExpanded, theme);
  const rootLabel = language === 'es' ? 'Mi unidad' : 'My Drive';
  const { visibleNodes, activeFolderId, handleSelectNode, handleToggleExpander } =
    useDirectoryTree({ rootLabel });

  return (
    <aside
      data-testid="directory-tree-panel"
      aria-label="Directory tree"
      aria-hidden={!isExpanded}
      className={`h-full bg-[#F2F0EA] dark:bg-[#15181E] flex flex-col shrink-0 select-none z-10 ${classes.container}`}
    >
      <div className={`flex flex-col h-full w-[240px] overflow-hidden ${classes.inner}`}>
        {/* Upper Technical Index Strip (FR-3) */}
        <div
          data-testid="tree-technical-strip"
          className="h-8 px-3 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none shrink-0"
        >
          <span>DRIVE // TREE</span>
          <span>{getTreeTechnicalStripIdentifier(language)}</span>
        </div>

        {/* Tree Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
          {children || (
            <div
              data-testid="tree-nodes-list"
              role="tree"
              className="flex flex-col min-w-0"
            >
              {visibleNodes.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  isActive={activeFolderId === node.id}
                  onSelectNode={handleSelectNode}
                  onToggleExpander={handleToggleExpander}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
