import React from 'react';

export type UserRole = 'peserta' | 'organizer' | 'admin';

export const EvoraHeroMascot: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
      {/* Soft Organic Blob Backdrop */}
      <svg
        className="absolute inset-0 w-full h-full text-violet-100"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M47.5,12.5 C66,8 86,21 88,41 C90,61 75,84 53,87 C31,90 12,73 11,51 C10,29 29,17 47.5,12.5 Z" />
      </svg>
      {/* Cute Calendar-Event Character */}
      <svg
        className="relative w-14 h-14 drop-shadow-sm"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <rect x="10" y="14" width="44" height="40" rx="13" fill="#7C3AED" />
        <rect x="18" y="8" width="6" height="10" rx="3" fill="#C4B5FD" />
        <rect x="40" y="8" width="6" height="10" rx="3" fill="#C4B5FD" />
        <ellipse cx="24" cy="34" rx="3.5" ry="4.5" fill="#FFF" />
        <circle cx="24" cy="34" r="2.2" fill="#1E1B4B" />
        <circle cx="23.2" cy="32.8" r="0.9" fill="#FFF" />
        <ellipse cx="40" cy="34" rx="3.5" ry="4.5" fill="#FFF" />
        <circle cx="40" cy="34" r="2.2" fill="#1E1B4B" />
        <circle cx="39.2" cy="32.8" r="0.9" fill="#FFF" />
        <circle cx="18" cy="39" r="2.5" fill="#F472B6" opacity="0.7" />
        <circle cx="46" cy="39" r="2.5" fill="#F472B6" opacity="0.7" />
        <path
          d="M29 39c1.5 2 4.5 2 6 0"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M51 15l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z"
          fill="#FDE047"
        />
      </svg>
    </div>
  );
};

export const PeekingMascots: React.FC = () => {
  return (
    <div
      className="pt-4 flex justify-center items-end gap-2 opacity-90 pointer-events-none select-none overflow-hidden h-14 -mb-5"
      aria-hidden="true"
    >
      {/* Pink Mini Character */}
      <svg className="w-11 h-11 translate-y-1" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="26" r="18" fill="#F9A8D4" />
        <circle cx="18" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="30" cy="23" r="2.2" fill="#1E1B4B" />
        <path
          d="M21 27c1.5 1.5 4.5 1.5 6 0"
          stroke="#1E1B4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {/* Orange Mini Character */}
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="8" width="36" height="36" rx="14" fill="#FB923C" />
        <circle cx="18" cy="22" r="2.4" fill="#1E1B4B" />
        <circle cx="30" cy="22" r="2.4" fill="#1E1B4B" />
        <path
          d="M21 27c1.5 1.5 4.5 1.5 6 0"
          stroke="#1E1B4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {/* Mint Mini Character */}
      <svg className="w-11 h-11 translate-y-1" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="26" r="18" fill="#5EEAD4" />
        <circle cx="18" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="30" cy="23" r="2.2" fill="#1E1B4B" />
        <path
          d="M21 27c1.5 1.5 4.5 1.5 6 0"
          stroke="#1E1B4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const RoleMascot: React.FC<{ role: UserRole; className?: string }> = ({
  role,
  className = 'w-9 h-9',
}) => {
  if (role === 'peserta') {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="36" height="28" rx="10" fill="#F472B6" />
        <circle cx="18" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="30" cy="23" r="2.2" fill="#1E1B4B" />
        <path
          d="M21 28c1.5 1.5 4.5 1.5 6 0"
          stroke="#1E1B4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (role === 'organizer') {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="18" fill="#FB923C" />
        <circle cx="18" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="30" cy="23" r="2.2" fill="#1E1B4B" />
        <path
          d="M21 28c1.5 1.5 4.5 1.5 6 0"
          stroke="#1E1B4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6L41 18L35 39H13L7 18L24 6Z" fill="#8B5CF6" />
      <circle cx="18" cy="23" r="2.2" fill="#FFF" />
      <circle cx="30" cy="23" r="2.2" fill="#FFF" />
      <path
        d="M21 28c1.5 1.5 4.5 1.5 6 0"
        stroke="#FFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
