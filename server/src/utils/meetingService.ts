import Meeting, { IMeeting } from '../models/Meeting';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

export const createMeetingService = async (data: any, authUser: any) => {
  const { chapter, title, type, date, location, description, maxAttendees, startTime, endTime, host } = data;

  const meeting = new Meeting({
    chapter,
    title,
    type: type || 'Weekly Meeting',
    date: new Date(date),
    startTime: startTime || "10:00",
    endTime: endTime || "12:00",
    location,
    description,
    maxAttendees,
    host: host || authUser.id,
    status: 'Upcoming'
  });

  await meeting.save();

  // Notification logic
  const dateStr = new Date(date).toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const notificationTitle = `New Meeting Scheduled: ${title}`;
  const notificationMessage = `A new ${type || 'Weekly Meeting'} "${title}" has been scheduled for ${chapter} on ${dateStr} at ${startTime || '10:00'}.`;

  const members = await User.find({ 
    chapter: { $regex: new RegExp(`^${chapter}$`, 'i') }, 
    status: 'Approved' 
  });
  
  const chapterLeads = await User.find({ 
    chapter: { $regex: new RegExp(`^${chapter}$`, 'i') }, 
    role: 'CHAPTER_LEAD' 
  });
  
  const uniqueRecipients = [...members.map(m => m._id), ...chapterLeads.map(cl => cl._id)]
    .filter((id, i, self) => self.findIndex(t => t.toString() === id.toString()) === i);

  if (uniqueRecipients.length > 0) {
    const notifications = uniqueRecipients.map(recipientId => ({
      recipient: recipientId,
      type: 'MEETING',
      title: notificationTitle,
      message: notificationMessage,
      chapter,
      link: '/meetings', // Default link, individual apps can handle specific redirects if needed
      isRead: false
    }));
    await Notification.insertMany(notifications);
  }

  return meeting;
};
