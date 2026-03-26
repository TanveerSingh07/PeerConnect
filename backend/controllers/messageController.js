import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';

// @desc    Get or create conversation
// @route   POST /api/messages/conversation
// @access  Private
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    const participants = [
      req.user._id.toString(),
      userId.toString()
    ].sort();

    // ✅ ALWAYS CHECK FIRST
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 }
    })
      .populate('participants', 'name profilePic department year')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      });

    if (conversation) {
      return res.json(conversation); // ✅ RETURN EARLY
    }

    // ✅ CREATE ONLY IF NOT EXISTS
    conversation = await Conversation.create({
      participants
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name profilePic department year')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      });

    res.json(conversation);

  } catch (error) {
    console.error('❌ Conversation error:', error);

    // ✅ HANDLE DUPLICATE ERROR SAFELY
    if (error.code === 11000) {
      const { userId } = req.body;

      const participants = [
        req.user._id.toString(),
        userId.toString()
      ].sort();

      const existing = await Conversation.findOne({
        participants: { $all: participants, $size: 2 }
      });

      if (existing) {
        return res.json(existing);
      }
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's conversations with unread counts
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profilePic department year')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ lastMessageAt: -1 })
      .lean();

    // ✅ ADD: Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          isRead: false
        });

        return {
          ...conv,
          unreadCount
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message
// @route   POST /api/messages/:conversationId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text
    });

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate and return
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePic');

    // Get recipient
    const recipient = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create notification for recipient
    if (recipient) {
      await createNotification(recipient, 'message', req.user._id, {
        relatedId: conversationId,
        message: 'sent you a message',
        link: '/chat',
        postContent: text.slice(0, 50) + (text.length > 50 ? '...' : '')
      });
    }

    res.status(201).json({ message: populatedMessage, recipientId: recipient });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    });

    const conversationIds = conversations.map(c => c._id);

    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};