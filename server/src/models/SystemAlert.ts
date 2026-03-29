import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemAlert extends Document {
  title: string;
  message: string;
  type: 'MAINTENANCE' | 'UPDATE' | 'WARNING' | 'INFO';
  isResolved: boolean;
  createdAt: Date;
}

const SystemAlertSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MAINTENANCE', 'UPDATE', 'WARNING', 'INFO'],
    default: 'INFO'
  },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISystemAlert>('SystemAlert', SystemAlertSchema);
