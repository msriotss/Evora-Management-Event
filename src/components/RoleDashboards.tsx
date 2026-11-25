import React, { useState } from 'react';
import {
  QrCode,
  Bell,
  CheckCircle2,
  Award,
  Star,
  CalendarPlus,
  Ticket,
  BarChart3,
  ShieldCheck,
  Send,
  AlertTriangle,
  LogOut,
  Users,
  Download,
  Flame,
} from 'lucide-react';
import { EventItem, StreakState, TicketOrder, UserAccount, UserRole } from '../types/evora';
import { RoleMascot } from './EvoraMascots';

interface RoleDashboardsProps {
  currentUser: UserAccount;
  events: EventItem[];
  orders: TicketOrder[];
  streak: StreakState;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onSubmitNewEvent: (ev: EventItem) => void;
  onResubmitEvent: (eventId: string, updatedTitle: string) => void;
  onAdminApprove: (eventId: string) => void;
  onAdminReject: (eventId: string, note: string) => void;
  onCheckInOrder: (orderId: string) => void;
  onToggleReminder: (orderId: string) => void;
  onSubmitFeedback: (orderId: string, rating: number, comment: string) => void;
  onGoToMap: () => void;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Jakarta: { lat: -6.2088, lng: 106.8456 },
  Bandung: { lat: -6.9175, lng: 107.6191 },
  Surabaya: { lat: -7.2575, lng: 112.7521 },
  Yogyakarta: { lat: -7.7956, lng: 110.3695 },
  Bali: { lat: -8.6705, lng: 115.2126 },
};

export const RoleDashboards: React.FC<RoleDashboardsProps> = ({
  currentUser,
  events,
  orders,
  streak,
  onSwitchRole,
  onLogout,
  onSubmitNewEvent,
  onResubmitEvent,
  onAdminApprove,
  onAdminReject,
  onCheckInOrder,
  onToggleReminder,
  onSubmitFeedback,
  onGoToMap,
}) => {
  const role = currentUser.role;

  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [certificateOrder, setCertificateOrder] = useState<TicketOrder | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventItem['category']>('Kreatif');
  const [newDate, setNewDate] = useState('2027-01-24');
  const [newTime, setNewTime] = useState('10:00 – 16:00 WIB');
  const [newCity, setNewCity] = useState('Jakarta');
  const [newVenue, setNewVenue] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTierName, setNewTierName] = useState('Tiket Reguler');
  const [newTierPrice, setNewTierPrice] = useState(75000);
  const [newTierQuota, setNewTierQuota] = useState(120);
  const [newPromoCode, setNewPromoCode] = useState('PANITIA15');
  const [newSpeaker, setNewSpeaker] = useState('Pembicara Utama');
  const [newSponsor, setNewSponsor] = useState('Sponsor Lokal');
  const [newRundownTitle, setNewRundownTitle] = useState('Sesi Pembukaan & Materi');
  const [newRundownTime, setNewRundownTime] = useState('10:00');
  const [wizardError, setWizardError] = useState<string | null>(null);

  const [revisionEditTitles, setRevisionEditTitles] = useState<Record<string, string>>({});
  const [revisionInputs, setRevisionInputs] = useState<Record<string, string>>({});
  const [openRevisionBox, setOpenRevisionBox] = useState<string | null>(null);
  const [orgTab, setOrgTab] = useState<'events' | 'checkin' | 'report'>('events');

  const handleCreateEventSubmit = () => {
    if (!newTitle.trim() || !newVenue.trim()) {
      setWizardError('Nama event dan nama venue wajib diisi.');
      setWizardStep(1);
      return;
    }

    const formattedDate = new Date(newDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const baseCoords = CITY_COORDS[newCity] ?? CITY_COORDS.Jakarta;
    const jitterLat = (Math.random() - 0.5) * 0.025;
    const jitterLng = (Math.random() - 0.5) * 0.025;

    const created: EventItem = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      date: newDate,
      dateLabel: formattedDate,
      timeLabel: newTime,
      city: newCity,
      venue: newVenue.trim(),
      address: newAddress.trim() || `${newVenue.trim()}, ${newCity}`,
      lat: +(baseCoords.lat + jitterLat).toFixed(4),
      lng: +(baseCoords.lng + jitterLng).toFixed(4),
      pinColor: '#377EC0',
      description: `Event ${newCategory.toLowerCase()} yang diselenggarakan oleh ${currentUser.name}.`,
      organizerName: currentUser.name,
      speakers: [newSpeaker.trim() || 'Pembicara Tamu'],
      sponsors: [newSponsor.trim() || 'Mitra Komunitas'],
      promoCode: newPromoCode.trim() || undefined,
      promoDiscountPercent: newPromoCode.trim() ? 15 : undefined,
      tiers: [
        {
          id: `t-${Date.now()}`,
          name: newTierName.trim() || 'Reguler',
          price: Number(newTierPrice) || 0,
          quota: Number(newTierQuota) || 50,
          sold: 0,
        },
      ],
      rundown: [
        {
          time: newRundownTime || '10:00',
          title: newRundownTitle.trim() || 'Pembukaan Acara',
          speaker: newSpeaker.trim(),
        },
      ],
      status: 'pending',
    };

    onSubmitNewEvent(created);
    setShowCreateForm(false);
    setWizardStep(1);
    setNewTitle('');
    setNewVenue('');
    setNewAddress('');
    setWizardError(null);
  };

  const downloadCertificateFile = (order: TicketOrder) => {
    const htmlContent = `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>Sertifikat - ${order.eventTitle}</title></head>
<body style="font-family:sans-serif;padding:48px;background:#E8F5FA;text-align:center;">
  <div style="max-width:680px;margin:0 auto;background:#fff;padding:48px;border-radius:28px;border:3px solid #377EC0;">
    <p style="color:#377EC0;font-weight:800;letter-spacing:2px;font-size:12px;">EVORA — SERTIFIKAT KEHADIRAN</p>
    <h1 style="margin:16px 0 8px;font-size:28px;color:#0F172A;">${order.attendeeName}</h1>
    <p style="color:#475569;font-size:15px;">Telah berpartisipasi aktif dalam acara:</p>
    <h2 style="margin:12px 0;font-size:22px;color:#377EC0;">${order.eventTitle}</h2>
    <p style="color:#64748B;font-size:13px;">${order.eventDateLabel} · ${order.eventVenue}</p>
    <p style="margin-top:28px;font-size:11px;color:#94A3B8;">Kode E-Tiket Terverifikasi: ${order.qrCode}</p>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sertifikat-${order.qrCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingEvents = events.filter((e) => e.status === 'pending');
  const publishedEvents = events.filter((e) => e.status === 'published');
  const totalTicketsSold = publishedEvents.reduce(
    (sum, ev) => sum + ev.tiers.reduce((tSum, t) => tSum + t.sold, 0),
    0
  );

  return (
    <section id="workspace" className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60">
          {/* Top Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <RoleMascot role={role} className="w-12 h-12 shrink-0" />
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#377EC0]">
                  {role === 'peserta'
                    ? 'Dashboard Peserta'
                    : role === 'organizer'
                    ? 'Dashboard Panitia (Organizer)'
                    : 'Dashboard Admin Platform'}
                </p>
                <h2 className="font-pixel text-2xl sm:text-3xl text-slate-900">
                  Halo, {currentUser.name}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBDF54]/50 text-slate-900 text-xs font-extrabold tabular-nums">
                <Flame className="w-3.5 h-3.5 text-[#F7891F] fill-[#F7891F]" />
                {streak.monthlyEventsHosted} Event Panitia Bulan Ini
              </span>

              <div className="inline-flex p-1 bg-[#E8F5FA] rounded-xl">
                {(['peserta', 'organizer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onSwitchRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      role === r
                        ? 'bg-white text-[#377EC0] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'peserta' ? 'Peserta' : r === 'organizer' ? 'Panitia' : 'Admin'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F04F52]/10 hover:bg-[#F04F52]/20 text-[#F04F52] text-xs font-extrabold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          </div>

          {/* ================= PESERTA DASHBOARD ================= */}
          {role === 'peserta' && (
            <div className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-pixel text-xl text-slate-900">
                    E-Tiket, Check-in & Sertifikat Saya
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Kelola pengingat H-1, scan QR saat hadir, dan unduh sertifikat setelah mengisi feedback.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoToMap}
                  className="px-4 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold shrink-0 cursor-pointer"
                >
                  + Cari Event di Google Maps
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#E8F5FA] text-center space-y-2">
                  <p className="text-sm font-extrabold text-slate-700">Belum ada tiket aktif.</p>
                  <p className="text-xs font-bold text-slate-500">
                    Pilih event di peta untuk membeli tiket pertamamu.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-3xl bg-[#E8F5FA]/70 border border-[#9FD2D6] flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-extrabold text-[#377EC0] tabular-nums">
                            {ord.eventDateLabel} · {ord.eventTimeLabel}
                          </p>
                          <h4 className="font-pixel text-lg text-slate-900 mt-0.5">
                            {ord.eventTitle}
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{ord.eventVenue}</p>
                          <p className="text-xs font-bold text-slate-700 mt-2">
                            {ord.quantity}x {ord.tierName} · Kode:{' '}
                            <span className="font-mono text-[#377EC0]">{ord.qrCode}</span>
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-sm flex items-center justify-center shrink-0">
                          <QrCode className="w-11 h-11 text-slate-900" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#9FD2D6]/60 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleReminder(ord.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer ${
                            ord.reminderActive
                              ? 'bg-[#FBDF54] text-slate-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {ord.reminderActive ? 'Pengingat H-1 Aktif' : 'Aktifkan Pengingat'}
                        </button>

                        {!ord.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => onCheckInOrder(ord.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Scan QR Check-in
                          </button>
                        ) : !ord.feedbackSubmitted ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackOrderId(ord.id);
                              setRating(5);
                              setComment('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#12BAAA] hover:opacity-90 text-white text-xs font-extrabold cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Isi Feedback & Sertifikat
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCertificateOrder(ord)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Lihat & Unduh Sertifikat
                          </button>
                        )}
                      </div>

                      {feedbackOrderId === ord.id && (
                        <div className="p-4 rounded-2xl bg-white border border-[#9FD2D6] space-y-3">
                          <p className="text-xs font-extrabold text-slate-900">
                            Bagaimana pengalamanmu di event ini?
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                aria-label={`Beri rating ${star} bintang`}
                                className="p-1 cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= rating
                                      ? 'fill-[#FBDF54] text-[#F7891F]'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tulis ulasan singkat..."
                            className="w-full px-3 py-2 text-xs font-bold bg-[#E8F5FA] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setFeedbackOrderId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-500 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSubmitFeedback(
                                  ord.id,
                                  rating,
                                  comment.trim() || 'Acara sangat seru dan rapi!'
                                );
                                setFeedbackOrderId(null);
                                setCertificateOrder({ ...ord, feedbackSubmitted: true, rating });
                              }}
                              className="px-4 py-1.5 rounded-xl bg-[#377EC0] text-white text-xs font-extrabold cursor-pointer"
                            >
                              Kirim & Buka Sertifikat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {certificateOrder && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#E8F5FA] to-[#FBDF54]/25 border border-[#9FD2D6] text-center space-y-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#377EC0]">
                    Sertifikat Kehadiran Digital
                  </p>
                  <h4 className="font-pixel text-2xl text-slate-900">
                    {certificateOrder.attendeeName}
                  </h4>
                  <p className="text-xs font-bold text-slate-600">
                    Telah hadir & menyelesaikan event{' '}
                    <strong>{certificateOrder.eventTitle}</strong> pada{' '}
                    {certificateOrder.eventDateLabel}.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadCertificateFile(certificateOrder)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Sertifikat
                    </button>
                    <button
                      type="button"
                      onClick={() => setCertificateOrder(null)}
                      className="px-4 py-2.5 rounded-xl bg-white text-slate-700 text-xs font-extrabold cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ORGANIZER (PANITIA) DASHBOARD ================= */}
          {role === 'organizer' && (
            <div className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex p-1 bg-[#E8F5FA] rounded-2xl self-start">
                  <button
                    type="button"
                    onClick={() => setOrgTab('events')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                      orgTab === 'events'
                        ? 'bg-white text-[#377EC0] shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Event & Pengajuan
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrgTab('checkin')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                      orgTab === 'checkin'
                        ? 'bg-white text-[#377EC0] shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Check-in QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrgTab('report')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                      orgTab === 'report'
                        ? 'bg-white text-[#377EC0] shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Laporan Evaluasi
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm((s) => !s);
                    setOrgTab('events');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F7891F] hover:bg-[#F04F52] text-white text-xs font-extrabold shadow-sm cursor-pointer transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  {showCreateForm ? 'Tutup Form Event' : 'Buat Event Baru (+1 Streak)'}
                </button>
              </div>

              {showCreateForm && (
                <div className="p-5 sm:p-6 rounded-3xl bg-[#E8F5FA]/70 border border-[#9FD2D6] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-pixel text-xl text-slate-900">
                      Buat Event Baru (Panitia)
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
                      <span
                        className={`px-2.5 py-1 rounded-lg ${
                          wizardStep === 1
                            ? 'bg-[#377EC0] text-white'
                            : 'bg-white text-[#377EC0]'
                        }`}
                      >
                        1. Detail & Kota
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg ${
                          wizardStep === 2
                            ? 'bg-[#377EC0] text-white'
                            : 'bg-white text-[#377EC0]'
                        }`}
                      >
                        2. Tiket & Promo
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg ${
                          wizardStep === 3
                            ? 'bg-[#377EC0] text-white'
                            : 'bg-white text-[#377EC0]'
                        }`}
                      >
                        3. Rundown & Ajukan
                      </span>
                    </div>
                  </div>

                  {wizardStep === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Nama event (misal: Festival Musik Biru)"
                        className="sm:col-span-2 px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl focus:outline-none focus:border-[#377EC0]"
                      />
                      <select
                        value={newCategory}
                        onChange={(e) =>
                          setNewCategory(e.target.value as EventItem['category'])
                        }
                        className="px-3 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      >
                        <option value="Kreatif">Kreatif</option>
                        <option value="Teknologi">Teknologi</option>
                        <option value="Musik">Musik</option>
                        <option value="Bisnis">Bisnis</option>
                        <option value="Komunitas">Komunitas</option>
                      </select>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="px-3 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      />
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="Jam (10:00 – 16:00 WIB)"
                        className="px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      />
                      <select
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="px-3 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      >
                        {Object.keys(CITY_COORDS).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newVenue}
                        onChange={(e) => setNewVenue(e.target.value)}
                        placeholder="Nama lokasi / venue"
                        className="px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      />
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Keterangan area lokasi"
                        className="px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                      />
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Nama Jenis Tiket
                        </label>
                        <input
                          type="text"
                          value={newTierName}
                          onChange={(e) => setNewTierName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Harga Tiket (Rp)
                        </label>
                        <input
                          type="number"
                          value={newTierPrice}
                          onChange={(e) => setNewTierPrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Kuota Peserta
                        </label>
                        <input
                          type="number"
                          value={newTierQuota}
                          onChange={(e) => setNewTierQuota(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Kode Promo (Diskon 15%)
                        </label>
                        <input
                          type="text"
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Jam & Nama Sesi Rundown
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRundownTime}
                            onChange={(e) => setNewRundownTime(e.target.value)}
                            className="w-20 px-3 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                          />
                          <input
                            type="text"
                            value={newRundownTitle}
                            onChange={(e) => setNewRundownTitle(e.target.value)}
                            className="flex-1 px-3 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Pembicara / Guest Star
                        </label>
                        <input
                          type="text"
                          value={newSpeaker}
                          onChange={(e) => setNewSpeaker(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Sponsor / Mitra Acara
                        </label>
                        <input
                          type="text"
                          value={newSponsor}
                          onChange={(e) => setNewSponsor(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-[#9FD2D6] rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  {wizardError && (
                    <p className="text-xs font-extrabold text-[#F04F52]">{wizardError}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep((s) => (s - 1) as 1 | 2 | 3)}
                        className="px-4 py-2 rounded-xl bg-white border border-[#9FD2D6] text-xs font-extrabold text-slate-700 cursor-pointer"
                      >
                        ← Sebelumnya
                      </button>
                    ) : (
                      <span />
                    )}

                    {wizardStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep((s) => (s + 1) as 1 | 2 | 3)}
                        className="px-5 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold cursor-pointer"
                      >
                        Lanjut →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCreateEventSubmit}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ajukan ke Admin (+1 Streak)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {orgTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((ev) => {
                    const sold = ev.tiers.reduce((s, t) => s + t.sold, 0);
                    const quota = ev.tiers.reduce((s, t) => s + t.quota, 0);
                    return (
                      <div
                        key={ev.id}
                        className="p-5 rounded-3xl bg-[#E8F5FA]/60 border border-[#9FD2D6]/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-extrabold text-slate-400">
                              {ev.dateLabel} · {ev.city}
                            </p>
                            <h4 className="font-pixel text-lg text-slate-900">
                              {ev.title}
                            </h4>
                          </div>
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                              ev.status === 'published'
                                ? 'bg-[#12BAAA]/15 text-[#12BAAA]'
                                : ev.status === 'pending'
                                ? 'bg-[#FBDF54]/50 text-slate-900'
                                : 'bg-[#F04F52]/15 text-[#F04F52]'
                            }`}
                          >
                            {ev.status === 'published'
                              ? 'Tayang'
                              : ev.status === 'pending'
                              ? 'Menunggu Review'
                              : 'Perlu Revisi'}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-600 tabular-nums">
                          Penjualan tiket: <strong>{sold}</strong> / {quota} kuota
                        </p>

                        {ev.status === 'revision' && (
                          <div className="p-3.5 rounded-2xl bg-[#F04F52]/10 border border-[#F04F52]/30 space-y-2">
                            <p className="text-xs font-extrabold text-[#F04F52] flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Catatan Revisi Admin: {ev.revisionNote}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={revisionEditTitles[ev.id] ?? ev.title}
                                onChange={(e) =>
                                  setRevisionEditTitles((prev) => ({
                                    ...prev,
                                    [ev.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-3 py-1.5 text-xs font-bold bg-white rounded-xl border border-[#F04F52]/30"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onResubmitEvent(
                                    ev.id,
                                    revisionEditTitles[ev.id] ?? ev.title
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-[#377EC0] text-white text-xs font-extrabold cursor-pointer"
                              >
                                Ajukan Ulang
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {orgTab === 'checkin' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500">
                    Konfirmasi kehadiran peserta dengan memverifikasi kode QR e-tiket mereka.
                  </p>
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-[#E8F5FA]/70 border border-[#9FD2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {ord.attendeeName} ·{' '}
                          <span className="font-mono text-[#377EC0]">{ord.qrCode}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-500">
                          {ord.eventTitle} ({ord.quantity}x {ord.tierName})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCheckInOrder(ord.id)}
                        disabled={ord.checkedIn}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          ord.checkedIn
                            ? 'bg-[#12BAAA]/15 text-[#12BAAA] cursor-default'
                            : 'bg-[#377EC0] hover:bg-[#5460AC] text-white'
                        }`}
                      >
                        {ord.checkedIn ? 'Sudah Check-in ✓' : 'Scan & Check-in'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {orgTab === 'report' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-[#E8F5FA]">
                    <Ticket className="w-5 h-5 text-[#377EC0] mb-2" />
                    <p className="text-xs font-extrabold text-[#377EC0]">Total Tiket Terjual</p>
                    <p className="font-pixel text-3xl text-slate-900 tabular-nums mt-1">
                      {totalTicketsSold}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-[#FFF4E5]">
                    <Users className="w-5 h-5 text-[#F7891F] mb-2" />
                    <p className="text-xs font-extrabold text-[#F7891F]">Kehadiran Check-in</p>
                    <p className="font-pixel text-3xl text-slate-900 tabular-nums mt-1">
                      {orders.filter((o) => o.checkedIn).length} / {orders.length}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-[#E6F9F7]">
                    <BarChart3 className="w-5 h-5 text-[#12BAAA] mb-2" />
                    <p className="text-xs font-extrabold text-[#12BAAA]">Event Aktif di Peta</p>
                    <p className="font-pixel text-3xl text-slate-900 tabular-nums mt-1">
                      {publishedEvents.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ADMIN PLATFORM DASHBOARD ================= */}
          {role === 'admin' && (
            <div className="pt-6 space-y-6">
              <div>
                <h3 className="font-pixel text-xl text-slate-900">
                  Review Pengajuan Event Panitia
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  Setujui pengajuan untuk mempublikasikan event ke Google Maps & katalog, atau kirim catatan revisi ke panitia.
                </p>
              </div>

              {pendingEvents.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#E8F5FA] text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#377EC0] mx-auto" />
                  <p className="text-sm font-extrabold text-slate-800">
                    Semua pengajuan event sudah direview!
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    Coba beralih ke peran Panitia dan ajukan event baru untuk melihatnya masuk di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-3xl bg-[#E8F5FA]/70 border border-[#9FD2D6] space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#377EC0]">
                            {ev.category} · {ev.city} · {ev.dateLabel}
                          </p>
                          <h4 className="font-pixel text-xl text-slate-900 mt-0.5">
                            {ev.title}
                          </h4>
                          <p className="text-xs font-bold text-slate-600 mt-1">
                            Panitia: <strong>{ev.organizerName}</strong> · Lokasi: {ev.venue}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRevisionBox((prev) => (prev === ev.id ? null : ev.id))
                            }
                            className="px-4 py-2.5 rounded-xl bg-[#FBDF54] hover:bg-[#F7891F] hover:text-white text-slate-900 text-xs font-extrabold cursor-pointer transition-colors"
                          >
                            Kirim Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdminApprove(ev.id)}
                            className="px-4 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold shadow-sm cursor-pointer"
                          >
                            Publikasikan ke Katalog
                          </button>
                        </div>
                      </div>

                      {openRevisionBox === ev.id && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <input
                            type="text"
                            value={revisionInputs[ev.id] || ''}
                            onChange={(e) =>
                              setRevisionInputs((prev) => ({
                                ...prev,
                                [ev.id]: e.target.value,
                              }))
                            }
                            placeholder="Tulis catatan revisi (misal: lengkapi detail rundown)"
                            className="flex-1 px-3.5 py-2 text-xs font-bold bg-white rounded-xl border border-[#F7891F]/50 focus:outline-none focus:border-[#F7891F]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const note =
                                revisionInputs[ev.id]?.trim() ||
                                'Mohon lengkapi detail jadwal dan lokasi acara.';
                              onAdminReject(ev.id, note);
                              setOpenRevisionBox(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#F04F52] text-white text-xs font-extrabold cursor-pointer"
                          >
                            Kirim Catatan Revisi
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
