import React from 'react';

export const BackgroundMascots: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Cute Pink Cloud/Flower Character (Kiri Atas) */}
      <div
        className="absolute top-[7%] left-[4%] w-28 h-28 blur-[6px] opacity-65 float-a"
        style={{ '--r': '-10deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M24 22c6-8 18-8 24 0 10-2 18 6 16 16 7 7 5 19-4 23-6 9-20 9-26 0-10-3-13-15-6-23-3-9 5-18 16-16z"
            fill="#F9A8D4"
          />
          <ellipse cx="32" cy="40" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="31" cy="38.5" r="1.2" fill="#FFF" />
          <ellipse cx="48" cy="40" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="47" cy="38.5" r="1.2" fill="#FFF" />
          <circle cx="26" cy="44" r="3" fill="#F472B6" opacity="0.6" />
          <circle cx="54" cy="44" r="3" fill="#F472B6" opacity="0.6" />
          <path
            d="M37 44c1.5 2 4.5 2 6 0"
            stroke="#1E1B4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 2. Cute Orange Circle Ticket/Event Character (Kanan Atas) */}
      <div
        className="absolute top-[9%] right-[5%] w-24 h-24 blur-[5px] opacity-65 float-b"
        style={{ '--r': '12deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="28" fill="#FB923C" />
          <ellipse cx="31" cy="39" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="30" cy="37.5" r="1.2" fill="#FFF" />
          <ellipse cx="49" cy="39" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="48" cy="37.5" r="1.2" fill="#FFF" />
          <path
            d="M36 45c2 2.5 6 2.5 8 0"
            stroke="#1E1B4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M54 20l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"
            fill="#FDE047"
          />
        </svg>
      </div>

      {/* 3. Cute Blue Pentagon Star Character (Kiri Bawah) */}
      <div
        className="absolute bottom-[8%] left-[6%] w-28 h-28 blur-[6px] opacity-60 float-b"
        style={{ '--r': '8deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M40 12L66 31L56 62H24L14 31L40 12Z"
            fill="#60A5FA"
            stroke="#60A5FA"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <ellipse cx="32" cy="40" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="31" cy="38.5" r="1.2" fill="#FFF" />
          <ellipse cx="48" cy="40" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="47" cy="38.5" r="1.2" fill="#FFF" />
          <path
            d="M37 45c1.5 2 4.5 2 6 0"
            stroke="#1E1B4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 4. Cute Mint Square Character (Kanan Bawah) */}
      <div
        className="absolute bottom-[10%] right-[6%] w-24 h-24 blur-[5.5px] opacity-65 float-a"
        style={{ '--r': '-12deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="15" y="15" width="50" height="50" rx="16" fill="#5EEAD4" />
          <ellipse cx="32" cy="39" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="31" cy="37.5" r="1.2" fill="#FFF" />
          <ellipse cx="48" cy="39" rx="3.5" ry="4.5" fill="#1E1B4B" />
          <circle cx="47" cy="37.5" r="1.2" fill="#FFF" />
          <circle cx="25" cy="44" r="2.8" fill="#14B8A6" opacity="0.5" />
          <circle cx="55" cy="44" r="2.8" fill="#14B8A6" opacity="0.5" />
          <path
            d="M37 44c1.5 2 4.5 2 6 0"
            stroke="#1E1B4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 5. Cute Yellow Ticket/Smile Character (Tengah Atas Samar) */}
      <div
        className="absolute top-[6%] left-[47%] w-20 h-20 blur-[7px] opacity-50 float-a"
        style={{ '--r': '14deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="14" y="20" width="52" height="40" rx="14" fill="#FCD34D" />
          <ellipse cx="32" cy="39" rx="3" ry="4" fill="#1E1B4B" />
          <ellipse cx="48" cy="39" rx="3" ry="4" fill="#1E1B4B" />
          <path
            d="M37 44c1.5 2 4.5 2 6 0"
            stroke="#1E1B4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
