import React from 'react';

export interface TreeExpanderBoxProps {
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

/**
 * Classic square boxed expand/collapse toggle ([+] / [-]) (Spec 007 US-2, FR-5, FR-6).
 */
export const TreeExpanderBox: React.FC<TreeExpanderBoxProps> = ({
  isExpanded,
  onClick,
  disabled = false
}) => {
  return (
    <button
      type="button"
      data-testid="tree-expander-box"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={disabled}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? 'Collapse folder branch' : 'Expand folder branch'}
      className="w-3 h-3 rounded-[2px] border border-[#7C8087] dark:border-[#6B7280] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] flex items-center justify-center font-mono text-[9px] font-bold leading-none select-none transition-colors hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] focus:outline-none active:scale-95 disabled:opacity-40 shrink-0"
    >
      {isExpanded ? '−' : '+'}
    </button>
  );
};
