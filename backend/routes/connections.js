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

// @route   GET /api/connections
router.get('/', protect, getMyConnections);

// @route   GET /api/connections/pending
router.get('/pending', protect, getPendingRequests);

// @route   GET /api/connections/sent
router.get('/sent', protect, getSentRequests);

// @route   GET /api/connections/status/:userId
router.get('/status/:userId', protect, getConnectionStatus);

// @route   POST /api/connections/send/:recipientId
router.post('/send/:recipientId', protect, sendConnectionRequest);

// @route   PUT /api/connections/accept/:connectionId
router.put('/accept/:connectionId', protect, acceptConnectionRequest);

// @route   PUT /api/connections/reject/:connectionId
router.put('/reject/:connectionId', protect, rejectConnectionRequest);

// @route   DELETE /api/connections/withdraw/:recipientId
router.delete('/withdraw/:recipientId', protect, withdrawConnectionRequest);

router.delete('/remove/:userId', protect, removeConnection); 

export default router;