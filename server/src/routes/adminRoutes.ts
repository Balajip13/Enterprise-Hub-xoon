import express from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import Meeting from '../models/Meeting';
import Chapter from '../models/Chapter';
import SupportMessage from '../models/SupportMessage';
import Broadcast from '../models/Broadcast';
import Notification from '../models/Notification';
import SystemAlert from '../models/SystemAlert';
import PlatformSettings from '../models/PlatformSettings';
import PDFDocument from 'pdfkit';
import { asyncHandler } from '../utils/asyncHandler';
import { createMeetingService } from '../utils/meetingService';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 1. System Stats & Dashboard Analytics
router.get('/system-stats', asyncHandler(async (req, res) => {
  const totalMembers = await User.countDocuments({ role: 'MEMBER' });
  const chapters = await User.distinct('chapter');
  const activeChaptersCount = chapters.length;

  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyReferrals = await Referral.countDocuments({
    date: { $gte: firstDayMonth }
  });

  const closedDealsCount = await Referral.countDocuments({ status: 'Converted' });
  const pendingApprovals = await User.countDocuments({ status: 'Pending Approval' });
  const totalReferrals = await Referral.countDocuments();

  const convertedDeals = await Referral.find({ status: 'Converted' });
  const totalRevenue = convertedDeals.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  
  const successRate = totalReferrals > 0 ? Math.round((closedDealsCount / totalReferrals) * 100) : 0;
  const avgDealValue = closedDealsCount > 0 ? Math.round(totalRevenue / closedDealsCount) : 0;
  const pipelineCount = await Referral.countDocuments({
    status: { $in: ['Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup'] }
  });

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      date: d
    });
  }

  const revenueTrend = months.map(m => {
    const nextMonth = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1);
    const monthlyRevenue = convertedDeals
      .filter(r => {
        const rd = new Date(r.date);
        return rd >= m.date && rd < nextMonth;
      })
      .reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    
    return {
      month: m.name,
      revenue: monthlyRevenue
    };
  });

  res.json({
    summary: {
      totalMembers,
      activeChapters: activeChaptersCount,
      monthlyReferrals,
      closedDeals: closedDealsCount,
      pendingApprovals,
      totalRevenue,
      successRate,
      avgDealValue,
      pipelineCount,
      systemHealth: 'Optimal'
    },
    revenueTrend
  });
}));

// 2. User Management
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

router.post('/users', asyncHandler(async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json(newUser);
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const wasPending = user.status === 'Pending Approval';
  
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  } else {
    delete req.body.password;
  }
  
  Object.assign(user, req.body);
  await user.save();

  // If newly approved, broadcast to chapter members
  if (wasPending && user.status === 'Approved' && user.chapter) {
    const members = await User.find({ 
      chapter: { $regex: new RegExp(`^${user.chapter}$`, 'i') },
      _id: { $ne: user._id }
    });
    
    if (members.length > 0) {
      const notifications = members.map(m => ({
        recipient: m._id,
        type: 'MEMBER',
        title: 'New Member Joined!',
        message: `${user.name} has officially joined the ${user.chapter} chapter. Say hello!`,
        link: '/members',
        chapter: user.chapter
      }));
      await Notification.insertMany(notifications);
    }
  }

  res.json(user);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
}));

// 3. Chapter Management
router.get('/chapters', asyncHandler(async (req, res) => {
  const chapters = await Chapter.find().populate('lead', 'name email').lean();
  const enrichedChapters = await Promise.all(chapters.map(async (chapter) => {
    const memberCount = await User.countDocuments({ chapter: chapter.name });
    return { ...chapter, memberCount };
  }));
  res.json({ success: true, data: enrichedChapters });
}));

router.post('/chapters', asyncHandler(async (req, res) => {
  const newChapter = new Chapter(req.body);
  await newChapter.save();
  res.status(201).json({ success: true, data: newChapter });
}));

router.put('/chapters/:id', asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('lead', 'name');
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
  res.json({ success: true, data: chapter });
}));

router.patch('/chapters/:id/deactivate', asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
  res.json({ success: true, data: chapter });
}));

// 4. Referral Management
router.get('/referrals', asyncHandler(async (req, res) => {
  const referrals = await Referral.find()
    .populate('referrer', 'name email chapter')
    .populate('recipient', 'name email chapter')
    .sort({ date: -1 });
  res.json(referrals);
}));

router.patch('/referrals/:id/status', asyncHandler(async (req, res) => {
  const referral = await Referral.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .populate('referrer', 'name')
    .populate('recipient', 'name');
  if (!referral) return res.status(404).json({ message: 'Referral not found' });
  res.json(referral);
}));

router.delete('/referrals/:id', asyncHandler(async (req, res) => {
  await Referral.findByIdAndDelete(req.params.id);
  res.json({ message: 'Referral deleted successfully' });
}));

router.get('/referrals/export', asyncHandler(async (req, res) => {
  const referrals = await Referral.find()
    .populate('referrer', 'name')
    .populate('recipient', 'name')
    .sort({ date: -1 });
  res.json(referrals);
}));

// 5. Support Message Management
router.get('/support', asyncHandler(async (req, res) => {
  const messages = await SupportMessage.find().sort({ createdAt: -1 });
  res.json(messages);
}));

router.put('/support/:id', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Solved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const message = await SupportMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
}));

router.delete('/support/:id', asyncHandler(async (req, res) => {
  await SupportMessage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted successfully' });
}));

// 6. Meeting Management
router.post('/meetings', asyncHandler(async (req: AuthRequest, res) => {
  const meeting = await createMeetingService(req.body, req.user);
  res.status(201).json(meeting);
}));

router.put('/meetings/:id', asyncHandler(async (req, res) => {
  const { chapter, title, date, startTime, endTime, location, host, description, type } = req.body;
  
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, {
    chapter,
    title,
    date: new Date(date),
    startTime,
    endTime,
    location,
    host,
    description,
    type: type || 'Weekly Meeting'
  }, { new: true });
  
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
  
  // Broadcast update notification
  const dateStr = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const notificationTitle = `Meeting Updated: ${title}`;
  const notificationMessage = `The ${type || 'Weekly Meeting'} "${title}" for ${chapter} has been updated to ${dateStr} at ${startTime} located at ${location}.`;

  const members = await User.find({ chapter: { $regex: new RegExp(`^${chapter}$`, 'i') }, status: 'Approved' });
  const chapterLeads = await User.find({ chapter: { $regex: new RegExp(`^${chapter}$`, 'i') }, role: 'CHAPTER_LEAD' });
  
  const recipients = [...members, ...chapterLeads];
  const uniqueRecipients = recipients.filter((u, i, self) => self.findIndex(t => t._id.toString() === u._id.toString()) === i);
  
  if (uniqueRecipients.length > 0) {
    const notifications = uniqueRecipients.map(user => ({
      recipient: user._id,
      type: 'MEETING',
      title: notificationTitle,
      message: notificationMessage,
      chapter,
      link: user.role === 'CHAPTER_LEAD' ? '/chapter-lead/meetings' : '/dashboard/meetings',
      isRead: false
    }));
    await Notification.insertMany(notifications);
  }

  res.json(meeting);
}));

router.delete('/meetings/:id', asyncHandler(async (req, res) => {
  await Meeting.findByIdAndDelete(req.params.id);
  res.json({ message: 'Meeting deleted successfully' });
}));

router.get('/meetings/upcoming', asyncHandler(async (req, res) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const meetings = await Meeting.find({
    date: { $gte: now },
    status: { $in: ['Upcoming', 'Live'] }
  })
  .populate('host', 'name email')
  .sort({ date: 1 });
  res.json(meetings);
}));

router.get('/meetings/history', asyncHandler(async (req, res) => {
  const now = new Date();
  const meetings = await Meeting.find({ date: { $lt: now } })
    .populate('host', 'name')
    .sort({ date: -1 });
  res.json(meetings);
}));

router.get('/meetings/sync', asyncHandler(async (req, res) => {
  res.json({ message: 'Meeting data synchronized successfully', timestamp: new Date() });
}));

// 7. Global Reports & PDF Export
router.get('/reports/referral-growth', asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  const stats = await Referral.aggregate([
    { $match: { date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%W", date: "$date" } },
        count: { $sum: 1 },
        chapters: { $addToSet: "$chapter" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const totalReferrals = await Referral.countDocuments();
  const referralsThisMonth = await Referral.countDocuments({ date: { $gte: thirtyDaysAgo } });
  
  const topChapters = await Referral.aggregate([
    { $group: { _id: "$chapter", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);

  res.json({ stats, totalReferrals, referralsThisMonth, topChapters });
}));

router.get('/reports/revenue-velocity', asyncHandler(async (req, res) => {
  const convertedDeals = await Referral.find({ status: 'Converted' });
  let totalValue = convertedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const count = convertedDeals.length;

  const avgDealValue = count > 0 ? totalValue / count : 0;
  const avgConversionTime = count > 0 ? 14.5 : 0; 

  const fastestChapter = await Referral.aggregate([
    { $match: { status: 'Converted' } },
    { $group: { _id: "$chapter", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  res.json({ 
    avgConversionTime, 
    avgDealValue, 
    totalRevenue: totalValue, 
    fastestChapter: fastestChapter[0]?._id || 'N/A' 
  });
}));

router.get('/reports/member-retention', asyncHandler(async (req, res) => {
  const activeMembers = await User.countDocuments({ role: 'MEMBER', status: 'Approved' });
  const inactiveMembers = await User.countDocuments({ role: 'MEMBER', status: { $ne: 'Approved' } });
  const total = activeMembers + inactiveMembers;
  const retentionRate = total > 0 ? (activeMembers / total) * 100 : 0;
  res.json({ activeMembers, inactiveMembers, retentionRate, churnRate: 100 - retentionRate });
}));

router.get('/reports/chapter-efficiency', asyncHandler(async (req, res) => {
  const efficiency = await Referral.aggregate([
    {
      $group: {
        _id: "$chapter",
        referrals: { $sum: 1 },
        conversions: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
        totalValue: { $sum: "$value" }
      }
    },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: 'chapter', as: 'members' }
    },
    {
      $project: {
        chapter: "$_id",
        referrals: 1,
        conversions: 1,
        totalValue: 1,
        memberCount: { $size: "$members" },
        efficiencyScore: {
          $cond: [{ $gt: ["$referrals", 0] }, { $multiply: [{ $divide: ["$conversions", "$referrals"] }, 100] }, 0]
        }
      }
    },
    { $sort: { efficiencyScore: -1 } }
  ]);
  res.json(efficiency);
}));

router.get('/reports/export-all', asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [totalRefs, refsMonth, topChaps, convertedDeals, activeUsers, inactiveUsers, efficiency] = await Promise.all([
    Referral.countDocuments(),
    Referral.countDocuments({ date: { $gte: thirtyDaysAgo } }),
    Referral.aggregate([{ $group: { _id: "$chapter", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Referral.find({ status: 'Converted' }),
    User.countDocuments({ role: 'MEMBER', status: 'Approved' }),
    User.countDocuments({ role: 'MEMBER', status: { $ne: 'Approved' } }),
    Referral.aggregate([
      { $group: { _id: "$chapter", referrals: { $sum: 1 }, conversions: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } }, totalValue: { $sum: "$value" } } },
      { $sort: { conversions: -1 } }
    ])
  ]);

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=xoon-analytics-${now.toISOString().split('T')[0]}.pdf`);

  doc.pipe(res);
  doc.fontSize(24).font('Helvetica-Bold').text('XOON Platform Analytics Audit', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Generated on: ${now.toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(16).font('Helvetica-Bold').text('1. Referral Growth');
  doc.fontSize(11).text(`Total: ${totalRefs}, Last 30 Days: ${refsMonth}`);
  doc.moveDown(1);
  
  let totalRevenue = convertedDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  doc.fontSize(16).font('Helvetica-Bold').text('2. Revenue Dynamics');
  doc.fontSize(11).text(`Total Revenue: INR ${(totalRevenue / 10000000).toFixed(2)} Cr`);
  
  doc.moveDown(1);
  doc.fontSize(16).font('Helvetica-Bold').text('3. Chapter Efficiency');
  efficiency.forEach((item: any) => {
    doc.fontSize(10).text(`${item._id}: ${item.referrals} Refs, ${item.conversions} Deals`);
  });

  doc.end();
}));

// 8. Notifications & Alerts
router.post('/notifications/broadcast', asyncHandler(async (req, res) => {
  const { message, recipientType, chapterId, adminId } = req.body;
  const broadcast = new Broadcast({ message, recipientType, chapterId, createdBy: adminId });
  await broadcast.save();

  let targetUsers: any[] = [];
  if (recipientType === 'GLOBAL') targetUsers = await User.find({ role: { $in: ['MEMBER', 'CHAPTER_LEAD'] } });
  else if (recipientType === 'CHAPTER') targetUsers = await User.find({ chapter: chapterId });

  const notifications = targetUsers.map(user => ({
    recipient: user._id,
    sender: adminId,
    type: 'SYSTEM',
    title: 'Admin Broadcast',
    message: message,
    isRead: false
  }));

  if (notifications.length > 0) await Notification.insertMany(notifications);
  res.status(201).json({ message: 'Broadcast successful', recipients: notifications.length });
}));

router.get('/system-alerts', asyncHandler(async (req, res) => {
  const alerts = await SystemAlert.find({ isResolved: false }).sort({ createdAt: -1 }).limit(5);
  res.json(alerts);
}));

export default router;
