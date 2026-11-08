import React, { useState } from 'react';
import {
  LogOut,
  Info,
  Languages,
  Palette,
  Check,
  ChevronRight
} from 'lucide-react';
import type { LanguageCode, ThemeMode } from '../../../../shared/types';
import type { ActiveMenu, OptionsSubmenu } from '../../../../shared/shell-state';
import { toggleMenuHeader, resolveOptionsSubmenu } from '../../../../shared/shell-state';
import { getTranslation } from '../../../../shared/i18n/translations';

export interface MenuBarProps {
  language: LanguageCode;
  userEmail: string;
  openMenu: ActiveMenu;
  menuBarRef: React.RefObject<HTMLDivElement>;
  onToggleMenu: (menu: ActiveMenu) => void;
  onCloseMenus: () => void;
  onDisconnectClick: () => void;
  onToggleSidebar?: () => void;
  onOpenAbout: () => void;
  onSetLanguage: (lang: LanguageCode) => void;
  theme?: ThemeMode;
  onSetTheme?: (theme: ThemeMode) => void;
  onCloseWindow?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  language,
  openMenu,
  menuBarRef,
  onToggleMenu,
  onCloseMenus,
  onDisconnectClick,
  onOpenAbout,
  onSetLanguage,
  theme = 'dark',
  onSetTheme
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<OptionsSubmenu>(null);

  const handleHeaderClick = (menu: ActiveMenu) => {
    setActiveSubmenu(null);
    onToggleMenu(toggleMenuHeader(openMenu, menu));
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    onSetLanguage(lang);
    setActiveSubmenu(null);
    onCloseMenus();
  };

  const handleSelectTheme = (selectedTheme: ThemeMode) => {
    onSetTheme?.(selectedTheme);
    setActiveSubmenu(null);
    onCloseMenus();
  };

  const themeMenuLabel = language === 'es' ? 'Tema' : 'Theme';
  const lightThemeLabel = language === 'es' ? 'Claro' : 'Light';
  const darkThemeLabel = language === 'es' ? 'Oscuro' : 'Dark';
  const isDark = theme === 'dark';
  const dropdownPanelClasses = isDark
    ? 'bg-[#161B22] border-slate-700/80 text-slate-200'
    : 'bg-white border-slate-200 text-slate-800';
  const menuItemClasses = isDark
    ? 'text-slate-200 hover:bg-blue-600 hover:text-white'
    : 'text-slate-800 hover:bg-blue-600 hover:text-white';
  const menuIconClasses = isDark
    ? 'text-slate-400 group-hover:text-white'
    : 'text-slate-500 group-hover:text-white';

  return (
    <div
      ref={menuBarRef}
      data-testid="shell-menu-bar"
      className={`flex items-center w-full h-full text-xs font-medium relative select-none ${
        isDark ? 'text-slate-300' : 'text-slate-700'
      }`}
    >
      <div className="flex items-center gap-1">
        {/* 1. Options (Opciones) Menu */}
        <div className="relative">
          <button
            type="button"
            data-testid="menu-trigger-options"
            onClick={() => handleHeaderClick('options')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'options'}
            className={`px-2.5 py-1 rounded-md transition-colors duration-100 ${
              openMenu === 'options'
                ? isDark
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-200 text-slate-900 font-semibold'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {getTranslation(language, 'menu_options')}
          </button>

          {openMenu === 'options' && (
            <div
              data-testid="menu-dropdown-options"
              className={`absolute top-full left-0 mt-1 min-w-[190px] border rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${dropdownPanelClasses}`}
            >
              {/* Language Submenu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu('language')}
                onMouseLeave={() =>
                  setActiveSubmenu((prev) => (prev === 'language' ? null : prev))
                }
              >
                <button
                  type="button"
                  data-testid="menu-item-lang-parent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubmenu((prev) => resolveOptionsSubmenu(prev, 'language'));
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                >
                  <div className="flex items-center gap-2">
                    <Languages className={`w-3.5 h-3.5 ${menuIconClasses}`} />
                    <span>{getTranslation(language, 'menu_language')}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ml-2 ${menuIconClasses}`} />
                </button>

                {/* Nested Flyout Language Submenu */}
                {activeSubmenu === 'language' && (
                  <div
                    data-testid="menu-submenu-lang"
                    className={`absolute left-full -top-1 ml-1 min-w-[130px] border rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${dropdownPanelClasses}`}
                  >
                    <button
                      type="button"
                      data-testid="menu-item-lang-en"
                      onClick={() => handleSelectLanguage('en')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                    >
                      <span>English</span>
                      {language === 'en' && (
                        <Check className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
                      )}
                    </button>
                    <button
                      type="button"
                      data-testid="menu-item-lang-es"
                      onClick={() => handleSelectLanguage('es')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                    >
                      <span>Español</span>
                      {language === 'es' && (
                        <Check className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Submenu Trigger (FR-6, FR-7, FR-8) */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu('theme')}
                onMouseLeave={() =>
                  setActiveSubmenu((prev) => (prev === 'theme' ? null : prev))
                }
              >
                <button
                  type="button"
                  data-testid="menu-item-theme-parent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubmenu((prev) => resolveOptionsSubmenu(prev, 'theme'));
                  }}
                  className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                >
                  <div className="flex items-center gap-2">
                    <Palette className={`w-3.5 h-3.5 ${menuIconClasses}`} />
                    <span>{themeMenuLabel}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ml-2 ${menuIconClasses}`} />
                </button>

                {/* Nested Flyout Theme Submenu */}
                {activeSubmenu === 'theme' && (
                  <div
                    data-testid="menu-submenu-theme"
                    className={`absolute left-full -top-1 ml-1 min-w-[130px] border rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${dropdownPanelClasses}`}
                  >
                    <button
                      type="button"
                      data-testid="menu-item-theme-light"
                      onClick={() => handleSelectTheme('light')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                    >
                      <span>{lightThemeLabel}</span>
                      {theme === 'light' && (
                        <Check
                          data-testid="theme-check-light"
                          className="w-3.5 h-3.5 text-blue-500 group-hover:text-white"
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      data-testid="menu-item-theme-dark"
                      onClick={() => handleSelectTheme('dark')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors group ${menuItemClasses}`}
                    >
                      <span>{darkThemeLabel}</span>
                      {theme === 'dark' && (
                        <Check
                          data-testid="theme-check-dark"
                          className="w-3.5 h-3.5 text-blue-500 group-hover:text-white"
                        />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Structural Divider */}
              <div
                className={`my-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
                role="separator"
              />

              {/* Disconnect Action */}
              <button
                type="button"
                data-testid="menu-item-disconnect"
                onClick={() => {
                  onCloseMenus();
                  onDisconnectClick();
                }}
                className={`w-full px-3 py-1.5 flex items-center gap-2 text-left transition-colors ${
                  isDark
                    ? 'text-rose-400 hover:bg-rose-500/15 hover:text-rose-300'
                    : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getTranslation(language, 'menu_disconnect')}</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Help (Ayuda) Menu */}
        <div className="relative">
          <button
            type="button"
            data-testid="menu-trigger-help"
            onClick={() => handleHeaderClick('help')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'help'}
            className={`px-2.5 py-1 rounded-md transition-colors duration-100 ${
              openMenu === 'help'
                ? isDark
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-200 text-slate-900 font-semibold'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {getTranslation(language, 'menu_help')}
          </button>

          {openMenu === 'help' && (
            <div
              data-testid="menu-dropdown-help"
              className={`absolute top-full left-0 mt-1 min-w-[190px] border rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${dropdownPanelClasses}`}
            >
              <button
                type="button"
                data-testid="menu-item-about"
                onClick={() => {
                  onCloseMenus();
                  onOpenAbout();
                }}
                className={`w-full px-3 py-1.5 flex items-center gap-2 text-left transition-colors group ${menuItemClasses}`}
              >
                <Info className={`w-3.5 h-3.5 ${menuIconClasses}`} />
                <span>{getTranslation(language, 'menu_about')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
