import React from 'react';
import type { ThemeMode, LanguageCode } from '../../../../shared/types';
import { getTreePanelClasses } from '../../../../shared/shell-state';

export interface DirectoryTreePanelProps {
  isExpanded: boolean;
  theme?: ThemeMode;
  language?: LanguageCode;
  children?: React.ReactNode;
}

/**
 * Collapsible Directory Tree Navigation Panel (Spec 007 US-1, US-4).
 * Positioned between the navigation rail and central table.
 */
export const DirectoryTreePanel: React.FC<DirectoryTreePanelProps> = ({
  isExpanded,
  theme = 'dark',
  children
}) => {
  const classes = getTreePanelClasses(isExpanded, theme);

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
          <span>MY_DRIVE</span>
        </div>

        {/* Tree Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          {children}
        </div>
      </div>
    </aside>
  );
};
