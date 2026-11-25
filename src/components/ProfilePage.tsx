import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Save,
  DoorOpen,
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

type DeepCategory =
  | 'bentuk-wajah'
  | 'alis'
  | 'warna-kulit'
  | 'mata'
  | 'hidung'
  | 'mulut'
  | 'rambut'
  | 'aksesoris'
  | 'outfit';

const DEEP_CATEGORIES: { id: DeepCategory; label: string }[] = [
  { id: 'bentuk-wajah', label: 'Bentuk Wajah' },
  { id: 'alis', label: 'Alis' },
  { id: 'warna-kulit', label: 'Warna Kulit' },
  { id: 'mata', label: 'Mata' },
  { id: 'hidung', label: 'Hidung' },
  { id: 'mulut', label: 'Mulut' },
  { id: 'rambut', label: 'Rambut' },
  { id: 'aksesoris', label: 'Aksesoris' },
  { id: 'outfit', label: 'Baju & Sepatu' },
];

const CATEGORY_BUBBLES: Record<DeepCategory, string[]> = {
  'bentuk-wajah': ['Bentuk wajahku makin imut!', 'Cocok banget kan siluetnya?'],
  alis: ['Alisku makin ekspresif!', 'Ekspresi alisku oke nggak?'],
  'warna-kulit': ['Tampil makin fresh nih!', 'Rona pipinya lucu banget~'],
  mata: ['Mataku makin berbinar!', 'Tatapan siap bertugas!'],
  hidung: ['Hidung mungil ikonik~', 'Hehe, imut kan?'],
  mulut: ['Senyum baruku siap menyapa!', 'Ekspresi baru nih!'],
  rambut: ['Gaya rambut baruku kece!', 'Wah, rambutnya cocok banget!'],
  aksesoris: ['Aksesoris ini pas banget!', 'Makin stand out di event!'],
  outfit: ['Outfit panitia paling kece!', 'Siap turun ke lapangan!'],
};

const BedroomMirrorBackdrop: React.FC = () => (
  <svg
    viewBox="0 0 360 320"
    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
    aria-hidden="true"
  >
    <rect width="360" height="238" fill="#E9F5FB" />
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
    <rect x="0" y="228" width="360" height="10" fill="#FFFFFF" />
    <rect x="0" y="238" width="360" height="82" fill="#F2D7B6" />
    <g stroke="#E2B98B" strokeWidth="1.5">
      <line x1="0" y1="258" x2="360" y2="258" />
      <line x1="0" y1="280" x2="360" y2="280" />
      <line x1="0" y1="302" x2="360" y2="302" />
    </g>

    <rect x="132" y="24" width="96" height="82" rx="12" fill="#FFFFFF" stroke="#9FD2D6" strokeWidth="3" />
    <rect x="140" y="32" width="36" height="66" rx="4" fill="#CBEAF7" />
    <rect x="184" y="32" width="36" height="66" rx="4" fill="#CBEAF7" />
    <circle cx="156" cy="52" r="8" fill="#FBDF54" opacity="0.85" />
    <path d="M126 24 L234 24" stroke="#377EC0" strokeWidth="5" strokeLinecap="round" />

    {/* Left: Lemari Pakaian */}
    <g transform="translate(14, 48)">
      <rect x="0" y="0" width="88" height="184" rx="10" fill="#FDF8EE" stroke="#D9B88F" strokeWidth="2.5" />
      <rect x="8" y="14" width="72" height="96" rx="6" fill="#E8DFD1" />
      <line x1="12" y1="24" x2="76" y2="24" stroke="#8C6D4F" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 25 L26 25 L32 34 L28 38 L26 35 L26 62 L18 62 L18 35 L16 38 L12 34 Z" fill="#377EC0" />
      <path d="M39 25 L49 25 L56 35 L51 39 L49 36 L49 66 L39 66 L39 36 L37 39 L32 35 Z" fill="#FBDF54" />
      <path d="M60 25 L68 25 L74 34 L70 38 L68 35 L68 60 L60 60 L60 35 L58 38 L54 34 Z" fill="#F04F52" />
      <rect x="8" y="118" width="72" height="26" rx="4" fill="#F3E5D0" stroke="#D9B88F" strokeWidth="1.5" />
      <circle cx="44" cy="131" r="3" fill="#B68A5A" />
      <rect x="8" y="150" width="72" height="26" rx="4" fill="#F3E5D0" stroke="#D9B88F" strokeWidth="1.5" />
      <circle cx="44" cy="163" r="3" fill="#B68A5A" />
    </g>

    {/* Right: Kaca / Cermin Berdiri */}
    <g transform="translate(262, 56)">
      <line x1="16" y1="162" x2="8" y2="188" stroke="#A67C52" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="68" y1="162" x2="76" y2="188" stroke="#A67C52" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="8" y="0" width="68" height="168" rx="34" fill="#C99663" stroke="#9C6B3B" strokeWidth="2.5" />
      <rect x="15" y="7" width="54" height="154" rx="27" fill="#DDF3FA" />
      <path d="M24 38 L58 14 L62 24 L24 52 Z" fill="#FFFFFF" opacity="0.7" />
      <path d="M22 72 L62 42 L64 49 L22 80 Z" fill="#FFFFFF" opacity="0.45" />
      <circle cx="42" cy="128" r="10" fill="#9FD2D6" opacity="0.45" />
    </g>

    <g transform="translate(238, 198)">
      <path d="M4 22 L20 22 L18 36 L6 36 Z" fill="#F7891F" />
      <ellipse cx="12" cy="14" rx="7" ry="10" fill="#12BAAA" />
      <ellipse cx="6" cy="17" rx="5" ry="7" fill="#2E9D67" />
      <ellipse cx="18" cy="17" rx="5" ry="7" fill="#2E9D67" />
    </g>

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
  const [selectedCategory, setSelectedCategory] = useState<DeepCategory>('bentuk-wajah');
  const [previewMode, setPreviewMode] = useState<'full' | 'head'>('full');

  // Separate state for each element in 'Kustomisasi Mendalam'
  const [gender, setGender] = useState<AvatarConfig['gender']>(avatar.gender);
  const [faceShape, setFaceShape] = useState<AvatarConfig['faceShape']>(avatar.faceShape);
  const [eyebrowStyle, setEyebrowStyle] = useState<AvatarConfig['eyebrowStyle']>(avatar.eyebrowStyle);
  const [eyebrowColor, setEyebrowColor] = useState<string>(avatar.eyebrowColor);
  const [skinColor, setSkinColor] = useState<string>(avatar.skinColor);
  const [makeupStyle, setMakeupStyle] = useState<AvatarConfig['makeupStyle']>(avatar.makeupStyle);
  const [eyeStyle, setEyeStyle] = useState<AvatarConfig['eyeStyle']>(avatar.eyeStyle);
  const [eyeColor, setEyeColor] = useState<string>(avatar.eyeColor);
  const [noseStyle, setNoseStyle] = useState<AvatarConfig['noseStyle']>(avatar.noseStyle);
  const [mouthStyle, setMouthStyle] = useState<AvatarConfig['mouthStyle']>(avatar.mouthStyle);
  const [hairStyle, setHairStyle] = useState<AvatarConfig['hairStyle']>(avatar.hairStyle);
  const [hairColor, setHairColor] = useState<string>(avatar.hairColor);
  const [accessory, setAccessory] = useState<AvatarConfig['accessory']>(avatar.accessory);
  const [shirtStyle, setShirtStyle] = useState<AvatarConfig['shirtStyle']>(avatar.shirtStyle);
  const [shirtColor, setShirtColor] = useState<string>(avatar.shirtColor);
  const [jacketStyle, setJacketStyle] = useState<AvatarConfig['jacketStyle']>(avatar.jacketStyle);
  const [jacketColor, setJacketColor] = useState<string>(avatar.jacketColor);
  const [shoeStyle, setShoeStyle] = useState<AvatarConfig['shoeStyle']>(avatar.shoeStyle);
  const [shoeColor, setShoeColor] = useState<string>(avatar.shoeColor);

  // Wardrobe door animation & expressive bubble states
  const [doorsClosed, setDoorsClosed] = useState<boolean>(true);
  const [doorStatusText, setDoorStatusText] = useState<string>('Membuka Lemari...');
  const [isSavingDoors, setIsSavingDoors] = useState<boolean>(false);
  const [isExpressing, setIsExpressing] = useState<boolean>(false);
  const [bubbleText, setBubbleText] = useState<string>('Hai! Ayo ganti gaya di kamar~');
  const [bubbleKey, setBubbleKey] = useState<number>(1);
  const [iconSavedFlash, setIconSavedFlash] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const expressTimeoutRef = useRef<number | null>(null);

  const composedAvatar: AvatarConfig = useMemo(
    () => ({
      gender,
      faceShape,
      eyebrowStyle,
      eyebrowColor,
      skinColor,
      makeupStyle,
      eyeStyle,
      eyeColor,
      noseStyle,
      mouthStyle,
      hairStyle,
      hairColor,
      accessory,
      shirtStyle,
      shirtColor,
      jacketStyle,
      jacketColor,
      shoeStyle,
      shoeColor,
    }),
    [
      gender,
      faceShape,
      eyebrowStyle,
      eyebrowColor,
      skinColor,
      makeupStyle,
      eyeStyle,
      eyeColor,
      noseStyle,
      mouthStyle,
      hairStyle,
      hairColor,
      accessory,
      shirtStyle,
      shirtColor,
      jacketStyle,
      jacketColor,
      shoeStyle,
      shoeColor,
    ]
  );

  // Play wardrobe entrance door-opening animation on mount
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setDoorsClosed(false);
      triggerReaction('Selamat datang di kamar ganti!');
    }, 180);
    return () => {
      window.clearTimeout(t1);
      if (expressTimeoutRef.current) window.clearTimeout(expressTimeoutRef.current);
    };
  }, []);

  const triggerReaction = (message: string) => {
    setBubbleText(message);
    setBubbleKey((k) => k + 1);
    setIsExpressing(true);
    if (expressTimeoutRef.current) window.clearTimeout(expressTimeoutRef.current);
    expressTimeoutRef.current = window.setTimeout(() => {
      setIsExpressing(false);
    }, 900);
  };

  const applyAllElements = (cfg: AvatarConfig) => {
    setGender(cfg.gender);
    setFaceShape(cfg.faceShape);
    setEyebrowStyle(cfg.eyebrowStyle);
    setEyebrowColor(cfg.eyebrowColor);
    setSkinColor(cfg.skinColor);
    setMakeupStyle(cfg.makeupStyle);
    setEyeStyle(cfg.eyeStyle);
    setEyeColor(cfg.eyeColor);
    setNoseStyle(cfg.noseStyle);
    setMouthStyle(cfg.mouthStyle);
    setHairStyle(cfg.hairStyle);
    setHairColor(cfg.hairColor);
    setAccessory(cfg.accessory);
    setShirtStyle(cfg.shirtStyle);
    setShirtColor(cfg.shirtColor);
    setJacketStyle(cfg.jacketStyle);
    setJacketColor(cfg.jacketColor);
    setShoeStyle(cfg.shoeStyle);
    setShoeColor(cfg.shoeColor);
  };

  const reactCategory = (cat: DeepCategory) => {
    const lines = CATEGORY_BUBBLES[cat];
    const line = lines[Math.floor(Math.random() * lines.length)];
    triggerReaction(line);
  };

  // Trigger Wardrobe Entrance Animation when user clicks "Ganti Avatar"
  const handleEnterWardrobeChange = () => {
    setDoorStatusText('Membuka Pintu Lemari...');
    setDoorsClosed(true);
    window.setTimeout(() => {
      setDoorsClosed(false);
      triggerReaction('Pintu terbuka! Pilih gaya barumu~');
    }, 520);
  };

  // Trigger Wardrobe Closing Animation when saving Avatar
  const handleSaveAvatarWithDoors = () => {
    if (isSavingDoors) return;
    setIsSavingDoors(true);
    triggerReaction('Yay! Tampilanku tersimpan!');
    setDoorStatusText('Menyimpan ke Lemari...');

    window.setTimeout(() => {
      setDoorsClosed(true);
    }, 220);

    window.setTimeout(() => {
      onChangeAvatar(composedAvatar);
      onSetAsIcon();
      setDoorStatusText('Avatar Tersimpan!');
      setIconSavedFlash(true);
    }, 820);

    window.setTimeout(() => {
      setDoorsClosed(false);
      setIsSavingDoors(false);
      triggerReaction('Siap bertugas dengan gaya baru!');
    }, 1550);

    window.setTimeout(() => setIconSavedFlash(false), 2600);
  };

  const handleRandomize = () => {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const nextHairColor = pick(AVATAR_PALETTES.hair).hex;
    const randomized: AvatarConfig = {
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
      hairColor: nextHairColor,
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
      eyebrowColor: nextHairColor,
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
    };
    applyAllElements(randomized);
    triggerReaction('Wah! Gaya kejutan baru!');
  };

  const handleResetDefault = () => {
    applyAllElements(INITIAL_AVATAR);
    triggerReaction('Kembali ke gaya awal EVORA!');
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
      triggerReaction('Icon PNG sudah diunduh!');
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

  const renderVisualChoiceGrid = <K extends keyof AvatarConfig>(
    label: string,
    fieldKey: K,
    currentVal: AvatarConfig[K],
    onSelect: (val: AvatarConfig[K]) => void,
    previewPart: 'head' | 'torso' | 'shoes' | 'full',
    options: { value: AvatarConfig[K]; label: string }[]
  ) => (
    <div className="space-y-2.5">
      <span className="text-xs font-extrabold text-slate-700 block">{label}</span>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {options.map((opt) => {
          const active = currentVal === opt.value;
          const previewCfg: AvatarConfig = { ...composedAvatar, [fieldKey]: opt.value };
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelect(opt.value)}
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
                  className={previewPart === 'shoes' ? 'w-14 h-10' : 'w-14 h-14'}
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
          {/* LEFT: Cozy Bedroom Wardrobe + Animated Doors + Speech Bubble + Streak */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-4">
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

              {/* Cozy Bedroom Backdrop + Animated Double Wardrobe Doors + Expressive Bubble */}
              <div className="relative rounded-[28px] border-2 border-[#9FD2D6]/70 flex flex-col items-center justify-end min-h-[340px] overflow-hidden shadow-inner">
                <BedroomMirrorBackdrop />

                {/* Speech Bubble Above Avatar */}
                {!doorsClosed && (
                  <div
                    key={bubbleKey}
                    className="bubble-pop relative z-20 mt-4 mb-1 px-4 py-2 rounded-2xl bg-white/95 border-2 border-[#377EC0]/40 shadow-md max-w-[230px] text-center"
                  >
                    <p className="text-xs font-extrabold text-[#1E3A8A] leading-snug">
                      {bubbleText}
                    </p>
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#377EC0]/40 rotate-45"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Lively Swaying & Expressive Chibi Avatar */}
                <div className="relative z-10 pb-3 pt-1 flex items-center justify-center">
                  <ChibiAvatar
                    ref={svgRef}
                    config={composedAvatar}
                    mode={previewMode}
                    softShadow
                    animateIdle={!doorsClosed}
                    isExpressing={isExpressing}
                    className={
                      previewMode === 'head'
                        ? 'w-44 h-44 transition-all duration-300'
                        : 'w-48 h-60 transition-all duration-300'
                    }
                    title="Avatar Kustom EVORA"
                  />
                </div>

                {/* Animated Twin Wardrobe Doors Overlay (Open on Enter, Close on Save) */}
                <div
                  className={`absolute inset-0 z-30 flex pointer-events-none transition-opacity duration-300 ${
                    doorsClosed ? 'opacity-100' : 'opacity-100'
                  }`}
                  aria-hidden={!doorsClosed}
                >
                  {/* Left Wardrobe Door */}
                  <div
                    className={`w-1/2 h-full bg-gradient-to-r from-[#E6C59C] to-[#F3D9B6] border-r-2 border-[#B68A5A] p-3 flex flex-col justify-between transition-transform duration-700 ease-in-out shadow-xl ${
                      doorsClosed ? 'translate-x-0' : '-translate-x-full'
                    }`}
                  >
                    <div className="flex-1 rounded-2xl border-2 border-[#C99F6D] bg-[#F7E5CA]/60 grid grid-rows-3 gap-2 p-2">
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-10 rounded-full bg-[#FBDF54] border border-[#B45309] shadow-sm" />
                  </div>

                  {/* Right Wardrobe Door */}
                  <div
                    className={`w-1/2 h-full bg-gradient-to-l from-[#E6C59C] to-[#F3D9B6] border-l-2 border-[#B68A5A] p-3 flex flex-col justify-between transition-transform duration-700 ease-in-out shadow-xl ${
                      doorsClosed ? 'translate-x-0' : 'translate-x-full'
                    }`}
                  >
                    <div className="flex-1 rounded-2xl border-2 border-[#C99F6D] bg-[#F7E5CA]/60 grid grid-rows-3 gap-2 p-2">
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                      <div className="rounded-lg border border-[#D4AF82] bg-[#EBD0AC]/50" />
                    </div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-10 rounded-full bg-[#FBDF54] border border-[#B45309] shadow-sm" />
                  </div>

                  {/* Center Wardrobe Badge when Doors are Closed */}
                  {doorsClosed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-5 py-2.5 rounded-2xl bg-white/95 border-2 border-[#377EC0] shadow-lg text-center">
                        <p className="font-pixel text-base text-[#377EC0]">
                          {doorStatusText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Save & Wardrobe Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleEnterWardrobeChange}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-[#377EC0] border border-[#9FD2D6] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DoorOpen className="w-4 h-4" />
                  Ganti Avatar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatarWithDoors}
                  disabled={isSavingDoors}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#12BAAA] hover:bg-[#0E9F91] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#12BAAA]/25 cursor-pointer disabled:opacity-70"
                >
                  {iconSavedFlash ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {iconSavedFlash ? 'Tersimpan!' : 'Simpan Avatar'}
                </button>
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
                  onClick={handleDownloadIconPng}
                  className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#377EC0]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Unduh Icon PNG
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-xs font-extrabold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Gaya Awal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeAvatar(composedAvatar);
                    onSetAsIcon();
                    triggerReaction('Icon profil langsung diperbarui!');
                  }}
                  className="text-xs font-extrabold text-[#377EC0] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Pasang ke Icon Header
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

          {/* RIGHT: Panel 'Kustomisasi Mendalam' */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#377EC0]">
                  Studio Personalisasi
                </p>
                <h2 className="font-pixel text-2xl sm:text-3xl text-slate-900">
                  Kustomisasi Mendalam
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Pilih tiap kategori elemen lalu klik Simpan Avatar
              </span>
            </div>

            {/* Category Selector Pills */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {DEEP_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#377EC0] text-white shadow-md shadow-[#377EC0]/20'
                        : 'bg-[#E8F5FA] text-slate-700 hover:bg-[#9FD2D6]/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* 1. BENTUK WAJAH */}
            {selectedCategory === 'bentuk-wajah' && (
              <div className="space-y-6">
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
                      const active = gender === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => {
                            setGender(g.value);
                            reactCategory('bentuk-wajah');
                          }}
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

                {renderVisualChoiceGrid(
                  'Pilih Bentuk Wajah',
                  'faceShape',
                  faceShape,
                  (val) => {
                    setFaceShape(val);
                    reactCategory('bentuk-wajah');
                  },
                  'head',
                  [
                    { value: 'round', label: 'Bulat Chibi' },
                    { value: 'oval', label: 'Oval Lembut' },
                    { value: 'square', label: 'Kotak Manis' },
                    { value: 'heart', label: 'Heart Shape' },
                  ]
                )}
              </div>
            )}

            {/* 2. ALIS */}
            {selectedCategory === 'alis' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Bentuk Alis',
                  'eyebrowStyle',
                  eyebrowStyle,
                  (val) => {
                    setEyebrowStyle(val);
                    reactCategory('alis');
                  },
                  'head',
                  [
                    { value: 'soft', label: 'Lembut' },
                    { value: 'thick', label: 'Tebal Tegas' },
                    { value: 'raised', label: 'Naik Ekspresif' },
                    { value: 'flat', label: 'Lurus' },
                  ]
                )}

                {renderColorRow('Warna Alis', AVATAR_PALETTES.hair, eyebrowColor, (hex) => {
                  setEyebrowColor(hex);
                  reactCategory('alis');
                })}
              </div>
            )}

            {/* 3. WARNA KULIT & MAKE UP */}
            {selectedCategory === 'warna-kulit' && (
              <div className="space-y-6">
                {renderColorRow('Warna Kulit', AVATAR_PALETTES.skin, skinColor, (hex) => {
                  setSkinColor(hex);
                  reactCategory('warna-kulit');
                })}

                {renderVisualChoiceGrid(
                  'Riasan / Blush Pipi',
                  'makeupStyle',
                  makeupStyle,
                  (val) => {
                    setMakeupStyle(val);
                    reactCategory('warna-kulit');
                  },
                  'head',
                  [
                    { value: 'none', label: 'Natural' },
                    { value: 'blush-pink', label: 'Blush Pink' },
                    { value: 'blush-peach', label: 'Blush Peach' },
                    { value: 'freckles', label: 'Freckles' },
                    { value: 'pastel-shadow', label: 'Eyeshadow' },
                  ]
                )}
              </div>
            )}

            {/* 4. MATA */}
            {selectedCategory === 'mata' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Bentuk Mata (9 Pilihan)',
                  'eyeStyle',
                  eyeStyle,
                  (val) => {
                    setEyeStyle(val);
                    reactCategory('mata');
                  },
                  'head',
                  [
                    { value: 'sparkle', label: 'Berbinar' },
                    { value: 'big', label: 'Bulat Besar' },
                    { value: 'starry', label: 'Bintang' },
                    { value: 'lashes', label: 'Lentik' },
                    { value: 'cat', label: 'Mata Kucing' },
                    { value: 'wink', label: 'Kedip' },
                    { value: 'chill', label: 'Santai' },
                    { value: 'sleepy', label: 'Mengantuk' },
                    { value: 'happy', label: 'Ceria' },
                  ]
                )}

                {renderColorRow('Warna Mata', AVATAR_PALETTES.eyes, eyeColor, (hex) => {
                  setEyeColor(hex);
                  reactCategory('mata');
                })}
              </div>
            )}

            {/* 5. HIDUNG */}
            {selectedCategory === 'hidung' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Bentuk Hidung',
                  'noseStyle',
                  noseStyle,
                  (val) => {
                    setNoseStyle(val);
                    reactCategory('hidung');
                  },
                  'head',
                  [
                    { value: 'triangle', label: 'Segitiga Ikonik' },
                    { value: 'button', label: 'Kancing Bulat' },
                    { value: 'tiny', label: 'Titik Mungil' },
                  ]
                )}
              </div>
            )}

            {/* 6. MULUT */}
            {selectedCategory === 'mulut' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Bentuk Mulut (8 Pilihan)',
                  'mouthStyle',
                  mouthStyle,
                  (val) => {
                    setMouthStyle(val);
                    reactCategory('mulut');
                  },
                  'head',
                  [
                    { value: 'smile', label: 'Senyum' },
                    { value: 'grin', label: 'Tertawa' },
                    { value: 'cheer', label: 'Gembira' },
                    { value: 'cat', label: 'Kucing (:3)' },
                    { value: 'tongue', label: 'Melet Lucu' },
                    { value: 'surprised', label: 'Kaget (o)' },
                    { value: 'pout', label: 'Cemberut' },
                    { value: 'cool', label: 'Santai' },
                  ]
                )}
              </div>
            )}

            {/* 7. RAMBUT */}
            {selectedCategory === 'rambut' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Model Rambut (10 Pilihan)',
                  'hairStyle',
                  hairStyle,
                  (val) => {
                    setHairStyle(val);
                    reactCategory('rambut');
                  },
                  'head',
                  [
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
                  ]
                )}

                {renderColorRow('Warna Rambut', AVATAR_PALETTES.hair, hairColor, (hex) => {
                  setHairColor(hex);
                  reactCategory('rambut');
                })}
              </div>
            )}

            {/* 8. AKSESORIS */}
            {selectedCategory === 'aksesoris' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Aksesoris (10 Pilihan)',
                  'accessory',
                  accessory,
                  (val) => {
                    setAccessory(val);
                    reactCategory('aksesoris');
                  },
                  'head',
                  [
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
                  ]
                )}
              </div>
            )}

            {/* 9. BAJU, JAKET & SEPATU */}
            {selectedCategory === 'outfit' && (
              <div className="space-y-6">
                {renderVisualChoiceGrid(
                  'Model Baju (7 Pilihan)',
                  'shirtStyle',
                  shirtStyle,
                  (val) => {
                    setShirtStyle(val);
                    reactCategory('outfit');
                  },
                  'torso',
                  [
                    { value: 'ribbon-uniform', label: 'Seragam Pita' },
                    { value: 'aloha', label: 'Kemeja Aloha' },
                    { value: 'tee', label: 'Kaos Event' },
                    { value: 'collar', label: 'Kemeja Kerah' },
                    { value: 'hoodie', label: 'Hoodie' },
                    { value: 'overall', label: 'Overall' },
                    { value: 'dress', label: 'Dress' },
                  ]
                )}

                {renderColorRow('Warna Baju', AVATAR_PALETTES.outfit, shirtColor, (hex) => {
                  setShirtColor(hex);
                  reactCategory('outfit');
                })}

                {renderVisualChoiceGrid(
                  'Jaket & Luaran (7 Pilihan)',
                  'jacketStyle',
                  jacketStyle,
                  (val) => {
                    setJacketStyle(val);
                    reactCategory('outfit');
                  },
                  'torso',
                  [
                    { value: 'none', label: 'Tanpa Jaket' },
                    { value: 'cardigan', label: 'Kardigan' },
                    { value: 'blazer', label: 'Blazer' },
                    { value: 'sweater-vest', label: 'Rompi Rajut' },
                    { value: 'varsity', label: 'Varsity' },
                    { value: 'denim', label: 'Denim' },
                    { value: 'parka', label: 'Parka' },
                  ]
                )}

                {jacketStyle !== 'none' &&
                  renderColorRow('Warna Jaket', AVATAR_PALETTES.outfit, jacketColor, (hex) => {
                    setJacketColor(hex);
                    reactCategory('outfit');
                  })}

                {renderVisualChoiceGrid(
                  'Model Sepatu',
                  'shoeStyle',
                  shoeStyle,
                  (val) => {
                    setShoeStyle(val);
                    reactCategory('outfit');
                  },
                  'shoes',
                  [
                    { value: 'sneakers', label: 'Sneakers' },
                    { value: 'loafers', label: 'Loafers' },
                    { value: 'maryjane', label: 'Mary Jane' },
                    { value: 'boots', label: 'Boots' },
                  ]
                )}

                {renderColorRow('Warna Sepatu', AVATAR_PALETTES.outfit, shoeColor, (hex) => {
                  setShoeColor(hex);
                  reactCategory('outfit');
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
