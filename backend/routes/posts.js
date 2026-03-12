import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getUserPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/posts
router.get('/', protect, getPosts);

// @route   POST /api/posts
router.post('/', protect, createPost);

// @route   GET /api/posts/:id
router.get('/:id', protect, getPostById);

// @route   PUT /api/posts/:id
router.put('/:id', protect, updatePost);

// @route   DELETE /api/posts/:id
router.delete('/:id', protect, deletePost);

// @route   PUT /api/posts/:id/like
router.put('/:id/like', protect, likePost);

// @route   POST /api/posts/:id/comment
router.post('/:id/comment', protect, addComment);

// @route   DELETE /api/posts/:id/comment/:commentId
router.delete('/:id/comment/:commentId', protect, deleteComment);

// @route   GET /api/posts/user/:userId
router.get('/user/:userId', protect, getUserPosts);

export default router;