import React from 'react';
import { LogOut, Info, FolderTree, PanelRight, PanelLeft } from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import type { ActiveMenu } from '../../../../shared/shell-state';
import {
  shouldShowTopBarDisconnect
} from '../../../../shared/shell-state';
import { getHeaderPanelToggleButtonClasses } from '../../../../shared/theme';
import { getTranslation } from '../../../../shared/i18n/translations';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';

export interface MenuBarProps {
  language: LanguageCode;
  userEmail: string;
  openMenu?: ActiveMenu;
  menuBarRef?: React.RefObject<HTMLDivElement>;
  onToggleMenu?: (menu: ActiveMenu) => void;
  onCloseMenus?: () => void;
  onDisconnectClick: () => void;
  onToggleSidebar?: () => void;
  onOpenAbout: () => void;
  onSetLanguage: (lang: LanguageCode) => void;
  theme?: ThemeMode;
  onSetTheme?: (theme: ThemeMode) => void;
  onToggleTheme?: () => void;
  onCloseWindow?: () => void;
  isSidebarExpanded?: boolean;
  isTreeExpanded?: boolean;
  onToggleTree?: () => void;
  isCompactWidth?: boolean;
  isRailExpanded?: boolean;
  onToggleRail?: () => void;
}

/**
 * Swiss Archive 40px Top Header Bar (Spec 006 FR-7, FR-9, FR-10, FR-16).
 * Features static drive unit badge on the left, unified controls on the right,
 * and a compact icon-only Disconnect button when the right sidebar is collapsed.
 */
export const MenuBar: React.FC<MenuBarProps> = ({
  language,
  onDisconnectClick,
  onOpenAbout,
  onSetLanguage,
  theme = 'dark',
  onSetTheme,
  onToggleTheme,
  isSidebarExpanded = true,
  isTreeExpanded = false,
  onToggleTree,
  onToggleSidebar,
  isCompactWidth = false,
  isRailExpanded = true,
  onToggleRail
}) => {
  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else if (onSetTheme) {
      onSetTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const showTopBarDisconnect = shouldShowTopBarDisconnect(isSidebarExpanded);

  return (
    <header
      data-testid="shell-menu-bar"
      className="h-10 px-3 flex items-center justify-between border-b border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-xs font-mono select-none flex-shrink-0 z-30"
    >
      {/* Left side: Panel Toggle Cluster (Spec 009 FR-1, FR-2, FR-3, FR-4, FR-6) */}
      <div className="flex items-center gap-1.5" data-testid="header-panel-toggle-cluster">
        {/* Navigation Rail Toggle (only in compact mode) (FR-4) */}
        {isCompactWidth && onToggleRail && (
          <button
            type="button"
            data-testid="header-toggle-rail-btn"
            onClick={onToggleRail}
            aria-pressed={isRailExpanded}
            aria-label={getTranslation(language, isRailExpanded ? 'panel_toggle_rail_hide' : 'panel_toggle_rail_show')}
            title={getTranslation(language, isRailExpanded ? 'panel_toggle_rail_hide' : 'panel_toggle_rail_show')}
            className={getHeaderPanelToggleButtonClasses(Boolean(isRailExpanded), theme)}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Directory Tree Toggle Button (FR-3, FR-4) */}
        {onToggleTree && (
          <button
            type="button"
            data-testid="header-toggle-tree-btn"
            onClick={onToggleTree}
            aria-pressed={isTreeExpanded}
            aria-label={getTranslation(language, isTreeExpanded ? 'panel_toggle_tree_hide' : 'panel_toggle_tree_show')}
            title={getTranslation(language, isTreeExpanded ? 'panel_toggle_tree_hide' : 'panel_toggle_tree_show')}
            className={getHeaderPanelToggleButtonClasses(Boolean(isTreeExpanded), theme)}
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Right Sidebar Toggle Button (FR-3, FR-4) */}
        {onToggleSidebar && (
          <button
            type="button"
            data-testid="header-toggle-sidebar-btn"
            onClick={onToggleSidebar}
            aria-pressed={isSidebarExpanded}
            aria-label={getTranslation(language, isSidebarExpanded ? 'panel_toggle_sidebar_hide' : 'panel_toggle_sidebar_show')}
            title={getTranslation(language, isSidebarExpanded ? 'panel_toggle_sidebar_hide' : 'panel_toggle_sidebar_show')}
            className={getHeaderPanelToggleButtonClasses(Boolean(isSidebarExpanded), theme)}
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right side: Unified control cluster (FR-7, FR-16, EC-6) */}
      <div className="flex items-center gap-2">
        {/* About Prydrive info button (FR-7, EC-7) */}
        <button
          type="button"
          data-testid="about-btn"
          onClick={onOpenAbout}
          title={getTranslation(language, 'about_title')}
          aria-label={getTranslation(language, 'about_title')}
          className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] active:scale-95"
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        {/* Theme toggle button (FR-7) */}
        <ThemeToggle
          theme={theme}
          onToggle={handleToggleTheme}
          language={language}
        />

        {/* Language selector (FR-7) */}
        <LanguageToggle
          currentLanguage={language}
          onLanguageChange={onSetLanguage}
          theme={theme}
        />

        {/* Compact icon-only Disconnect SVG button (FR-16, EC-6) */}
        {showTopBarDisconnect && (
          <button
            type="button"
            data-testid="topbar-disconnect-btn"
            onClick={onDisconnectClick}
            title={getTranslation(language, 'disconnect')}
            aria-label={getTranslation(language, 'disconnect')}
            className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[4px] border border-[rgba(220,38,38,0.25)] dark:border-[rgba(239,68,68,0.30)] bg-[rgba(220,38,38,0.08)] dark:bg-[rgba(239,68,68,0.12)] text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] dark:hover:bg-[#EF4444] hover:text-white transition-all duration-150 focus:outline-none active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
