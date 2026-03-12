import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import Connection from '../models/Connection.js';

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    // Fetch notifications from database
    const notifications = await Notification.find({ user: req.user._id })
      .populate('from', 'name profilePic department year')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNotification = async (userId, type, fromUserId, data) => {
  try {
    const notificationData = {
      user: userId,
      type,
      from: fromUserId,
      relatedId: data.relatedId || null,
      message: data.message,
      link: data.link,
      postContent: data.postContent || ''
    };

    await Notification.create(notificationData);
  } catch (error) {
    console.error('Create notification error:', error);
  }
};