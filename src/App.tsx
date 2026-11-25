import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  CalendarCheck,
  MapPin,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { BackgroundMascots } from './components/BackgroundMascots';
import { RoleMascot, UserRole } from './components/EvoraMascots';
import { HeroShowcase } from './components/HeroShowcase';
import { InteractiveEventMap } from './components/InteractiveEventMap';
import { AuthModal } from './components/AuthModal';
import { PesertaFlowModal } from './components/PesertaFlowModal';
import { RoleDashboards } from './components/RoleDashboards';
import { StreakTracker } from './components/StreakTracker';
import { EventQuestGame } from './components/EventQuestGame';
import { INITIAL_EVENTS, INITIAL_ORDERS, INITIAL_STREAK } from './data/initialData';
import { EventItem, StreakState, TicketOrder, UserAccount } from './types/evora';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [orders, setOrders] = useState<TicketOrder[]>(INITIAL_ORDERS);
  const [streak, setStreak] = useState<StreakState>(INITIAL_STREAK);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('peserta');

  // Peserta Checkout Modal state
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);

  // 2D Mini-Game state
  const [gameOpen, setGameOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const openAuth = (mode: 'login' | 'register', role: UserRole = 'peserta') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bumpTodayStreak = (extraHosted = 0, extraJoined = 0) => {
    setStreak((prev) => {
      const hasToday = prev.activeDaysInMonth.includes(25);
      const nextDays = hasToday ? prev.currentDays : prev.currentDays + 1;
      return {
        ...prev,
        currentDays: nextDays,
        longestDays: Math.max(prev.longestDays, nextDays),
        monthlyEventsHosted: prev.monthlyEventsHosted + extraHosted,
        monthlyEventsJoined: prev.monthlyEventsJoined + extraJoined,
        activeDaysInMonth: hasToday ? prev.activeDaysInMonth : [...prev.activeDaysInMonth, 25],
      };
    });
  };

  const handleAuthenticated = (user: UserAccount) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    showToast(
      `Selamat datang, ${user.name}! Masuk sebagai ${
        user.role === 'peserta'
          ? 'Peserta'
          : user.role === 'organizer'
          ? 'Panitia'
          : 'Admin Platform'
      }.`
    );
    setTimeout(() => scrollToSection('workspace'), 100);
  };

  const handleOrderComplete = (newOrder: TicketOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== newOrder.eventId) return ev;
        return {
          ...ev,
          tiers: ev.tiers.map((t) =>
            t.name === newOrder.tierName
              ? { ...t, sold: t.sold + newOrder.quantity }
              : t
          ),
        };
      })
    );
    bumpTodayStreak(0, 1);
    showToast(`E-Tiket ${newOrder.qrCode} diterbitkan! Streak event bertambah.`);
  };

  const handleSubmitNewEvent = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    bumpTodayStreak(1, 0);
    setStreak((prev) => ({
      ...prev,
      completedDailyGoals: prev.completedDailyGoals.includes('goal-panitia')
        ? prev.completedDailyGoals
        : [...prev.completedDailyGoals, 'goal-panitia'],
    }));
    showToast('Event diajukan ke Admin & Streak Panitia bulan ini +1!');
  };

  const handleResubmitEvent = (eventId: string, updatedTitle: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, title: updatedTitle, status: 'pending', revisionNote: undefined }
          : ev
      )
    );
    showToast('Revisi disimpan dan event diajukan ulang ke Admin.');
  };

  const handleAdminApprove = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: 'published' } : ev))
    );
    showToast('Event disetujui dan langsung tampil di Google Maps!');
  };

  const handleAdminReject = (eventId: string, note: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, status: 'revision', revisionNote: note } : ev
      )
    );
    showToast('Catatan revisi dikirim ke Panitia.');
  };

  const handleCheckInOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, checkedIn: true } : o))
    );
    showToast('Check-in QR berhasil diverifikasi!');
  };

  const handleToggleReminder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, reminderActive: !o.reminderActive } : o
      )
    );
  };

  const handleSubmitFeedback = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, feedbackSubmitted: true, rating, feedbackComment: comment }
          : o
      )
    );
    showToast('Terima kasih! Sertifikat kehadiran Anda siap diunduh.');
  };

  const handleToggleDailyGoal = (goalId: string) => {
    setStreak((prev) => {
      const exists = prev.completedDailyGoals.includes(goalId);
      return {
        ...prev,
        completedDailyGoals: exists
          ? prev.completedDailyGoals.filter((g) => g !== goalId)
          : [...prev.completedDailyGoals, goalId],
      };
    });
  };

  const handleGameComplete = (score: number, maxCombo: number) => {
    setStreak((prev) => {
      const nextPets = [...prev.unlockedPets];
      if (score >= 100 && !nextPets.includes('bimo-baju')) {
        nextPets.push('bimo-baju');
      }
      if (score >= 180 && !nextPets.includes('kala-kalender')) {
        nextPets.push('kala-kalender');
      }
      const nextGoals = prev.completedDailyGoals.includes('goal-quest')
        ? prev.completedDailyGoals
        : [...prev.completedDailyGoals, 'goal-quest'];

      return {
        ...prev,
        questBestScore: Math.max(prev.questBestScore, score),
        unlockedPets: nextPets,
        completedDailyGoals: nextGoals,
      };
    });
    showToast(`Quest selesai! Skor ${score} (Combo ${maxCombo}x).`);
  };

  const publishedCount = events.filter((e) => e.status === 'published').length;

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <BackgroundMascots />

      {/* Google Maps Demo Quota Notice (Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* TOP BAR (3-Zone Contract + Blue Theme) */}
      <header className="sticky top-0 z-40 bg-[#E8F5FA]/90 backdrop-blur-md border-b border-[#9FD2D6]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-pixel text-2xl tracking-tight text-[#377EC0] whitespace-nowrap shrink-0"
          >
            EVORA
          </a>

          <nav
            className="hidden md:flex items-center gap-6 text-sm font-extrabold text-slate-700"
            aria-label="Navigasi utama"
          >
            <button
              type="button"
              onClick={() => scrollToSection('peta-event')}
              className="hover:text-[#377EC0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Peta Event
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('streak-panitia')}
              className="hover:text-[#377EC0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Streak & Quest
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('daftar-panitia')}
              className="hover:text-[#377EC0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Daftar Panitia
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('alur-kerja')}
              className="hover:text-[#377EC0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Alur Kerja
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={() => scrollToSection('workspace')}
                className="px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-[#377EC0] hover:bg-[#5460AC] rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dashboard ({currentUser.role === 'organizer' ? 'Panitia' : currentUser.role === 'admin' ? 'Admin' : 'Peserta'})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('login', 'peserta')}
                className="px-5 py-2 text-xs sm:text-sm font-extrabold text-white bg-[#377EC0] hover:bg-[#5460AC] rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Masuk
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              className="md:hidden w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#9FD2D6] px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => scrollToSection('peta-event')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 hover:bg-[#E8F5FA]"
            >
              Peta Event
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('streak-panitia')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 hover:bg-[#E8F5FA]"
            >
              Streak & Quest
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('daftar-panitia')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 hover:bg-[#E8F5FA]"
            >
              Daftar Jadi Panitia
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('alur-kerja')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 hover:bg-[#E8F5FA]"
            >
              Alur Kerja
            </button>
          </div>
        )}
      </header>

      <main id="top" className="relative z-10 flex-1">
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-[#9FD2D6]/40">
            {toastMessage}
          </div>
        )}

        {/* 1. HERO SHOWCASE */}
        <HeroShowcase
          onExploreMap={() => scrollToSection('peta-event')}
          onOpenAuth={openAuth}
          onOpenGame={() => setGameOpen(true)}
          publishedCount={publishedCount}
          streakDays={streak.currentDays}
          monthlyHosted={streak.monthlyEventsHosted}
        />

        {/* 2. ACTIVE WORKSPACE (WHEN LOGGED IN) */}
        {currentUser && (
          <RoleDashboards
            currentUser={currentUser}
            events={events}
            orders={orders}
            streak={streak}
            onSwitchRole={(role) => setCurrentUser({ ...currentUser, role })}
            onLogout={() => {
              setCurrentUser(null);
              showToast('Anda telah keluar dari akun.');
            }}
            onSubmitNewEvent={handleSubmitNewEvent}
            onResubmitEvent={handleResubmitEvent}
            onAdminApprove={handleAdminApprove}
            onAdminReject={handleAdminReject}
            onCheckInOrder={handleCheckInOrder}
            onToggleReminder={handleToggleReminder}
            onSubmitFeedback={handleSubmitFeedback}
            onGoToMap={() => scrollToSection('peta-event')}
          />
        )}

        {/* 3. TIKTOK-STYLE STREAK PANITIA BULANAN & MISI HARIAN */}
        <StreakTracker
          streak={streak}
          onToggleGoal={handleToggleDailyGoal}
          onOpenGame={() => setGameOpen(true)}
          onCreateEventClick={() => openAuth('register', 'organizer')}
        />

        {/* 4. INTERACTIVE GOOGLE MAPS & SCHEDULE EXPLORER */}
        <InteractiveEventMap
          events={events}
          onSelectEventToRegister={(ev) => setCheckoutEvent(ev)}
          onBecomeOrganizer={() => openAuth('register', 'organizer')}
        />

        {/* 5. DAFTAR JADI PANITIA SECTION */}
        <section id="daftar-panitia" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs font-extrabold tracking-widest uppercase text-[#F7891F]">
                  Khusus Penyelenggara & Komunitas
                </p>
                <h2 className="font-pixel text-2xl sm:text-4xl text-slate-900 tracking-tight text-balance">
                  Daftar jadi panitia, kumpulkan streak bulanan!
                </h2>
                <p className="text-sm font-bold text-slate-600 leading-relaxed max-w-xl">
                  Tentukan titik lokasi acara di Google Maps, atur tiket dan kode promo, susun rundown serta pembicara, dan tingkatkan streak panitia setiap bulan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-[#E8F5FA] flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#377EC0] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Pin Google Maps</p>
                      <p className="text-[11px] font-bold text-slate-600">
                        Peserta langsung temukan lokasi & jadwal acaramu.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF4E5] flex items-start gap-3">
                    <Flame className="w-5 h-5 text-[#F7891F] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Streak Bulanan</p>
                      <p className="text-[11px] font-bold text-slate-600">
                        Naikkan tier Blue Flame hingga Rainbow Panitia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#E8F5FA] rounded-[28px] p-6 sm:p-7 space-y-4 border border-[#9FD2D6]">
                <div className="flex items-center gap-3">
                  <RoleMascot role="organizer" className="w-12 h-12 shrink-0" />
                  <div>
                    <h3 className="font-pixel text-xl text-slate-900">
                      Mulai Buat Event
                    </h3>
                    <p className="text-xs font-bold text-slate-600">
                      Registrasi cepat dengan verifikasi email OTP
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-bold">
                  <li className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#377EC0] shrink-0" />
                    Input detail event, tiket, promo & rundown
                  </li>
                  <li className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#12BAAA] shrink-0" />
                    Check-in QR peserta & laporan evaluasi
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5460AC] shrink-0" />
                    Review transparan oleh Admin Platform
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => openAuth('register', 'organizer')}
                  className="w-full py-3.5 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-2xl shadow-md shadow-[#377EC0]/25 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Registrasi Akun Panitia
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ALUR KERJA SESUAI FLOWCHART */}
        <section id="alur-kerja" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <p className="text-xs font-extrabold tracking-widest uppercase text-[#377EC0]">
                Alur Aplikasi Terpadu
              </p>
              <h2 className="font-pixel text-2xl sm:text-4xl text-slate-900 tracking-tight text-balance">
                Satu akun, tiga jenis akses sesuai flowchart
              </h2>
              <p className="text-sm font-bold text-slate-600">
                Klik salah satu peran di bawah untuk mencoba alur login dan dashboardnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* PESERTA */}
              <button
                type="button"
                onClick={() => openAuth('login', 'peserta')}
                className="text-left p-6 rounded-[28px] bg-[#FDECEC] hover:bg-[#FBD5D5] border border-white shadow-lg shadow-[#377EC0]/10 transition-all flex flex-col justify-between gap-5 cursor-pointer"
              >
                <div className="space-y-3">
                  <RoleMascot role="peserta" className="w-11 h-11" />
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F04F52]">
                      01. Peserta
                    </span>
                    <h3 className="font-pixel text-xl text-slate-900 mt-0.5">
                      Cari Event hingga Sertifikat
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Filter event di Google Maps, pilih tiket & metode bayar, terima e-tiket QR dan pengingat H-1, check-in, lalu isi feedback & unduh sertifikat.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#F04F52]">
                  Masuk sebagai Peserta <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* ORGANIZER / PANITIA */}
              <button
                type="button"
                onClick={() => openAuth('register', 'organizer')}
                className="text-left p-6 rounded-[28px] bg-[#FFF4E5] hover:bg-[#FFE8C7] border border-white shadow-lg shadow-[#377EC0]/10 transition-all flex flex-col justify-between gap-5 cursor-pointer"
              >
                <div className="space-y-3">
                  <RoleMascot role="organizer" className="w-11 h-11" />
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F7891F]">
                      02. Panitia (Organizer)
                    </span>
                    <h3 className="font-pixel text-xl text-slate-900 mt-0.5">
                      Buat Event & Streak Bulanan
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Input detail & lokasi, atur tiket dan promo, susun rundown & pembicara, ajukan ke admin, pantau penjualan, scan QR check-in, dan buat laporan.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#F7891F]">
                  Daftar / Masuk Panitia <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* ADMIN PLATFORM */}
              <button
                type="button"
                onClick={() => openAuth('login', 'admin')}
                className="text-left p-6 rounded-[28px] bg-[#E8F5FA] hover:bg-[#9FD2D6]/40 border border-white shadow-lg shadow-[#377EC0]/10 transition-all flex flex-col justify-between gap-5 cursor-pointer"
              >
                <div className="space-y-3">
                  <RoleMascot role="admin" className="w-11 h-11" />
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#5460AC]">
                      03. Admin Platform
                    </span>
                    <h3 className="font-pixel text-xl text-slate-900 mt-0.5">
                      Review & Publikasikan Event
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Periksa pengajuan dari panitia. Jika perlu perbaikan, kirim catatan revisi; jika disetujui, publikasikan langsung ke Google Maps & katalog peserta.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5460AC]">
                  Masuk sebagai Admin <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="relative z-10 border-t border-[#9FD2D6]/60 bg-white/50 backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
          <span className="font-pixel text-base text-[#377EC0]">
            EVORA — Event Management Platform
          </span>
          <span>Google Maps Lokasi · Streak Panitia Bulanan · Mini-Game Quest</span>
        </div>
      </footer>

      {/* MODALS & GAME SHELL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <PesertaFlowModal
        event={checkoutEvent}
        currentUser={currentUser}
        onClose={() => setCheckoutEvent(null)}
        onOrderComplete={handleOrderComplete}
      />

      <EventQuestGame
        isOpen={gameOpen}
        bestScore={streak.questBestScore}
        onClose={() => setGameOpen(false)}
        onCompleteRound={handleGameComplete}
      />
    </div>
  );
}
