import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';
import { EvoraHeroMascot, PeekingMascots, RoleMascot, UserRole } from './EvoraMascots';
import { UserAccount } from '../types/evora';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onAuthenticated: (user: UserAccount) => void;
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
  const [otp, setOtp] = useState<string[]>(['5', '2', '9', '']);
  const [error, setError] = useState<string | null>(null);
  const [otpResent, setOtpResent] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setRole(initialRole);
      setError(null);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Kata sandi minimal 4 karakter.');
      return;
    }
    setError(null);
    onAuthenticated({
      id: `usr-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role,
      verified: true,
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Masukkan nama lengkap Anda.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Buat kata sandi minimal 4 karakter.');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    setError(null);
    if (clean && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = () => {
    const filled = otp.every((d) => d.length === 1);
    if (!filled) {
      setError('Lengkapi 4 digit kode OTP.');
      return;
    }
    setError(null);
    onAuthenticated({
      id: `usr-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role,
      verified: true,
    });
  };

  const quickFillDemo = (demoRole: UserRole) => {
    setRole(demoRole);
    const defaults: Record<UserRole, { name: string; email: string }> = {
      peserta: { name: 'Satrio Wibisono', email: 'peserta@evora.id' },
      organizer: { name: 'Kolektif Ruang Karya', email: 'panitia@evora.id' },
      admin: { name: 'Admin EVORA', email: 'admin@evora.id' },
    };
    setName(defaults[demoRole].name);
    setEmail(defaults[demoRole].email);
    setPassword('evora2026');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[390px] bg-white rounded-[36px] p-6 sm:p-7 shadow-2xl border border-[#9FD2D6] overflow-hidden my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela akses"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="scale-90 -my-1">
            <EvoraHeroMascot />
          </div>
          <h2 id="auth-modal-title" className="font-pixel text-2xl text-slate-900 tracking-tight">
            EVORA
          </h2>
          <p className="text-xs text-slate-400 font-bold">Event Management Platform</p>
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
              Selamat datang kembali!
            </h3>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-label="Email"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                aria-label="Kata sandi"
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
              <p className="text-xs font-bold text-[#F04F52] text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              Masuk
            </button>

            <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Isi cepat:</span>
              <button
                type="button"
                onClick={() => quickFillDemo('peserta')}
                className="text-[11px] font-extrabold text-[#F04F52] hover:underline cursor-pointer"
              >
                Peserta
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => quickFillDemo('organizer')}
                className="text-[11px] font-extrabold text-[#F7891F] hover:underline cursor-pointer"
              >
                Panitia
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => quickFillDemo('admin')}
                className="text-[11px] font-extrabold text-[#5460AC] hover:underline cursor-pointer"
              >
                Admin
              </button>
            </div>

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
                Registrasi akun
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
                : 'Mulai perjalanan eventmu'}
            </h3>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'organizer' ? 'Nama organisasi / panitia' : 'Nama lengkap'}
              aria-label="Nama lengkap"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-label="Email"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Buat kata sandi"
              aria-label="Kata sandi"
              className="w-full px-4 py-3 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
            />

            {error && (
              <p className="text-xs font-bold text-[#F04F52] text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              Lanjut Verifikasi Email / OTP
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
              <h3 className="font-pixel text-lg text-slate-900">Verifikasi Email / OTP</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Masukkan 4 digit kode yang dikirim ke{' '}
                <strong className="text-slate-800">{email || 'email Anda'}</strong>
              </p>
            </div>

            <div className="flex justify-center gap-2.5 py-1">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  placeholder="•"
                  aria-label={`Digit OTP ${idx + 1}`}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-13 text-center font-pixel text-xl tabular-nums bg-[#E8F5FA] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#377EC0] focus:outline-none transition-all"
                />
              ))}
            </div>

            {error && <p className="text-xs font-bold text-[#F04F52]">{error}</p>}

            <button
              type="button"
              onClick={handleOtpVerify}
              className="w-full py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verifikasi & Masuk Dashboard
            </button>

            <div className="flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-slate-400 hover:text-[#377EC0] font-bold cursor-pointer"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpResent(true);
                  setTimeout(() => setOtpResent(false), 2500);
                }}
                className="font-extrabold text-[#377EC0] hover:underline cursor-pointer"
              >
                {otpResent ? 'Kode dikirim ulang!' : 'Kirim ulang kode'}
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
