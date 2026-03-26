import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  uploadProfilePic,
  getUserStats,
  getRecommendations,
  deleteAccount  
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/stats', protect, getUserStats);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.post('/upload', protect, upload.single('profilePic'), uploadProfilePic);
router.delete('/account', protect, deleteAccount);  

export default router;