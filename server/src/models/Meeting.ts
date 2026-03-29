import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  chapter: string;
  title: string;
  type: 'Weekly Meeting' | 'Special Event';
  description?: string;
  date: Date;
  location: string;
  maxAttendees?: number;
  startTime: string;
  endTime: string;
  host: mongoose.Types.ObjectId;
  status: 'Upcoming' | 'Live' | 'Completed';
  attendance: {
    userId: mongoose.Types.ObjectId;
    status: 'Present' | 'Absent';
  }[];
  link?: string;
}

const MeetingSchema: Schema = new Schema({
  chapter: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Weekly Meeting', 'Special Event'], default: 'Weekly Meeting' },
  description: String,
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming' },
  maxAttendees: Number,
  attendance: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Present', 'Absent', 'Excused'], default: 'Present' }
  }],
  link: String
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
