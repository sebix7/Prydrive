import React from 'react';
import type { ThemeMode } from '../../../../shared/types';

export interface PrydriveLogoProps {
  className?: string;
  cutoutColor?: string;
  theme?: ThemeMode;
}

/**
 * Custom SVG icon representing the Prydrive brand mark ("P").
 * Renders the official favicon identity mark: crisp white rounded card tile with the brand blue "P".
 */
export const PrydriveLogo: React.FC<PrydriveLogoProps> = ({
  className = 'w-5 h-5',
  cutoutColor = '#FFFFFF',
  theme
}) => {
  const letterFill = theme === 'dark' ? '#3B66FF' : theme === 'light' ? '#1B44E8' : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Crisp White Card Tile with subtle border in light mode */}
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="5.5"
        fill="#FFFFFF"
        stroke="#C9C6BD"
        strokeOpacity="0.6"
        className="dark:stroke-transparent"
      />
      {/* Brand Blue "P" glyph */}
      <path
        d="M7 6H13.5C15.9853 6 18 8.01472 18 10.5C18 12.9853 15.9853 15 13.5 15H10V18.5H7V6ZM13 8.5A2 2 0 1 0 13 12.5A2 2 0 1 0 13 8.5Z"
        fill={letterFill}
        className={!theme ? 'fill-[#1B44E8] dark:fill-[#3B66FF]' : undefined}
        fillRule="evenodd"
      />
      {/* Inner circular cutout of "P" is always white across both light and dark themes */}
      <circle cx="13" cy="10.5" r="2" fill="#FFFFFF" data-testid="prydrive-logo-cutout" />
    </svg>
  );
};
