import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  name: string;
  businessName: string;
  mobile: string;
  category: string;
  invitedBy: mongoose.Types.ObjectId;
  meetingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VisitorSchema: Schema = new Schema({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  mobile: { type: String, required: true },
  category: { type: String, required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
