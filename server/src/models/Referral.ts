import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  clientName: string;
  email: string;
  clientPhone: string;
  category?: string;
  requirement: string;
  value: number;
  status: 'Given' | 'Accepted' | 'Meeting Scheduled' | 'Committed' | 'Followup' | 'Converted' | 'Closed' | 'Blocked' | 'Rejected';
  notes?: string;
  rating?: number;
  review?: string;
  date: Date;
  chapter: mongoose.Types.ObjectId;
}

const ReferralSchema: Schema = new Schema({
  referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  email: { 
    type: String, 
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
  },
  clientPhone: { type: String, required: true },
  category: { type: String },
  requirement: { type: String, required: true },
  value: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup', 'Converted', 'Closed', 'Blocked', 'Rejected'], 
    default: 'Given' 
  },
  notes: String,
  rating: Number,
  review: String,
  date: { type: Date, default: Date.now },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true }
});

export default mongoose.model<IReferral>('Referral', ReferralSchema);
