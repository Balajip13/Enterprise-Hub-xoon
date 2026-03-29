import express from 'express';
import Meeting from '../models/Meeting';
import User from '../models/User';
import Notification from '../models/Notification';
import Visitor from '../models/Visitor';
import { asyncHandler } from '../utils/asyncHandler';
import { createMeetingService } from '../utils/meetingService';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all meetings (filtered by chapter)
router.get('/', asyncHandler(async (req: AuthRequest, res: any) => {
  const { chapterId } = req.query;
  const authUser = req.user;

  // Enforce chapter-based access
  if (authUser.role !== 'ADMIN' && chapterId) {
    const user = await User.findById(authUser.id);
    const targetChapter = Array.isArray(chapterId) ? chapterId[0] : chapterId;
    if (!user || user.chapter?.toLowerCase() !== String(targetChapter).toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to this chapter is denied' });
    }
  }

  const filter: any = {};
  if (chapterId) {
    filter.chapter = { $regex: new RegExp(`^${chapterId}$`, 'i') };
  }
  const meetings = await Meeting.find(filter)
    .populate('host', 'name email businessName profileImage')
    .sort({ date: 1 });
  res.json(meetings);
}));

// GET next upcoming meeting for user's chapter
router.get('/upcoming', asyncHandler(async (req: AuthRequest, res: any) => {
  const authUser = req.user;
  const user = await User.findById(authUser.id);
  if (!user || !user.chapter) {
    return res.json(null);
  }

  const meeting = await Meeting.findOne({
    chapter: { $regex: new RegExp(`^${user.chapter}$`, 'i') },
    date: { $gte: new Date() }
  })
  .populate('host', 'name email businessName profileImage')
  .sort({ date: 1 });

  res.json(meeting);
}));

// GET meetings for specific chapter
router.get('/chapter/:chapter', asyncHandler(async (req: AuthRequest, res: any) => {
  const { chapter } = req.params;
  const authUser = req.user;

  if (authUser.role !== 'ADMIN') {
    const user = await User.findById(authUser.id);
    if (!user || user.chapter?.toLowerCase() !== String(chapter).toLowerCase()) {
       return res.status(403).json({ success: false, message: 'Forbidden: Access to this chapter is denied' });
    }
  }

  const meetings = await Meeting.find({ chapter: String(chapter) }).sort({ date: 1 });
  res.json(meetings);
}));

// POST create meeting
router.post('/', asyncHandler(async (req: AuthRequest, res: any) => {
  const meeting = await createMeetingService(req.body, req.user);
  res.status(201).json(meeting);
}));

// PUT update meeting
router.put('/:id', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const authUser = req.user;

  if (authUser.role !== 'ADMIN' && authUser.role !== 'CHAPTER_LEAD') {
    return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to update meetings' });
  }

  const meeting = await Meeting.findByIdAndUpdate(id, req.body, { new: true });
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  const members = await User.find({ 
    chapter: { $regex: new RegExp(`^${meeting.chapter}$`, 'i') },
    role: 'MEMBER'
  });

  for (const member of members) {
    const notification = new Notification({
      recipient: member._id,
      type: 'MEETING',
      title: 'Meeting Updated',
      message: `The meeting "${meeting.title}" has been updated.`,
      link: '/meetings',
      chapter: meeting.chapter
    });
    await notification.save();
  }

  res.json(meeting);
}));

// PUT update attendance (Admin/Lead only)
router.put('/:id/attendance', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { attendance } = req.body;
  const authUser = req.user;

  if (authUser.role !== 'ADMIN' && authUser.role !== 'CHAPTER_LEAD') {
    return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to update attendance' });
  }

  const meeting = await Meeting.findByIdAndUpdate(id, { attendance }, { new: true });
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
  res.json(meeting);
}));

router.post('/:id/mark-attendance', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const authUser = req.user;

  const meeting = await Meeting.findById(id);
  if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

  const user = await User.findById(authUser.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Enforce chapter matching
  if (user.chapter?.toLowerCase() !== meeting.chapter?.toLowerCase() && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: You can only mark attendance for your own chapter.' });
  }

  // Enforce time window: 30 mins before to 2 hours after
  const [hours, minutes] = meeting.startTime.split(':').map(Number);
  const meetingStartTime = new Date(meeting.date);
  meetingStartTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const windowStart = new Date(meetingStartTime.getTime() - 30 * 60000); // 30 mins before
  const windowEnd = new Date(meetingStartTime.getTime() + 2 * 60 * 60000); // 2 hours after

  if (now < windowStart || now > windowEnd) {
    return res.status(400).json({ 
      success: false, 
      message: 'Attendance can only be marked between 30 mins before and 2 hours after the meeting start time.' 
    });
  }

  // Check if session is already marked
  const alreadyMarked = meeting.attendance.some(a => a.userId.toString() === authUser.id.toString());
  if (alreadyMarked) {
    return res.status(400).json({ success: false, message: 'Attendance already marked' });
  }

  // Update attendance
  meeting.attendance.push({ 
    userId: authUser.id, 
    status: 'Present' 
  });
  
  await meeting.save();
  res.json({ success: true, message: 'Attendance marked successfully', meeting });
}));

// GET guests for meeting
router.get('/:id/guests', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const guests = await Visitor.find({ meetingId: id }).populate('invitedBy', 'name');
  res.json(guests);
}));

// POST add guest to meeting
router.post('/:id/guests', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { name, businessName, mobile, category, invitedBy } = req.body;
  const authUser = req.user;

  // Users can only add guests if they are the inviter or ADMIN/LEAD
  if (String(authUser.id) !== String(invitedBy) && authUser.role !== 'ADMIN' && authUser.role !== 'CHAPTER_LEAD') {
    return res.status(403).json({ success: false, message: 'Forbidden: Cannot add guests for other users' });
  }

  const guest = new Visitor({
    name,
    businessName,
    mobile,
    category,
    invitedBy,
    meetingId: id
  });
  await guest.save();
  res.status(201).json(guest);
}));

export default router;
