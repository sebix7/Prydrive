import React from 'react';
import type { ThemeMode } from '../../../../shared/types';

export interface PrydriveWordmarkProps {
  className?: string;
  theme?: ThemeMode;
  'aria-label'?: string;
  id?: string;
}

/**
 * Custom SVG Wordmark representing the Prydrive brand identity ("PRYDRIVE").
 * - First 4 glyphs ("PRYD"): Klein Blue (#1B44E8) in light mode, Electric Blue (#3B66FF) in dark mode.
 * - Last 4 glyphs ("RIVE"): Solid Black (#111315) in light mode, Pure White (#FFFFFF) in dark mode.
 * Geometrically aligned with the Bauhaus/Swiss grotesque architecture of the favicon mark.
 */
export const PrydriveWordmark: React.FC<PrydriveWordmarkProps> = ({
  className = 'h-7 w-auto',
  theme,
  'aria-label': ariaLabel = 'Prydrive',
  id
}) => {
  const prydFill = theme === 'dark' ? '#3B66FF' : theme === 'light' ? '#1B44E8' : undefined;
  const riveFill = theme === 'dark' ? '#FFFFFF' : theme === 'light' ? '#111315' : undefined;

  return (
    <svg
      id={id}
      viewBox="0 0 95 15.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      {/* PRYD - Brand Blue */}
      <g
        fill={prydFill}
        className={!theme ? 'fill-[#1B44E8] dark:fill-[#3B66FF]' : undefined}
        fillRule="evenodd"
        data-testid="prydrive-wordmark-pryd"
      >
        {/* P */}
        <path d="M0 1.5 H6.5 C8.9853 1.5 11 3.5147 11 6 C11 8.4853 8.9853 10.5 6.5 10.5 H3 V14 H0 V1.5 Z M6 4 A 2 2 0 1 0 6 8 A 2 2 0 1 0 6 4 Z" />
        {/* R */}
        <path d="M13 1.5 H19.5 C21.8 1.5 23.5 3.2 23.5 5.5 C23.5 7.4 22.2 8.9 20.3 9.3 L24.5 14 H21 L17.2 9.5 H16 V14 H13 V1.5 Z M18.8 4 H16 V7 H18.8 C19.7 7 20.5 6.3 20.5 5.5 C20.5 4.7 19.7 4 18.8 4 Z" />
        {/* Y */}
        <path d="M26.5 1.5 H29.8 L32 6.2 L34.2 1.5 H37.5 L33.5 8.5 V14 H30.5 V8.5 L26.5 1.5 Z" />
        {/* D */}
        <path d="M39.5 1.5 H45 C48.5 1.5 51.5 4.3 51.5 7.75 C51.5 11.2 48.5 14 45 14 H39.5 V1.5 Z M42.5 4 V11.5 H44.8 C46.8 11.5 48.5 9.8 48.5 7.75 C48.5 5.7 46.8 4 44.8 4 H42.5 Z" />
      </g>

      {/* RIVE - Neutral (White in Dark mode, Black in Light mode) */}
      <g
        fill={riveFill}
        className={!theme ? 'fill-[#111315] dark:fill-[#FFFFFF]' : undefined}
        fillRule="evenodd"
        data-testid="prydrive-wordmark-rive"
      >
        {/* R */}
        <path d="M53.5 1.5 H60 C62.3 1.5 64 3.2 64 5.5 C64 7.4 62.7 8.9 60.8 9.3 L65 14 H61.5 L57.7 9.5 H56.5 V14 H53.5 V1.5 Z M59.3 4 H56.5 V7 H59.3 C60.2 7 61 6.3 61 5.5 C61 4.7 60.2 4 59.3 4 Z" />
        {/* I */}
        <path d="M67 1.5 H70 V14 H67 V1.5 Z" />
        {/* V */}
        <path d="M72 1.5 H75.2 L77.5 9.5 L79.8 1.5 H83 L79 14 H76 L72 1.5 Z" />
        {/* E */}
        <path d="M85 1.5 H95 V4 H88 V6.5 H94 V9 H88 V11.5 H95 V14 H85 V1.5 Z" />
      </g>
    </svg>
  );
};
