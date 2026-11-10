import React from 'react';
import { Folder, HardDrive, Loader2 } from 'lucide-react';
import type { TreeNode } from '../../../../shared/types';
import { TreeExpanderBox } from './TreeExpanderBox';

export interface TreeNodeItemProps {
  node: TreeNode;
  isActive: boolean;
  onSelectNode: (nodeId: string) => void;
  onToggleExpander: (nodeId: string) => void;
}

/**
 * Single 32px directory tree folder row with dotted hierarchy lines,
 * boxed [+] / [-] expanders, clean leaf state, and persistent tooltips (Spec 007 US-2, US-4).
 */
export const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  isActive,
  onSelectNode,
  onToggleExpander
}) => {
  const isRoot = node.id === 'root';
  const indentationPadding = node.depth * 16 + 8;
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll active tree node into view ONLY if it is currently outside the visible viewport (FR-9, Decision 15)
  React.useEffect(() => {
    if (isActive && itemRef.current && typeof itemRef.current.scrollIntoView === 'function') {
      itemRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [isActive]);

  return (
    <div
      ref={itemRef}
      data-testid="tree-node-item"
      data-node-id={node.id}
      data-active={isActive}
      onClick={() => onSelectNode(node.id)}
      style={{ paddingLeft: `${indentationPadding}px` }}
      className={`group relative h-8 flex items-center pr-2 select-none cursor-pointer text-xs font-sans transition-colors ${
        isActive
          ? 'bg-[#DDE7FA] dark:bg-[#1C2D52] text-[#1B44E8] dark:text-[#3B66FF] font-medium'
          : 'text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C]'
      }`}
    >
      {/* 3px Vertical Active Indicator Bar (FR-12, FR-13) */}
      {isActive && (
        <span
          data-testid="tree-active-bar"
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1B44E8] dark:bg-[#3B66FF]"
          aria-hidden="true"
        />
      )}

      {/* Dotted Guideline Connector */}
      {node.depth > 0 && (
        <span
          aria-hidden="true"
          className="absolute border-l border-dotted border-[#C9C6BD] dark:border-[#2C323D]"
          style={{
            left: `${(node.depth - 1) * 16 + 14}px`,
            top: 0,
            bottom: 0,
            width: '1px'
          }}
        />
      )}

      {/* Boxed Expander ([+] / [-]), Root Fixed Dot ([·]), or Clean Leaf Line (FR-4, FR-5, FR-6, FR-7) */}
      <div className="w-5 flex items-center justify-center shrink-0 mr-1">
        {node.isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-[#1B44E8] dark:text-[#3B66FF]" />
        ) : isRoot ? (
          <span
            data-testid="tree-root-dot-box"
            className="w-3 h-3 rounded-[2px] border border-[#7C8087] dark:border-[#6B7280] bg-[#FFFFFF] dark:bg-[#181C23] text-[#7C8087] dark:text-[#9CA3AF] flex items-center justify-center font-mono text-[9px] font-bold leading-none select-none shrink-0"
            aria-hidden="true"
          >
            ·
          </span>
        ) : !node.isLeaf ? (
          <TreeExpanderBox
            isExpanded={node.isExpanded}
            onClick={() => onToggleExpander(node.id)}
          />
        ) : (
          <span
            data-testid="tree-leaf-line"
            className="w-3 h-px border-b border-dotted border-[#C9C6BD] dark:border-[#2C323D] shrink-0"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Folder Icon */}
      <div className="shrink-0 mr-1.5 flex items-center justify-center">
        {isRoot ? (
          <HardDrive className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B44E8] dark:text-[#3B66FF]' : 'text-[#7C8087] dark:text-[#9CA3AF]'}`} />
        ) : (
          <Folder className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B44E8] dark:text-[#3B66FF] fill-[#1B44E8]/20 dark:fill-[#3B66FF]/20' : 'text-amber-500 fill-amber-500/20'}`} />
        )}
      </div>

      {/* Folder Name with Ellipsis & Persistent Tooltip (FR-13) */}
      <span
        title={node.name}
        className="truncate flex-1 font-sans text-xs"
      >
        {node.name}
      </span>
    </div>
  );
};
