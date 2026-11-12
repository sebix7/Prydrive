import React from 'react';

export interface MegaLogoProps {
  className?: string;
  size?: number;
}

export const MegaLogo: React.FC<MegaLogoProps> = ({
  className = 'w-4 h-4',
  size
}) => {
  return (
    <svg
      viewBox="119.5 239.5 721 721"
      width={size}
      height={size}
      className={`select-none pointer-events-none ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="480" cy="600" r="360.5" fill="#D31B00" />
      <path
        fill="#FFFFFF"
        d="M267 454h85l128 130 129-130h82v293h-86V577.25L500.334 682h-40.668L355 577.25V747h-88z"
      />
    </svg>
  );
};
