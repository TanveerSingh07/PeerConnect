import express from 'express';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  withdrawConnectionRequest,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
  getConnectionStatus,
  removeConnection
} from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyConnections);
router.get('/pending', protect, getPendingRequests);
router.get('/sent', protect, getSentRequests);
router.get('/status/:userId', protect, getConnectionStatus);
router.post('/send/:recipientId', protect, sendConnectionRequest);
router.put('/accept/:connectionId', protect, acceptConnectionRequest);
router.put('/reject/:connectionId', protect, rejectConnectionRequest);
router.delete('/withdraw/:recipientId', protect, withdrawConnectionRequest);
router.delete('/remove/:userId', protect, removeConnection); 

export default router;