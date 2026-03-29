import express from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET notifications for user
router.get('/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
}));

// GET unread count
router.get('/:userId/unread-count', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  res.json({ count });
}));

// PUT mark as read
router.put('/:id/read', asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const authUser = req.user;

  const notification = await Notification.findById(id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  if (String(authUser.id) !== String(notification.recipient) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  notification.isRead = true;
  await notification.save();
  res.json({ message: 'Notification marked as read' });
}));

// PUT mark all as read
router.put('/mark-all-read/:userId', asyncHandler(async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const authUser = req.user;

  if (String(authUser.id) !== String(userId) && authUser.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
  }

  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
}));

export default router;
