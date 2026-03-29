import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  googleId?: string;
  role: string;
  chapter?: string;
  chapterId?: string;
  chapterLocation?: string;
  businessName?: string;
  businessCategory?: string;
  subCategories?: string[];
  whatsappNumber?: string;
  rating?: number;
  reviewCount?: number;
  trustScore?: number;
  paymentStatus: 'unpaid' | 'paid';
  paymentDate?: Date;
  razorpayPaymentId?: string;
  createdAt: Date;
  profileImage?: string;
  portfolioVideo?: string;
  referralCode?: string;
  referredBy?: string;
  walletBalance?: number;
  purchasedCourses?: string[];
  status?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String },
  googleId: String,
  role: { type: String, enum: ['ADMIN', 'MEMBER', 'CHAPTER_LEAD'] },
  chapter: String,
  chapterId: String,
  chapterLocation: String,
  businessName: String,
  businessCategory: String,
  subCategories: [String],
  whatsappNumber: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 0 },
  membershipType: { type: String, enum: ['PRO', 'Normal'], default: 'Normal' },
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected'], default: 'Pending Approval' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentDate: Date,
  razorpayPaymentId: String,
  services: [{
    name: String,
    description: String,
    icon: String
  }],
  idealReferrals: [{
    target: String,
    description: String,
    industry: String
  }],
  availability: {
    status: { 
      type: String, 
      enum: ['Open for Referrals', 'Limited Capacity', 'Not Accepting Referrals', 'On Vacation'],
      default: 'Open for Referrals'
    },
    note: String
  },
  createdAt: { type: Date, default: Date.now },
  profileImage: String,
  portfolioVideo: String,
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  walletBalance: { type: Number, default: 0 },
  purchasedCourses: [{ type: String }]
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

export default mongoose.model<IUser>('User', UserSchema);
