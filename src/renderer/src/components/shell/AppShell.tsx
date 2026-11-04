import React from 'react';
import type { UserProfile, StorageQuota } from '../../../../shared/types';
import { useShellState } from '../../hooks/useShellState';
import { WorkspaceCanvas } from './WorkspaceCanvas';

interface AppShellProps {
  userProfile: UserProfile | null;
  storageQuota: StorageQuota | null;
  language: 'en' | 'es';
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
    openMenu: string | null;
    menuBarRef: React.RefObject<HTMLDivElement | null>;
    dispatch: any;
  }) => React.ReactNode;
  renderNavigationRail?: (props: {
    activeNav: 'prydrive' | 'google-drive';
    onSelectNav: (nav: 'prydrive' | 'google-drive') => void;
  }) => React.ReactNode;
  renderTelemetrySidebar?: (props: {
    userEmail: string;
    storageQuota: StorageQuota | null;
    isExpanded: boolean;
    onToggle: () => void;
    onRefreshQuota: () => void;
    language: 'en' | 'es';
  }) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  userProfile,
  storageQuota,
  language,
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
      className="flex flex-col h-screen w-screen bg-[#0D1117] text-slate-100 overflow-hidden font-sans select-none min-w-[960px] min-h-[600px]"
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
            openMenu: state.openMenu,
            menuBarRef,
            dispatch
          })
        ) : (
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <span className="font-semibold text-slate-100">Prydrive</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{userEmail}</span>
          </div>
        )}
      </header>

      {/* Main Workspace Body: Left Rail + Center Canvas + Right Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Zone 2: Left Navigation Rail */}
        <aside
          data-testid="shell-nav-rail-zone"
          className="w-16 border-r border-slate-800 bg-[#161B22] flex flex-col items-center py-4 gap-4 z-20 shrink-0"
        >
          {renderNavigationRail ? (
            renderNavigationRail({
              activeNav: state.activeNav,
              onSelectNav: (nav) => dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })
            })
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_NAV', payload: 'prydrive' })}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-150 ${
                  state.activeNav === 'prydrive'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Prydrive"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_NAV', payload: 'google-drive' })}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-150 ${
                  state.activeNav === 'google-drive'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Google Drive"
              >
                G
              </button>
            </div>
          )}
        </aside>

        {/* Zone 3: Central Workspace Canvas */}
        <WorkspaceCanvas activeNav={state.activeNav} language={language} />

        {/* Zone 4: Right Telemetry Sidebar */}
        {renderTelemetrySidebar ? (
          renderTelemetrySidebar({
            userEmail,
            storageQuota,
            isExpanded: state.isSidebarExpanded,
            onToggle: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
            onRefreshQuota,
            language
          })
        ) : (
          <aside
            data-testid="shell-sidebar-zone"
            className={`border-l border-slate-800 bg-[#161B22] transition-all duration-200 ease-in-out relative shrink-0 ${
              state.isSidebarExpanded ? 'w-[260px]' : 'w-0 border-l-0 overflow-hidden'
            }`}
          >
            {state.isSidebarExpanded && (
              <div className="p-4 w-[260px] text-xs text-slate-400 space-y-3">
                <div className="font-semibold text-slate-200">Google Drive</div>
                <div className="truncate text-slate-400" title={userEmail}>
                  {userEmail}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
