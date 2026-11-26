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
      className={`${sizeClasses} relative flex flex-col items-center justify-center shrink-0 overflow-hidden border-2 transition-all duration-700 ease-in-out ${
        isFrozen
          ? 'bg-gradient-to-br from-[#E8F5FA] via-[#9FD2D6] to-[#377EC0] border-[#377EC0]/45 flame-glow-frozen'
          : 'bg-gradient-to-br from-[#FBDF54] via-[#F7891F] to-[#F04F52] border-[#F7891F] flame-glow-burning'
      }`}
      title={
        isFrozen
          ? 'Api Belum Menyala — Daftar akun & ikut kepanitiaan untuk menyalakan api!'
          : 'Api Streak Panitia Menyala!'
      }
    >
      {/* Cross-fading Burning vs Frozen SVG Container */}
      <div className={`relative ${svgSize} flex items-center justify-center`}>
        {/* Burning Flame Layer */}
        <svg
          viewBox="0 0 64 64"
          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
            isFrozen ? 'opacity-0 scale-75 rotate-6' : 'opacity-100 scale-100 rotate-0'
          }`}
          aria-hidden="true"
        >
          <circle cx="18" cy="14" r="2.4" fill="#FFFBEB" />
          <circle cx="48" cy="18" r="2" fill="#FBDF54" />
          <path
            d="M33 6 C41 16, 51 24, 49 38 C48 49, 40 57, 32 57 C23 57, 15 49, 15 37 C15 28, 22 22, 24 14 C27 18, 30 16, 33 6 Z"
            fill="#F04F52"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <path
            d="M32 17 C38 24, 44 30, 43 40 C42 48, 37 53, 32 53 C26 53, 21 48, 21 39 C21 32, 26 28, 28 22 C30 24, 31 23, 32 17 Z"
            fill="#F7891F"
          />
          <path
            d="M32 30 C36 35, 38 39, 37 45 C36 49, 34 51, 32 51 C29 51, 27 49, 27 44 C27 39, 30 35, 32 30 Z"
            fill="#FBDF54"
          />
        </svg>

        {/* Frozen Ice-Crystal Flame Layer */}
        <svg
          viewBox="0 0 64 64"
          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
            isFrozen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-110 -rotate-6'
          }`}
          aria-hidden="true"
        >
          <polygon
            points="32,4 54,22 50,50 32,60 14,50 10,22"
            fill="#BAE6FD"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
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
          <path d="M16 24 L26 30 L18 42" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="14" r="2.2" fill="#FFFFFF" />
          <circle cx="49" cy="16" r="2" fill="#FFFFFF" />
          <circle cx="47" cy="48" r="2.2" fill="#FFFFFF" />
        </svg>
      </div>

      <span
        className={`relative z-10 font-arcade leading-none mt-0.5 tabular-nums transition-colors duration-700 ${
          size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-[11px]'
        } ${isFrozen ? 'text-[#0F2347]' : 'text-white'}`}
      >
        {days}d
      </span>
    </div>
  );
};
