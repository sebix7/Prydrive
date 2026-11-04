import React from 'react';
import googleDriveLogo from '../../assets/google-drive.png';

export interface GoogleDriveLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * Official Google Drive logo brand asset provided for Prydrive.
 */
export const GoogleDriveLogo: React.FC<GoogleDriveLogoProps> = ({
  className = 'w-5 h-5',
  size,
  alt = 'Google Drive'
}) => {
  return (
    <img
      src={googleDriveLogo}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
};
