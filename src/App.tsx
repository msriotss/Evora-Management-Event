import { useState } from 'react';
import { BackgroundMascots } from './components/BackgroundMascots';
import { RoleMascot, UserRole } from './components/EvoraMascots';
import { AuthView, PhoneMockup } from './components/PhoneMockup';

interface RoleCardConfig {
  id: UserRole;
  label: string;
  description: string;
  bgClass: string;
  hoverClass: string;
  activeRingClass: string;
  labelColorClass: string;
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    id: 'peserta',
    label: 'Peserta',
    description: 'Cari event dan beli tiket',
    bgClass: 'bg-[#FFF5F7]',
    hoverClass: 'hover:bg-[#FFEBF0]',
    activeRingClass: 'ring-2 ring-rose-300 bg-[#FFEBF0]',
    labelColorClass: 'text-rose-500',
  },
  {
    id: 'organizer',
    label: 'Organizer',
    description: 'Buat dan kelola event',
    bgClass: 'bg-[#FFF7ED]',
    hoverClass: 'hover:bg-[#FFEDD5]',
    activeRingClass: 'ring-2 ring-orange-300 bg-[#FFEDD5]',
    labelColorClass: 'text-orange-500',
  },
  {
    id: 'admin',
    label: 'Admin Platform',
    description: 'Review dan publikasikan event',
    bgClass: 'bg-[#F3E8FF]',
    hoverClass: 'hover:bg-[#E9D5FF]',
    activeRingClass: 'ring-2 ring-violet-400 bg-[#E9D5FF]',
    labelColorClass: 'text-violet-600',
  },
];

export default function App() {
  const [view, setView] = useState<AuthView>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('peserta');

  const handleRoleCardClick = (role: UserRole) => {
    setSelectedRole(role);
    if (view !== 'dashboard') {
      setView('dashboard');
    }
  };

  return (
    <div className="min-h-screen p-5 md:p-10 lg:p-14 flex items-center justify-center relative overflow-x-hidden">
      <BackgroundMascots />

      <div className="max-w-5xl w-full mx-auto relative z-10">
        {/* Minimalist Slide Header */}
        <header className="flex items-center justify-between mb-8">
          <span className="text-xs font-bold tracking-widest text-violet-800/80 uppercase">
            01 — Akses Pengguna
          </span>
          <span className="text-xs font-semibold text-violet-700/50 tabular-nums">
            {view === 'dashboard' ? '02' : '01'}
          </span>
        </header>

        {/* Main Clean Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* KOLOM KIRI: Clean Mobile Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <PhoneMockup
              view={view}
              onChangeView={setView}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
            />
          </div>

          {/* KOLOM KANAN: Clean & Elegant Overview Card */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-2.5">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
                Login & registrasi
              </h1>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
                Alur awal aplikasi: buka aplikasi, registrasi atau login, verifikasi akun, lalu masuk sesuai peran.
              </p>
            </div>

            {/* Simple Elevated White Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-7 md:p-9 shadow-xl shadow-violet-900/5 border border-white">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">
                Satu akun, tiga jenis akses.
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mb-7">
                Setelah kredensial tervalidasi, sistem mengarahkan pengguna ke dashboard sesuai peran.
              </p>

              {/* 3 Role Cards (Clean & Cute Minimalist, Interactive) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ROLE_CARDS.map((card) => {
                  const isActive = view === 'dashboard' && selectedRole === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleRoleCardClick(card.id)}
                      className={`text-left p-5 rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        isActive
                          ? card.activeRingClass
                          : `${card.bgClass} ${card.hoverClass}`
                      }`}
                    >
                      <RoleMascot role={card.id} className="w-9 h-9 mb-3.5" />
                      <span
                        className={`block text-[10px] font-extrabold tracking-widest uppercase mb-1 ${card.labelColorClass}`}
                      >
                        {card.label}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
