import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

export default router;