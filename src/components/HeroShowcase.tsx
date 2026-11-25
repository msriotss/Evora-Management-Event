import React from 'react';
import { MapPin, Calendar, ArrowRight, Compass, Users, Flame, Gamepad2 } from 'lucide-react';
import { EvoraHeroMascot } from './EvoraMascots';

interface HeroShowcaseProps {
  onExploreMap: () => void;
  onOpenAuth: (mode: 'login' | 'register', role?: 'peserta' | 'organizer') => void;
  onOpenGame: () => void;
  publishedCount: number;
  streakDays: number;
  monthlyHosted: number;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  onExploreMap,
  onOpenAuth,
  onOpenGame,
  publishedCount,
  streakDays,
  monthlyHosted,
}) => {
  return (
    <section className="pt-8 pb-10 md:pt-12 md:pb-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT: Bold Pixel + Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-[#377EC0]">
              <Flame className="w-4 h-4 text-[#F7891F]" />
              <span>Streak Panitia Aktif · {streakDays} Hari · {monthlyHosted} Event Bulan Ini</span>
            </div>

            <h1 className="font-pixel text-4xl sm:text-5xl lg:text-[54px] text-slate-900 tracking-tight leading-[1.08] text-balance">
              Temukan event seru, pantau jadwal, & kejar streak panitiamu!
            </h1>

            <p className="text-sm sm:text-base font-bold text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Eksplorasi lokasi konser, festival, dan workshop di Google Maps interaktif, daftar jadi panitia dengan streak bulanan ala TikTok, serta mainkan EVORA Panitia Rush.
            </p>

            {/* Primary + Secondary Actions */}
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

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-slate-500 pt-1">
              <span className="tabular-nums">{publishedCount} Event Aktif</span>
              <span aria-hidden="true">·</span>
              <span>Google Maps Lokasi</span>
              <span aria-hidden="true">·</span>
              <span>Streak Bulanan & E-Tiket QR</span>
            </div>
          </div>

          {/* RIGHT: 3-Phone Illustrated Showcase (Blue & Bright Rainbow Palette) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[540px] h-[390px] sm:h-[440px] flex items-center justify-center">
              {/* Soft Sky & Meadow Horizon */}
              <div
                className="absolute inset-x-0 bottom-0 h-28 rounded-[36px] bg-gradient-to-t from-[#9FD2D6]/60 via-[#E8F5FA]/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* PHONE 1 (Left-Back): Login & Streak */}
              <button
                type="button"
                onClick={() => onOpenAuth('login', 'peserta')}
                className="hidden sm:flex flex-col justify-between text-left w-[175px] h-[320px] bg-white rounded-[30px] p-3.5 shadow-xl shadow-[#377EC0]/15 border border-[#9FD2D6]/60 -rotate-6 -translate-x-36 -translate-y-4 hover:-translate-y-6 transition-transform duration-300 z-10 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="scale-75 -my-2">
                    <EvoraHeroMascot />
                  </div>
                  <p className="font-pixel text-sm text-slate-900 mt-1">
                    Mulai di EVORA
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 leading-snug mt-1">
                    Login peserta, panitia, atau admin.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full py-2 rounded-xl bg-[#377EC0] text-white text-[10px] font-extrabold text-center">
                    Masuk / Daftar
                  </div>
                  <p className="text-[9px] text-center text-[#12BAAA] font-extrabold">
                    Streak {streakDays} Hari Aktif
                  </p>
                </div>
              </button>

              {/* PHONE 2 (Center): Winding Quest & Adventure Path */}
              <button
                type="button"
                onClick={onOpenGame}
                className="relative w-[210px] sm:w-[220px] h-[360px] sm:h-[385px] bg-white rounded-[34px] p-2.5 shadow-2xl shadow-[#377EC0]/20 border border-[#9FD2D6]/70 z-20 hover:-translate-y-1.5 transition-transform duration-300 cursor-pointer text-left flex flex-col"
              >
                <div className="flex-1 rounded-[26px] overflow-hidden bg-gradient-to-b from-[#9FD2D6] via-[#E8F5FA] to-[#12BAAA]/35 relative p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white text-[10px] font-extrabold text-[#F7891F] shadow-sm tabular-nums flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-[#F7891F]" /> {streakDays}d
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

              {/* PHONE 3 (Right-Front): Nearest Venue & Google Maps */}
              <button
                type="button"
                onClick={onExploreMap}
                className="hidden sm:flex flex-col justify-between text-left w-[185px] h-[325px] bg-white rounded-[30px] p-2.5 shadow-2xl shadow-[#377EC0]/20 border border-[#9FD2D6]/60 rotate-6 translate-x-36 translate-y-6 hover:translate-y-4 transition-transform duration-300 z-30 cursor-pointer"
              >
                <div className="flex-1 rounded-[22px] bg-[#E8F5FA] relative overflow-hidden p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-slate-900">
                      Google Maps
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-[#F04F52]" />
                  </div>

                  <svg viewBox="0 0 140 110" className="w-full h-28" aria-hidden="true">
                    <path d="M0 30 L140 50" stroke="#FFF" strokeWidth="10" />
                    <path d="M50 0 L70 110" stroke="#FFF" strokeWidth="10" />
                    <path d="M0 80 Q70 65 140 85" stroke="#9FD2D6" strokeWidth="12" fill="none" />
                    <circle cx="72" cy="54" r="24" fill="#377EC0" fillOpacity="0.18" />
                    <circle cx="72" cy="54" r="5" fill="#377EC0" />
                    <circle cx="34" cy="36" r="8" fill="#F04F52" />
                    <circle cx="110" cy="40" r="8" fill="#F7891F" />
                  </svg>

                  <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-[#9FD2D6]/50 space-y-1">
                    <p className="text-[9px] font-extrabold text-[#377EC0] uppercase">
                      Event Aktif
                    </p>
                    <p className="font-pixel text-xs text-slate-900 truncate">
                      Pastel Creative Fest
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 tabular-nums">
                      12 Des 2026 · Jakarta
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-extrabold text-[#377EC0]">
                      <span>Buka Peta</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
