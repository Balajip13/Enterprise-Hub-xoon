import express from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import Meeting from '../models/Meeting';
import Notification from '../models/Notification';
import SupportMessage from '../models/SupportMessage';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Profile stats moved to profile/:userId

// GET detailed profile stats
router.get('/profile/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params as { userId: string };
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const referralsGiven = await Referral.countDocuments({ referrer: userId });
  const referralsReceived = await Referral.countDocuments({ recipient: userId });
  
  const convertedReferrals = await Referral.find({ 
    recipient: userId,
    status: 'Converted'
  });

  const revenueImpact = convertedReferrals.reduce((sum, ref) => sum + (ref.value || 0), 0);
  const dealsClosed = convertedReferrals.length;

  const totalMeetings = await Meeting.countDocuments({ 
    chapter: user.chapter,
    date: { $gte: user.createdAt, $lte: new Date() },
    status: 'Completed'
  });

  const attendedMeetings = await Meeting.countDocuments({
    chapter: user.chapter,
    status: 'Completed',
    attendance: {
      $elemMatch: {
        userId: userId,
        status: 'Present'
      }
    }
  });

  const attendanceRate = totalMeetings > 0 ? Math.round((attendedMeetings / totalMeetings) * 100) : 100;

  const trustScore = Math.min(100, Math.round((referralsGiven * 2) + (dealsClosed * 5) + (attendanceRate / 10)));

  const analytics = [
    { month: 'Jan', commission: 0, projectRevenue: 0 },
    { month: 'Feb', commission: 0, projectRevenue: 0 },
    { month: 'Mar', commission: 0, projectRevenue: 0 },
    { month: 'Apr', commission: 0, projectRevenue: 0 },
    { month: 'May', commission: 0, projectRevenue: 0 },
    { month: 'Jun', commission: 0, projectRevenue: 0 },
  ];

  const leaderboard = await User.aggregate([
    { $match: { role: 'MEMBER' } },
    {
      $lookup: { from: 'referrals', localField: '_id', foreignField: 'referrer', as: 'refGiven' }
    },
    {
      $lookup: { from: 'referrals', localField: '_id', foreignField: 'recipient', as: 'refReceived' }
    },
    {
      $project: {
        referralsGiven: { $size: '$refGiven' },
        dealsClosed: {
          $size: {
            $filter: {
              input: '$refReceived',
              as: 'ref',
              cond: { $eq: ['$$ref.status', 'Converted'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        trustScore: {
          $min: [100, {
            $add: [{ $multiply: ['$referralsGiven', 10] }, { $multiply: ['$dealsClosed', 25] }]
          }]
        }
      }
    },
    { $sort: { trustScore: -1 } }
  ]);

  const rankIndex = leaderboard.findIndex(l => l._id.toString() === userId);
  const rank = rankIndex === -1 ? 'N/A' : `#${rankIndex + 1}`;

  res.json({
    user,
    stats: {
      trustScore,
      referralPoints: referralsGiven * 50,
      rank,
      revenueImpact,
      dealsClosed,
      referralsGiven,
      referralsReceived,
      attendanceRate,
      analytics
    }
  });
}));

// GET current user profile (Safe, non-id-param variant)
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// UPDATE profile
router.put('/profile/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Cannot update other user profiles' });
  }

  const updateData = req.body;
  
  delete updateData.password;
  delete updateData.role;
  delete updateData.email;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json(user);
}));

// GET user activity report
router.get('/:userId/report', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params as { userId: string };
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const referralsCount = await Referral.countDocuments({ referrer: userId });
  const meetingsAttended = await Meeting.countDocuments({
    attendance: { $elemMatch: { userId: userId, status: 'Present' } }
  });

  res.json({
    name: user.name,
    email: user.email,
    chapter: user.chapter,
    role: user.role,
    joinDate: user.createdAt,
    status: user.status,
    referralsCount,
    meetingsAttended
  });
}));

// POST demo course purchase
router.post('/course-purchase', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.body;
  const authUser = req.user;

  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.paymentStatus = 'paid';
  if (!user.purchasedCourses) user.purchasedCourses = [];
  if (!user.purchasedCourses.includes('DEMO_COURSE')) {
    user.purchasedCourses.push('DEMO_COURSE');
  }
  
  await user.save();
  res.json({ success: true, message: 'Demo course unlocked successfully', user });
}));

// GET referral stats
router.get('/referral-stats/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const referredUsersCount = await User.countDocuments({ referredBy: user.referralCode });
  res.json({ referredUsersCount });
}));

// POST submit support message (Public)
router.post('/support', asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newMessage = new SupportMessage({ fullName, email, phone, subject, message });
  await newMessage.save();
  res.status(201).json({ message: 'Your message has been sent successfully.' });
}));

// GET current user status (for polling)
router.get('/me/status', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await User.findById(req.user.id).select('status role chapter');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ 
    success: true,
    status: user.status, 
    role: user.role, 
    chapter: user.chapter 
  });
}));

export default router;
