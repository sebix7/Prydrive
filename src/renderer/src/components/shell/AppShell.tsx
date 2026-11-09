import React from 'react';
import type { UserProfile, StorageQuota, ThemeMode } from '../../../../shared/types';
import { useShellState } from '../../hooks/useShellState';
import { NavigationRail } from './NavigationRail';
import { WorkspaceCanvas } from './WorkspaceCanvas';
import { MenuBar } from './MenuBar';
import { AboutModal } from './AboutModal';
import { TelemetrySidebar } from './TelemetrySidebar';

interface AppShellProps {
  userProfile: UserProfile | null;
  storageQuota: StorageQuota | null;
  isLoadingQuota?: boolean;
  quotaError?: string | null;
  language: 'en' | 'es';
  theme?: ThemeMode;
  onSetTheme?: (theme: ThemeMode) => void;
  onDisconnect: () => void;
  onSetLanguage: (lang: 'en' | 'es') => void;
  onRefreshQuota: () => void;
  renderMenuBar?: (props: {
    language: 'en' | 'es';
    userEmail: string;
    onDisconnectClick: () => void;
    onToggleSidebar: () => void;
    onOpenAbout: () => void;
    onSetLanguage: (lang: 'en' | 'es') => void;
    theme?: ThemeMode;
    onSetTheme?: (theme: ThemeMode) => void;
    openMenu: string | null;
    menuBarRef: React.RefObject<HTMLDivElement>;
    dispatch: any;
  }) => React.ReactNode;
  renderNavigationRail?: (props: {
    activeNav: 'prydrive' | 'google-drive';
    onSelectNav: (nav: 'prydrive' | 'google-drive') => void;
    language: 'en' | 'es';
    theme?: ThemeMode;
  }) => React.ReactNode;
  renderTelemetrySidebar?: (props: {
    userEmail: string;
    storageQuota: StorageQuota | null;
    isLoadingQuota?: boolean;
    quotaError?: string | null;
    isExpanded: boolean;
    onToggle: () => void;
    onRefreshQuota: () => void;
    language: 'en' | 'es';
    theme?: ThemeMode;
  }) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  userProfile,
  storageQuota,
  isLoadingQuota = false,
  quotaError = null,
  language,
  theme = 'dark',
  onSetTheme,
  onDisconnect,
  onSetLanguage,
  onRefreshQuota,
  renderMenuBar,
  renderNavigationRail,
  renderTelemetrySidebar
}) => {
  const { state, dispatch, menuBarRef } = useShellState();
  const userEmail = userProfile?.email || 'user@example.com';
  const isDark = theme === 'dark';

  return (
    <div
      data-testid="app-shell-container"
      className={`flex flex-col w-full h-full overflow-hidden font-sans select-none transition-colors ${
        isDark ? 'bg-[#0D1117] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Zone 1: Top Menu Bar */}
      {renderMenuBar ? (
        <div data-testid="shell-menu-bar-zone" className="h-10 border-b border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] flex items-center px-3 z-30 shrink-0">
          {renderMenuBar({
            language,
            userEmail,
            onDisconnectClick: onDisconnect,
            onToggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
            onOpenAbout: () => dispatch({ type: 'OPEN_ABOUT_MODAL' }),
            onSetLanguage,
            theme,
            onSetTheme,
            openMenu: state.openMenu,
            menuBarRef,
            dispatch
          })}
        </div>
      ) : (
        <MenuBar
          language={language}
          userEmail={userEmail}
          openMenu={state.openMenu}
          menuBarRef={menuBarRef}
          onToggleMenu={(menu) => dispatch({ type: 'OPEN_MENU', payload: menu })}
          onCloseMenus={() => dispatch({ type: 'CLOSE_MENUS' })}
          onDisconnectClick={onDisconnect}
          onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          onOpenAbout={() => dispatch({ type: 'OPEN_ABOUT_MODAL' })}
          onSetLanguage={onSetLanguage}
          theme={theme}
          onSetTheme={onSetTheme}
          isSidebarExpanded={state.isSidebarExpanded}
        />
      )}

      {/* Main Workspace Body: Left Rail + Center Canvas + Right Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Zone 2: Left Navigation Rail */}
        {renderNavigationRail ? (
          renderNavigationRail({
            activeNav: state.activeNav,
            onSelectNav: (nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav }),
            language,
            theme
          })
        ) : (
          <NavigationRail
            activeNav={state.activeNav}
            onSelectNav={(nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })}
            language={language}
            theme={theme}
          />
        )}

        {/* Zone 3: Central Workspace Canvas */}
        <WorkspaceCanvas
          activeNav={state.activeNav}
          language={language}
          theme={theme}
          onSelectNav={(nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })}
        />

        {/* Zone 4: Right Telemetry Sidebar */}
        {renderTelemetrySidebar ? (
          renderTelemetrySidebar({
            userEmail,
            storageQuota,
            isLoadingQuota,
            quotaError,
            isExpanded: state.isSidebarExpanded,
            onToggle: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
            onRefreshQuota,
            language,
            theme
          })
        ) : (
          <TelemetrySidebar
            userEmail={userEmail}
            storageQuota={storageQuota}
            isLoadingQuota={isLoadingQuota}
            quotaError={quotaError}
            isExpanded={state.isSidebarExpanded}
            onToggle={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            onRefreshQuota={onRefreshQuota}
            onDisconnect={onDisconnect}
            language={language}
            theme={theme}
          />
        )}
      </div>

      {/* About Modal (FR-6 / Help) */}
      <AboutModal
        isOpen={state.isAboutModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_ABOUT_MODAL' })}
        language={language}
        theme={theme}
      />
    </div>
  );
};
