import React from 'react';

interface StreakFlameBadgeProps {
  isFrozen: boolean;
  days: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakFlameBadge: React.FC<StreakFlameBadgeProps> = ({
  isFrozen,
  days,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'w-12 h-12 rounded-xl'
      : size === 'lg'
      ? 'w-24 h-24 rounded-[26px]'
      : 'w-16 h-16 rounded-2xl';

  const svgSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';

  return (
    <div
      className={`${sizeClasses} relative flex flex-col items-center justify-center shrink-0 transition-all duration-300 ${
        isFrozen
          ? 'bg-gradient-to-br from-[#E8F5FA] via-[#9FD2D6] to-[#377EC0] shadow-lg shadow-[#377EC0]/25 ring-2 ring-[#9FD2D6]'
          : 'bg-gradient-to-br from-[#FBDF54] via-[#F7891F] to-[#F04F52] shadow-lg shadow-[#F7891F]/30'
      }`}
      title={isFrozen ? 'Api Streak Beku (Gunakan Token Es / Selesaikan Misi)' : 'Api Streak Masih Menyala!'}
    >
      <svg viewBox="0 0 64 64" className={svgSize} aria-hidden="true">
        {isFrozen ? (
          <g>
            {/* Ice Crystal Encasement */}
            <polygon
              points="32,4 54,22 50,50 32,60 14,50 10,22"
              fill="#9FD2D6"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Frozen Flame Core */}
            <path
              d="M32 14 C38 22, 44 28, 43 38 C42 46, 37 51, 32 51 C27 51, 22 46, 21 38 C20 30, 26 26, 27 21 C29 24, 31 24, 32 14 Z"
              fill="#377EC0"
              stroke="#E8F5FA"
              strokeWidth="2"
            />
            <path
              d="M32 28 C35 33, 37 37, 36 42 C35 46, 33 48, 32 48 C30 48, 28 46, 27 42 C27 37, 30 33, 32 28 Z"
              fill="#E8F5FA"
            />
            {/* Frost Facets & Snowflakes */}
            <path d="M16 24 L26 30 L18 42" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="15" cy="14" r="2.2" fill="#FFFFFF" />
            <circle cx="49" cy="16" r="2" fill="#FFFFFF" />
            <circle cx="47" cy="48" r="2.2" fill="#FFFFFF" />
          </g>
        ) : (
          <g>
            {/* Floating Sparks */}
            <circle cx="18" cy="14" r="2.4" fill="#FFFBEB" />
            <circle cx="48" cy="18" r="2" fill="#FBDF54" />
            {/* Outer Flame */}
            <path
              d="M33 6 C41 16, 51 24, 49 38 C48 49, 40 57, 32 57 C23 57, 15 49, 15 37 C15 28, 22 22, 24 14 C27 18, 30 16, 33 6 Z"
              fill="#F04F52"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* Mid Flame */}
            <path
              d="M32 17 C38 24, 44 30, 43 40 C42 48, 37 53, 32 53 C26 53, 21 48, 21 39 C21 32, 26 28, 28 22 C30 24, 31 23, 32 17 Z"
              fill="#F7891F"
            />
            {/* Inner Bright Core */}
            <path
              d="M32 30 C36 35, 38 39, 37 45 C36 49, 34 51, 32 51 C29 51, 27 49, 27 44 C27 39, 30 35, 32 30 Z"
              fill="#FBDF54"
            />
          </g>
        )}
      </svg>

      <span
        className={`font-pixel leading-none mt-0.5 tabular-nums ${
          size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'
        } ${isFrozen ? 'text-[#1E3A8A]' : 'text-white'}`}
      >
        {days}d
      </span>
    </div>
  );
};
