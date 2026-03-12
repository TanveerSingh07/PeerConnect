import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateProfile, 
  uploadProfilePic, 
  getUserStats 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/users
router.get('/', protect, getUsers);

// @route   GET /api/users/stats
router.get('/stats', protect, getUserStats);

// @route   PUT /api/users/profile
router.put('/profile', protect, updateProfile);

// @route   POST /api/users/upload
router.post('/upload', protect, upload.single('image'), uploadProfilePic);

// @route   GET /api/users/:id
router.get('/:id', protect, getUserById);

export default router;