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
  const [previewSticker, setPreviewSticker] = useState(true);
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
      hairStyle: pick(['poni', 'bob', 'pigtails', 'bun', 'parted', 'short'] as const),
      hairColor,
      eyeStyle: pick(['sparkle', 'big', 'chill', 'lashes', 'cat', 'happy'] as const),
      eyeColor: pick(AVATAR_PALETTES.eyes).hex,
      eyebrowStyle: pick(['soft', 'thick', 'raised', 'flat'] as const),
      eyebrowColor: hairColor,
      noseStyle: pick(['triangle', 'button', 'tiny'] as const),
      mouthStyle: pick(['smile', 'grin', 'surprised', 'cat', 'cool'] as const),
      makeupStyle: pick(['none', 'blush-pink', 'blush-peach', 'freckles', 'pastel-shadow'] as const),
      shirtStyle: pick(['tee', 'ribbon-uniform', 'collar', 'dress'] as const),
      shirtColor: pick(AVATAR_PALETTES.outfit).hex,
      jacketStyle: pick(['none', 'cardigan', 'denim', 'varsity', 'blazer'] as const),
      jacketColor: pick(AVATAR_PALETTES.outfit).hex,
      shoeStyle: pick(['sneakers', 'loafers', 'maryjane', 'boots'] as const),
      shoeColor: pick(AVATAR_PALETTES.outfit).hex,
      accessory: pick(['none', 'flower-crown', 'glasses', 'cap', 'headphones', 'ribbon-bow'] as const),
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

      // Soft sky badge background for exported profile icon
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
                    c.hex.toUpperCase() === '#FFFFFF' || c.hex.toUpperCase() === '#FAF0CA' || c.hex.toUpperCase() === '#FBDF54'
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

  const renderChoiceGrid = <T extends string>(
    label: string,
    options: { value: T; label: string }[],
    selected: T,
    onSelect: (val: T) => void
  ) => (
    <div className="space-y-2">
      <span className="text-xs font-extrabold text-slate-700 block">{label}</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                active
                  ? 'bg-[#377EC0] text-white border-[#377EC0] shadow-md shadow-[#377EC0]/20'
                  : 'bg-[#F4FAFC] hover:bg-[#E8F5FA] text-slate-700 border-[#9FD2D6]/60'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-[#9FD2D6]/60 shadow-lg shadow-[#377EC0]/10">
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
          {/* LEFT: Live Character Preview + Icon Actions + Streak Flame Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-lg text-slate-900">Preview Avatar</span>
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

              {/* Animal Crossing-inspired soft pastel triangle stage */}
              <div className="relative rounded-[28px] bg-gradient-to-b from-[#DDF3FA] via-[#E8F5FA] to-[#FFFBEB] border border-[#9FD2D6]/60 p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#377EC0 1.2px, transparent 1.2px)',
                    backgroundSize: '18px 18px',
                  }}
                />
                <ChibiAvatar
                  ref={svgRef}
                  config={avatar}
                  mode={previewMode}
                  stickerEffect={previewSticker}
                  className={
                    previewMode === 'head'
                      ? 'w-48 h-48 relative z-10 transition-all'
                      : 'w-52 h-64 relative z-10 transition-all'
                  }
                  title="Avatar Kustom EVORA"
                />
                <button
                  type="button"
                  onClick={() => setPreviewSticker((s) => !s)}
                  className="mt-3 relative z-10 px-3 py-1 rounded-xl bg-white/90 border border-[#9FD2D6] text-[11px] font-extrabold text-[#377EC0] shadow-sm cursor-pointer"
                >
                  {previewSticker ? 'Outline Putih & Shadow: Aktif' : 'Outline Putih & Shadow: Nonaktif'}
                </button>
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
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 ${
                    streak.isFrozen
                      ? 'bg-[#E8F5FA] text-[#377EC0] border border-[#9FD2D6]'
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
                      ? 'Streak panitia aman terlindungi es. Selesaikan misi atau nyalakan kembali api.'
                      : `Sudah menyala ${streak.currentDays} hari beruntun & ${streak.monthlyEventsHosted} event panitia bulan ini.`}
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

          {/* RIGHT: Full Character Customizer Controls */}
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
                {renderChoiceGrid(
                  'Jenis Kelamin / Siluet Outfit',
                  [
                    { value: 'cewek', label: 'Cewek (Rok)' },
                    { value: 'cowok', label: 'Cowok (Celana)' },
                    { value: 'netral', label: 'Netral (Kasual)' },
                  ],
                  avatar.gender,
                  (val) => updateField('gender', val)
                )}

                {renderChoiceGrid(
                  'Bentuk Muka',
                  [
                    { value: 'round', label: 'Bulat Chibi' },
                    { value: 'oval', label: 'Oval Lembut' },
                    { value: 'square', label: 'Kotak Manis' },
                    { value: 'heart', label: 'Heart Shape' },
                  ],
                  avatar.faceShape,
                  (val) => updateField('faceShape', val)
                )}

                {renderColorRow('Warna Kulit', AVATAR_PALETTES.skin, avatar.skinColor, (hex) =>
                  updateField('skinColor', hex)
                )}
              </div>
            )}

            {activeTab === 'rambut' && (
              <div className="space-y-6">
                {renderChoiceGrid(
                  'Model Rambut',
                  [
                    { value: 'bob', label: 'Bob Rapi' },
                    { value: 'poni', label: 'Panjang Poni' },
                    { value: 'pigtails', label: 'Kuncir Dua' },
                    { value: 'bun', label: 'Cepol Atas' },
                    { value: 'parted', label: 'Gelombang Belah' },
                    { value: 'short', label: 'Pendek Shaggy' },
                  ],
                  avatar.hairStyle,
                  (val) => updateField('hairStyle', val)
                )}

                {renderColorRow('Warna Rambut', AVATAR_PALETTES.hair, avatar.hairColor, (hex) =>
                  updateField('hairColor', hex)
                )}

                {renderChoiceGrid(
                  'Bentuk Alis',
                  [
                    { value: 'soft', label: 'Lengkung Lembut' },
                    { value: 'thick', label: 'Tebal Tegas' },
                    { value: 'raised', label: 'Ekspresif Naik' },
                    { value: 'flat', label: 'Lurus Minimalis' },
                  ],
                  avatar.eyebrowStyle,
                  (val) => updateField('eyebrowStyle', val)
                )}

                {renderColorRow('Warna Alis', AVATAR_PALETTES.hair, avatar.eyebrowColor, (hex) =>
                  updateField('eyebrowColor', hex)
                )}
              </div>
            )}

            {activeTab === 'ekspresi' && (
              <div className="space-y-6">
                {renderChoiceGrid(
                  'Bentuk Mata',
                  [
                    { value: 'sparkle', label: 'Berbinar' },
                    { value: 'big', label: 'Bulat Besar' },
                    { value: 'lashes', label: 'Bulu Mata Lentik' },
                    { value: 'chill', label: 'Santai / Chill' },
                    { value: 'cat', label: 'Mata Kucing' },
                    { value: 'happy', label: 'Ceria (^ ^)' },
                  ],
                  avatar.eyeStyle,
                  (val) => updateField('eyeStyle', val)
                )}

                {renderColorRow('Warna Mata', AVATAR_PALETTES.eyes, avatar.eyeColor, (hex) =>
                  updateField('eyeColor', hex)
                )}

                {renderChoiceGrid(
                  'Bentuk Hidung',
                  [
                    { value: 'triangle', label: 'Segitiga Ikonik' },
                    { value: 'button', label: 'Kancing Bulat' },
                    { value: 'tiny', label: 'Titik Mungil' },
                  ],
                  avatar.noseStyle,
                  (val) => updateField('noseStyle', val)
                )}

                {renderChoiceGrid(
                  'Bentuk Mulut',
                  [
                    { value: 'smile', label: 'Senyum Manis' },
                    { value: 'grin', label: 'Tertawa Lebar' },
                    { value: 'cat', label: 'Kucing (:3)' },
                    { value: 'surprised', label: 'Kaget (o)' },
                    { value: 'cool', label: 'Senyum Santai' },
                  ],
                  avatar.mouthStyle,
                  (val) => updateField('mouthStyle', val)
                )}
              </div>
            )}

            {activeTab === 'makeup' && (
              <div className="space-y-6">
                {renderChoiceGrid(
                  'Riasan / Make Up Wajah',
                  [
                    { value: 'none', label: 'Natural Polos' },
                    { value: 'blush-pink', label: 'Blush Pink' },
                    { value: 'blush-peach', label: 'Blush Peach' },
                    { value: 'freckles', label: 'Freckles Pipi' },
                    { value: 'pastel-shadow', label: 'Eyeshadow Pastel' },
                  ],
                  avatar.makeupStyle,
                  (val) => updateField('makeupStyle', val)
                )}

                {renderChoiceGrid(
                  'Aksesoris Kepala & Wajah',
                  [
                    { value: 'none', label: 'Tanpa Aksesoris' },
                    { value: 'flower-crown', label: 'Mahkota Bunga' },
                    { value: 'glasses', label: 'Kacamata Bulat' },
                    { value: 'cap', label: 'Topi Panitia' },
                    { value: 'headphones', label: 'Headphone Kru' },
                    { value: 'ribbon-bow', label: 'Pita Besar' },
                  ],
                  avatar.accessory,
                  (val) => updateField('accessory', val)
                )}
              </div>
            )}

            {activeTab === 'outfit' && (
              <div className="space-y-6">
                {renderChoiceGrid(
                  'Model Baju',
                  [
                    { value: 'ribbon-uniform', label: 'Seragam Pita' },
                    { value: 'tee', label: 'Kaos Event' },
                    { value: 'collar', label: 'Kemeja Kerah' },
                    { value: 'dress', label: 'Dress Terusan' },
                  ],
                  avatar.shirtStyle,
                  (val) => updateField('shirtStyle', val)
                )}

                {renderColorRow('Warna Baju', AVATAR_PALETTES.outfit, avatar.shirtColor, (hex) =>
                  updateField('shirtColor', hex)
                )}

                {renderChoiceGrid(
                  'Model Jaket / Luaran',
                  [
                    { value: 'none', label: 'Tanpa Jaket' },
                    { value: 'cardigan', label: 'Kardigan' },
                    { value: 'blazer', label: 'Blazer Panitia' },
                    { value: 'varsity', label: 'Jaket Varsity' },
                    { value: 'denim', label: 'Jaket Denim' },
                  ],
                  avatar.jacketStyle,
                  (val) => updateField('jacketStyle', val)
                )}

                {avatar.jacketStyle !== 'none' &&
                  renderColorRow('Warna Jaket', AVATAR_PALETTES.outfit, avatar.jacketColor, (hex) =>
                    updateField('jacketColor', hex)
                  )}

                {renderChoiceGrid(
                  'Model Sepatu',
                  [
                    { value: 'sneakers', label: 'Sneakers' },
                    { value: 'loafers', label: 'Loafers' },
                    { value: 'maryjane', label: 'Mary Jane' },
                    { value: 'boots', label: 'Sepatu Boots' },
                  ],
                  avatar.shoeStyle,
                  (val) => updateField('shoeStyle', val)
                )}

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
