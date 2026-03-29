import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User';
import Referral from '../models/Referral';
import Notification from '../models/Notification';

import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

const onboardingSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.string().optional(),
    chapter: z.string().min(1, 'Chapter selection is required'),
    chapterLocation: z.string().optional()
  })
});

// 1. User Registration with Referral Logic
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, email, mobile, password, referredBy } = req.body;

    if (!name || !email || !password || !mobile) {
      throw new Error('All fields are required');
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      referralCode: userReferralCode,
      status: 'Pending Approval',
      walletBalance: 0
    });

    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy }).session(session);
      
      if (referrer) {
        if (referrer.email === email) {
          throw new Error('You cannot refer yourself');
        }

        referrer.walletBalance = (referrer.walletBalance || 0) + 50;
        await referrer.save({ session });

        newUser.referredBy = referredBy;

        const referralRecord = new Referral({
          referrer: referrer._id,
          recipient: newUser._id,
          status: 'Given',
          date: new Date()
        });
        await referralRecord.save({ session });

        const notification = new Notification({
          recipient: referrer._id,
          type: 'REFERRAL',
          title: 'Referral Bonus!',
          message: `Congratulations! ${name} joined using your code. You earned 50 credits.`,
          link: '/dashboard'
        });
        await notification.save({ session });
      } else {
        throw new Error('Invalid referral code');
      }
    }

    await newUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful!',
      token: token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, chapter: newUser.chapter }
    });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(400).json({ success: false, message: error.message });
  }
}));

// 1.5 User Onboarding (Chapter Selection)
router.put('/onboarding', authenticateToken, validate(onboardingSchema), asyncHandler(async (req, res) => {
  const { userId, role, chapter, chapterLocation } = req.body;
  const authUser = (req as any).user;
  
  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
     return res.status(403).json({ success: false, message: 'Forbidden: Cannot onboard another user' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.role = role || user.role;
  user.chapter = chapter || user.chapter;
  user.chapterLocation = chapterLocation || user.chapterLocation;

  await user.save();

  // Create a welcome notification for the new member
  try {
    const existingNotif = await Notification.findOne({
      recipient: user._id,
      title: 'Welcome to XOON Network!'
    });

    if (!existingNotif) {
      const welcomeNotif = new Notification({
        recipient: user._id,
        type: 'SYSTEM',
        title: 'Welcome to XOON Network!',
        message: `You've joined the ${chapter} chapter. Start connecting with members and give your first referral!`,
        link: '/dashboard',
        chapter: chapter
      });
      await welcomeNotif.save();
    }
  } catch (notifErr) {
    console.error('[Onboarding] Failed to save welcome notification:', notifErr);
  }

  res.json({ 
    success: true, 
    message: 'Onboarding completed', 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      chapter: user.chapter,
      chapterLocation: user.chapterLocation,
      status: user.status
    }
  });
}));

// 2. Email Login
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({ 
    success: true,
    message: 'Login successful',
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      chapter: user.chapter,
      status: user.status
    } 
  });
}));

export default router;
