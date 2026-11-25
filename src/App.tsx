import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Bot,
  MessageCircle,
  Mail,
  Instagram,
  Send,
  Users,
} from 'lucide-react';
import { BackgroundMascots } from './components/BackgroundMascots';
import { UserRole } from './components/EvoraMascots';
import { HeroShowcase } from './components/HeroShowcase';
import { InteractiveEventMap } from './components/InteractiveEventMap';
import { AuthModal, BroadcastEmailInfo, BroadcastPreviewModal } from './components/AuthModal';
import { PesertaFlowModal } from './components/PesertaFlowModal';
import { RoleDashboards } from './components/RoleDashboards';
import { StreakTracker } from './components/StreakTracker';
import { EventQuestGame } from './components/EventQuestGame';
import { ChibiAvatar } from './components/ChibiAvatar';
import { ProfilePage } from './components/ProfilePage';
import { AppRoadmapPath } from './components/AppRoadmapPath';
import { AiAssistantModal } from './components/AiAssistantModal';
import { INITIAL_AVATAR, INITIAL_EVENTS, INITIAL_ORDERS, INITIAL_STREAK } from './data/initialData';
import { AvatarConfig, EventItem, StreakState, TicketOrder, UserAccount } from './types/evora';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [orders, setOrders] = useState<TicketOrder[]>(INITIAL_ORDERS);
  const [streak, setStreak] = useState<StreakState>(INITIAL_STREAK);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [broadcastPreview, setBroadcastPreview] = useState<BroadcastEmailInfo | null>(null);

  const [activePage, setActivePage] = useState<'home' | 'profile'>('home');
  const [joinedPanitiaEventIds, setJoinedPanitiaEventIds] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('evora_avatar_v1');
      if (saved) return { ...INITIAL_AVATAR, ...JSON.parse(saved) };
    } catch {
      // ignore storage errors
    }
    return INITIAL_AVATAR;
  });

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

  // Bot AI & Feedback state
  const [aiBotOpen, setAiBotOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleUpdateAvatar = (next: AvatarConfig) => {
    setAvatar(next);
    try {
      localStorage.setItem('evora_avatar_v1', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    if (authToken) {
      fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ avatarConfig: next }),
      }).catch(() => {
        // silent background sync
      });
    }
  };

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

  const openProfilePage = () => {
    setActivePage('profile');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activePage !== 'home') {
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleStreakFreeze = () => {
    setStreak((prev) => {
      const nextFrozen = !prev.isFrozen;
      showToast(
        nextFrozen
          ? 'Mode Api Beku diaktifkan — streak panitia tetap aman terlindungi es!'
          : 'Api Streak kembali menyala terang!'
      );
      return {
        ...prev,
        isFrozen: nextFrozen,
      };
    });
  };

  const bumpTodayStreak = (extraHosted = 0, extraJoined = 0) => {
    setStreak((prev) => {
      const hasToday = prev.activeDaysInMonth.includes(25);
      const nextDays = hasToday ? prev.currentDays : prev.currentDays + 1;
      return {
        ...prev,
        isFrozen: false,
        currentDays: nextDays,
        longestDays: Math.max(prev.longestDays, nextDays),
        monthlyEventsHosted: prev.monthlyEventsHosted + extraHosted,
        monthlyEventsJoined: prev.monthlyEventsJoined + extraJoined,
        activeDaysInMonth: hasToday ? prev.activeDaysInMonth : [...prev.activeDaysInMonth, 25],
      };
    });
  };

  const handleJoinEventAsPanitia = (ev: EventItem) => {
    if (joinedPanitiaEventIds.includes(ev.id)) return;
    setJoinedPanitiaEventIds((prev) => [...prev, ev.id]);
    bumpTodayStreak(1, 0);
    setStreak((prev) => ({
      ...prev,
      isFrozen: false,
      completedDailyGoals: prev.completedDailyGoals.includes('goal-panitia')
        ? prev.completedDailyGoals
        : [...prev.completedDailyGoals, 'goal-panitia'],
    }));
    showToast(`Berhasil gabung tim panitia "${ev.title}"! Streak panitia +1 & api menyala.`);
  };

  const handleAuthenticated = ({
    user,
    token,
    avatarConfig,
    broadcastEmail,
  }: {
    user: UserAccount;
    token: string;
    avatarConfig?: AvatarConfig | null;
    broadcastEmail?: BroadcastEmailInfo | null;
  }) => {
    setCurrentUser(user);
    setAuthToken(token);
    if (avatarConfig) {
      setAvatar({ ...INITIAL_AVATAR, ...avatarConfig });
    }
    setAuthModalOpen(false);
    if (broadcastEmail) {
      setBroadcastPreview(broadcastEmail);
    }
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

  const handleSendBroadcastEmail = async () => {
    if (!authToken) {
      openAuth('login', 'peserta');
      return;
    }
    try {
      const res = await fetch('/api/auth/send-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = (await res.json()) as BroadcastEmailInfo & { error?: string };
      if (!res.ok || !data.previewHtml) {
        showToast(data.error || 'Gagal menyiapkan broadcast email.');
        return;
      }
      setBroadcastPreview(data);
    } catch {
      showToast('Koneksi terputus saat membuat broadcast email.');
    }
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
        isFrozen: exists ? prev.isFrozen : false,
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
        isFrozen: false,
        questBestScore: Math.max(prev.questBestScore, score),
        unlockedPets: nextPets,
        completedDailyGoals: nextGoals,
      };
    });
    showToast(`Quest selesai! Skor ${score} (Combo ${maxCombo}x).`);
  };

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

      {/* TOP BAR (3-Zone Contract + Blue Theme + Live Avatar Icon) */}
      <header className="sticky top-0 z-40 bg-[#E8F5FA]/90 backdrop-blur-md border-b border-[#9FD2D6]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActivePage('home');
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
              onClick={openProfilePage}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'profile' ? 'text-[#377EC0]' : 'hover:text-[#377EC0]'
              }`}
            >
              Profil & Avatar
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openProfilePage}
              title="Buka Halaman Profil & Ganti Avatar"
              aria-label="Buka Halaman Profil & Ganti Avatar"
              className={`w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 transition-transform hover:scale-105 cursor-pointer overflow-hidden shadow-sm ${
                activePage === 'profile' ? 'border-[#377EC0] ring-2 ring-[#9FD2D6]' : 'border-[#9FD2D6]'
              }`}
            >
              <ChibiAvatar
                config={avatar}
                mode="head"
                emptyProfile={!currentUser}
                className="w-9 h-9"
              />
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => scrollToSection('workspace')}
                className="px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-[#377EC0] hover:bg-[#5460AC] rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentUser.name}
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
              onClick={openProfilePage}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-extrabold text-[#377EC0] bg-[#E8F5FA]"
            >
              Profil & Studio Avatar
            </button>
          </div>
        )}
      </header>

      <main id="top" className="relative z-10 flex-1">
        {toastMessage && (
          <div className="fixed bottom-20 right-5 z-50 max-w-sm bg-slate-900 text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-[#9FD2D6]/40">
            {toastMessage}
          </div>
        )}

        {activePage === 'profile' ? (
          <ProfilePage
            avatar={avatar}
            currentUser={currentUser}
            onChangeAvatar={handleUpdateAvatar}
            onSetAsIcon={() => {
              showToast('Avatar berhasil disimpan dan dipasang sebagai Icon Profil EVORA!');
            }}
            onBackHome={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => openAuth('login', 'peserta')}
          />
        ) : (
          <>
            {/* 1. BAR AWAL PENGGUNA & KHUSUS PENYELENGGARA */}
            {currentUser ? (
              <RoleDashboards
                currentUser={currentUser}
                events={events}
                orders={orders}
                streak={streak}
                onSwitchRole={(role) => setCurrentUser({ ...currentUser, role })}
                onLogout={() => {
                  setCurrentUser(null);
                  setAuthToken(null);
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
                onSendBroadcast={handleSendBroadcastEmail}
              />
            ) : (
              <section id="daftar-panitia" className="pt-5 pb-2">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-4 sm:px-6 sm:py-4 border border-[#9FD2D6]/70 shadow-lg shadow-[#377EC0]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={openProfilePage}
                        className="w-12 h-12 rounded-2xl bg-[#E8F5FA] border border-[#9FD2D6] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        title="Lihat Profil Avatar"
                      >
                        <ChibiAvatar
                          config={avatar}
                          mode="head"
                          emptyProfile
                          softShadow={false}
                          className="w-11 h-11"
                        />
                      </button>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Tamu (Belum Sign In / Sign Up)
                        </p>
                        <p className="text-[11px] sm:text-xs font-bold text-[#F7891F]">
                          Khusus Penyelenggara & Komunitas · Daftar jadi panitia, pin Google Maps & kumpulkan streak bulanan!
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openAuth('register', 'organizer')}
                        className="px-4 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Registrasi Akun Panitia
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuth('login', 'peserta')}
                        className="px-4 py-2.5 rounded-xl bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-[#377EC0] text-xs font-extrabold cursor-pointer transition-colors"
                      >
                        Sign In / Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. HERO SHOWCASE */}
            <HeroShowcase
              avatar={avatar}
              userName={currentUser?.name ?? null}
              isAuthenticated={Boolean(currentUser)}
              isFrozen={streak.isFrozen}
              onExploreMap={() => scrollToSection('peta-event')}
              onOpenAuth={openAuth}
              onOpenGame={() => setGameOpen(true)}
              onOpenProfile={openProfilePage}
              streakDays={streak.currentDays}
              monthlyHosted={streak.monthlyEventsHosted}
            />

            {/* 3. INTERACTIVE REAL-TIME GOOGLE MAPS & SCHEDULE EXPLORER */}
            <InteractiveEventMap
              events={events}
              joinedPanitiaEventIds={joinedPanitiaEventIds}
              onSelectEventToRegister={(ev) => setCheckoutEvent(ev)}
              onJoinEventAsPanitia={handleJoinEventAsPanitia}
              onBecomeOrganizer={() => openAuth('register', 'organizer')}
            />

            {/* 4. TIKTOK-STYLE STREAK PANITIA BULANAN & MISI HARIAN */}
            <StreakTracker
              streak={streak}
              onToggleGoal={handleToggleDailyGoal}
              onToggleFreeze={handleToggleStreakFreeze}
              onOpenGame={() => setGameOpen(true)}
              onCreateEventClick={() => openAuth('register', 'organizer')}
            />

            {/* 5. PETA JALAN ALUR APLIKASI (STEP-BY-STEP ROADMAP) */}
            <AppRoadmapPath
              onStepLogin={() => openAuth('login', 'peserta')}
              onStepProfile={openProfilePage}
              onStepMap={() => scrollToSection('peta-event')}
              onStepStreak={() => scrollToSection('streak-panitia')}
            />
          </>
        )}
      </main>

      {/* CREATOR, CUSTOMER SERVICE WA, INSTAGRAM, BOT AI & GMAIL FEEDBACK FOOTER */}
      <footer className="relative z-10 border-t border-[#9FD2D6]/60 bg-white/80 backdrop-blur-md py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-pixel text-lg text-[#1E3A8A]">
                Muhammad Satrio Wibisono
              </p>
              <p className="text-xs font-bold text-slate-500">
                Ada keluh kesah, masukan, atau butuh bantuan? Hubungi layanan di samping.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="https://instagram.com/msriotsss"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#DB2777] border border-[#FBCFE8] text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @msriotsss
              </a>

              <a
                href="https://wa.me/6289603963329"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#E6F9F7] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                CS WhatsApp: 089603963329
              </a>

              <button
                type="button"
                onClick={() => setAiBotOpen(true)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Bot className="w-4 h-4 text-[#FBDF54]" />
                Bot AI EVORA
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackOpen((prev) => !prev);
                  setFeedbackError(null);
                }}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFF4E5] hover:bg-[#FDE68A] text-[#B45309] border border-[#FBDF54] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Mail className="w-4 h-4" />
                Keluh Kesah & Masukan (msriotss@gmail.com)
              </button>
            </div>
          </div>

          {feedbackOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!feedbackSubject.trim() || feedbackBody.trim().length < 5) {
                  setFeedbackError('Isi judul dan isi keluh kesah/masukan minimal 5 karakter.');
                  return;
                }
                setFeedbackError(null);
                const mailtoUrl = `mailto:msriotss@gmail.com?subject=${encodeURIComponent(
                  `[EVORA Masukan] ${feedbackSubject.trim()}`
                )}&body=${encodeURIComponent(
                  `${feedbackBody.trim()}\n\nDari: ${currentUser ? `${currentUser.name} (${currentUser.email})` : 'Pengunjung EVORA'}`
                )}`;
                window.location.href = mailtoUrl;
                setFeedbackSubject('');
                setFeedbackBody('');
                setFeedbackOpen(false);
                showToast('Aplikasi email siap mengirim keluh kesah & masukan ke msriotss@gmail.com!');
              }}
              className="bg-[#F4FAFC] border border-[#9FD2D6] rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-[#1E3A8A]">
                  Kirim Keluh Kesah & Masukan ke msriotss@gmail.com
                </p>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Tutup form masukan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Subjek (mis. Saran fitur peta)"
                  className="sm:col-span-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#9FD2D6]/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
                />
                <input
                  type="text"
                  value={feedbackBody}
                  onChange={(e) => setFeedbackBody(e.target.value)}
                  placeholder="Tulis keluh kesah atau masukanmu di sini..."
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#9FD2D6]/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
                />
              </div>
              {feedbackError && (
                <p className="text-xs font-bold text-[#F04F52]">{feedbackError}</p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=msriotss@gmail.com&su=Keluh%20Kesah%20%26%20Masukan%20EVORA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-extrabold text-[#377EC0] hover:underline"
                >
                  Atau buka langsung Gmail Web →
                </a>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim ke Gmail
                </button>
              </div>
            </form>
          )}
        </div>
      </footer>

      {/* Floating Bot AI Launcher */}
      <button
        type="button"
        onClick={() => setAiBotOpen(true)}
        aria-label="Buka Bot AI EVORA"
        className="fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold shadow-xl shadow-[#377EC0]/30 border-2 border-white inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
      >
        <Bot className="w-4 h-4 text-[#FBDF54]" />
        <span>Bot AI</span>
      </button>

      {/* MODALS & GAME SHELL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <BroadcastPreviewModal
        broadcast={broadcastPreview}
        recipientEmail={currentUser?.email}
        onClose={() => setBroadcastPreview(null)}
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

      <AiAssistantModal
        isOpen={aiBotOpen}
        onClose={() => setAiBotOpen(false)}
        userName={currentUser?.name ?? null}
      />
    </div>
  );
}
