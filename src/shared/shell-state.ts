export type ActiveNavTab = 'prydrive' | 'google-drive';
export type ActiveMenu = 'file' | 'account' | 'view' | 'help' | null;

export interface ShellState {
  activeNav: ActiveNavTab;
  isSidebarExpanded: boolean;
  openMenu: ActiveMenu;
  isAboutModalOpen: boolean;
  isDisconnectModalOpen: boolean;
}

export type ShellAction =
  | { type: 'SET_ACTIVE_NAV'; payload: ActiveNavTab }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_EXPANDED'; payload: boolean }
  | { type: 'OPEN_MENU'; payload: ActiveMenu }
  | { type: 'CLOSE_MENUS' }
  | { type: 'OPEN_ABOUT_MODAL' }
  | { type: 'CLOSE_ABOUT_MODAL' }
  | { type: 'OPEN_DISCONNECT_MODAL' }
  | { type: 'CLOSE_DISCONNECT_MODAL' };

export const initialShellState: ShellState = {
  activeNav: 'google-drive',
  isSidebarExpanded: true,
  openMenu: null,
  isAboutModalOpen: false,
  isDisconnectModalOpen: false
};

/**
 * Pure state reducer governing all shell layout transitions and modals.
 */
export function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case 'SET_ACTIVE_NAV':
      return { ...state, activeNav: action.payload, openMenu: null };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarExpanded: !state.isSidebarExpanded, openMenu: null };
    case 'SET_SIDEBAR_EXPANDED':
      return { ...state, isSidebarExpanded: action.payload };
    case 'OPEN_MENU':
      return { ...state, openMenu: action.payload };
    case 'CLOSE_MENUS':
      return { ...state, openMenu: null };
    case 'OPEN_ABOUT_MODAL':
      return { ...state, isAboutModalOpen: true, openMenu: null };
    case 'CLOSE_ABOUT_MODAL':
      return { ...state, isAboutModalOpen: false };
    case 'OPEN_DISCONNECT_MODAL':
      return { ...state, isDisconnectModalOpen: true, openMenu: null };
    case 'CLOSE_DISCONNECT_MODAL':
      return { ...state, isDisconnectModalOpen: false };
    default:
      return state;
  }
}

/**
 * Pure calculation to determine if the sidebar must auto-collapse
 * to preserve a minimum central canvas width of 480px.
 * Min window size = 64 (rail) + 260 (sidebar) + 480 (canvas) = 804px.
 */
export function shouldAutoCollapseSidebar(windowWidth: number): boolean {
  return windowWidth < 804;
}

/**
 * Pure utility to truncate long emails with ellipsis while preserving domain readability.
 */
export function truncateEmail(email: string, maxChars: number = 24): string {
  if (!email || email.length <= maxChars) return email;
  const atIndex = email.indexOf('@');
  if (atIndex === -1 || atIndex <= 3) {
    return `${email.slice(0, maxChars - 3)}...`;
  }
  const domain = email.slice(atIndex);
  const user = email.slice(0, atIndex);
  const availableUserChars = maxChars - domain.length - 3;
  if (availableUserChars > 2) {
    return `${user.slice(0, availableUserChars)}...${domain}`;
  }
  return `${email.slice(0, maxChars - 3)}...`;
}

export interface NavItem {
  id: ActiveNavTab;
  label: string;
  tooltip: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'prydrive', label: 'Prydrive', tooltip: 'Prydrive Workspace' },
  { id: 'google-drive', label: 'Google Drive', tooltip: 'Google Drive' }
];

/**
 * Resolves the active central workspace view for a given navigation tab (FR-5).
 * Both 'prydrive' and 'google-drive' currently activate the Google Drive view.
 */
export function resolveWorkspaceView(nav: ActiveNavTab): 'google-drive' {
  // In this iteration, both tabs activate the Google Drive explorer view
  if (nav === 'prydrive' || nav === 'google-drive') {
    return 'google-drive';
  }
  return 'google-drive';
}

/**
 * Resolves active navigation button visual styling classes (FR-4).
 * Returns distinctive active fill vs subtle inactive hover.
 */
export function getNavButtonStyles(isActive: boolean): {
  container: string;
  indicator: string;
} {
  return {
    container: isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
    indicator: isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
  };
}
