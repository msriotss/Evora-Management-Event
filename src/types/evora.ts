export type UserRole = 'peserta' | 'organizer' | 'admin';

export type EventStatus = 'draft' | 'pending' | 'revision' | 'published';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
}

export interface RundownItem {
  time: string;
  title: string;
  speaker?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Musik' | 'Teknologi' | 'Kreatif' | 'Bisnis' | 'Komunitas';
  date: string;
  dateLabel: string;
  timeLabel: string;
  city: string;
  venue: string;
  address: string;
  lat: number;
  lng: number;
  pinColor: string;
  description: string;
  organizerName: string;
  speakers: string[];
  sponsors: string[];
  promoCode?: string;
  promoDiscountPercent?: number;
  tiers: TicketTier[];
  rundown: RundownItem[];
  status: EventStatus;
  revisionNote?: string;
}

export interface AvatarConfig {
  gender: 'cowok' | 'cewek' | 'netral';
  skinColor: string;
  faceShape: 'round' | 'oval' | 'square' | 'heart';
  hairStyle: 'poni' | 'bob' | 'pigtails' | 'bun' | 'parted' | 'short';
  hairColor: string;
  eyeStyle: 'sparkle' | 'big' | 'chill' | 'lashes' | 'cat' | 'happy';
  eyeColor: string;
  eyebrowStyle: 'soft' | 'thick' | 'raised' | 'flat';
  eyebrowColor: string;
  noseStyle: 'triangle' | 'button' | 'tiny';
  mouthStyle: 'smile' | 'grin' | 'surprised' | 'cat' | 'cool';
  makeupStyle: 'none' | 'blush-pink' | 'blush-peach' | 'freckles' | 'pastel-shadow';
  shirtStyle: 'tee' | 'ribbon-uniform' | 'collar' | 'dress';
  shirtColor: string;
  jacketStyle: 'none' | 'cardigan' | 'denim' | 'varsity' | 'blazer';
  jacketColor: string;
  shoeStyle: 'sneakers' | 'loafers' | 'maryjane' | 'boots';
  shoeColor: string;
  accessory: 'none' | 'flower-crown' | 'glasses' | 'cap' | 'headphones' | 'ribbon-bow';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
}

export interface TicketOrder {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  eventVenue: string;
  tierName: string;
  quantity: number;
  totalPaid: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  paymentMethod: 'QRIS' | 'Virtual Account' | 'E-Wallet';
  qrCode: string;
  checkedIn: boolean;
  reminderActive: boolean;
  feedbackSubmitted: boolean;
  rating?: number;
  feedbackComment?: string;
  purchasedAt: string;
}

export interface StreakState {
  currentDays: number;
  longestDays: number;
  isFrozen: boolean;
  freezeTokens: number;
  monthlyEventsHosted: number;
  monthlyHostGoal: number;
  monthlyEventsJoined: number;
  activeDaysInMonth: number[];
  unlockedPets: string[];
  questBestScore: number;
  completedDailyGoals: string[];
}
