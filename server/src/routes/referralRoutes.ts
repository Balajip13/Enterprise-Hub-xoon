import express from 'express';
import Referral from '../models/Referral';
import Notification from '../models/Notification';
import User from '../models/User';
import Chapter from '../models/Chapter';
import * as mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET my referrals
router.get('/my/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const referrals = await Referral.find({
    $or: [{ referrer: userId }, { recipient: userId }]
  })
  .populate('referrer', 'name')
  .populate('recipient', 'name')
  .sort({ date: -1 });
  res.json(referrals);
}));

// POST create referral
router.post('/', asyncHandler(async (req: AuthRequest, res: any) => {
  const { referrer, recipient, clientName, email, clientPhone, category, requirement, value, notes } = req.body;
  const authUser = req.user;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (String(authUser.id) !== String(referrer) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Cannot create referrals for other users' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Duplicate Check: Same referrer + Same client email
  const existingReferral = await Referral.findOne({ referrer, email: normalizedEmail });
  if (existingReferral) {
    return res.status(400).json({ message: "Referral already exists" });
  }

  // Fetch referrer's chapter
  const user = await User.findById(referrer);
  if (!user || (!user.chapter && !user.chapterId)) {
    return res.status(400).json({ message: "Referrer must belong to a chapter" });
  }

  // Get Chapter ID from Chapter collection
  let chapterDoc = null;
  
  // 1. Try by chapterId if it exists (Safe Migration)
  if (user.chapterId) {
    chapterDoc = await Chapter.findById(user.chapterId);
  }
  
  // 2. Fallback to name-based lookup
  if (!chapterDoc && user.chapter) {
    chapterDoc = await Chapter.findOne({ name: { $regex: new RegExp(`^${user.chapter}$`, 'i') } });
  }

  if (!chapterDoc) {
    return res.status(400).json({ message: "Valid chapter reference not found" });
  }

  const referral = new Referral({
    referrer,
    recipient,
    clientName,
    email: normalizedEmail,
    clientPhone,
    category,
    requirement,
    value,
    notes,
    status: 'Given',
    date: new Date(),
    chapter: chapterDoc._id
  });
  await referral.save();

  const notification = new Notification({
    recipient,
    sender: referrer,
    type: 'REFERRAL',
    title: 'New Referral Received',
    message: `You have received a new referral for ${clientName}`,
    link: '/referrals',
    chapter: user.chapter
  });
  await notification.save();

  res.status(201).json(referral);
}));

// PUT update referral (lifecycle stages)
router.put('/:id', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, notes, rating, review, value } = req.body;
  const authUser = req.user;
  
  const referral = await Referral.findById(id);
  if (!referral) return res.status(404).json({ message: 'Referral not found' });

  // Only recipient or ADMIN can update referral status
  if (String(authUser.id) !== String(referral.recipient) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only recipients can update referral status' });
  }

  const statusOrder = ['Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup', 'Converted', 'Closed'];
  const currentIdx = statusOrder.indexOf(referral.status);
  const newIdx = statusOrder.indexOf(status);

  if (newIdx !== -1 && currentIdx !== -1) {
    if (newIdx > currentIdx + 1) {
      return res.status(400).json({ 
        message: `Cannot skip stages. Next required stage: ${statusOrder[currentIdx + 1]}` 
      });
    }
  }

  if (status) referral.status = status;
  if (notes !== undefined) referral.notes = notes;
  if (rating !== undefined) referral.rating = rating;
  if (review !== undefined) referral.review = review;
  if (value !== undefined) referral.value = value;

  await referral.save();

  const referrerUser = await User.findById(referral.referrer);
  const notification = new Notification({
    recipient: referral.referrer,
    type: 'REFERRAL',
    title: `Referral ${status}`,
    message: `Your referral for ${referral.clientName} has been ${status.toLowerCase()}.`,
    link: '/referral-status',
    chapter: referrerUser?.chapter
  });
  await notification.save();

  res.json(referral);
}));

export default router;
