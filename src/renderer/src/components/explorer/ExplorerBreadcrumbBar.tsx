import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FolderCrumb, LanguageCode, ThemeMode } from '../../../../shared/types';
import { formatCrumbDisplayName } from '../../../../shared/explorer-helpers';
import {
  getBreadcrumbBarClasses,
  getBreadcrumbCrumbClasses,
  getBreadcrumbSeparatorClasses
} from '../../../../shared/theme';

export interface ExplorerBreadcrumbBarProps {
  folderHistory: FolderCrumb[];
  onNavigateToCrumb: (folderId: string) => void;
  language?: LanguageCode;
  theme?: ThemeMode;
}

/**
 * Explorer Breadcrumb Bar component (Spec 010 FR-1, FR-2, FR-3, FR-4, FR-6, FR-7, FR-8).
 * Renders the persistent 32px path bar directly above the file table with full lineage,
 * typographical slashes, interactive ancestor crumbs, prominent active crumb, and smooth horizontal scrolling.
 * Features:
 * - Direct mouse wheel horizontal scrolling (translates deltaY to scrollLeft)
 * - Auto-scroll to active crumb on navigation and on container resize (e.g. sidebar toggle or mobile viewport)
 * - Interactive left/right scroll buttons when contents overflow
 * - Drag-to-scroll mouse support
 */
export const ExplorerBreadcrumbBar: React.FC<ExplorerBreadcrumbBarProps> = ({
  folderHistory,
  onNavigateToCrumb,
  language = 'en',
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll tracking
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Update canScrollLeft and canScrollRight indicators
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  // Programmatic scroll helper for chevron buttons
  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Enable mouse wheel horizontal scrolling on Windows / Chromium (FR-8)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (delta !== 0) {
          el.scrollLeft += delta;
          updateScrollState();
          e.preventDefault();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [updateScrollState]);

  // Auto-scroll to the end of the breadcrumb trail whenever the navigation stack changes (FR-8)
  // and maintain active folder visibility on container resize (e.g. expanding right panel or mobile viewport)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollToActiveCrumb = () => {
      requestAnimationFrame(() => {
        if (containerRef.current && containerRef.current.scrollWidth > containerRef.current.clientWidth) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
          updateScrollState();
        } else {
          updateScrollState();
        }
      });
    };

    scrollToActiveCrumb();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scrollToActiveCrumb();
      });
      resizeObserver.observe(el);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [folderHistory]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX;
    scrollLeftRef.current = el.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 3) {
      hasDraggedRef.current = true;
      el.scrollLeft = scrollLeftRef.current - dx;
      updateScrollState();
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const effectiveHistory = folderHistory.length > 0
    ? folderHistory
    : [{ id: 'root', name: 'My Drive' }];

  return (
    <div className="relative w-full min-w-0 flex items-center shrink-0">
      {/* Left Scroll Chevron Button (appears when overflowed to the left) */}
      {canScrollLeft && (
        <button
          type="button"
          data-testid="breadcrumb-scroll-left"
          title={language === 'es' ? 'Desplazar a la izquierda' : 'Scroll left'}
          aria-label={language === 'es' ? 'Desplazar a la izquierda' : 'Scroll left'}
          onClick={() => scrollByAmount(-160)}
          className={`absolute left-0 top-0 bottom-0 z-20 w-6 flex items-center justify-center border-r transition-colors shadow-xs ${
            theme === 'dark'
              ? 'bg-[#15181E] border-[#2C323D] text-[#9CA3AF] hover:text-[#3B66FF] hover:bg-[#1C2028]'
              : 'bg-[#F2F0EA] border-[#C9C6BD] text-[#4A4E54] hover:text-[#1B44E8] hover:bg-[#E5E3DC]'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Main Horizontal Scrollable Breadcrumb Bar */}
      <nav
        ref={containerRef}
        role="navigation"
        aria-label={language === 'es' ? 'Ruta de carpetas' : 'Folder path'}
        className={getBreadcrumbBarClasses(theme)}
        data-testid="explorer-breadcrumb-bar"
        onScroll={updateScrollState}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {effectiveHistory.map((crumb, index) => {
          const isRoot = index === 0 || crumb.id === 'root';
          const isActive = index === effectiveHistory.length - 1;
          const displayName = formatCrumbDisplayName(crumb, isRoot, language);

          return (
            <React.Fragment key={`${crumb.id}-${index}`}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={getBreadcrumbSeparatorClasses(theme)}
                  data-testid="breadcrumb-separator"
                >
                  /
                </span>
              )}
              {isActive ? (
                <span
                  aria-current="page"
                  className={getBreadcrumbCrumbClasses(true, theme)}
                  data-testid="breadcrumb-active-crumb"
                  title={displayName}
                >
                  {displayName}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateToCrumb(crumb.id)}
                  className={getBreadcrumbCrumbClasses(false, theme)}
                  data-testid={`breadcrumb-crumb-${crumb.id}`}
                  title={displayName}
                  aria-label={displayName}
                >
                  {displayName}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right Scroll Chevron Button (appears when overflowed to the right) */}
      {canScrollRight && (
        <button
          type="button"
          data-testid="breadcrumb-scroll-right"
          title={language === 'es' ? 'Desplazar a la derecha' : 'Scroll right'}
          aria-label={language === 'es' ? 'Desplazar a la derecha' : 'Scroll right'}
          onClick={() => scrollByAmount(160)}
          className={`absolute right-0 top-0 bottom-0 z-20 w-6 flex items-center justify-center border-l transition-colors shadow-xs ${
            theme === 'dark'
              ? 'bg-[#15181E] border-[#2C323D] text-[#9CA3AF] hover:text-[#3B66FF] hover:bg-[#1C2028]'
              : 'bg-[#F2F0EA] border-[#C9C6BD] text-[#4A4E54] hover:text-[#1B44E8] hover:bg-[#E5E3DC]'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
