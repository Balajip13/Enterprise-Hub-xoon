
import { BusinessProfile, Referral, Chapter } from './types';

export const BUSINESS_QUOTES = [
  {
    text: "Your network is your net worth. Invest in people first.",
    author: "Porter Gale"
  },
  {
    text: "The best way to sell something is to earn the awareness, respect, and trust of those who might buy.",
    author: "Jordan Belfort"
  },
  {
    text: "Referrals are the highest form of flattery. They are the ultimate indicator of professional trust.",
    author: "XOON Wisdom"
  },
  {
    text: "Networking is not about just connecting people. It's about connecting people with people, people with ideas, and people with opportunities.",
    author: "Michele Jennae"
  },
  {
    text: "In business, you don't get what you deserve, you get what you negotiate and who you know.",
    author: "Chester L. Karrass"
  },
  {
    text: "The currency of real networking is not greed but generosity.",
    author: "Keith Ferrazzi"
  }
];

export const MOCK_USER: BusinessProfile = {
  id: 'u1',
  name: 'X-Tech Solutions',
  ownerName: 'Rahul Sharma',
  category: 'Software Development',
  keywords: ['Web Design', 'Mobile Apps', 'Cloud'],
  location: 'Bangalore, KA',
  phone: '+91 9876543210',
  email: 'rahul@xtech.com',
  whatsapp: '919876543210',
  services: ['SaaS Development', 'UI/UX Design'],
  trustScore: 85,
  averageRating: 4.8,
  totalReviews: 12,
  isPremium: true,
  businessType: 'SMALL_COMPANY',
  gstNumber: '29AAAAA0000A1Z5',
  panNumber: 'ABCDE1234F',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  membershipDiscount: 250,
  referralPoints: 1250,
  isAutoRenewalEnabled: true,
};

export const MOCK_MEMBERS: BusinessProfile[] = [
  {
    id: 'u2',
    name: 'Green Flora',
    ownerName: 'Priya Iyer',
    category: 'Interior Design',
    keywords: ['Residential', 'Office Decor'],
    location: 'Bangalore, KA',
    phone: '+91 9123456789',
    email: 'priya@greenflora.in',
    whatsapp: '919123456789',
    services: ['Home Styling', 'Vertical Gardens'],
    trustScore: 92,
    averageRating: 4.9,
    totalReviews: 24,
    isPremium: true,
    businessType: 'SMALL_COMPANY',
    gstNumber: '29BBBBB1111B1Z5',
    panNumber: 'FGHIJ5678K',
    membershipDiscount: 100,
    referralPoints: 800,
    isAutoRenewalEnabled: false,
  },
  {
    id: 'u3',
    name: 'Finance First',
    ownerName: 'Anil Gupta',
    category: 'Financial Planning',
    keywords: ['Tax Saving', 'Mutual Funds', 'Insurance'],
    location: 'Bangalore, KA',
    phone: '+91 9345678901',
    email: 'anil@financefirst.com',
    whatsapp: '919345678901',
    services: ['Wealth Management', 'Corporate Tax'],
    trustScore: 78,
    averageRating: 4.2,
    totalReviews: 8,
    isPremium: false,
    businessType: 'FREELANCER',
    panNumber: 'KLMNO9012P',
    membershipDiscount: 0,
    referralPoints: 150,
    isAutoRenewalEnabled: false,
  },
  {
    id: 'u4',
    name: 'Creative Clicks',
    ownerName: 'Samir Verma',
    category: 'Photography',
    keywords: ['Events', 'Product Shoots'],
    location: 'Bangalore, KA',
    phone: '+91 9555544444',
    email: 'samir@creativeclicks.com',
    whatsapp: '919555544444',
    services: ['Wedding Photography', 'Ad Films'],
    trustScore: 88,
    averageRating: 4.7,
    totalReviews: 15,
    isPremium: true,
    businessType: 'FREELANCER',
    panNumber: 'QRSTU3456V',
    membershipDiscount: 450,
    referralPoints: 2100,
    isAutoRenewalEnabled: true,
  }
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref1',
    fromMemberId: 'u2',
    toMemberId: 'u1',
    clientName: 'Modern Estates',
    clientPhone: '080-22334455',
    requirement: 'Need a mobile app for tenant management.',
    status: 'ACCEPTED',
    value: 75000,
    referrerCommission: 3750,
    platformFee: 3750,
    timestamp: Date.now() - 86400000 * 2,
    notes: 'Urgent requirement, expected timeline 3 months.',
    isPlatformBound: false
  },
  {
    id: 'ref2',
    fromMemberId: 'u1',
    toMemberId: 'u3',
    clientName: 'Suresh V',
    clientPhone: '9888877777',
    requirement: 'Individual tax planning for FY 24-25.',
    status: 'CONVERTED',
    value: 5000,
    referrerCommission: 250,
    platformFee: 250,
    timestamp: Date.now() - 86400000 * 5,
    notes: 'Long term client of ours.',
    isPlatformBound: true,
    rating: 5,
    review: "Anil did a fantastic job. Extremely professional and thorough with the tax planning."
  }
];

export const MOCK_CHAPTERS: Chapter[] = [
  { id: 'ch1', name: 'XOON Bangalore Alpha', location: 'Indiranagar', memberCount: 45 },
  { id: 'ch2', name: 'XOON Bangalore Delta', location: 'Whitefield', memberCount: 32 }
];
