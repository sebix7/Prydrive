import type { ThemeMode } from './types';

export type { ThemeMode };

export const THEME_STORAGE_KEY = 'prydrive_theme';

export const SWISS_ARCHIVE_FONTS = {
  display: ['Space Grotesk', 'Segoe UI', 'system-ui', 'sans-serif'],
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  mono: ['IBM Plex Mono', 'Cascadia Mono', 'Consolas', 'monospace']
} as const;

export const SWISS_CONTROL_LAYOUT = {
  topRightClusterClass: 'absolute top-[5px] right-[12px] flex items-center gap-2',
  buttonDimensionClass: 'w-[30px] h-[30px]',
  languageContainerClass: 'h-[30px]',
  controlRadiusClass: 'rounded-[4px]',
  cardRadiusClass: 'rounded-[6px]',
  cardContainerClass: 'max-w-[420px] w-full rounded-[6px] border overflow-hidden shadow-sm'
} as const;

/**
 * Resolves the Google Sign-in button classes implementing Swiss Archive styling and Klein Blue hover state (Spec 006 FR-8).
 */
export function getGoogleSignInButtonClasses(
  theme: ThemeMode = 'dark',
  disabled: boolean = false
): string {
  return getGoogleDriveConnectButtonClasses(theme, disabled);
}

export type ProviderButtonLayout = 'full' | 'compact';

/**
 * Resolves classes for the primary active Google Drive connection button (FR-1, FR-2, FR-11, FR-12).
 */
export function getGoogleDriveConnectButtonClasses(
  theme: ThemeMode = 'dark',
  disabled: boolean = false,
  layout: ProviderButtonLayout = 'full'
): string {
  const widthAndGap = layout === 'compact' ? 'gap-5' : 'w-full gap-3';
  const base =
    `group flex items-center justify-between ${widthAndGap} px-4 py-2 text-xs font-semibold rounded-[4px] border font-display transition-all duration-150`;
  if (disabled) {
    return theme === 'dark'
      ? `${base} bg-[#15181E] text-[#6B7280] border-[#2C323D] opacity-60 cursor-not-allowed`
      : `${base} bg-[#F2F0EA] text-[#7C8087] border-[#C9C6BD] opacity-60 cursor-not-allowed`;
  }
  return theme === 'dark'
    ? `${base} bg-[#15181E] text-[#F3F4F6] border-[#2C323D] hover:bg-[#3B66FF] hover:border-[#3B66FF] hover:text-white active:scale-[0.99] cursor-pointer shadow-xs`
    : `${base} bg-[#F2F0EA] text-[#111315] border-[#C9C6BD] hover:bg-[#1B44E8] hover:border-[#1B44E8] hover:text-white active:scale-[0.99] cursor-pointer shadow-xs`;
}

/**
 * Resolves classes for secondary upcoming cloud provider buttons (FR-3, FR-6, FR-11, FR-12).
 * Permanently styled as disabled with muted secondary Swiss Archive surfaces and non-interactive cursor.
 */
export function getUpcomingProviderButtonClasses(
  theme: ThemeMode = 'dark',
  layout: ProviderButtonLayout = 'full'
): string {
  const widthAndGap = layout === 'compact' ? 'gap-5' : 'w-full gap-3';
  const base =
    `flex items-center justify-between ${widthAndGap} px-4 py-2 text-xs font-medium rounded-[4px] border font-display cursor-not-allowed select-none opacity-40`;
  return theme === 'dark'
    ? `${base} bg-[#15181E] text-[#9CA3AF] border-[#2C323D]`
    : `${base} bg-[#F2F0EA] text-[#6B7280] border-[#C9C6BD]`;
}

/**
 * Resolves classes for the compact "Próximamente" / "Coming soon" roadmap badge (FR-5, FR-11, FR-12).
 */
export function getRoadmapBadgeClasses(
  theme: ThemeMode = 'dark'
): string {
  const base =
    'px-1.5 py-0.5 rounded-[3px] border font-mono text-[9.5px] uppercase font-semibold tracking-wider shrink-0 transition-colors';
  return theme === 'dark'
    ? `${base} bg-[#1E232C] border-[#2C323D] text-[#9CA3AF]`
    : `${base} bg-[#ECEAE3] border-[#C9C6BD] text-[#4A4E54]`;
}

export interface MinimalStorage {
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
}

/**
 * Type guard verifying if an unknown value is a valid ThemeMode ('light' | 'dark') (EC-2).
 */
export function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/**
 * Resolves the initial theme mode once at startup (FR-1, FR-2, FR-3, EC-1, EC-2):
 * 1. If savedValue is a valid ThemeMode ('light' | 'dark'), returns it.
 * 2. Otherwise, if systemPrefersDark is a boolean, returns 'dark' when true or 'light' when false.
 * 3. Otherwise (when OS detection is unavailable), safely defaults to 'dark' (EC-1).
 */
export function resolveInitialTheme(
  savedValue: unknown,
  systemPrefersDark?: boolean | null
): ThemeMode {
  if (isValidThemeMode(savedValue)) {
    return savedValue;
  }
  if (typeof systemPrefersDark === 'boolean') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Alternates between 'light' and 'dark' theme modes (FR-5).
 */
export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export interface ThemeToggleMetadata {
  targetTheme: ThemeMode;
  iconName: 'moon' | 'sun';
  tooltipKey: 'theme_switch_to_dark' | 'theme_switch_to_light';
}

/**
 * Resolves action-oriented toggle button metadata (FR-4, FR-13):
 * - When activeTheme is 'light' -> Moon icon + 'theme_switch_to_dark'.
 * - When activeTheme is 'dark'  -> Sun icon  + 'theme_switch_to_light'.
 */
export function getThemeToggleMetadata(activeTheme: ThemeMode): ThemeToggleMetadata {
  if (activeTheme === 'light') {
    return {
      targetTheme: 'dark',
      iconName: 'moon',
      tooltipKey: 'theme_switch_to_dark'
    };
  }
  return {
    targetTheme: 'light',
    iconName: 'sun',
    tooltipKey: 'theme_switch_to_light'
  };
}

export interface ThemeSurfacePalette {
  frameBg: string;
  canvasBg: string;
  secondaryBg: string;
  cardBg: string;
  modalBg: string;
  hoverBg: string;
  selectedBg: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

/**
 * Resolves standardized Swiss Archive semantic surface and typography classes for Light and Dark modes (Spec 006 FR-1, FR-2, NFR-1).
 */
export function getThemeSurfaceClasses(theme: ThemeMode): ThemeSurfacePalette {
  if (theme === 'light') {
    return {
      frameBg: 'bg-[#E4E2DC]',
      canvasBg: 'bg-[#FAF9F6]',
      secondaryBg: 'bg-[#F2F0EA]',
      cardBg: 'bg-[#FFFFFF]',
      modalBg: 'bg-[#FFFFFF]',
      hoverBg: 'hover:bg-[#ECEAE3]',
      selectedBg: 'bg-[#DDE7FA]',
      border: 'border-[#C9C6BD]',
      borderSubtle: 'border-[#DFDDD6]',
      textPrimary: 'text-[#111315]',
      textSecondary: 'text-[#4A4E54]',
      textMuted: 'text-[#7C8087]',
      accentBg: 'bg-[#1B44E8]',
      accentText: 'text-[#1B44E8]',
      accentBorder: 'border-[#1B44E8]'
    };
  }
  return {
    frameBg: 'bg-[#08090B]',
    canvasBg: 'bg-[#101216]',
    secondaryBg: 'bg-[#15181E]',
    cardBg: 'bg-[#181C23]',
    modalBg: 'bg-[#181C23]',
    hoverBg: 'hover:bg-[#1E232C]',
    selectedBg: 'bg-[#1C2D52]',
    border: 'border-[#2C323D]',
    borderSubtle: 'border-[#222730]',
    textPrimary: 'text-[#F3F4F6]',
    textSecondary: 'text-[#9CA3AF]',
    textMuted: 'text-[#6B7280]',
    accentBg: 'bg-[#3B66FF]',
    accentText: 'text-[#3B66FF]',
    accentBorder: 'border-[#3B66FF]'
  };
}

export type TechnicalIndexContext =
  | 'welcome'
  | 'offline'
  | 'workspace'
  | 'awaiting_auth'
  | 'about'
  | 'disconnect';

export interface TechnicalIndexStrip {
  leftLabel: string;
  rightLabel: string;
}

/**
 * Resolves deterministic uppercase labels for Swiss Archive Technical Index Strips (Spec 006 FR-6, FR-17).
 */
export function getTechnicalIndexStrip(
  context: TechnicalIndexContext,
  version = 'v0.4.0'
): TechnicalIndexStrip {
  const formattedVersion = version.startsWith('v') ? version : `v${version}`;
  switch (context) {
    case 'welcome':
      return {
        leftLabel: 'PRYDRIVE // AUTHENTICATION',
        rightLabel: `${formattedVersion}`
      };
    case 'offline':
      return {
        leftLabel: 'PRYDRIVE // OFFLINE',
        rightLabel: 'NETWORK_STATUS'
      };
    case 'workspace':
      return {
        leftLabel: 'PRYDRIVE // WORKSPACE',
        rightLabel: formattedVersion
      };
    case 'awaiting_auth':
      return {
        leftLabel: 'OAUTH 2.0 LOOPBACK',
        rightLabel: '127.0.0.1'
      };
    case 'about':
      return {
        leftLabel: 'SYSTEM // ABOUT',
        rightLabel: '[ESC]'
      };
    case 'disconnect':
      return {
        leftLabel: 'SECURITY // REVOKE SESSION',
        rightLabel: 'SAFE_STORAGE'
      };
  }
}

/**
 * Safely reads the persisted theme preference from storage without throwing on restricted environments (FR-12).
 */
export function loadSavedTheme(storage?: MinimalStorage | null): ThemeMode | null {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof localStorage !== 'undefined'
          ? localStorage
          : null;
    if (!targetStorage?.getItem) {
      return null;
    }
    const raw = targetStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Safely persists the user's theme preference without throwing on restricted environments (FR-2, FR-12).
 */
export function saveThemePreference(
  theme: ThemeMode,
  storage?: MinimalStorage | null
): void {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof localStorage !== 'undefined'
          ? localStorage
          : null;
    targetStorage?.setItem?.(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors and continue operating in memory (FR-12)
  }
}
