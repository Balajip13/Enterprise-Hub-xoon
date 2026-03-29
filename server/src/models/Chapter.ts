import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  name: string;
  city: string;
  location: string;
  code: string;
  lead?: mongoose.Types.ObjectId | string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const ChapterSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  location: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  lead: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
