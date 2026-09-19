export type ServiceCategory = 'body' | 'face' | 'injections' | 'posture' | 'packages';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  durationMinutes: number;
  priceFrom: number;
  priceTo?: number;
  popular?: boolean;
  tag?: string;
  image?: string;
  vkUrl?: string;
  vkId?: number;
  includedSteps?: string[];
  recommendedMasterId?: string;
  priceOnConsultation?: boolean;
  priceLabel?: string;
  priceNote?: string;
  isInjectable?: boolean;
}

export interface Master {
  id: string;
  name: string;
  role: string;
  specialties: ServiceCategory[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatar: string;
  fallbackAvatar?: string;
  quote?: string;
  nextAvailableSlot?: string;
}

export interface PortfolioItem {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  masterName: string;
  image: string;
  fallbackImage?: string;
  beforeImage?: string;
  tags: string[];
  durationMinutes?: number;
  serviceId?: string;
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  source: 'yandex' | 'site' | 'gis';
  text: string;
  service?: string;
  master?: string;
  verified?: boolean;
  avatarColor?: string;
  userLevel?: string;
  likes?: number;
  hasReply?: boolean;
  replyText?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  additionalServices?: { id: string; name: string; price: number; duration: number }[];
  masterId: string;
  masterName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  price: number;
  durationMinutes: number;
  clientName: string;
  clientPhone: string;
  clientComment?: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

export type NewsCategory = 'advice' | 'news' | 'promo' | 'care' | 'injections';

export interface NewsPost {
  id: string;
  title: string;
  category: NewsCategory;
  categoryLabel?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  readTimeMinutes?: number;
  authorName?: string;
  authorRole?: string;
  isPublished?: boolean;
  featured?: boolean;
}

export interface BlockedSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string; // e.g. "Запись по телефону", "Бронь администратора"
  note?: string; // e.g. клиент, телефон
  blockedAt?: string;
}
