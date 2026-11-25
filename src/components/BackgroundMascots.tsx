import React from 'react';

export const BackgroundMascots: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Kamera (Kiri Atas) */}
      <div
        className="absolute top-[7%] left-[4%] w-28 h-28 blur-[4.5px] opacity-60 float-a"
        style={{ '--r': '-12deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="12" y="24" width="56" height="40" rx="12" fill="#377EC0" />
          <rect x="28" y="16" width="24" height="10" rx="4" fill="#9FD2D6" />
          <circle cx="40" cy="44" r="13" fill="#FFF" />
          <circle cx="40" cy="44" r="8" fill="#5460AC" />
          <circle cx="37" cy="41" r="2.5" fill="#9FD2D6" />
          <circle cx="57" cy="32" r="3" fill="#FBDF54" />
        </svg>
      </div>

      {/* 2. Mic Panggung (Kanan Atas) */}
      <div
        className="absolute top-[9%] right-[5%] w-24 h-24 blur-[4.5px] opacity-60 float-b"
        style={{ '--r': '14deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="46" cy="28" r="14" fill="#F7891F" />
          <path d="M36 22l20 12" stroke="#FBDF54" strokeWidth="3" strokeLinecap="round" />
          <rect
            x="22"
            y="36"
            width="12"
            height="28"
            rx="5"
            transform="rotate(35 22 36)"
            fill="#5460AC"
          />
          <circle cx="58" cy="18" r="3.5" fill="#FBDF54" />
        </svg>
      </div>

      {/* 3. Baju / Kaos Panitia (Kiri Bawah) */}
      <div
        className="absolute bottom-[9%] left-[5%] w-28 h-28 blur-[5px] opacity-55 float-b"
        style={{ '--r': '10deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M24 18L10 28L16 40L24 35V64H56V35L64 40L70 28L56 18C52 24 46 26 40 26C34 26 28 24 24 18Z"
            fill="#F04F52"
          />
          <circle cx="40" cy="43" r="6" fill="#FBDF54" />
        </svg>
      </div>

      {/* 4. Kalender Event (Kanan Bawah) */}
      <div
        className="absolute bottom-[10%] right-[5%] w-26 h-26 blur-[4.5px] opacity-60 float-a"
        style={{ '--r': '-10deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="14" y="18" width="52" height="48" rx="14" fill="#5460AC" />
          <rect x="14" y="18" width="52" height="16" rx="8" fill="#377EC0" />
          <rect x="24" y="11" width="7" height="13" rx="3.5" fill="#9FD2D6" />
          <rect x="49" y="11" width="7" height="13" rx="3.5" fill="#9FD2D6" />
          <rect x="24" y="40" width="10" height="10" rx="3" fill="#FBDF54" />
          <rect x="46" y="40" width="10" height="10" rx="3" fill="#12BAAA" />
        </svg>
      </div>

      {/* 5. Waktu / Jam Countdown (Tengah Atas) */}
      <div
        className="absolute top-[5%] left-[46%] w-20 h-20 blur-[5.5px] opacity-50 float-a"
        style={{ '--r': '16deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="42" r="24" fill="#12BAAA" />
          <circle cx="40" cy="42" r="17" fill="#FFF" opacity="0.85" />
          <rect x="35" y="11" width="10" height="6" rx="3" fill="#377EC0" />
          <path
            d="M40 31V42L48 47"
            stroke="#5460AC"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 6. Tiket / Star Badge (Tengah Kiri) */}
      <div
        className="hidden lg:block absolute top-[45%] left-[2%] w-20 h-20 blur-[5.5px] opacity-45 float-b"
        style={{ '--r': '-16deg' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="10" y="22" width="60" height="36" rx="10" fill="#FBDF54" />
          <circle cx="10" cy="40" r="6" fill="#E8F5FA" />
          <circle cx="70" cy="40" r="6" fill="#E8F5FA" />
          <path
            d="M40 31l2.5 5 5.5.8-4 3.9.9 5.5L40 43.6l-4.9 2.6.9-5.5-4-3.9 5.5-.8z"
            fill="#F7891F"
          />
        </svg>
      </div>
    </div>
  );
};
