import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportMessage extends Document {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Solved';
  createdAt: Date;
}

const SupportMessageSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Solved'],
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISupportMessage>('SupportMessage', SupportMessageSchema);
