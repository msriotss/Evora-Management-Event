import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Sparkles,
  Shuffle,
  RotateCcw,
  Check,
  UserCheck,
  LogIn,
  Save,
  DoorOpen,
} from 'lucide-react';
import { AvatarConfig, UserAccount } from '../types/evora';
import { AVATAR_PALETTES, INITIAL_AVATAR } from '../data/initialData';
import { ChibiAvatar } from './ChibiAvatar';

interface ProfilePageProps {
  avatar: AvatarConfig;
  currentUser: UserAccount | null;
  onChangeAvatar: (next: AvatarConfig) => void;
  onSetAsIcon: () => void;
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
    <defs>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DCEEFB" />
        <stop offset="65%" stopColor="#EFF7FD" />
        <stop offset="100%" stopColor="#DCEAF5" />
      </linearGradient>
      <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DFBA8F" />
        <stop offset="45%" stopColor="#EECBA1" />
        <stop offset="100%" stopColor="#CFA06E" />
      </linearGradient>
      <linearGradient id="sunBeam" x1="0.5" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.55" />
        <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7CC4F0" />
        <stop offset="100%" stopColor="#D7F0FC" />
      </linearGradient>
      <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E6F7FF" />
        <stop offset="50%" stopColor="#C3E7F7" />
        <stop offset="100%" stopColor="#A6D5EA" />
      </linearGradient>
      <linearGradient id="wardrobeBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FAF0E1" />
        <stop offset="82%" stopColor="#EFE0CA" />
        <stop offset="100%" stopColor="#DFC7A7" />
      </linearGradient>
      <radialGradient id="fairyGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FDE047" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Wall Base + Subtle Wainscoting */}
    <rect width="360" height="236" fill="url(#wallGrad)" />
    <g opacity="0.45">
      <rect x="0" y="168" width="360" height="68" fill="#F6FAFE" />
      <line x1="0" y1="168" x2="360" y2="168" stroke="#C5DFEE" strokeWidth="2.5" />
      <rect x="116" y="176" width="54" height="44" rx="4" fill="none" stroke="#D1E6F3" strokeWidth="1.5" />
      <rect x="184" y="176" width="54" height="44" rx="4" fill="none" stroke="#D1E6F3" strokeWidth="1.5" />
    </g>

    {/* Baseboard Molding & Shadow */}
    <rect x="0" y="226" width="360" height="11" fill="#FFFFFF" />
    <line x1="0" y1="226" x2="360" y2="226" stroke="#C7DCEB" strokeWidth="1.5" />
    <rect x="0" y="237" width="360" height="4" fill="#9A7248" opacity="0.22" />

    {/* Aesthetic Hardwood Floor with Plank Depth */}
    <rect x="0" y="237" width="360" height="83" fill="url(#floorGrad)" />
    <g stroke="#B88959" strokeWidth="1.1" opacity="0.55">
      <line x1="0" y1="254" x2="360" y2="254" />
      <line x1="0" y1="274" x2="360" y2="274" />
      <line x1="0" y1="296" x2="360" y2="296" />
      <line x1="64" y1="237" x2="48" y2="254" />
      <line x1="196" y1="237" x2="192" y2="254" />
      <line x1="294" y1="237" x2="306" y2="254" />
      <line x1="118" y1="254" x2="108" y2="274" />
      <line x1="252" y1="254" x2="262" y2="274" />
      <line x1="76" y1="274" x2="62" y2="296" />
      <line x1="226" y1="274" x2="236" y2="296" />
    </g>

    {/* Fairy String Lights Draped Along Ceiling */}
    <path d="M8 10 Q90 36 180 12 Q270 36 352 10" fill="none" stroke="#94A3B8" strokeWidth="1.4" opacity="0.65" />
    {[
      [42, 20],
      [94, 24],
      [146, 18],
      [212, 18],
      [268, 24],
      [318, 19],
    ].map(([cx, cy], idx) => (
      <g key={idx}>
        <circle cx={cx} cy={cy} r="9" fill="url(#fairyGlow)" />
        <circle cx={cx} cy={cy} r="2.8" fill="#FEF08A" stroke="#F59E0B" strokeWidth="0.6" />
      </g>
    ))}

    {/* Arched Window + Sky + Curtains */}
    <g transform="translate(128, 22)">
      <path d="M6 94 L6 40 A46 40 0 0 1 98 40 L98 94 Z" fill="#FFFFFF" stroke="#B7D7EA" strokeWidth="2.5" />
      <path d="M12 88 L12 41 A40 35 0 0 1 92 41 L92 88 Z" fill="url(#skyGrad)" />
      {/* Fluffy Clouds & Warm Sun */}
      <circle cx="72" cy="36" r="9" fill="#FEF08A" opacity="0.95" />
      <ellipse cx="38" cy="48" rx="14" ry="7" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="48" cy="46" rx="10" ry="6" fill="#FFFFFF" opacity="0.95" />
      {/* Window Mullions */}
      <line x1="52" y1="7" x2="52" y2="89" stroke="#FFFFFF" strokeWidth="3" />
      <line x1="12" y1="54" x2="92" y2="54" stroke="#FFFFFF" strokeWidth="3" />
      {/* Sheer Pastel Curtains */}
      <path d="M0 10 Q18 45 8 96 L24 96 Q24 48 16 10 Z" fill="#FFFFFF" opacity="0.82" />
      <path d="M104 10 Q86 45 96 96 L80 96 Q80 48 88 10 Z" fill="#FFFFFF" opacity="0.82" />
      <rect x="-4" y="6" width="112" height="5" rx="2.5" fill="#C99663" />
      <circle cx="-4" cy="8.5" r="3.5" fill="#B4814E" />
      <circle cx="108" cy="8.5" r="3.5" fill="#B4814E" />
    </g>

    {/* Warm Volumetric Sunlight Beam */}
    <polygon points="140,116 220,116 268,290 92,290" fill="url(#sunBeam)" />

    {/* Floating Shelf & Wall Polaroids */}
    <g transform="translate(118, 128)">
      <rect x="0" y="16" width="66" height="5" rx="2" fill="#C99663" />
      <rect x="0" y="21" width="66" height="2" fill="#9A6C3F" opacity="0.35" />
      <rect x="8" y="2" width="10" height="14" rx="1.5" fill="#377EC0" />
      <rect x="19" y="5" width="8" height="11" rx="1.5" fill="#FBDF54" />
      <rect x="44" y="4" width="14" height="12" rx="2" fill="#FFFFFF" stroke="#9FD2D6" strokeWidth="1.2" />
      <circle cx="51" cy="10" r="3" fill="#F04F52" opacity="0.7" />
    </g>

    {/* Left: Dimensional Wooden Wardrobe (Lemari Pakaian Estetik) */}
    <g transform="translate(12, 46)">
      {/* Side Shadow */}
      <rect x="6" y="4" width="90" height="190" rx="10" fill="#7C5832" opacity="0.16" />
      <rect x="0" y="0" width="90" height="190" rx="10" fill="url(#wardrobeBody)" stroke="#C69C6D" strokeWidth="2.4" />
      {/* Crown Molding */}
      <rect x="-3" y="-3" width="96" height="8" rx="4" fill="#D4AE81" stroke="#B68A5A" strokeWidth="1.5" />
      {/* Closet Interior with Shadow */}
      <rect x="8" y="14" width="74" height="100" rx="6" fill="#DED2C1" />
      <rect x="8" y="14" width="74" height="10" rx="4" fill="#C7B69E" opacity="0.6" />
      <line x1="12" y1="26" x2="78" y2="26" stroke="#7A5A3A" strokeWidth="3.2" strokeLinecap="round" />
      {/* Hanging Clothes with Highlights */}
      <path d="M17 27 L27 27 L34 37 L29 41 L27 37 L27 68 L17 68 L17 37 L15 41 L10 37 Z" fill="#377EC0" />
      <path d="M39 27 L49 27 L56 38 L51 42 L49 38 L49 72 L39 72 L39 38 L37 42 L32 38 Z" fill="#FBDF54" />
      <path d="M60 27 L70 27 L77 37 L72 41 L70 37 L70 65 L60 65 L60 37 L58 41 L53 37 Z" fill="#F04F52" />
      {/* Beveled Drawers */}
      <rect x="8" y="122" width="74" height="27" rx="5" fill="#F5E7D3" stroke="#C9A276" strokeWidth="1.5" />
      <rect x="13" y="126" width="64" height="19" rx="3" fill="none" stroke="#E4C7A1" strokeWidth="1.2" />
      <circle cx="45" cy="135.5" r="3.2" fill="#B4814E" />
      <rect x="8" y="155" width="74" height="27" rx="5" fill="#F5E7D3" stroke="#C9A276" strokeWidth="1.5" />
      <rect x="13" y="159" width="64" height="19" rx="3" fill="none" stroke="#E4C7A1" strokeWidth="1.2" />
      <circle cx="45" cy="168.5" r="3.2" fill="#B4814E" />
    </g>

    {/* Right: Ornate Arched Standing Mirror (Kaca Berdiri Estetik) */}
    <g transform="translate(260, 52)">
      {/* Floor Shadow */}
      <ellipse cx="42" cy="192" rx="34" ry="6" fill="#7C5832" opacity="0.2" />
      <line x1="16" y1="162" x2="8" y2="190" stroke="#9C6B3B" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="162" x2="76" y2="190" stroke="#9C6B3B" strokeWidth="5" strokeLinecap="round" />
      <rect x="6" y="0" width="72" height="172" rx="36" fill="#C99663" stroke="#8C5D30" strokeWidth="2.5" />
      <rect x="11" y="5" width="62" height="162" rx="31" fill="#E8C699" />
      <rect x="14" y="8" width="56" height="156" rx="28" fill="url(#mirrorGlass)" />
      {/* Glass Diagonal Reflections */}
      <path d="M22 44 L62 16 L66 26 L22 58 Z" fill="#FFFFFF" opacity="0.72" />
      <path d="M20 78 L64 46 L66 53 L20 86 Z" fill="#FFFFFF" opacity="0.45" />
      <path d="M24 128 L58 104 L60 109 L24 134 Z" fill="#FFFFFF" opacity="0.32" />
    </g>

    {/* Potted Monstera Plant */}
    <g transform="translate(232, 194)">
      <ellipse cx="14" cy="40" rx="11" ry="3.5" fill="#7C5832" opacity="0.22" />
      <path d="M5 22 L23 22 L20 40 L8 40 Z" fill="#F7891F" stroke="#C2640E" strokeWidth="1.2" />
      <rect x="3" y="19" width="22" height="5" rx="2" fill="#FDBA74" />
      <ellipse cx="14" cy="12" rx="7.5" ry="11" fill="#12BAAA" />
      <ellipse cx="6" cy="16" rx="5.5" ry="8" transform="rotate(-18 6 16)" fill="#0D9488" />
      <ellipse cx="22" cy="16" rx="5.5" ry="8" transform="rotate(18 22 16)" fill="#2DD4BF" />
    </g>

    {/* Plush Woven Circular Rug with Subtle Shadow */}
    <ellipse cx="180" cy="288" rx="84" ry="22" fill="#7C5832" opacity="0.16" />
    <ellipse cx="180" cy="284" rx="80" ry="20" fill="#9FD2D6" stroke="#FFFFFF" strokeWidth="3.5" />
    <ellipse cx="180" cy="284" rx="64" ry="15" fill="#E8F5FA" opacity="0.85" />
    <ellipse cx="180" cy="284" rx="44" ry="9" fill="none" stroke="#377EC0" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
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
  currentUser,
  onChangeAvatar,
  onSetAsIcon,
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
    if (!currentUser) {
      onOpenAuth();
      return;
    }
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
                {currentUser ? currentUser.name : 'Profil Kosong (Belum Masuk)'}
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
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Main 2-Column Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Cozy Aesthetic Bedroom Wardrobe + Animated Doors + Speech Bubble */}
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
                    className="bubble-pop relative z-20 mt-4 mb-1 px-4 py-2 rounded-2xl bg-white/95 border-2 border-[#377EC0]/40 shadow-md max-w-[235px] text-center"
                  >
                    <p className="text-xs font-extrabold text-[#1E3A8A] leading-snug">
                      {currentUser
                        ? bubbleText
                        : 'Profil masih kosong — Yuk Sign In / Sign Up dulu!'}
                    </p>
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#377EC0]/40 rotate-45"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Lively Swaying & Expressive Chibi Avatar (Bald & Faceless when NOT signed in) */}
                <div className="relative z-10 pb-3 pt-1 flex items-center justify-center">
                  <ChibiAvatar
                    ref={svgRef}
                    config={composedAvatar}
                    mode={previewMode}
                    softShadow
                    animateIdle={!doorsClosed}
                    isExpressing={currentUser ? isExpressing : false}
                    emptyProfile={!currentUser}
                    className={
                      previewMode === 'head'
                        ? 'w-44 h-44 transition-all duration-300'
                        : 'w-48 h-60 transition-all duration-300'
                    }
                    title={currentUser ? 'Avatar Kustom EVORA' : 'Profil Kosong EVORA'}
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
                    if (!currentUser) {
                      onOpenAuth();
                      return;
                    }
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
              {!currentUser && (
                <div className="rounded-2xl bg-[#E8F5FA] border border-[#9FD2D6] p-3.5 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    Karena kamu belum Sign In / Sign Up, avatar profil masih kosong (botak tanpa wajah).
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-4 py-2 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In / Sign Up Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Panel 'Kustomisasi Mendalam' (or Locked Notice if not signed in) */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/60 space-y-6">
            {!currentUser && (
              <div className="rounded-2xl bg-[#FFF4E5] border border-[#FBDF54] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-[#B45309]">
                    Profil Belum Aktif
                  </p>
                  <p className="text-xs font-bold text-slate-600">
                    Sign In atau Sign Up akun terlebih dahulu untuk membuka dan menyimpan kustomisasi avatarmu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-2.5 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold shrink-0 cursor-pointer"
                >
                  Masuk / Daftar
                </button>
              </div>
            )}
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
