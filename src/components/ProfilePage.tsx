import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Sparkles,
  Shuffle,
  RotateCcw,
  Check,
  Flame,
  Snowflake,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { AvatarConfig, StreakState, UserAccount } from '../types/evora';
import { AVATAR_PALETTES, INITIAL_AVATAR } from '../data/initialData';
import { ChibiAvatar } from './ChibiAvatar';
import { StreakFlameBadge } from './StreakFlameBadge';

interface ProfilePageProps {
  avatar: AvatarConfig;
  streak: StreakState;
  currentUser: UserAccount | null;
  onChangeAvatar: (next: AvatarConfig) => void;
  onSetAsIcon: () => void;
  onToggleFreeze: () => void;
  onBackHome: () => void;
  onOpenAuth: () => void;
}

type CustomizerTab = 'wajah' | 'rambut' | 'ekspresi' | 'makeup' | 'outfit';

const TABS: { id: CustomizerTab; label: string }[] = [
  { id: 'wajah', label: 'Wajah & Kulit' },
  { id: 'rambut', label: 'Rambut & Alis' },
  { id: 'ekspresi', label: 'Mata, Hidung & Mulut' },
  { id: 'makeup', label: 'Make Up & Aksesoris' },
  { id: 'outfit', label: 'Baju, Jaket & Sepatu' },
];

const BedroomMirrorBackdrop: React.FC = () => (
  <svg
    viewBox="0 0 360 320"
    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
    aria-hidden="true"
  >
    {/* Pastel Sky Bedroom Wall */}
    <rect width="360" height="238" fill="#E9F5FB" />
    {/* Soft Wall Stripes */}
    <g opacity="0.35" fill="#FFFFFF">
      <rect x="0" y="0" width="24" height="238" />
      <rect x="48" y="0" width="24" height="238" />
      <rect x="96" y="0" width="24" height="238" />
      <rect x="144" y="0" width="24" height="238" />
      <rect x="192" y="0" width="24" height="238" />
      <rect x="240" y="0" width="24" height="238" />
      <rect x="288" y="0" width="24" height="238" />
      <rect x="336" y="0" width="24" height="238" />
    </g>

    {/* Baseboard */}
    <rect x="0" y="228" width="360" height="10" fill="#FFFFFF" />

    {/* Warm Wooden Floor */}
    <rect x="0" y="238" width="360" height="82" fill="#F2D7B6" />
    <g stroke="#E2B98B" strokeWidth="1.5">
      <line x1="0" y1="258" x2="360" y2="258" />
      <line x1="0" y1="280" x2="360" y2="280" />
      <line x1="0" y1="302" x2="360" y2="302" />
    </g>

    {/* Window Center-Back */}
    <rect x="132" y="24" width="96" height="82" rx="12" fill="#FFFFFF" stroke="#9FD2D6" strokeWidth="3" />
    <rect x="140" y="32" width="36" height="66" rx="4" fill="#CBEAF7" />
    <rect x="184" y="32" width="36" height="66" rx="4" fill="#CBEAF7" />
    <circle cx="156" cy="52" r="8" fill="#FBDF54" opacity="0.85" />
    <path d="M126 24 L234 24" stroke="#377EC0" strokeWidth="5" strokeLinecap="round" />

    {/* Left: Cute Wardrobe / Lemari Pakaian */}
    <g transform="translate(14, 48)">
      {/* Lemari Body */}
      <rect x="0" y="0" width="88" height="184" rx="10" fill="#FDF8EE" stroke="#D9B88F" strokeWidth="2.5" />
      {/* Open Closet Hanging Rack */}
      <rect x="8" y="14" width="72" height="96" rx="6" fill="#E8DFD1" />
      <line x1="12" y1="24" x2="76" y2="24" stroke="#8C6D4F" strokeWidth="3" strokeLinecap="round" />
      {/* Hanging Shirts in Lemari */}
      <path d="M18 25 L26 25 L32 34 L28 38 L26 35 L26 62 L18 62 L18 35 L16 38 L12 34 Z" fill="#377EC0" />
      <path d="M39 25 L49 25 L56 35 L51 39 L49 36 L49 66 L39 66 L39 36 L37 39 L32 35 Z" fill="#FBDF54" />
      <path d="M60 25 L68 25 L74 34 L70 38 L68 35 L68 60 L60 60 L60 35 L58 38 L54 34 Z" fill="#F04F52" />
      {/* Drawers below */}
      <rect x="8" y="118" width="72" height="26" rx="4" fill="#F3E5D0" stroke="#D9B88F" strokeWidth="1.5" />
      <circle cx="44" cy="131" r="3" fill="#B68A5A" />
      <rect x="8" y="150" width="72" height="26" rx="4" fill="#F3E5D0" stroke="#D9B88F" strokeWidth="1.5" />
      <circle cx="44" cy="163" r="3" fill="#B68A5A" />
    </g>

    {/* Right: Standing Full-Length Mirror / Kaca Kamar */}
    <g transform="translate(262, 56)">
      {/* Mirror Stand Legs */}
      <line x1="16" y1="162" x2="8" y2="188" stroke="#A67C52" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="68" y1="162" x2="76" y2="188" stroke="#A67C52" strokeWidth="4.5" strokeLinecap="round" />
      {/* Mirror Wooden Frame */}
      <rect x="8" y="0" width="68" height="168" rx="34" fill="#C99663" stroke="#9C6B3B" strokeWidth="2.5" />
      {/* Glass Surface */}
      <rect x="15" y="7" width="54" height="154" rx="27" fill="#DDF3FA" />
      {/* Mirror Reflection Sheen */}
      <path d="M24 38 L58 14 L62 24 L24 52 Z" fill="#FFFFFF" opacity="0.7" />
      <path d="M22 72 L62 42 L64 49 L22 80 Z" fill="#FFFFFF" opacity="0.45" />
      <circle cx="42" cy="128" r="10" fill="#9FD2D6" opacity="0.45" />
    </g>

    {/* Cute Potted Plant */}
    <g transform="translate(238, 198)">
      <path d="M4 22 L20 22 L18 36 L6 36 Z" fill="#F7891F" />
      <ellipse cx="12" cy="14" rx="7" ry="10" fill="#12BAAA" />
      <ellipse cx="6" cy="17" rx="5" ry="7" fill="#2E9D67" />
      <ellipse cx="18" cy="17" rx="5" ry="7" fill="#2E9D67" />
    </g>

    {/* Soft Pastel Rug Under Avatar */}
    <ellipse cx="180" cy="284" rx="76" ry="20" fill="#9FD2D6" stroke="#FFFFFF" strokeWidth="3" />
    <ellipse cx="180" cy="284" rx="56" ry="13" fill="#E8F5FA" opacity="0.7" />
  </svg>
);

const GenderIcon: React.FC<{ gender: AvatarConfig['gender']; active: boolean }> = ({
  gender,
  active,
}) => {
  const color = active ? '#FFFFFF' : '#377EC0';
  if (gender === 'cowok') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" />
        <path d="M14 10 L20 4" />
        <path d="M15 4 H20 V9" />
      </svg>
    );
  }
  if (gender === 'cewek') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14 V21" />
        <path d="M9 18 H15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M15.5 8.5 L20 4 M16 4 H20 V8" />
      <path d="M8.5 15.5 L4 20 M4 16 V20 H8" />
    </svg>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({
  avatar,
  streak,
  currentUser,
  onChangeAvatar,
  onSetAsIcon,
  onToggleFreeze,
  onBackHome,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('wajah');
  const [previewMode, setPreviewMode] = useState<'full' | 'head'>('full');
  const [iconSavedFlash, setIconSavedFlash] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const updateField = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    onChangeAvatar({ ...avatar, [key]: value });
  };

  const handleRandomize = () => {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const hairColor = pick(AVATAR_PALETTES.hair).hex;
    onChangeAvatar({
      gender: pick(['cowok', 'cewek', 'netral'] as const),
      skinColor: pick(AVATAR_PALETTES.skin).hex,
      faceShape: pick(['round', 'oval', 'square', 'heart'] as const),
      hairStyle: pick([
        'poni',
        'bob',
        'pigtails',
        'bun',
        'parted',
        'short',
        'side-swept',
        'curly-afro',
        'wavy-long',
        'twintails-low',
      ] as const),
      hairColor,
      eyeStyle: pick([
        'sparkle',
        'big',
        'chill',
        'lashes',
        'cat',
        'happy',
        'starry',
        'wink',
        'sleepy',
      ] as const),
      eyeColor: pick(AVATAR_PALETTES.eyes).hex,
      eyebrowStyle: pick(['soft', 'thick', 'raised', 'flat'] as const),
      eyebrowColor: hairColor,
      noseStyle: pick(['triangle', 'button', 'tiny'] as const),
      mouthStyle: pick(['smile', 'grin', 'surprised', 'cat', 'cool', 'cheer', 'pout', 'tongue'] as const),
      makeupStyle: pick(['none', 'blush-pink', 'blush-peach', 'freckles', 'pastel-shadow'] as const),
      shirtStyle: pick(['tee', 'ribbon-uniform', 'collar', 'dress', 'aloha', 'hoodie', 'overall'] as const),
      shirtColor: pick(AVATAR_PALETTES.outfit).hex,
      jacketStyle: pick(['none', 'cardigan', 'denim', 'varsity', 'blazer', 'sweater-vest', 'parka'] as const),
      jacketColor: pick(AVATAR_PALETTES.outfit).hex,
      shoeStyle: pick(['sneakers', 'loafers', 'maryjane', 'boots'] as const),
      shoeColor: pick(AVATAR_PALETTES.outfit).hex,
      accessory: pick([
        'none',
        'flower-crown',
        'glasses',
        'cap',
        'headphones',
        'ribbon-bow',
        'beret',
        'cat-ears',
        'star-clip',
        'sunglasses',
      ] as const),
    });
  };

  const handleApplyIcon = () => {
    onSetAsIcon();
    setIconSavedFlash(true);
    setTimeout(() => setIconSavedFlash(false), 1800);
  };

  const handleDownloadIconPng = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#E8F5FA';
      ctx.beginPath();
      ctx.arc(256, 256, 248, 0, Math.PI * 2);
      ctx.fill();

      const scale = Math.min(440 / img.width, 440 / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.drawImage(img, (512 - drawW) / 2, (512 - drawH) / 2, drawW, drawH);

      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `evora-avatar-icon-${previewMode}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = url;
  };

  const renderColorRow = (
    label: string,
    colors: { name: string; hex: string }[],
    selectedHex: string,
    onSelect: (hex: string) => void
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700">{label}</span>
        <span className="text-[11px] font-bold text-slate-500">
          {colors.find((c) => c.hex.toLowerCase() === selectedHex.toLowerCase())?.name || selectedHex}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => {
          const active = c.hex.toLowerCase() === selectedHex.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => onSelect(c.hex)}
              className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                active
                  ? 'border-[#377EC0] scale-110 ring-2 ring-[#9FD2D6]'
                  : 'border-white shadow-sm hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {active && (
                <Check
                  className={`w-4 h-4 ${
                    c.hex.toUpperCase() === '#FFFFFF' ||
                    c.hex.toUpperCase() === '#FAF0CA' ||
                    c.hex.toUpperCase() === '#FBDF54'
                      ? 'text-slate-800'
                      : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Visual Option Grid — shows live ChibiAvatar mini-preview of each option!
  const renderVisualChoiceGrid = <K extends keyof AvatarConfig>(
    label: string,
    fieldKey: K,
    previewPart: 'head' | 'torso' | 'shoes' | 'full',
    options: { value: AvatarConfig[K]; label: string }[]
  ) => (
    <div className="space-y-2.5">
      <span className="text-xs font-extrabold text-slate-700 block">{label}</span>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {options.map((opt) => {
          const active = avatar[fieldKey] === opt.value;
          const previewCfg: AvatarConfig = { ...avatar, [fieldKey]: opt.value };
          // For jacket preview when jacketStyle === 'none', still render torso cleanly
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => updateField(fieldKey, opt.value)}
              className={`relative p-2 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between gap-1 min-h-[92px] ${
                active
                  ? 'bg-[#E6F7F6] border-[#12BAAA] shadow-md ring-2 ring-[#9FD2D6]/60 scale-[1.02]'
                  : 'bg-[#F7FBFD] hover:bg-[#E8F5FA] border-[#9FD2D6]/50'
              }`}
            >
              {active && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#12BAAA] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
              <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center overflow-hidden">
                <ChibiAvatar
                  config={previewCfg}
                  mode={previewPart}
                  softShadow={false}
                  className={
                    previewPart === 'head'
                      ? 'w-14 h-14'
                      : previewPart === 'shoes'
                      ? 'w-14 h-10'
                      : 'w-14 h-14'
                  }
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight text-center line-clamp-1">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-[#9FD2D6]/60 shadow-lg shadow-[#377EC0]/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-[#377EC0] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </button>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#12BAAA]">
                Halaman Profil & Studio Karakter
              </p>
              <h1 className="font-pixel text-2xl sm:text-3xl text-slate-900">
                {currentUser ? currentUser.name : 'Profil Panitia & Peserta'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="px-4 py-2 rounded-2xl bg-[#E6F9F7] border border-[#12BAAA]/40 text-xs font-extrabold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#12BAAA]" />
                <span>
                  {currentUser.email} ·{' '}
                  {currentUser.role === 'organizer'
                    ? 'Panitia'
                    : currentUser.role === 'admin'
                    ? 'Admin'
                    : 'Peserta'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Masuk / Daftar Akun
              </button>
            )}
          </div>
        </div>

        {/* Main 2-Column Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Cozy Bedroom Wardrobe + Mirror Preview + Streak Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-lg text-slate-900">Kamar Ganti EVORA</span>
                <div className="flex rounded-xl bg-[#E8F5FA] p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('full')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      previewMode === 'full' ? 'bg-[#377EC0] text-white' : 'text-slate-600'
                    }`}
                  >
                    Full Body
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('head')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      previewMode === 'head' ? 'bg-[#377EC0] text-white' : 'text-slate-600'
                    }`}
                  >
                    Icon Profil
                  </button>
                </div>
              </div>

              {/* Cozy Bedroom Backdrop with Wardrobe (Lemari) & Standing Mirror (Kaca) */}
              <div className="relative rounded-[28px] border-2 border-[#9FD2D6]/70 flex flex-col items-center justify-end min-h-[320px] overflow-hidden shadow-inner">
                <BedroomMirrorBackdrop />
                <div className="relative z-10 pb-3 pt-10 flex items-center justify-center">
                  <ChibiAvatar
                    ref={svgRef}
                    config={avatar}
                    mode={previewMode}
                    softShadow
                    className={
                      previewMode === 'head'
                        ? 'w-44 h-44 transition-all duration-300'
                        : 'w-48 h-60 transition-all duration-300'
                    }
                    title="Avatar Kustom EVORA"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#FFF4E5] hover:bg-[#FBDF54]/50 text-[#F7891F] border border-[#FBDF54] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                  Acak Karakter
                </button>
                <button
                  type="button"
                  onClick={() => onChangeAvatar(INITIAL_AVATAR)}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={handleApplyIcon}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#12BAAA] hover:bg-[#0E9F91] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#12BAAA]/20 cursor-pointer"
                >
                  {iconSavedFlash ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {iconSavedFlash ? 'Icon Dipasang!' : 'Jadikan Icon'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIconPng}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#377EC0]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Unduh Icon PNG
                </button>
              </div>
            </div>

            {/* Streak Flame Status Card inside Profile Page */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-pixel text-xl text-slate-900">Status Api Streak</h2>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-all duration-500 ${
                    streak.isFrozen
                      ? 'bg-[#E8F5FA] text-[#377EC0] border border-[#377EC0]/40'
                      : 'bg-[#FFF4E5] text-[#F7891F] border border-[#FBDF54]'
                  }`}
                >
                  {streak.isFrozen ? (
                    <>
                      <Snowflake className="w-3.5 h-3.5" /> Kondisi: Api Beku
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5" /> Kondisi: Masih Menyala
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F4FAFC] border border-[#9FD2D6]/60">
                <StreakFlameBadge isFrozen={streak.isFrozen} days={streak.currentDays} size="lg" />
                <div className="space-y-1.5 min-w-0">
                  <p className="font-pixel text-lg text-slate-900">
                    {streak.isFrozen ? 'Api Streak Sedang Beku' : 'Api Streak Masih Menyala!'}
                  </p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {streak.isFrozen
                      ? 'Streak panitia aman terlindungi es. Nyalakan kembali atau ikut panitia event.'
                      : `Menyala ${streak.currentDays} hari beruntun · ${streak.monthlyEventsHosted} event panitia bulan ini.`}
                  </p>
                  <button
                    type="button"
                    onClick={onToggleFreeze}
                    className={`mt-1 px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      streak.isFrozen
                        ? 'bg-[#F7891F] hover:bg-[#F04F52] text-white'
                        : 'bg-[#377EC0] hover:bg-[#5460AC] text-white'
                    }`}
                  >
                    {streak.isFrozen ? (
                      <>
                        <Flame className="w-3.5 h-3.5" /> Nyalakan Api Kembali
                      </>
                    ) : (
                      <>
                        <Snowflake className="w-3.5 h-3.5" /> Lihat Mode Api Beku
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Option Selector Tabs */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#377EC0] text-white shadow-md shadow-[#377EC0]/20'
                        : 'bg-[#E8F5FA] text-slate-700 hover:bg-[#9FD2D6]/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'wajah' && (
              <div className="space-y-6">
                {/* Gender with Icons */}
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Jenis Kelamin & Siluet Outfit
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { value: 'cewek', label: 'Cewek' },
                        { value: 'cowok', label: 'Cowok' },
                        { value: 'netral', label: 'Netral' },
                      ] as const
                    ).map((g) => {
                      const active = avatar.gender === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => updateField('gender', g.value)}
                          className={`min-h-[64px] px-3 py-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#377EC0] text-white border-[#377EC0] shadow-md shadow-[#377EC0]/20'
                              : 'bg-[#F7FBFD] hover:bg-[#E8F5FA] text-slate-700 border-[#9FD2D6]/60'
                          }`}
                        >
                          <GenderIcon gender={g.value} active={active} />
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {renderVisualChoiceGrid('Bentuk Muka', 'faceShape', 'head', [
                  { value: 'round', label: 'Bulat' },
                  { value: 'oval', label: 'Oval' },
                  { value: 'square', label: 'Kotak Manis' },
                  { value: 'heart', label: 'Heart' },
                ])}

                {renderColorRow('Warna Kulit', AVATAR_PALETTES.skin, avatar.skinColor, (hex) =>
                  updateField('skinColor', hex)
                )}
              </div>
            )}

            {activeTab === 'rambut' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid('Model Rambut (10 Pilihan)', 'hairStyle', 'head', [
                  { value: 'bob', label: 'Bob Rapi' },
                  { value: 'side-swept', label: 'Belah Samping' },
                  { value: 'poni', label: 'Panjang Poni' },
                  { value: 'pigtails', label: 'Kuncir Tinggi' },
                  { value: 'twintails-low', label: 'Kuncir Bawah' },
                  { value: 'bun', label: 'Cepol Atas' },
                  { value: 'parted', label: 'Gelombang' },
                  { value: 'wavy-long', label: 'Panjang Ikal' },
                  { value: 'short', label: 'Pendek Shaggy' },
                  { value: 'curly-afro', label: 'Keriting Lucu' },
                ])}

                {renderColorRow('Warna Rambut', AVATAR_PALETTES.hair, avatar.hairColor, (hex) =>
                  updateField('hairColor', hex)
                )}

                {renderVisualChoiceGrid('Bentuk Alis', 'eyebrowStyle', 'head', [
                  { value: 'soft', label: 'Lembut' },
                  { value: 'thick', label: 'Tebal' },
                  { value: 'raised', label: 'Naik' },
                  { value: 'flat', label: 'Lurus' },
                ])}

                {renderColorRow('Warna Alis', AVATAR_PALETTES.hair, avatar.eyebrowColor, (hex) =>
                  updateField('eyebrowColor', hex)
                )}
              </div>
            )}

            {activeTab === 'ekspresi' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid('Bentuk Mata (9 Pilihan)', 'eyeStyle', 'head', [
                  { value: 'sparkle', label: 'Berbinar' },
                  { value: 'big', label: 'Bulat Besar' },
                  { value: 'starry', label: 'Bintang' },
                  { value: 'lashes', label: 'Lentik' },
                  { value: 'cat', label: 'Mata Kucing' },
                  { value: 'wink', label: 'Kedip' },
                  { value: 'chill', label: 'Santai' },
                  { value: 'sleepy', label: 'Mengantuk' },
                  { value: 'happy', label: 'Ceria' },
                ])}

                {renderColorRow('Warna Mata', AVATAR_PALETTES.eyes, avatar.eyeColor, (hex) =>
                  updateField('eyeColor', hex)
                )}

                {renderVisualChoiceGrid('Bentuk Hidung', 'noseStyle', 'head', [
                  { value: 'triangle', label: 'Segitiga' },
                  { value: 'button', label: 'Bulat' },
                  { value: 'tiny', label: 'Mungil' },
                ])}

                {renderVisualChoiceGrid('Bentuk Mulut (8 Pilihan)', 'mouthStyle', 'head', [
                  { value: 'smile', label: 'Senyum' },
                  { value: 'grin', label: 'Tertawa' },
                  { value: 'cheer', label: 'Gembira' },
                  { value: 'cat', label: 'Kucing (:3)' },
                  { value: 'tongue', label: 'Melet Lucu' },
                  { value: 'surprised', label: 'Kaget (o)' },
                  { value: 'pout', label: 'Cemberut' },
                  { value: 'cool', label: 'Santai' },
                ])}
              </div>
            )}

            {activeTab === 'makeup' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid('Make Up Wajah', 'makeupStyle', 'head', [
                  { value: 'none', label: 'Natural' },
                  { value: 'blush-pink', label: 'Blush Pink' },
                  { value: 'blush-peach', label: 'Blush Peach' },
                  { value: 'freckles', label: 'Freckles' },
                  { value: 'pastel-shadow', label: 'Eyeshadow' },
                ])}

                {renderVisualChoiceGrid('Aksesoris (10 Pilihan)', 'accessory', 'head', [
                  { value: 'none', label: 'Polos' },
                  { value: 'flower-crown', label: 'Mahkota Bunga' },
                  { value: 'glasses', label: 'Kacamata' },
                  { value: 'sunglasses', label: 'Kacamata Hitam' },
                  { value: 'cap', label: 'Topi Panitia' },
                  { value: 'beret', label: 'Baret Seniman' },
                  { value: 'cat-ears', label: 'Bando Kucing' },
                  { value: 'headphones', label: 'Headphone' },
                  { value: 'ribbon-bow', label: 'Pita Besar' },
                  { value: 'star-clip', label: 'Jepit Bintang' },
                ])}
              </div>
            )}

            {activeTab === 'outfit' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid('Model Baju (7 Pilihan)', 'shirtStyle', 'torso', [
                  { value: 'ribbon-uniform', label: 'Seragam Pita' },
                  { value: 'aloha', label: 'Kemeja Aloha' },
                  { value: 'tee', label: 'Kaos Event' },
                  { value: 'collar', label: 'Kemeja Kerah' },
                  { value: 'hoodie', label: 'Hoodie' },
                  { value: 'overall', label: 'Overall' },
                  { value: 'dress', label: 'Dress' },
                ])}

                {renderColorRow('Warna Baju', AVATAR_PALETTES.outfit, avatar.shirtColor, (hex) =>
                  updateField('shirtColor', hex)
                )}

                {renderVisualChoiceGrid('Jaket & Luaran (7 Pilihan)', 'jacketStyle', 'torso', [
                  { value: 'none', label: 'Tanpa Jaket' },
                  { value: 'cardigan', label: 'Kardigan' },
                  { value: 'blazer', label: 'Blazer' },
                  { value: 'sweater-vest', label: 'Rompi Rajut' },
                  { value: 'varsity', label: 'Varsity' },
                  { value: 'denim', label: 'Denim' },
                  { value: 'parka', label: 'Parka' },
                ])}

                {avatar.jacketStyle !== 'none' &&
                  renderColorRow('Warna Jaket', AVATAR_PALETTES.outfit, avatar.jacketColor, (hex) =>
                    updateField('jacketColor', hex)
                  )}

                {renderVisualChoiceGrid('Model Sepatu', 'shoeStyle', 'shoes', [
                  { value: 'sneakers', label: 'Sneakers' },
                  { value: 'loafers', label: 'Loafers' },
                  { value: 'maryjane', label: 'Mary Jane' },
                  { value: 'boots', label: 'Boots' },
                ])}

                {renderColorRow('Warna Sepatu', AVATAR_PALETTES.outfit, avatar.shoeColor, (hex) =>
                  updateField('shoeColor', hex)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
