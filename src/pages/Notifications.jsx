import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { notificationAPI } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationAPI.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Notifications error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationAPI.markAsRead(notification._id);
        
        // Update local state immediately
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );

        // Trigger navbar refresh
        window.dispatchEvent(new CustomEvent('notificationRead'));
        
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
    
    // Navigate to link
    navigate(notification.link);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Trigger navbar refresh
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'connection_accepted':
        return <UserCheck className="text-green-500" size={20} />;
      case 'comment':
        return <MessageCircle className="text-purple-500" size={20} />;
      case 'like':
        return <Heart className="text-red-500" size={20} />;
      case 'message':
        return <MessageSquare className="text-blue-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.isRead;
    if (activeFilter === 'connections') return notif.type.includes('connection');
    if (activeFilter === 'messages') return notif.type === 'message';
    if (activeFilter === 'likes') return notif.type === 'like';
    if (activeFilter === 'comments') return notif.type === 'comment';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {['all', 'unread', 'connections', 'messages', 'likes', 'comments'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
              activeFilter === filter
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter === 'all' && ` (${notifications.length})`}
            {filter === 'unread' && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            When someone interacts with you, you'll see it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleClick(notif)}
              className={`flex items-start gap-4 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                !notif.isRead
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-500'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>

              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {notif.from?.profilePic ? (
                  <img
                    src={notif.from.profilePic}
                    alt={notif.from.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {notif.from?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{notif.from?.name || 'Someone'}</span>{' '}
                  {notif.message}
                </p>
                
                {notif.postContent && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    "{notif.postContent}"
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">
                    {getTimeAgo(notif.createdAt)}
                  </p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}