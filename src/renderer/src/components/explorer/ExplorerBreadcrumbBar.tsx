import React, { useRef, useEffect } from 'react';
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
 * typographical slashes, interactive ancestor crumbs, prominent active crumb, and horizontal auto-scroll.
 */
export const ExplorerBreadcrumbBar: React.FC<ExplorerBreadcrumbBarProps> = ({
  folderHistory,
  onNavigateToCrumb,
  language = 'en',
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLElement>(null);

  // Auto-scroll to the end of the breadcrumb trail whenever the navigation stack changes (FR-8)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [folderHistory]);

  const effectiveHistory = folderHistory.length > 0
    ? folderHistory
    : [{ id: 'root', name: 'My Drive' }];

  return (
    <nav
      ref={containerRef}
      role="navigation"
      aria-label={language === 'es' ? 'Ruta de carpetas' : 'Folder path'}
      className={getBreadcrumbBarClasses(theme)}
      data-testid="explorer-breadcrumb-bar"
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
  );
};
