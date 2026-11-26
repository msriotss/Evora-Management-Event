import React from 'react';
import { LogIn, Sparkles, MapPin, Flame, ArrowRight, Flag } from 'lucide-react';

interface AppRoadmapPathProps {
  onStepLogin: () => void;
  onStepProfile: () => void;
  onStepMap: () => void;
  onStepStreak: () => void;
}

export const AppRoadmapPath: React.FC<AppRoadmapPathProps> = ({
  onStepLogin,
  onStepProfile,
  onStepMap,
  onStepStreak,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Masuk & Pilih Peran',
      desc: 'Daftar manual & masuk sebagai Peserta, Panitia, atau Admin.',
      icon: LogIn,
      color: '#377EC0',
      bg: '#E8F5FA',
      onClick: onStepLogin,
    },
    {
      num: '02',
      title: 'Kustom Avatar Kamar',
      desc: 'Atur wajah, outfit & pasang jadi icon profil.',
      icon: Sparkles,
      color: '#12BAAA',
      bg: '#E6F9F7',
      onClick: onStepProfile,
    },
    {
      num: '03',
      title: 'Peta Event Real-time',
      desc: 'Pantau lokasi GPS, jadwal & ikut jadi panitia.',
      icon: MapPin,
      color: '#F7891F',
      bg: '#FFF4E5',
      onClick: onStepMap,
    },
    {
      num: '04',
      title: 'Streak & Sertifikat',
      desc: 'Kejar streak bulanan, scan QR & unduh sertifikat.',
      icon: Flame,
      color: '#F04F52',
      bg: '#FDECEC',
      onClick: onStepStreak,
    },
  ];

  return (
    <section id="alur-kerja" className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 rounded-[34px] p-6 sm:p-9 pixel-card overflow-hidden relative">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <p className="font-arcade text-[11px] tracking-widest uppercase text-[#377EC0]">
              Peta Jalan EVORA
            </p>
            <h2 className="font-pixel text-2xl sm:text-4xl text-[#0F2347] tracking-tight">
              Alur Aplikasi Step-by-Step
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Ikuti jalur 4 langkah praktis di bawah ini — klik pos mana saja untuk langsung mencoba.
            </p>
          </div>

          {/* Eye-Catching Winding Road Map Container */}
          <div className="relative rounded-[28px] bg-gradient-to-b from-[#DDF3FA]/70 via-[#E8F5FA]/70 to-[#E6F9F7]/70 border border-[#9FD2D6]/70 p-5 sm:p-8">
            {/* Winding Desktop SVG Road Behind Stations */}
            <svg
              viewBox="0 0 1000 180"
              className="hidden md:block absolute inset-x-6 top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] h-36 pointer-events-none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 60 110 C 200 10, 320 170, 500 90 C 680 10, 800 170, 940 70"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="36"
                strokeLinecap="round"
              />
              <path
                d="M 60 110 C 200 10, 320 170, 500 90 C 680 10, 800 170, 940 70"
                fill="none"
                stroke="#FBDF54"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 60 110 C 200 10, 320 170, 500 90 C 680 10, 800 170, 940 70"
                fill="none"
                stroke="#F7891F"
                strokeWidth="3.5"
                strokeDasharray="12 10"
                strokeLinecap="round"
              />
            </svg>

            {/* Mobile Vertical Dashed Road */}
            <div
              className="md:hidden absolute left-10 top-10 bottom-10 w-2 bg-[#FBDF54] border-x-2 border-white rounded-full pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={step.onClick}
                    className={`group text-left bg-white hover:-translate-y-1.5 rounded-3xl p-4 sm:p-5 border-2 border-white hover:border-[#377EC0] shadow-lg shadow-[#377EC0]/10 transition-all cursor-pointer flex md:flex-col items-center md:items-start gap-4 md:gap-3 ${
                      idx % 2 === 1 ? 'md:mt-8' : 'md:mb-8'
                    }`}
                  >
                    <div className="flex items-center justify-between w-auto md:w-full shrink-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: step.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-pixel text-xs"
                        style={{ backgroundColor: step.bg, color: step.color }}
                      >
                        {idx === 0 && <Flag className="w-3 h-3" />}
                        Pos {step.num}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className="md:hidden text-[10px] font-extrabold uppercase tracking-wider"
                        style={{ color: step.color }}
                      >
                        Pos {step.num}
                      </span>
                      <h3 className="font-pixel text-base sm:text-lg text-slate-900 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <span
                      className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold mt-auto"
                      style={{ color: step.color }}
                    >
                      Buka <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
