
export type UserRole = 'ADMIN' | 'MEMBER';
export type BusinessType = 'FREELANCER' | 'SMALL_COMPANY' | 'ENTERPRISE';

export interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  keywords: string[];
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  services: string[];
  trustScore: number;
  averageRating: number; // New: 1-5 scale
  totalReviews: number; // New: count of testimonials
  isPremium: boolean;
  businessType: BusinessType;
  gstNumber?: string;
  panNumber?: string;
  imageUrl?: string;
  videoUrl?: string;
  membershipDiscount: number;
  referralPoints: number;
  isAutoRenewalEnabled: boolean;
}

export type ReferralStatus = 'GIVEN' | 'ACCEPTED' | 'COMMITTED' | 'FOLLOWUP' | 'CONVERTED' | 'CLOSED';

export interface Referral {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  clientName: string;
  clientPhone: string;
  requirement: string;
  status: ReferralStatus;
  value: number;
  referrerCommission: number;
  platformFee: number;
  timestamp: number;
  notes: string;
  isPlatformBound: boolean;
  verificationDocUrl?: string; 
  rating?: number; // New: rating given by referrer after conversion
  review?: string; // New: testimonial given by referrer
}

export interface Chapter {
  id: string;
  name: string;
  location: string;
  memberCount: number;
}

export interface Meeting {
  id: string;
  chapterId: string;
  date: string;
  time: string;
  agenda: string[];
  attendance: string[];
}
