import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Mail,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { EvoraHeroMascot, PeekingMascots, RoleMascot, UserRole } from './EvoraMascots';
import { AvatarConfig, UserAccount } from '../types/evora';

export interface BroadcastEmailInfo {
  subject: string;
  delivered: boolean;
  deliveryMode: string;
  notice: string;
  previewHtml: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onAuthenticated: (params: {
    user: UserAccount;
    token: string;
    avatarConfig?: AvatarConfig | null;
    broadcastEmail?: BroadcastEmailInfo | null;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  initialRole = 'peserta',
  onClose,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Real 6-digit OTP state
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpPreviewHtml, setOtpPreviewHtml] = useState<string | null>(null);
  const [showOtpInboxPreview, setShowOtpInboxPreview] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setRole(initialRole);
      setError(null);
      setOtpNotice(null);
      setOtpPreviewHtml(null);
      setShowOtpInboxPreview(false);
      setDevOtpHint(null);
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode, initialRole]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json()) as {
        user?: UserAccount;
        avatarConfig?: AvatarConfig | null;
        broadcastEmail?: BroadcastEmailInfo | null;
        error?: string;
      };
      if (!res.ok || !data.user) {
        setError(data.error || 'Gagal menyinkronkan akun Google.');
        return;
      }
      onAuthenticated({
        user: data.user,
        token: idToken,
        avatarConfig: data.avatarConfig ?? null,
        broadcastEmail: data.broadcastEmail ?? null,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message.includes('popup-closed')
          ? 'Jendela login Google ditutup sebelum selesai.'
          : 'Login Google dibatalkan atau gagal. Kamu juga bisa daftar langsung pakai OTP Gmail di bawah.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Masukkan alamat email Gmail yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });
      const data = (await res.json()) as {
        user?: UserAccount;
        token?: string;
        avatarConfig?: AvatarConfig | null;
        error?: string;
      };

      if (!res.ok || !data.user || !data.token) {
        setError(data.error || 'Email atau kata sandi salah.');
        return;
      }

      onAuthenticated({
        user: data.user,
        token: data.token,
        avatarConfig: data.avatarConfig ?? null,
        broadcastEmail: null,
      });
    } catch {
      setError('Tidak dapat terhubung ke server autentikasi. Coba lagi sebentar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Masukkan nama lengkap minimal 2 karakter.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Masukkan alamat email Gmail yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Buat kata sandi minimal 6 karakter.');
      return;
    }

    setError(null);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        notice?: string;
        otpPreviewHtml?: string;
        devOtpHint?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || 'Gagal mengirim kode OTP ke Gmail.');
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setOtpNotice(data.notice || 'Kode OTP 6 digit telah dikirim ke Gmail kamu.');
      setOtpPreviewHtml(data.otpPreviewHtml || null);
      setDevOtpHint(data.devOtpHint || null);
      setShowOtpInboxPreview(Boolean(data.devOtpHint && data.otpPreviewHtml));
      setResendCooldown(30);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      setError(
        isTimeout
          ? 'Permintaan kirim OTP melebihi batas waktu. Coba tekan Kirim Kode OTP lagi.'
          : 'Gagal terhubung ke server pendaftaran.'
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading || resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        notice?: string;
        otpPreviewHtml?: string;
        devOtpHint?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Gagal mengirim ulang OTP.');
        return;
      }
      setOtp(['', '', '', '', '', '']);
      setOtpNotice(data.notice || 'Kode OTP baru telah dikirim!');
      setOtpPreviewHtml(data.otpPreviewHtml || null);
      setDevOtpHint(data.devOtpHint || null);
      setShowOtpInboxPreview(Boolean(data.devOtpHint && data.otpPreviewHtml));
      setResendCooldown(30);
      otpRefs.current[0]?.focus();
    } catch {
      setError('Koneksi terputus saat mengirim ulang kode.');
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleAutoFillPreviewOtp = () => {
    if (!devOtpHint || devOtpHint.length !== 6) return;
    setOtp(devOtpHint.split(''));
    setError(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanDigits = value.replace(/\D/g, '');
    if (cleanDigits.length > 1) {
      // Support pasting full 6-digit OTP
      const split = cleanDigits.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      split.forEach((ch, idx) => {
        next[idx] = ch;
      });
      setOtp(next);
      setError(null);
      const focusIdx = Math.min(split.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const clean = cleanDigits.slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    setError(null);
    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Lengkapi 6 digit kode OTP yang dikirim ke Gmail kamu.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: code,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        user?: UserAccount;
        avatarConfig?: AvatarConfig | null;
        broadcastEmail?: BroadcastEmailInfo | null;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.user || !data.token) {
        setError(data.error || 'Kode OTP tidak valid.');
        return;
      }

      onAuthenticated({
        user: data.user,
        token: data.token,
        avatarConfig: data.avatarConfig ?? null,
        broadcastEmail: data.broadcastEmail ?? null,
      });
    } catch {
      setError('Gagal memverifikasi OTP ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[430px] bg-white rounded-[36px] p-6 sm:p-7 shadow-2xl border border-[#9FD2D6] overflow-hidden my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela akses"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-4">
          <div className="scale-90 -my-1">
            <EvoraHeroMascot />
          </div>
          <h2 id="auth-modal-title" className="font-pixel text-2xl text-slate-900 tracking-tight">
            EVORA
          </h2>
          <p className="text-xs text-slate-400 font-bold">
            Akun Terverifikasi OTP Gmail & Event Broadcast
          </p>
        </div>

        {step !== 'otp' && (
          <div className="mb-4">
            <p className="text-[11px] font-extrabold text-slate-500 text-center mb-2">
              {step === 'register' ? 'Daftar sebagai:' : 'Masuk sebagai:'}
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8F5FA] rounded-2xl">
              {(['peserta', 'organizer', 'admin'] as UserRole[]).map((r) => {
                const label =
                  r === 'peserta' ? 'Peserta' : r === 'organizer' ? 'Panitia' : 'Admin';
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === r
                        ? 'bg-white text-[#377EC0] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RoleMascot role={r} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <h3 className="font-pixel text-lg text-slate-900 text-center">
              Masuk ke Akun EVORA
            </h3>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              aria-label="Email"
              autoComplete="email"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi (min. 6 karakter)"
                aria-label="Kata sandi"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#377EC0] cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-bold text-[#F04F52] text-center bg-[#FDECEC] p-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] disabled:opacity-60 text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Masuk Sekarang
            </button>

            <div className="relative py-1 flex items-center justify-center">
              <span className="border-t border-slate-200 w-full" />
              <span className="px-2.5 bg-white text-[11px] font-bold text-slate-400 shrink-0">
                atau
              </span>
              <span className="border-t border-slate-200 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F4FAFC] border border-[#9FD2D6] text-slate-800 text-xs font-extrabold rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#377EC0]" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#377EC0] text-white text-[10px] font-extrabold flex items-center justify-center">
                  G
                </span>
              )}
              Masuk Instan dengan Google
            </button>

            <p className="text-xs font-bold text-slate-500 text-center pt-1">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep('register');
                }}
                className="font-extrabold text-[#377EC0] hover:underline cursor-pointer"
              >
                Daftar & Verifikasi OTP Gmail
              </button>
            </p>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <h3 className="font-pixel text-lg text-slate-900 text-center">
              {role === 'organizer'
                ? 'Registrasi Akun Panitia'
                : role === 'admin'
                ? 'Registrasi Admin Platform'
                : 'Daftar Akun Baru EVORA'}
            </h3>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'organizer' ? 'Nama organisasi / panitia' : 'Nama lengkap kamu'}
              aria-label="Nama lengkap"
              autoComplete="name"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com (untuk terima OTP & Broadcast)"
              aria-label="Email Gmail"
              autoComplete="email"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi (min. 6 karakter)"
                aria-label="Kata sandi"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-11 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#377EC0] cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-bold text-[#F04F52] text-center bg-[#FDECEC] p-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] disabled:opacity-60 text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 text-[#FBDF54]" />
              )}
              Kirim Kode OTP ke Gmail
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F4FAFC] border border-[#9FD2D6] text-slate-800 text-xs font-extrabold rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#377EC0]" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#377EC0] text-white text-[10px] font-extrabold flex items-center justify-center">
                  G
                </span>
              )}
              Atau Daftar Cepat dengan Google
            </button>

            <p className="text-xs font-bold text-slate-500 text-center pt-1">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep('login');
                }}
                className="font-extrabold text-[#377EC0] hover:underline cursor-pointer"
              >
                Masuk
              </button>
            </p>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-4 text-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F9F7] text-[#0F766E] text-[11px] font-extrabold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verifikasi 6 Digit OTP Gmail
              </div>
              <h3 className="font-pixel text-lg text-slate-900">Masukkan Kode OTP</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Dikirim ke <strong className="text-slate-800">{email}</strong>
              </p>
            </div>

            {otpNotice && (
              <div className="p-2.5 rounded-xl bg-[#E8F5FA] border border-[#9FD2D6] text-[11px] font-bold text-slate-700 text-left space-y-2">
                <p>{otpNotice}</p>
                {devOtpHint && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#9FD2D6]/60">
                    <span className="text-[#1E3A8A] font-extrabold">
                      Kode OTP:{' '}
                      <code className="px-2 py-0.5 rounded bg-white border border-[#377EC0] font-mono text-xs text-[#377EC0]">
                        {devOtpHint}
                      </code>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFillPreviewOtp}
                        className="px-2 py-1 rounded-lg bg-[#377EC0] hover:bg-[#5460AC] text-white text-[10px] font-extrabold cursor-pointer"
                      >
                        Isi Otomatis
                      </button>
                      {otpPreviewHtml && (
                        <button
                          type="button"
                          onClick={() => setShowOtpInboxPreview((s) => !s)}
                          className="text-[11px] font-extrabold text-[#377EC0] underline cursor-pointer"
                        >
                          {showOtpInboxPreview ? 'Sembunyikan' : 'Lihat Email'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showOtpInboxPreview && otpPreviewHtml && (
              <div className="rounded-2xl border border-[#9FD2D6] overflow-hidden bg-white shadow-inner">
                <iframe
                  srcDoc={otpPreviewHtml}
                  sandbox=""
                  title="Pratinjau Email OTP EVORA"
                  className="w-full h-48 border-0"
                />
              </div>
            )}

            <div className="flex justify-center gap-1.5 sm:gap-2 py-1">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  placeholder="•"
                  aria-label={`Digit OTP ${idx + 1}`}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 sm:w-11 h-12 text-center font-pixel text-xl tabular-nums bg-[#E8F5FA] border border-[#9FD2D6]/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#377EC0] focus:outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <p className="text-xs font-bold text-[#F04F52] bg-[#FDECEC] p-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleOtpVerify}
              disabled={loading}
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] disabled:opacity-60 text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Verifikasi & Kirim Broadcast Sambutan
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-slate-400 hover:text-[#377EC0] font-bold cursor-pointer"
              >
                ← Ubah Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                className="font-extrabold text-[#377EC0] hover:underline disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0
                  ? `Kirim ulang (${resendCooldown}d)`
                  : 'Kirim ulang OTP'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <PeekingMascots />
        </div>
      </div>
    </div>
  );
};

interface BroadcastModalProps {
  broadcast: BroadcastEmailInfo | null;
  recipientEmail?: string;
  onClose: () => void;
}

export const BroadcastPreviewModal: React.FC<BroadcastModalProps> = ({
  broadcast,
  recipientEmail,
  onClose,
}) => {
  if (!broadcast) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] p-5 sm:p-6 shadow-2xl border border-[#9FD2D6] my-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4E5] border border-[#FBDF54] text-[#B45309] text-[11px] font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              {broadcast.delivered
                ? 'Terkirim ke Kotak Masuk Gmail!'
                : 'Pratinjau Email Broadcast EVORA'}
            </div>
            <h2 id="broadcast-modal-title" className="font-pixel text-xl text-slate-900">
              {broadcast.subject}
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Penerima: <strong className="text-slate-800">{recipientEmail || 'Gmail Kamu'}</strong> ·{' '}
              {broadcast.notice}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau broadcast"
            className="w-10 h-10 rounded-full bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border-2 border-[#9FD2D6] overflow-hidden bg-[#E8F5FA]">
          <iframe
            srcDoc={broadcast.previewHtml}
            sandbox=""
            title="Email Broadcast Sambutan EVORA"
            className="w-full h-[460px] border-0"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold cursor-pointer"
          >
            Sip, Lanjut Jelajahi EVORA!
          </button>
        </div>
      </div>
    </div>
  );
};
