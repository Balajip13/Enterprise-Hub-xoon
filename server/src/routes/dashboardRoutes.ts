import express from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import Meeting from '../models/Meeting';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET personal dashboard stats
router.get('/stats/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params as { userId: string };
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Cannot access another user\'s statistics' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const referralsGiven = await Referral.countDocuments({ referrer: userId });
  const referralsReceived = await Referral.countDocuments({ recipient: userId });
  
  const businessMetrics = await Referral.aggregate([
    { 
      $match: { 
        $or: [
          { referrer: new mongoose.mongo.ObjectId(userId) }, 
          { recipient: new mongoose.mongo.ObjectId(userId) }
        ],
        status: 'Converted'
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalVolume: { $sum: '$value' },
        count: { $sum: 1 }
      } 
    }
  ]);

  const closedBusiness = businessMetrics[0]?.totalVolume || 0;
  const closedCount = businessMetrics[0]?.count || 0;
  const totalReferrals = referralsGiven + referralsReceived;
  const successRate = totalReferrals > 0 ? Math.round((closedCount / totalReferrals) * 100) : 0;
  const avgDealValue = closedCount > 0 ? Math.round(closedBusiness / closedCount) : 0;

  const pipelineCount = await Referral.countDocuments({
    $or: [{ referrer: userId }, { recipient: userId }],
    status: { $in: ['Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup'] }
  });

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

  let reputationTier = 'Bronze';
  const activityScore = (referralsGiven * 2) + (closedCount * 5) + (attendanceRate / 10);
  
  if (activityScore >= 50 && attendanceRate >= 90) reputationTier = 'Platinum';
  else if (activityScore >= 30 && attendanceRate >= 80) reputationTier = 'Gold';
  else if (activityScore >= 15 && attendanceRate >= 70) reputationTier = 'Silver';

  const upcomingMeetings = await Meeting.find({ 
    chapter: user.chapter,
    date: { $gte: new Date() }
  }).sort({ date: 1 }).limit(3);

  const recentReferrals = await Referral.find({
    $or: [{ referrer: userId }, { recipient: userId }]
  })
  .populate('referrer', 'name')
  .populate('recipient', 'name')
  .sort({ date: -1 })
  .limit(5);

  res.json({
    stats: {
      referralsGiven,
      referralsReceived,
      closedBusiness,
      upcomingMeetingsCount: upcomingMeetings.length,
      successRate,
      avgDealValue,
      pipelineCount,
      attendanceRate,
      reputationTier,
      activityScore: Math.round(activityScore)
    },
    upcomingMeetings,
    recentReferrals
  });
}));

// GET personal leaderboard
router.get('/', asyncHandler(async (req: AuthRequest, res: any) => {
  const leaderboard = await User.aggregate([
    { $match: { role: 'MEMBER' } },
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
      $project: {
        name: 1,
        email: 1,
        chapter: 1,
        businessCategory: 1,
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
        revenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$refReceived',
                  as: 'ref',
                  cond: { $eq: ['$$ref.status', 'Converted'] }
                }
              },
              as: 'deal',
              in: { $ifNull: ['$$deal.value', 0] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        activityScore: {
          $min: [100, {
            $add: [
              { $multiply: ['$referralsGiven', 8] },
              { $multiply: ['$dealsClosed', 20] },
              20
            ]
          }]
        }
      }
    },
    { $sort: { activityScore: -1, revenue: -1 } },
    { $limit: 20 }
  ]);

  res.json(leaderboard);
}));

export default router;
