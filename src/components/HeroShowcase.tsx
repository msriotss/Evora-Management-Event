import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Compass,
  Users,
  Flame,
  Gamepad2,
  Snowflake,
  Camera,
  LogIn,
} from 'lucide-react';
import { AvatarConfig } from '../types/evora';
import { ChibiAvatar } from './ChibiAvatar';

interface HeroShowcaseProps {
  avatar: AvatarConfig;
  userName: string | null;
  isAuthenticated: boolean;
  isFrozen: boolean;
  onExploreMap: () => void;
  onOpenAuth: (mode: 'login' | 'register', role?: 'peserta' | 'organizer') => void;
  onOpenGame: () => void;
  onOpenProfile: () => void;
  streakDays: number;
  monthlyHosted: number;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  avatar,
  userName,
  isAuthenticated,
  isFrozen,
  onExploreMap,
  onOpenAuth,
  onOpenGame,
  onOpenProfile,
  streakDays,
  monthlyHosted,
}) => {
  const [flashActive, setFlashActive] = useState(false);
  const [snapCount, setSnapCount] = useState(0);
  const flashTimerRef = useRef<number | null>(null);

  const displayName = userName?.trim() ? userName.trim() : 'Profil Kosong';

  const triggerPhotoSnap = () => {
    if (!isAuthenticated) return;
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    setFlashActive(true);
    setSnapCount((c) => c + 1);
    flashTimerRef.current = window.setTimeout(() => {
      setFlashActive(false);
    }, 820);
  };

  // Trigger camera flash + personalized greeting when entering website while authenticated or upon login
  useEffect(() => {
    if (!isAuthenticated) {
      setFlashActive(false);
      return;
    }
    const entryDelay = window.setTimeout(() => {
      triggerPhotoSnap();
    }, 320);
    return () => {
      window.clearTimeout(entryDelay);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, [isAuthenticated, userName]);

  const speechHeadline = isAuthenticated
    ? `Cekrek! Halo, ${displayName}!`
    : 'Profil Masih Kosong';

  const speechSub = isAuthenticated
    ? 'Siap seru-seruan & kejar streak?'
    : 'Yuk Sign In / Sign Up untuk buka avatarmu!';

  return (
    <section className="pt-6 pb-8 md:pt-10 md:pb-14 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Bold Pixel + Editorial Value Proposition (Always stays above layered phones) */}
          <div className="lg:col-span-6 relative z-30 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-[#377EC0]">
              {isFrozen ? (
                <Snowflake className="w-4 h-4 text-[#377EC0]" />
              ) : (
                <Flame className="w-4 h-4 text-[#F7891F]" />
              )}
              <span>
                {isFrozen ? 'Api Streak Beku' : 'Streak Panitia Menyala'} · {streakDays} Hari · {monthlyHosted} Event Bulan Ini
              </span>
            </div>

            <h1 className="font-pixel hero-text-stroke text-4xl sm:text-5xl lg:text-[54px] text-[#1E3A8A] tracking-tight leading-[1.1] text-balance">
              Temukan event seru, pantau jadwal, & kejar streak panitiamu!
            </h1>

            <p className="text-sm sm:text-base font-bold text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Eksplorasi lokasi konser, festival, dan workshop di Google Maps secara real-time, atur avatar panitia kustommu, dan raih streak bulanan ala TikTok.
            </p>

            {/* Primary + Secondary Actions (No caption row below per user request) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreMap}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-[#377EC0]/25 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Jelajahi Google Maps
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register', 'organizer')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-[#FFF4E5] text-slate-800 hover:text-[#F7891F] text-sm font-extrabold rounded-2xl border border-[#9FD2D6] shadow-md shadow-[#377EC0]/10 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#F7891F]" />
                Daftar Panitia
              </button>

              <button
                type="button"
                onClick={onOpenGame}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#FBDF54] hover:bg-[#F7891F] hover:text-white text-slate-900 text-sm font-extrabold rounded-2xl shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                Main Quest
              </button>
            </div>
          </div>

          {/* RIGHT: Clean Contained 3-Phone Layered Stack + Camera Entry Avatar */}
          <div className="lg:col-span-6 relative z-10">
            <div className="relative mx-auto w-full max-w-[490px] h-[410px] sm:h-[445px] flex items-center justify-center">
              {/* Soft Sky & Meadow Horizon */}
              <div
                className="absolute inset-x-0 bottom-0 h-28 rounded-[36px] bg-gradient-to-t from-[#9FD2D6]/60 via-[#E8F5FA]/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Brief Photographic Flash Glow Overlay on the Stage */}
              {isAuthenticated && flashActive && (
                <div
                  key={`flash-${snapCount}`}
                  className="pointer-events-none absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_24%_48%,rgba(255,255,255,0.95),rgba(251,223,84,0.4)_42%,transparent_72%)] z-40 camera-flash-burst"
                  aria-hidden="true"
                />
              )}

              {/* Speech Bubble Chat above Avatar Phone (Desktop/Tablet) */}
              <div
                key={`bubble-${snapCount}-${displayName}-${isAuthenticated}`}
                className="hidden sm:flex flex-col items-start absolute top-0 left-0 z-40 max-w-[240px] bg-white rounded-2xl px-3.5 py-2.5 shadow-xl shadow-[#377EC0]/20 border-2 border-[#377EC0] bubble-pop"
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-[11px] font-extrabold text-[#377EC0] flex items-center gap-1 truncate">
                    {isAuthenticated ? (
                      <Camera className="w-3.5 h-3.5 text-[#F7891F] shrink-0" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5 text-[#377EC0] shrink-0" />
                    )}
                    {speechHeadline}
                  </span>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerPhotoSnap();
                      }}
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-[#377EC0] shrink-0 cursor-pointer"
                      title="Potret ulang dengan flash"
                    >
                      Cekrek
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAuth('login', 'peserta');
                      }}
                      className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#377EC0] text-white shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-600 mt-0.5 leading-snug">
                  {speechSub}
                </p>
                {/* Bubble tail pointing down toward Phone 1 avatar */}
                <div
                  className="absolute -bottom-2 left-10 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#377EC0] rotate-45"
                  aria-hidden="true"
                />
              </div>

              {/* PHONE 1 (Layer Back-Left, z-10 — cleanly confined inside right column) */}
              <div
                role="button"
                tabIndex={0}
                onClick={isAuthenticated ? onOpenProfile : () => onOpenAuth('login', 'peserta')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isAuthenticated) {
                      onOpenProfile();
                    } else {
                      onOpenAuth('login', 'peserta');
                    }
                  }
                }}
                className="hidden sm:flex flex-col justify-between text-left absolute left-0 top-14 w-[164px] h-[302px] bg-white rounded-[28px] p-3 shadow-xl shadow-[#377EC0]/15 border border-[#9FD2D6]/70 -rotate-6 z-10 hover:z-40 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center pt-1">
                  <div className="w-28 h-36 flex items-center justify-center">
                    <ChibiAvatar
                      config={avatar}
                      mode="full"
                      softShadow
                      animateIdle
                      emptyProfile={!isAuthenticated}
                      isExpressing={isAuthenticated && flashActive}
                      holdingCamera={isAuthenticated}
                      cameraFlashActive={isAuthenticated && flashActive}
                      className="w-28 h-36"
                    />
                  </div>
                  <p className="font-pixel text-sm text-slate-900 mt-0.5 truncate w-full">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 leading-snug">
                    {isAuthenticated ? 'Klik untuk ganti gaya' : 'Sign In untuk isi profil'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-full py-1.5 rounded-xl bg-[#377EC0] text-white text-[10px] font-extrabold text-center">
                    {isAuthenticated ? 'Edit Avatar' : 'Masuk / Daftar'}
                  </div>
                  <p className="text-[9px] text-center text-[#12BAAA] font-extrabold">
                    {isAuthenticated
                      ? isFrozen
                        ? `Streak ${streakDays}d (Beku)`
                        : `Streak ${streakDays}d Menyala`
                      : 'Avatar belum aktif'}
                  </p>
                </div>
              </div>

              {/* PHONE 2 (Layer Center, z-20 — Winding Quest & Adventure Path) */}
              <button
                type="button"
                onClick={onOpenGame}
                className="relative z-20 w-[196px] sm:w-[208px] h-[348px] sm:h-[372px] bg-white rounded-[32px] p-2.5 shadow-2xl shadow-[#377EC0]/22 border border-[#9FD2D6]/80 hover:z-40 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-left flex flex-col"
              >
                <div className="flex-1 rounded-[24px] overflow-hidden bg-gradient-to-b from-[#9FD2D6] via-[#E8F5FA] to-[#12BAAA]/35 relative p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full bg-white text-[10px] font-extrabold shadow-sm tabular-nums flex items-center gap-1 ${
                        isFrozen ? 'text-[#377EC0]' : 'text-[#F7891F]'
                      }`}
                    >
                      {isFrozen ? (
                        <Snowflake className="w-3 h-3 text-[#377EC0]" />
                      ) : (
                        <Flame className="w-3 h-3 fill-[#F7891F]" />
                      )}
                      {streakDays}d
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-[#377EC0]" />
                    </span>
                  </div>

                  {/* Winding Path SVG */}
                  <svg viewBox="0 0 180 220" className="w-full h-44 my-auto" aria-hidden="true">
                    <path
                      d="M 40 200 C 120 180, 30 130, 110 100 C 170 75, 50 40, 100 15"
                      fill="none"
                      stroke="#FBDF54"
                      strokeWidth="22"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 40 200 C 120 180, 30 130, 110 100 C 170 75, 50 40, 100 15"
                      fill="none"
                      stroke="#F7891F"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                    />
                    <rect x="20" y="55" width="38" height="32" rx="8" fill="#F04F52" />
                    <rect x="115" y="130" width="42" height="34" rx="8" fill="#5460AC" />
                    <circle cx="105" cy="96" r="14" fill="#377EC0" />
                    <circle cx="105" cy="96" r="6" fill="#FFF" />
                    <circle cx="48" cy="182" r="12" fill="#12BAAA" />
                    <circle cx="48" cy="182" r="5" fill="#FFF" />
                  </svg>

                  <div className="bg-white/95 rounded-2xl p-2 flex items-center justify-between text-[9px] font-extrabold text-slate-700 shadow-sm">
                    <span className="text-[#377EC0]">Peta</span>
                    <span>Streak</span>
                    <span>Quest</span>
                    <span>Tiket</span>
                  </div>
                </div>
              </button>

              {/* PHONE 3 (Layer Front-Right, z-30 — Nearest Venue & Google Maps) */}
              <button
                type="button"
                onClick={onExploreMap}
                className="hidden sm:flex flex-col justify-between text-left absolute right-0 bottom-3 w-[168px] h-[304px] bg-white rounded-[28px] p-2.5 shadow-2xl shadow-[#377EC0]/20 border border-[#9FD2D6]/70 rotate-6 z-30 hover:z-40 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="flex-1 rounded-[20px] bg-[#E8F5FA] relative overflow-hidden p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-slate-900">
                      Google Maps
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-[#F04F52]" />
                  </div>

                  <svg viewBox="0 0 140 110" className="w-full h-24" aria-hidden="true">
                    <path d="M0 30 L140 50" stroke="#FFF" strokeWidth="10" />
                    <path d="M50 0 L70 110" stroke="#FFF" strokeWidth="10" />
                    <path d="M0 80 Q70 65 140 85" stroke="#9FD2D6" strokeWidth="12" fill="none" />
                    <circle cx="72" cy="54" r="24" fill="#377EC0" fillOpacity="0.18" />
                    <circle cx="72" cy="54" r="5" fill="#377EC0" />
                    <circle cx="34" cy="36" r="8" fill="#F04F52" />
                    <circle cx="110" cy="40" r="8" fill="#F7891F" />
                  </svg>

                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#9FD2D6]/50 space-y-0.5">
                    <p className="text-[8px] font-extrabold text-[#377EC0] uppercase">
                      Event Aktif
                    </p>
                    <p className="font-pixel text-xs text-slate-900 truncate">
                      Pastel Creative Fest
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 tabular-nums">
                      12 Des 2026 · Jakarta
                    </p>
                    <div className="pt-0.5 flex items-center justify-between text-[10px] font-extrabold text-[#377EC0]">
                      <span>Buka Peta</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Mobile Avatar Card + Greeting Bubble */}
            <div className="sm:hidden mt-4 bg-white/95 rounded-[26px] p-3.5 shadow-lg shadow-[#377EC0]/15 border border-[#9FD2D6] flex items-center gap-3">
              <button
                type="button"
                onClick={isAuthenticated ? onOpenProfile : () => onOpenAuth('login', 'peserta')}
                aria-label="Buka profil avatar"
                className="shrink-0 cursor-pointer"
              >
                <ChibiAvatar
                  config={avatar}
                  mode="full"
                  softShadow
                  animateIdle
                  emptyProfile={!isAuthenticated}
                  isExpressing={isAuthenticated && flashActive}
                  holdingCamera={isAuthenticated}
                  cameraFlashActive={isAuthenticated && flashActive}
                  className="w-24 h-28"
                />
              </button>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="bg-[#E8F5FA] rounded-2xl px-3 py-2 border border-[#9FD2D6] bubble-pop">
                  <p className="text-xs font-extrabold text-[#377EC0] flex items-center gap-1 truncate">
                    {isAuthenticated ? (
                      <Camera className="w-3.5 h-3.5 text-[#F7891F] shrink-0" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5 text-[#377EC0] shrink-0" />
                    )}
                    {speechHeadline}
                  </p>
                  <p className="text-[11px] font-bold text-slate-600">{speechSub}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={triggerPhotoSnap}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FBDF54] text-slate-900 text-[11px] font-extrabold cursor-pointer"
                      >
                        Cekrek Ulang
                      </button>
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="px-2.5 py-1.5 rounded-xl bg-[#377EC0] text-white text-[11px] font-extrabold cursor-pointer"
                      >
                        Edit Profil
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAuth('login', 'peserta')}
                      className="px-3 py-1.5 rounded-xl bg-[#377EC0] text-white text-[11px] font-extrabold cursor-pointer"
                    >
                      Sign In / Sign Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
