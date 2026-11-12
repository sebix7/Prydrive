import { APP_VERSION, APP_NAME, RAW_VERSION } from './version';
import type { LanguageCode, ThemeMode } from './types';

export { APP_VERSION, APP_NAME, RAW_VERSION };

export type ActiveNavTab = 'prydrive' | 'google-drive';
export type ActiveMenu = 'options' | 'help' | null;
export type OptionsSubmenu = 'language' | 'theme' | null;

export interface ShellState {
  activeNav: ActiveNavTab;
  isSidebarExpanded: boolean;
  isTreeExpanded: boolean;
  openMenu: ActiveMenu;
  isAboutModalOpen: boolean;
  isDisconnectModalOpen: boolean;
}

export type ShellAction =
  | { type: 'SET_ACTIVE_NAV'; payload: ActiveNavTab }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_EXPANDED'; payload: boolean }
  | { type: 'TOGGLE_TREE' }
  | { type: 'SET_TREE_EXPANDED'; payload: boolean }
  | { type: 'OPEN_MENU'; payload: ActiveMenu }
  | { type: 'CLOSE_MENUS' }
  | { type: 'OPEN_ABOUT_MODAL' }
  | { type: 'CLOSE_ABOUT_MODAL' }
  | { type: 'OPEN_DISCONNECT_MODAL' }
  | { type: 'CLOSE_DISCONNECT_MODAL' };

export const initialShellState: ShellState = {
  activeNav: 'google-drive',
  isSidebarExpanded: true,
  isTreeExpanded: true,
  openMenu: null,
  isAboutModalOpen: false,
  isDisconnectModalOpen: false
};

/**
 * Creates the initial shell state, conditionally resolving sidebar and tree
 * expansion according to the responsive window width threshold to prevent layout conflicts.
 */
export function createInitialShellState(windowWidth?: number): ShellState {
  if (windowWidth === undefined) {
    return { ...initialShellState };
  }

  const isSidebarExpanded = !shouldAutoCollapseSidebar(windowWidth);
  const isTreeExpanded = !shouldAutoCollapseTree(windowWidth, isSidebarExpanded);

  return {
    ...initialShellState,
    isSidebarExpanded,
    isTreeExpanded
  };
}

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
    case 'TOGGLE_TREE':
      return { ...state, isTreeExpanded: !state.isTreeExpanded };
    case 'SET_TREE_EXPANDED':
      return { ...state, isTreeExpanded: action.payload };
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
 * Returns the static monospace unit indicator for the left side of the 40px top header bar (FR-9, FR-10, EC-3).
 * Always returns 'UNIDAD: //MY_DRIVE' for 'es' and 'DRIVE: //MY_DRIVE' for 'en'.
 */
export function getStaticDriveUnitBadge(language: LanguageCode = 'en'): string {
  return language === 'es' ? 'UNIDAD: //MY_DRIVE' : 'DRIVE: //MY_DRIVE';
}

/**
 * Returns the monospace unit identifier for the right side of the directory tree technical strip (FR-3, US-4).
 * Returns 'MY_DRIVE' across languages to maintain uppercase monospace technical index consistency.
 */
export function getTreeTechnicalStripIdentifier(language: LanguageCode = 'en'): string {
  return 'MY_DRIVE';
}

/**
 * Determines whether the compact 30x30 icon-only Disconnect SVG button is shown
 * in the top header bar to the right of the EN|ES selector (FR-16, EC-6).
 * True strictly when the right telemetry sidebar is collapsed.
 */
export function shouldShowTopBarDisconnect(isSidebarExpanded: boolean): boolean {
  return !isSidebarExpanded;
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
 * Pure calculation to determine if the tree panel must auto-collapse (FR-14).
 * If right sidebar is expanded: 64 (rail) + 240 (tree) + 260 (sidebar) + 480 (canvas) = 1044px.
 * If right sidebar is collapsed: 64 (rail) + 240 (tree) + 0 (sidebar) + 480 (canvas) = 784px.
 */
export function shouldAutoCollapseTree(
  windowWidth: number,
  isSidebarExpanded: boolean = true
): boolean {
  const minWidth = isSidebarExpanded
    ? 64 + 240 + 260 + 480
    : 64 + 240 + 480;
  return windowWidth < minWidth;
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

/**
 * Resolves sidebar CSS width, border, and transition classes across themes (NFR-3, Spec 006 FR-15).
 */
export function getSidebarClasses(
  isExpanded: boolean,
  theme: ThemeMode = 'dark'
): {
  container: string;
  inner: string;
} {
  const borderClass = theme === 'dark' ? 'border-[#2C323D]' : 'border-[#C9C6BD]';
  return {
    container: isExpanded
      ? `w-[260px] border-l ${borderClass} transition-all duration-200 ease-in-out`
      : 'w-0 border-l-0 overflow-visible transition-all duration-200 ease-in-out',
    inner: isExpanded
      ? 'opacity-100 transition-opacity duration-150 delay-75'
      : 'opacity-0 pointer-events-none'
  };
}

/**
 * Resolves directory tree panel CSS width, border, and transition classes across themes (FR-1, FR-10, FR-11).
 */
export function getTreePanelClasses(
  isExpanded: boolean,
  theme: ThemeMode = 'dark'
): {
  container: string;
  inner: string;
} {
  const borderClass = theme === 'dark' ? 'border-[#2C323D]' : 'border-[#C9C6BD]';
  return {
    container: isExpanded
      ? `w-[240px] border-r ${borderClass} transition-all duration-200 ease-in-out`
      : 'w-0 border-r-0 overflow-hidden transition-all duration-200 ease-in-out',
    inner: isExpanded
      ? 'opacity-100 transition-opacity duration-150 delay-75'
      : 'opacity-0 pointer-events-none'
  };
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
  if (nav === 'prydrive' || nav === 'google-drive') {
    return 'google-drive';
  }
  return 'google-drive';
}

/**
 * Resolves active navigation button visual styling classes across themes (FR-11).
 * Returns distinctive active fill vs subtle inactive hover.
 */
export function getNavButtonStyles(
  isActive: boolean,
  theme: ThemeMode = 'dark'
): {
  container: string;
  indicator: string;
} {
  const isDark = theme === 'dark';
  const activeContainer = isDark
    ? 'bg-[#181C23] border border-[#2C323D] text-[#3B66FF] shadow-xs'
    : 'bg-[#FFFFFF] border border-[#C9C6BD] text-[#1B44E8] shadow-xs';
  const inactiveContainer = isDark
    ? 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1E232C] border border-transparent'
    : 'text-[#4A4E54] hover:text-[#111315] hover:bg-[#ECEAE3] border border-transparent';

  return {
    container: isActive ? activeContainer : inactiveContainer,
    indicator: isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
  };
}

/**
 * Resolves the inner cutout circle color for the Prydrive brand icon so it matches
 * the Swiss Archive active and inactive button surfaces (Spec 006 FR-11, EC-5).
 */
export function getPrydriveLogoCutoutColor(
  isActive: boolean,
  theme: ThemeMode = 'dark'
): string {
  if (isActive) {
    return theme === 'dark' ? '#181C23' : '#FFFFFF';
  }
  return theme === 'dark' ? '#15181E' : '#F2F0EA';
}

/**
 * Resolves the storage quota fill bar color class preserving usage thresholds (Spec 006 FR-15):
 * - isUnmetered: Klein Blue at 60% opacity
 * - >= 90%: Danger red ('bg-[#EF4444]' in dark, 'bg-[#DC2626]' in light)
 * - >= 75%: Warning signal ('bg-[#F97316]' in dark, 'bg-[#D95D1E]' in light)
 * - < 75%: Klein Blue ('bg-[#3B66FF]' in dark, 'bg-[#1B44E8]' in light)
 */
export function getQuotaProgressColorClass(
  percentage: number,
  isUnmetered: boolean = false,
  theme: ThemeMode = 'dark'
): string {
  const isDark = theme === 'dark';
  if (isUnmetered) {
    return isDark ? 'bg-[#3B66FF]/60' : 'bg-[#1B44E8]/60';
  }
  if (percentage >= 90) {
    return isDark ? 'bg-[#EF4444]' : 'bg-[#DC2626]';
  }
  if (percentage >= 75) {
    return isDark ? 'bg-[#F97316]' : 'bg-[#D95D1E]';
  }
  return isDark ? 'bg-[#3B66FF]' : 'bg-[#1B44E8]';
}

export interface AboutMetadata {
  appName: string;
  version: string;
  description: string;
  license: string;
  website: string;
  trelloUrl: string;
  contactEmail: string;
}

export const ABOUT_METADATA: AboutMetadata = {
  appName: APP_NAME,
  version: APP_VERSION,
  description: 'Fast, visual, and modern desktop client for Google Drive.',
  license: 'MIT',
  website: 'https://github.com/sebix7/Prydrive',
  trelloUrl: 'https://trello.com/b/aPzGPiHF/prydrive',
  contactEmail: 'sebiplay@hotmail.com'
};

/**
 * Formats a valid mailto: link for an email address (FR-4 / US-2).
 */
export function formatMailtoUrl(email: string): string {
  return `mailto:${email.trim()}`;
}

/**
 * Pure helper to toggle open menu state header (FR-6 / US-3).
 * Clicking the active open menu closes it; clicking another opens that menu.
 */
export function toggleMenuHeader(currentOpen: ActiveMenu, target: ActiveMenu): ActiveMenu {
  return currentOpen === target ? null : target;
}

/**
 * Enforces mutual exclusion between 'language' and 'theme' submenus inside Options (Spec 005 FR-6).
 * Clicking an inactive submenu opens it (closing any other open submenu); clicking the active submenu closes it.
 */
export function resolveOptionsSubmenu(
  current: OptionsSubmenu,
  target: OptionsSubmenu
): OptionsSubmenu {
  if (target === null) {
    return null;
  }
  return current === target ? null : target;
}

export interface UpcomingProviderDefinition {
  readonly id: 'onedrive' | 'mega' | 'mediafire';
  readonly name: string;
  readonly labelKey: 'connect_onedrive' | 'connect_mega' | 'connect_mediafire';
  readonly tooltipKey: 'provider_tooltip_onedrive' | 'provider_tooltip_mega' | 'provider_tooltip_mediafire';
  readonly badgeKey: 'provider_coming_soon';
}

export const UPCOMING_PROVIDERS: readonly UpcomingProviderDefinition[] = [
  {
    id: 'onedrive',
    name: 'OneDrive',
    labelKey: 'connect_onedrive',
    tooltipKey: 'provider_tooltip_onedrive',
    badgeKey: 'provider_coming_soon'
  },
  {
    id: 'mega',
    name: 'MEGA',
    labelKey: 'connect_mega',
    tooltipKey: 'provider_tooltip_mega',
    badgeKey: 'provider_coming_soon'
  },
  {
    id: 'mediafire',
    name: 'MediaFire',
    labelKey: 'connect_mediafire',
    tooltipKey: 'provider_tooltip_mediafire',
    badgeKey: 'provider_coming_soon'
  }
] as const;

/**
 * Standard viewport height threshold below which the welcome card adapts to compact 2x2 grid mode.
 */
export const WELCOME_COMPACT_HEIGHT_THRESHOLD = 620;

/**
 * Pure evaluator checking if a viewport height qualifies for compact welcome layout (Spec 008 FR-3, FR-4, FR-5).
 */
export function isWelcomeCompactHeight(windowHeight?: number): boolean {
  if (typeof windowHeight !== 'number' || isNaN(windowHeight)) {
    return false;
  }
  return windowHeight < WELCOME_COMPACT_HEIGHT_THRESHOLD;
}

/**
 * Suppresses all clicks, keyboard activations, and bubbling for disabled elements (Spec 008 FR-6, EC-1).
 */
export function suppressDisabledEvent(
  event: { preventDefault: () => void; stopPropagation?: () => void }
): void {
  event.preventDefault();
  event.stopPropagation?.();
}



