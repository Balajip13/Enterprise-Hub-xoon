import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcast extends Document {
  message: string;
  recipientType: 'GLOBAL' | 'CHAPTER';
  chapterId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BroadcastSchema: Schema = new Schema({
  message: { type: String, required: true },
  recipientType: { type: String, enum: ['GLOBAL', 'CHAPTER'], required: true },
  chapterId: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBroadcast>('Broadcast', BroadcastSchema);
