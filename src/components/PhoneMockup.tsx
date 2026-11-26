import React, { useState } from 'react';
import { Eye, EyeOff, Check, Ticket, CalendarPlus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { EvoraHeroMascot, PeekingMascots, RoleMascot, UserRole } from './EvoraMascots';

export type AuthView = 'login' | 'register' | 'dashboard';

interface PhoneMockupProps {
  view: AuthView;
  onChangeView: (view: AuthView) => void;
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

interface MiniEvent {
  id: string;
  title: string;
  date: string;
  price: string;
  booked: boolean;
}

interface ReviewItem {
  id: string;
  title: string;
  organizer: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ROLE_LABELS: Record<UserRole, string> = {
  peserta: 'Peserta',
  organizer: 'Organizer',
  admin: 'Admin Platform',
};

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  view,
  onChangeView,
  selectedRole,
}) => {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pesertaEvents, setPesertaEvents] = useState<MiniEvent[]>([
    { id: '1', title: 'Pastel Creative Fest', date: '12 Des · Jakarta', price: 'Rp 85k', booked: false },
    { id: '2', title: 'UI/UX Design Meetup', date: '19 Des · Bandung', price: 'Gratis', booked: true },
  ]);

  const [organizerEvents, setOrganizerEvents] = useState([
    { id: '1', title: 'Pastel Creative Fest', sold: 112, quota: 150, live: true },
    { id: '2', title: 'Workshop Ilustrasi Cute', sold: 36, quota: 50, live: false },
  ]);

  const [adminQueue, setAdminQueue] = useState<ReviewItem[]>([
    { id: '1', title: 'Indie Music Night', organizer: 'Studio Nada', status: 'pending' },
    { id: '2', title: 'Tech Campus Expo', organizer: 'HMIF Karya', status: 'pending' },
  ]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    onChangeView('dashboard');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    onChangeView('dashboard');
  };

  const toggleBookEvent = (id: string) => {
    setPesertaEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, booked: !ev.booked } : ev))
    );
  };

  const togglePublishOrganizer = (id: string) => {
    setOrganizerEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, live: !ev.live } : ev))
    );
  };

  const updateReviewStatus = (id: string, status: 'approved' | 'rejected') => {
    setAdminQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <div className="w-full max-w-[335px] bg-white rounded-[44px] p-2.5 phone-frame">
      <div className="bg-white rounded-[36px] overflow-hidden min-h-[640px] flex flex-col justify-between px-6 pt-4 pb-5 relative">
        {/* Minimal Status Bar */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-3">
          <span className="tabular-nums">9:41</span>
          <div className="w-20 h-5 bg-slate-900 rounded-full" aria-hidden="true" />
          <div className="flex items-center gap-1" aria-hidden="true">
            <div className="w-4 h-2.5 border border-slate-800 rounded-[3px] p-[1px]">
              <div className="w-full h-full bg-slate-800 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Konten Tengah App */}
        <div className="flex-1 flex flex-col justify-center">
          {view !== 'dashboard' && (
            <div className="flex flex-col items-center text-center mb-6">
              <EvoraHeroMascot />
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                EVORA
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Event Management Platform
              </p>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <h3 className="text-base font-bold text-slate-900 text-center mb-4">
                Selamat datang kembali!
              </h3>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  aria-label="Alamat email"
                  className="w-full px-4 py-3 text-xs bg-slate-100/80 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  aria-label="Kata sandi"
                  className="w-full px-4 py-3 pr-10 text-xs bg-slate-100/80 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-500 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 mt-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Masuk
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => onChangeView('register')}
                    className="font-bold text-violet-600 hover:underline cursor-pointer"
                  >
                    Daftar
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 text-center mb-3">
                Mulai perjalanan eventmu
              </h3>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                aria-label="Nama lengkap"
                className="w-full px-4 py-3 text-xs bg-slate-100/80 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                aria-label="Alamat email"
                className="w-full px-4 py-3 text-xs bg-slate-100/80 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none transition-all"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi"
                aria-label="Buat kata sandi"
                className="w-full px-4 py-3 text-xs bg-slate-100/80 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Daftar Sekarang
              </button>
              <p className="text-[11px] text-slate-500 text-center pt-1">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => onChangeView('login')}
                  className="font-bold text-violet-600 hover:underline cursor-pointer"
                >
                  Masuk
                </button>
              </p>
            </form>
          )}

          {/* VIEW 3: ROLE DASHBOARD PREVIEW */}
          {view === 'dashboard' && (
            <div className="flex flex-col h-full justify-between py-2">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <RoleMascot role={selectedRole} className="w-10 h-10 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                        {ROLE_LABELS[selectedRole]}
                      </p>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {fullName.trim() || 'Halo, Pengguna'}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeView('login')}
                    aria-label="Keluar ke halaman login"
                    className="text-[11px] font-semibold text-slate-400 hover:text-violet-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Keluar
                  </button>
                </div>

                {selectedRole === 'peserta' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#FFF5F7]">
                      <div className="flex items-center gap-2 text-rose-500 mb-1">
                        <Ticket className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Jelajahi Event</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Temukan event seru dan simpan tiket digitalmu.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {pesertaEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {ev.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {ev.date} · {ev.price}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBookEvent(ev.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                              ev.booked
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                            }`}
                          >
                            {ev.booked ? 'Dimiliki' : 'Beli Tiket'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRole === 'organizer' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#FFF7ED]">
                      <div className="flex items-center gap-2 text-orange-500 mb-1">
                        <CalendarPlus className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Kelola Eventmu</span>
                      </div>
                      <p className="text-xs text-slate-600 tabular-nums">
                        148 tiket terjual dari 2 event aktif minggu ini.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {organizerEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {ev.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                              {ev.sold}/{ev.quota} terjual
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePublishOrganizer(ev.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                              ev.live
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {ev.live ? 'Tayang' : 'Draf'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRole === 'admin' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#F3E8FF]">
                      <div className="flex items-center gap-2 text-violet-600 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Antrean Review</span>
                      </div>
                      <p className="text-xs text-slate-600 tabular-nums">
                        {adminQueue.filter((i) => i.status === 'pending').length} pengajuan event menunggu persetujuan.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {adminQueue.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {item.organizer}
                            </p>
                          </div>
                          {item.status === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => updateReviewStatus(item.id, 'approved')}
                              className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-violet-600 text-white hover:bg-violet-700 shrink-0 transition-colors cursor-pointer"
                            >
                              Publikasikan
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
                              <Check className="w-3 h-3" /> Disetujui
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onChangeView('login')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Coba Alur Login Lagi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cute Peeking Event Characters at Bottom */}
        <PeekingMascots />
      </div>
    </div>
  );
};
