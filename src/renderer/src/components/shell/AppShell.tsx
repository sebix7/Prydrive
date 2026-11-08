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

  return (
    <div
      data-testid="app-shell-container"
      className="flex flex-col w-full h-full bg-[#0D1117] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* Zone 1: Top Menu Bar */}
      <header
        data-testid="shell-menu-bar-zone"
        className="h-10 border-b border-slate-800 bg-[#161B22] flex items-center px-3 z-30 shrink-0"
      >
        {renderMenuBar ? (
          renderMenuBar({
            language,
            userEmail,
            onDisconnectClick: () => {
              dispatch({ type: 'CLOSE_MENUS' });
              onDisconnect();
            },
            onToggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
            onOpenAbout: () => dispatch({ type: 'OPEN_ABOUT_MODAL' }),
            onSetLanguage,
            theme,
            onSetTheme,
            openMenu: state.openMenu,
            menuBarRef,
            dispatch
          })
        ) : (
          <MenuBar
            language={language}
            userEmail={userEmail}
            openMenu={state.openMenu}
            menuBarRef={menuBarRef}
            onToggleMenu={(menu) => dispatch({ type: 'OPEN_MENU', payload: menu })}
            onCloseMenus={() => dispatch({ type: 'CLOSE_MENUS' })}
            onDisconnectClick={() => {
              dispatch({ type: 'CLOSE_MENUS' });
              onDisconnect();
            }}
            onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            onOpenAbout={() => dispatch({ type: 'OPEN_ABOUT_MODAL' })}
            onSetLanguage={onSetLanguage}
            theme={theme}
            onSetTheme={onSetTheme}
          />
        )}
      </header>

      {/* Main Workspace Body: Left Rail + Center Canvas + Right Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Zone 2: Left Navigation Rail */}
        {renderNavigationRail ? (
          renderNavigationRail({
            activeNav: state.activeNav,
            onSelectNav: (nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav }),
            language
          })
        ) : (
          <NavigationRail
            activeNav={state.activeNav}
            onSelectNav={(nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })}
            language={language}
          />
        )}

        {/* Zone 3: Central Workspace Canvas */}
        <WorkspaceCanvas activeNav={state.activeNav} language={language} />

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
            language
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
            language={language}
          />
        )}
      </div>

      {/* About Modal (FR-6 / Help) */}
      <AboutModal
        isOpen={state.isAboutModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_ABOUT_MODAL' })}
        language={language}
      />
    </div>
  );
};
