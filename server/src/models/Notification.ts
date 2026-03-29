import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'REFERRAL' | 'MEETING' | 'SYSTEM' | 'LEADERBOARD' | 'MEMBER';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  chapter?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['REFERRAL', 'MEETING', 'SYSTEM', 'LEADERBOARD', 'MEMBER'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: String,
  chapter: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
