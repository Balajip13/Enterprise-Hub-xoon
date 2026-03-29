import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  platformName: string;
  supportEmail: string;
  membershipFee: number;
  referralCommission: number;
  joiningFee: number;
  paymentSettings?: {
    gateway: string;
    currency: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    webhookSecret?: string;
    isLiveMode: boolean;
    enablePayments: boolean;
    enableSubscriptions: boolean;
    enableCoursePayments: boolean;
    enableReferralFees: boolean;
  };
  notificationSettings?: {
    emailAlerts: boolean;
    browserAlerts: boolean;
  };
  securitySettings?: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  referralRules?: {
    acceptanceTimeline: number;
    minDealValue: number;
  };
  updatedAt: Date;
}

const PlatformSettingsSchema: Schema = new Schema({
  platformName: { type: String, default: 'XOON Enterprise Hub' },
  supportEmail: { type: String, default: 'hq@xoon.com' },
  membershipFee: { type: Number, default: 4500 },
  referralCommission: { type: Number, default: 5 },
  joiningFee: { type: Number, default: 14200 },
  paymentSettings: {
    gateway: { type: String, default: 'Razorpay' },
    currency: { type: String, default: 'INR' },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    isLiveMode: { type: Boolean, default: false },
    enablePayments: { type: Boolean, default: false },
    enableSubscriptions: { type: Boolean, default: false },
    enableCoursePayments: { type: Boolean, default: false },
    enableReferralFees: { type: Boolean, default: false }
  },
  notificationSettings: {
    emailAlerts: { type: Boolean, default: true },
    browserAlerts: { type: Boolean, default: true }
  },
  securitySettings: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 60 }
  },
  referralRules: {
    acceptanceTimeline: { type: Number, default: 48 },
    minDealValue: { type: Number, default: 1000 }
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
