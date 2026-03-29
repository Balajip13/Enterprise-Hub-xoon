import express from 'express';
import SupportMessage from '../models/SupportMessage';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// POST /api/support - Submit a support message (Public)
router.post('/', asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide full name, email, and message.' 
    });
  }

  const newMessage = new SupportMessage({
    fullName,
    email,
    phone: phone || 'N/A',
    subject: subject || 'No Subject',
    message,
    status: 'Pending'
  });

  await newMessage.save();

  res.status(201).json({ 
    success: true, 
    message: 'Your message has been sent successfully. We will get back to you soon!' 
  });
}));

export default router;
