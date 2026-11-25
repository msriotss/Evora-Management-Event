import React, { useState } from 'react';
import {
  X,
  Ticket,
  User,
  CreditCard,
  QrCode,
  Bell,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { EventItem, TicketOrder, UserAccount } from '../types/evora';

interface PesertaFlowModalProps {
  event: EventItem | null;
  currentUser: UserAccount | null;
  onClose: () => void;
  onOrderComplete: (order: TicketOrder) => void;
}

type CheckoutStep = 'tier' | 'attendee' | 'payment' | 'failed' | 'ticket';

export const PesertaFlowModal: React.FC<PesertaFlowModalProps> = ({
  event,
  currentUser,
  onClose,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<CheckoutStep>('tier');
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  const [attendeeName, setAttendeeName] = useState(currentUser?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || '');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Virtual Account' | 'E-Wallet'>(
    'QRIS'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<TicketOrder | null>(null);

  if (!event) return null;

  const activeTier =
    event.tiers.find((t) => t.id === selectedTierId) || event.tiers[0];

  const subtotal = (activeTier?.price ?? 0) * quantity;
  const discount =
    promoApplied && event.promoDiscountPercent
      ? Math.round((subtotal * event.promoDiscountPercent) / 100)
      : 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    if (
      event.promoCode &&
      promoInput.trim().toUpperCase() === event.promoCode.toUpperCase()
    ) {
      setPromoApplied(true);
      setFormError(null);
    } else {
      setPromoApplied(false);
      setFormError(
        event.promoCode
          ? `Kode promo tidak cocok. Coba: ${event.promoCode}`
          : 'Event ini tidak memiliki kode promo aktif.'
      );
    }
  };

  const handleAttendeeNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendeeName.trim().length < 2) {
      setFormError('Nama peserta wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail.trim())) {
      setFormError('Masukkan email peserta yang valid.');
      return;
    }
    if (attendeePhone.trim().length < 8) {
      setFormError('Masukkan nomor HP yang valid.');
      return;
    }
    setFormError(null);
    setStep('payment');
  };

  const completePayment = () => {
    const newOrder: TicketOrder = {
      id: `ord-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDateLabel: event.dateLabel,
      eventTimeLabel: event.timeLabel,
      eventVenue: `${event.venue}, ${event.city}`,
      tierName: activeTier.name,
      quantity,
      totalPaid: total,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim(),
      attendeePhone: attendeePhone.trim(),
      paymentMethod,
      qrCode: `EVR-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      checkedIn: false,
      reminderActive: true,
      feedbackSubmitted: false,
      purchasedAt: '25 Nov 2026',
    };
    setCreatedOrder(newOrder);
    onOrderComplete(newOrder);
    setStep('ticket');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#9FD2D6] my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pendaftaran tiket"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-10 mb-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#377EC0]">
            Pendaftaran Peserta
          </p>
          <h2 id="checkout-modal-title" className="font-pixel text-2xl text-slate-900 mt-0.5">
            {event.title}
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#377EC0]" />
              {event.dateLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F04F52]" />
              {event.venue}
            </span>
          </p>
        </div>

        {step !== 'ticket' && (
          <div className="grid grid-cols-3 gap-2 mb-6 text-[11px] font-extrabold">
            <div
              className={`py-1.5 text-center rounded-xl ${
                step === 'tier'
                  ? 'bg-[#377EC0] text-white'
                  : 'bg-[#E8F5FA] text-[#377EC0]'
              }`}
            >
              1. Pilih Tiket
            </div>
            <div
              className={`py-1.5 text-center rounded-xl ${
                step === 'attendee'
                  ? 'bg-[#377EC0] text-white'
                  : step === 'payment' || step === 'failed'
                  ? 'bg-[#E8F5FA] text-[#377EC0]'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2. Data Peserta
            </div>
            <div
              className={`py-1.5 text-center rounded-xl ${
                step === 'payment' || step === 'failed'
                  ? 'bg-[#377EC0] text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3. Pembayaran
            </div>
          </div>
        )}

        {step === 'tier' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {event.tiers.map((tier) => {
                const isSelected = activeTier.id === tier.id;
                const remaining = Math.max(0, tier.quota - tier.sold);
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#377EC0] bg-[#E8F5FA] ring-2 ring-[#9FD2D6]'
                        : 'border-slate-200 hover:border-[#9FD2D6] bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{tier.name}</p>
                      <p className="text-xs font-bold text-slate-500 tabular-nums">
                        Tersisa {remaining} kuota
                      </p>
                    </div>
                    <p className="font-pixel text-base text-[#377EC0] tabular-nums">
                      {tier.price === 0
                        ? 'Gratis'
                        : `Rp ${tier.price.toLocaleString('id-ID')}`}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#E8F5FA]/70 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">Jumlah Tiket</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-[#9FD2D6] font-extrabold text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-extrabold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-[#9FD2D6] font-extrabold text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={event.promoCode ? `Promo: ${event.promoCode}` : 'Kode promo'}
                  aria-label="Kode promo"
                  className="flex-1 min-w-0 px-3 py-2 text-xs font-bold bg-[#E8F5FA]/70 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-2 bg-slate-900 text-white text-xs font-extrabold rounded-xl shrink-0 cursor-pointer"
                >
                  Pakai
                </button>
              </div>
            </div>

            {formError && <p className="text-xs font-bold text-[#F04F52]">{formError}</p>}
            {promoApplied && (
              <p className="text-xs font-bold text-[#12BAAA]">
                Promo {event.promoDiscountPercent}% berhasil diterapkan!
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400">Total Pembayaran</p>
                <p className="font-pixel text-xl text-slate-900 tabular-nums">
                  {total === 0 ? 'Gratis' : `Rp ${total.toLocaleString('id-ID')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setStep('attendee');
                }}
                className="px-5 py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md shadow-[#377EC0]/25 inline-flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                Isi Data Peserta
              </button>
            </div>
          </div>
        )}

        {step === 'attendee' && (
          <form onSubmit={handleAttendeeNext} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Nama Lengkap Peserta
              </label>
              <input
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="Nama sesuai identitas"
                className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#377EC0] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email Pengiriman E-Tiket
              </label>
              <input
                type="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#377EC0] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Nomor WhatsApp / HP
              </label>
              <input
                type="tel"
                value={attendeePhone}
                onChange={(e) => setAttendeePhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#377EC0] focus:outline-none"
              />
            </div>

            {formError && <p className="text-xs font-bold text-[#F04F52]">{formError}</p>}

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('tier')}
                className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold cursor-pointer"
              >
                ← Ubah Tiket
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Pilih Pembayaran
              </button>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <p className="text-xs font-extrabold text-slate-600">Pilih metode pembayaran:</p>

            <div className="grid grid-cols-1 gap-2.5">
              {(['QRIS', 'Virtual Account', 'E-Wallet'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'border-[#377EC0] bg-[#E8F5FA] ring-2 ring-[#9FD2D6]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#377EC0]" />
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {method}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#12BAAA]">Instan</span>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5FA]/70 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                {quantity}x {activeTier.name}
              </span>
              <span className="font-pixel text-lg text-slate-900 tabular-nums">
                {total === 0 ? 'Gratis' : `Rp ${total.toLocaleString('id-ID')}`}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={completePayment}
                className="w-full py-3.5 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-2xl shadow-md shadow-[#377EC0]/25 cursor-pointer"
              >
                Bayar Sekarang & Terbitkan E-Tiket
              </button>
              <button
                type="button"
                onClick={() => setStep('failed')}
                className="w-full py-2.5 bg-[#F04F52]/10 hover:bg-[#F04F52]/20 text-[#F04F52] text-xs font-extrabold rounded-xl cursor-pointer"
              >
                Simulasi Pembayaran Gagal / Kedaluwarsa
              </button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F04F52]/15 text-[#F04F52] flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-pixel text-xl text-slate-900">
                Pembayaran Gagal / Kedaluwarsa
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1 max-w-xs mx-auto">
                Batas waktu pembayaran berakhir atau transaksi dibatalkan. Kamu bisa memilih ulang metode pembayaran.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('payment')}
              className="px-6 py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-2xl shadow-md cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {step === 'ticket' && createdOrder && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#12BAAA] text-xs font-extrabold">
              <CheckCircle2 className="w-4 h-4" />
              Pembayaran Berhasil! E-Tiket Siap Digunakan
            </div>

            <div className="p-5 rounded-3xl bg-[#E8F5FA] border border-[#9FD2D6] space-y-3">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-3 shadow-sm flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <div>
                <p className="font-pixel text-sm text-[#377EC0] tabular-nums">
                  {createdOrder.qrCode}
                </p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  {createdOrder.attendeeName}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {createdOrder.quantity}x {createdOrder.tierName} · {createdOrder.paymentMethod}
                </p>
              </div>
              <div className="pt-2 border-t border-[#9FD2D6] flex items-center justify-center gap-2 text-xs text-[#377EC0] font-extrabold">
                <Bell className="w-3.5 h-3.5" />
                Pengingat otomatis H-1 & info venue aktif
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold rounded-2xl cursor-pointer"
            >
              Selesai & Lihat di Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
