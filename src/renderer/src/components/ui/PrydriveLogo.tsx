import React from 'react';

export interface PrydriveLogoProps {
  className?: string;
  cutoutColor?: string;
}

/**
 * Custom SVG icon representing the Prydrive brand mark ("P").
 * Dynamically adapts its inner cutout fill across active/inactive states in Light and Dark modes.
 */
export const PrydriveLogo: React.FC<PrydriveLogoProps> = ({
  className = 'w-5 h-5',
  cutoutColor = '#15181E'
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
    <path
      d="M7 6H13.5C15.9853 6 18 8.01472 18 10.5C18 12.9853 15.9853 15 13.5 15H10V18.5H7V6Z"
      fill="currentColor"
    />
    <circle cx="13" cy="10.5" r="2" fill={cutoutColor} data-testid="prydrive-logo-cutout" />
  </svg>
);
