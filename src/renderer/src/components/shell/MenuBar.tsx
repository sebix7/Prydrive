import React, { useState } from 'react';
import {
  LogOut,
  Info,
  Languages,
  Check,
  ChevronRight
} from 'lucide-react';
import type { LanguageCode } from '../../../../shared/types';
import type { ActiveMenu } from '../../../../shared/shell-state';
import { toggleMenuHeader } from '../../../../shared/shell-state';

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
  onSetLanguage
}) => {
  const isSpanish = language === 'es';
  const [isLangSubmenuOpen, setIsLangSubmenuOpen] = useState(false);

  const handleHeaderClick = (menu: ActiveMenu) => {
    setIsLangSubmenuOpen(false);
    onToggleMenu(toggleMenuHeader(openMenu, menu));
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    onSetLanguage(lang);
    setIsLangSubmenuOpen(false);
    onCloseMenus();
  };

  return (
    <div
      ref={menuBarRef}
      data-testid="shell-menu-bar"
      className="flex items-center w-full h-full text-xs font-medium text-slate-300 relative select-none"
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
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {isSpanish ? 'Opciones' : 'Options'}
          </button>

          {openMenu === 'options' && (
            <div
              data-testid="menu-dropdown-options"
              className="absolute top-full left-0 mt-1 min-w-[190px] bg-[#161B22] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Language Submenu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setIsLangSubmenuOpen(true)}
                onMouseLeave={() => setIsLangSubmenuOpen(false)}
              >
                <button
                  type="button"
                  data-testid="menu-item-lang-parent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLangSubmenuOpen((prev) => !prev);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-blue-600 hover:text-white text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    <span>{isSpanish ? 'Idioma' : 'Language'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white ml-2" />
                </button>

                {/* Nested Flyout Language Submenu */}
                {isLangSubmenuOpen && (
                  <div
                    data-testid="menu-submenu-lang"
                    className="absolute left-full -top-1 ml-1 min-w-[130px] bg-[#161B22] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      data-testid="menu-item-lang-en"
                      onClick={() => handleSelectLanguage('en')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-blue-600 hover:text-white text-slate-200 transition-colors"
                    >
                      <span>English</span>
                      {language === 'en' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                    <button
                      type="button"
                      data-testid="menu-item-lang-es"
                      onClick={() => handleSelectLanguage('es')}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-blue-600 hover:text-white text-slate-200 transition-colors"
                    >
                      <span>Español</span>
                      {language === 'es' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Structural Divider */}
              <div className="my-1 border-t border-slate-800" role="separator" />

              {/* Disconnect Action */}
              <button
                type="button"
                data-testid="menu-item-disconnect"
                onClick={() => {
                  onCloseMenus();
                  onDisconnectClick();
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isSpanish ? 'Desconectar' : 'Disconnect'}</span>
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
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {isSpanish ? 'Ayuda' : 'Help'}
          </button>

          {openMenu === 'help' && (
            <div
              data-testid="menu-dropdown-help"
              className="absolute top-full left-0 mt-1 min-w-[190px] bg-[#161B22] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                type="button"
                data-testid="menu-item-about"
                onClick={() => {
                  onCloseMenus();
                  onOpenAbout();
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-left hover:bg-blue-600 hover:text-white text-slate-200 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>{isSpanish ? 'Acerca de Prydrive' : 'About Prydrive'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
