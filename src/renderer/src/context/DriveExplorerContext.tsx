import React, { createContext, useContext } from 'react';
import { useDriveExplorer } from '../hooks/useDriveExplorer';

export type DriveExplorerContextType = ReturnType<typeof useDriveExplorer>;

export const DriveExplorerContext = createContext<DriveExplorerContextType | null>(null);

export interface DriveExplorerProviderProps {
  children: React.ReactNode;
  value?: DriveExplorerContextType;
  onRefreshQuota?: () => void;
}

/**
 * Shared Context Provider for Google Drive File Explorer and Directory Tree (Spec 007 US-3).
 * Enables parallel bidirectional navigation synchronization between the central table and directory tree.
 */
export const DriveExplorerProvider: React.FC<DriveExplorerProviderProps> = ({
  children,
  value,
  onRefreshQuota
}) => {
  const defaultExplorer = useDriveExplorer({ onRefreshQuota });
  return (
    <DriveExplorerContext.Provider value={value || defaultExplorer}>
      {children}
    </DriveExplorerContext.Provider>
  );
};

/**
 * Hook to access shared Drive Explorer state and navigation actions.
 * Falls back to standalone useDriveExplorer instance if rendered outside provider.
 */
export function useDriveExplorerContext(): DriveExplorerContextType {
  const ctx = useContext(DriveExplorerContext);
  if (!ctx) {
    return useDriveExplorer();
  }
  return ctx;
}
