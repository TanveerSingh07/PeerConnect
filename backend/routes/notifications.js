import express from 'express';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
router.get('/', protect, getNotifications);

// @route   GET /api/notifications/count
router.get('/count', protect, getUnreadCount);

// @route   PUT /api/notifications/read-all
router.put('/read-all', protect, markAllAsRead);

// @route   PUT /api/notifications/:id/read
router.put('/:id/read', protect, markAsRead);

export default router;