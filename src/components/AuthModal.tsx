import React, { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  X,
  Sparkles,
  Loader2,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  BroadcastEmailInfo,
  PENDING_GOOGLE_ROLE_KEY,
  parseJsonResponse,
  syncGoogleTokenWithServer,
} from '../lib/auth-client';
import { PeekingMascots, RoleMascot, UserRole } from './EvoraMascots';
import { AvatarConfig, UserAccount } from '../types/evora';

export type { BroadcastEmailInfo };

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
  const [step, setStep] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewTabHelp, setShowNewTabHelp] = useState(false);
  const [showSwitchToLogin, setShowSwitchToLogin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setRole(initialRole);
      setError(null);
      setShowNewTabHelp(false);
      setShowSwitchToLogin(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleGoogleSignIn = async () => {
    if (loading || googleLoading) return;
    setError(null);
    setShowNewTabHelp(false);
    setShowSwitchToLogin(false);
    setGoogleLoading(true);

    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      const synced = await syncGoogleTokenWithServer({ idToken, role });
      onAuthenticated({
        user: synced.user,
        token: synced.token,
        avatarConfig: synced.avatarConfig,
        broadcastEmail: synced.broadcastEmail,
      });
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      const code = firebaseErr?.code || '';

      if (
        !inIframe &&
        (code === 'auth/popup-blocked' ||
          code === 'auth/operation-not-supported-in-this-environment' ||
          code === 'auth/internal-error')
      ) {
        try {
          sessionStorage.setItem(PENDING_GOOGLE_ROLE_KEY, role);
          await signInWithRedirect(auth, googleAuthProvider);
          return;
        } catch (redirectErr) {
          console.error('Google redirect fallback failed:', redirectErr);
        }
      }

      if (code === 'auth/popup-closed-by-user') {
        setError('Jendela login Google ditutup sebelum selesai. Klik lagi lalu pilih akun Google kamu.');
      } else if (code === 'auth/cancelled-popup-request') {
        setError('Permintaan pop-up Google sebelumnya dibatalkan. Silakan klik sekali lagi.');
      } else if (code === 'auth/popup-blocked' || code === 'auth/internal-error') {
        setShowNewTabHelp(inIframe);
        setError(
          inIframe
            ? 'Popup login Google diblokir di mode pratinjau/iframe. Izinkan pop-up di browser atau buka EVORA di tab baru.'
            : 'Popup login Google diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setError(
          `Domain "${window.location.hostname}" belum terdaftar di Firebase Authorized Domains. Gunakan domain resmi EVORA atau Daftar Manual.`
        );
      } else if (code === 'auth/network-request-failed') {
        setError('Koneksi ke layanan Google terganggu. Periksa internet lalu coba lagi.');
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Sinkronisasi akun Google melebihi batas waktu. Coba lagi sebentar.');
      } else if (err instanceof Error && err.message && !code) {
        setError(err.message);
      } else {
        console.error('Google sign-in error:', code || err);
        setError('Login Google gagal diproses. Coba izinkan pop-up atau gunakan Daftar Manual.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    if (!validateEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setError(null);
    setShowNewTabHelp(false);
    setShowSwitchToLogin(false);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });
      const parsed = await parseJsonResponse<{
        user?: UserAccount;
        token?: string;
        avatarConfig?: AvatarConfig | null;
        error?: string;
      }>(res);

      if (!parsed.ok || !parsed.data?.user || !parsed.data?.token) {
        setError(
          parsed.data?.error ||
            (parsed.status >= 500 || parsed.status === 404
              ? `Server login belum siap (HTTP ${parsed.status}). Pastikan server EVORA aktif.`
              : 'Email atau kata sandi salah.')
        );
        return;
      }

      onAuthenticated({
        user: parsed.data.user,
        token: parsed.data.token,
        avatarConfig: parsed.data.avatarConfig ?? null,
        broadcastEmail: null,
      });
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      setError(
        isTimeout
          ? 'Permintaan masuk melebihi batas waktu. Coba lagi sebentar.'
          : 'Tidak dapat terhubung ke server autentikasi. Coba lagi sebentar.'
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    if (name.trim().length < 2) {
      setError('Masukkan nama lengkap minimal 2 karakter.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Buat kata sandi minimal 6 karakter.');
      return;
    }

    setError(null);
    setShowNewTabHelp(false);
    setShowSwitchToLogin(false);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);
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
      const parsed = await parseJsonResponse<{
        ok?: boolean;
        token?: string;
        user?: UserAccount;
        avatarConfig?: AvatarConfig | null;
        broadcastEmail?: BroadcastEmailInfo | null;
        error?: string;
      }>(res);

      if (!parsed.ok || !parsed.data?.ok || !parsed.data?.user || !parsed.data?.token) {
        if (parsed.status === 409) {
          setShowSwitchToLogin(true);
        }
        setError(
          parsed.data?.error ||
            (parsed.status >= 500 || parsed.status === 404
              ? `Server pendaftaran belum siap (HTTP ${parsed.status}). Pastikan server EVORA aktif.`
              : 'Gagal mendaftarkan akun.')
        );
        return;
      }

      onAuthenticated({
        user: parsed.data.user,
        token: parsed.data.token,
        avatarConfig: parsed.data.avatarConfig ?? null,
        broadcastEmail: parsed.data.broadcastEmail ?? null,
      });
    } catch (err: unknown) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      setError(
        isTimeout
          ? 'Permintaan pendaftaran melebihi batas waktu. Coba lagi sebentar.'
          : 'Gagal terhubung ke server pendaftaran.'
      );
    } finally {
      window.clearTimeout(timeoutId);
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
          <img
            src="/evora-logo.png"
            alt="Logo EVORA"
            id="auth-modal-title"
            className="h-14 w-auto object-contain mb-1.5"
          />
          <p className="text-xs text-slate-500 font-bold">
            Daftar Manual & Masuk Akun EVORA
          </p>
        </div>

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
              <div className="text-xs font-bold text-[#F04F52] text-center bg-[#FDECEC] p-2.5 rounded-xl space-y-2">
                <p>{error}</p>
                {showNewTabHelp && typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#F04F52]/30 text-[#377EC0] hover:bg-[#E8F5FA] text-[11px] font-extrabold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka EVORA di Tab Baru
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
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
              disabled={loading || googleLoading}
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
                  setShowNewTabHelp(false);
                  setShowSwitchToLogin(false);
                  setStep('register');
                }}
                className="font-extrabold text-[#377EC0] hover:underline cursor-pointer"
              >
                Daftar Manual Sekarang
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
              <div className="text-xs font-bold text-[#F04F52] text-center bg-[#FDECEC] p-2.5 rounded-xl space-y-2">
                <p>{error}</p>
                {showSwitchToLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setShowSwitchToLogin(false);
                      setStep('login');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#377EC0]/30 text-[#377EC0] hover:bg-[#E8F5FA] text-[11px] font-extrabold cursor-pointer"
                  >
                    Langsung ke Halaman Masuk →
                  </button>
                )}
                {showNewTabHelp && typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#F04F52]/30 text-[#377EC0] hover:bg-[#E8F5FA] text-[11px] font-extrabold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka EVORA di Tab Baru
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] disabled:opacity-60 text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 text-[#FBDF54]" />
              )}
              Daftar Sekarang
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
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
                  setShowNewTabHelp(false);
                  setShowSwitchToLogin(false);
                  setStep('login');
                }}
                className="font-extrabold text-[#377EC0] hover:underline cursor-pointer"
              >
                Masuk
              </button>
            </p>
          </form>
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
