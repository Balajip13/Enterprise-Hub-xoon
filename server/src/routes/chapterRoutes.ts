import express from 'express';
import Chapter from '../models/Chapter';
import User from '../models/User';
import Referral from '../models/Referral';
import Meeting from '../models/Meeting';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// GET all active chapters
router.get('/', asyncHandler(async (req, res) => {
  const chapters = await Chapter.find({ status: 'active' }).sort({ name: 1 });
  res.json({ success: true, data: chapters });
}));

// GET all active chapters explicitly
router.get('/active', asyncHandler(async (req, res) => {
  const chapters = await Chapter.find({ status: 'active' }).sort({ name: 1 });
  res.json({ success: true, data: chapters });
}));

// GET single chapter by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
  res.json({ success: true, data: chapter });
}));

// POST create chapter (Admin)
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { name, city, location, code } = req.body;
  if (!name || !city || !location || !code) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const existing = await Chapter.findOne({ code });
  if (existing) return res.status(400).json({ message: 'Chapter code already exists' });
  const chapter = new Chapter({ name, city, location, code });
  await chapter.save();
  res.status(201).json(chapter);
}));

// PUT update chapter
router.put('/:id', asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
  res.json(chapter);
}));

// DELETE chapter
router.delete('/:id', asyncHandler(async (req, res) => {
  await Chapter.findByIdAndDelete(req.params.id);
  res.json({ message: 'Chapter deleted' });
}));

// --- Chapter Lead Functions ---

// PUT update chapter
router.get('/members/:chapter', authenticateToken, asyncHandler(async (req, res) => {
  const { chapter } = req.params;
  
  const members = await User.aggregate([
    { 
      $match: { 
        chapter: { $regex: new RegExp(`^${chapter}$`, 'i') },
        role: 'MEMBER'
      } 
    },
    {
      $lookup: {
        from: 'referrals',
        localField: '_id',
        foreignField: 'referrer',
        as: 'refGiven'
      }
    },
    {
      $lookup: {
        from: 'referrals',
        localField: '_id',
        foreignField: 'recipient',
        as: 'refReceived'
      }
    },
    {
      $lookup: {
        from: 'meetings',
        let: { memberId: '$_id', memberChapter: '$chapter', joinDate: '$createdAt' },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$chapter', '$$memberChapter'] },
                  { $gte: ['$date', '$$joinDate'] },
                  { $eq: ['$status', 'Completed'] }
                ]
              }
            }
          },
          {
            $project: {
              attended: {
                $cond: [
                  { $anyElementTrue: {
                    $map: {
                      input: '$attendance',
                      as: 'a',
                      in: { $and: [{ $eq: ['$$a.userId', '$$memberId'] }, { $eq: ['$$a.status', 'Present'] }] }
                    }
                  } },
                  1,
                  0
                ]
              }
            }
          }
        ],
        as: 'meetingStats'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        businessCategory: 1,
        location: 1,
        profileImage: 1,
        status: 1,
        referralsGiven: { $size: '$refGiven' },
        dealsClosed: {
          $size: {
            $filter: {
              input: '$refReceived',
              as: 'ref',
              cond: { $eq: ['$$ref.status', 'Converted'] }
            }
          }
        },
        attendanceRate: {
          $cond: [
            { $gt: [{ $size: '$meetingStats' }, 0] },
            { $round: [{ $multiply: [{ $divide: [{ $sum: '$meetingStats.attended' }, { $size: '$meetingStats' }] }, 100] }, 0] },
            100
          ]
        }
      }
    }
  ]);

  res.json(members);
}));

// GET chapter lead dashboard stats
router.get('/stats/:chapter', authenticateToken, asyncHandler(async (req, res) => {
  const { chapter } = req.params;
  
  const members = await User.find({ 
    chapter: { $regex: new RegExp(`^${chapter}$`, 'i') },
    role: 'MEMBER'
  });
  
  const memberIds = members.map(m => m._id);
  const totalMembers = members.length;
  
  const pendingApprovalsCount = await User.countDocuments({
    chapter: { $regex: new RegExp(`^${chapter}$`, 'i') },
    status: 'Pending Approval'
  });

  const chapterReferrals = await Referral.find({
    $or: [
      { referrer: { $in: memberIds } },
      { recipient: { $in: memberIds } }
    ]
  })
  .populate('referrer', 'name')
  .populate('recipient', 'name')
  .sort({ date: -1 });

  const totalReferrals = chapterReferrals.length;
  
  const businessMetrics = await Referral.aggregate([
    { 
      $match: { 
        $or: [
          { referrer: { $in: memberIds } },
          { recipient: { $in: memberIds } }
        ],
        status: 'Converted'
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalVolume: { $sum: '$value' }
      } 
    }
  ]);

  const closedBusiness = businessMetrics[0]?.totalVolume || 0;
  const closedCount = chapterReferrals.filter((r: any) => r.status === 'Converted').length;
  
  const memberGrowthRate = totalMembers > 0 ? 15 : 0; 
  const dealConversionRate = totalReferrals > 0 ? Math.round((closedCount / totalReferrals) * 100) : 0;

  res.json({
    totalMembers,
    totalReferrals,
    closedDeals: closedCount,
    closedBusiness,
    pendingApprovals: pendingApprovalsCount,
    recentReferrals: chapterReferrals.slice(0, 5),
    performance: {
      memberGrowthRate,
      dealConversionRate
    }
  });
}));

// GET pending member approvals for chapter
router.get('/approvals/:chapter', authenticateToken, asyncHandler(async (req, res) => {
  const { chapter } = req.params;
  const pendingApplicants = await User.find({
    chapter: { $regex: new RegExp(`^${chapter}$`, 'i') },
    status: 'Pending Approval'
  }).sort({ createdAt: -1 });
  res.json(pendingApplicants);
}));

// GET full chapter analytics
router.get('/analytics/:chapter', authenticateToken, asyncHandler(async (req, res) => {
  const { chapter } = req.params;
  const chapterRegex = { $regex: new RegExp(`^${chapter}$`, 'i') };

  const allUsers = await User.find({ chapter: chapterRegex });
  const totalMembers = allUsers.length;
  const activeMembers = allUsers.filter(u => u.status === 'Approved').length;
  const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

  const memberIds = allUsers.map(u => u._id);
  const referrals = await Referral.find({
    $or: [
      { referrer: { $in: memberIds } },
      { recipient: { $in: memberIds } }
    ]
  });

  const totalReferrals = referrals.length;
  const convertedReferrals = referrals.filter(r => r.status === 'Converted').length;
  const dealConversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const currentMonthReferrals = referrals.filter(r => new Date(r.date) >= firstDayCurrentMonth).length;
  const lastMonthReferrals = referrals.filter(r => {
    const d = new Date(r.date);
    return d >= firstDayLastMonth && d < firstDayCurrentMonth;
  }).length;
  
  const velocity = lastMonthReferrals > 0 
    ? ((currentMonthReferrals - lastMonthReferrals) / lastMonthReferrals) * 100 
    : 0;

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      date: d
    });
  }

  const growthTrend = months.map(m => {
    const nextMonth = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1);
    return {
      month: m.name,
      members: allUsers.filter(u => u.createdAt < nextMonth).length,
      referrals: referrals.filter(r => {
        const rd = new Date(r.date);
        return rd >= m.date && rd < nextMonth;
      }).length,
      deals: referrals.filter(r => {
        const rd = new Date(r.date);
        return r.status === 'Converted' && rd >= m.date && rd < nextMonth;
      }).length
    };
  });

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const membersThreeMonthsAgo = allUsers.filter(u => u.createdAt < threeMonthsAgo).length;
  const avgMonthlyGrowth = (totalMembers - membersThreeMonthsAgo) / 3;
  const projectedQ4 = Math.round(totalMembers + (avgMonthlyGrowth * 3));

  res.json({
    summary: {
      totalMembers,
      activeMembers,
      retentionRate: Math.round(retentionRate),
      totalReferrals,
      convertedReferrals,
      dealConversionRate: Math.round(dealConversionRate),
      referralVelocity: Math.round(velocity),
      projectedMembership: projectedQ4
    },
    trend: growthTrend
  });
}));

export default router;
