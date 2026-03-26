import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Home, Search, Users, User, LogOut, Info, Bell, MessageSquare } from 'lucide-react';
import { isAuthenticated, logout } from '../services/auth';
import { notificationAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';

export default function Navbar({ onToggleTheme, theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (isAuth) {
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000); // Every 30s
      return () => clearInterval(interval);
    }
  }, [isAuth]);

  // ✅ FIX: Listen for Socket.io new messages to update count instantly
  useEffect(() => {
    if (isAuth) {
      const handleNewMessage = () => {
        // Increment message count when new message arrives
        setMessageCount(prev => prev + 1);
      };

      socketService.onNewMessage(handleNewMessage);

      return () => {
        socketService.off('newMessage', handleNewMessage);
      };
    }
  }, [isAuth]);

  // ✅ FIX: Listen for custom events when messages/notifications are viewed
  useEffect(() => {
    if (isAuth) {
      const handleNotificationRead = () => {
        fetchCounts();
      };

      const handleMessageRead = () => {
        fetchCounts();
      };

      window.addEventListener('notificationRead', handleNotificationRead);
      window.addEventListener('messageRead', handleMessageRead);

      return () => {
        window.removeEventListener('notificationRead', handleNotificationRead);
        window.removeEventListener('messageRead', handleMessageRead);
      };
    }
  }, [isAuth]);

  // Refresh on page visibility change
  useEffect(() => {
    if (isAuth) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchCounts();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isAuth]);

  // ✅ FIX: Instant refresh when navigating to chat/notifications
  useEffect(() => {
    if (isAuth && (location.pathname === '/notifications' || location.pathname === '/chat')) {
      // Immediate update
      fetchCounts();
    }
  }, [isAuth, location.pathname]);

  const fetchCounts = async () => {
    try {
      const [notifRes, messageRes] = await Promise.all([
        notificationAPI.getCount(),
        messageAPI.getUnreadCount()
      ]);
      setNotifCount(notifRes.data.count || 0);
      setMessageCount(messageRes.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
      setNotifCount(0);
      setMessageCount(0);
    }
  };

  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/browse', label: 'Browse', icon: <Search size={18} /> },
    { to: '/connections', label: 'Connections', icon: <Users size={18} /> },
    { to: '/chat', label: 'Messages', icon: <MessageSquare size={18} />, badge: messageCount },
    { to: '/notifications', label: 'Notifications', icon: <Bell size={18} />, badge: notifCount },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
    { to: '/about', label: 'About', icon: <Info size={18} /> },
  ];

  const linkClass = (path) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-300 relative whitespace-nowrap ${
      location.pathname === path
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">
          PeerConnect
        </Link>

        {isAuth && (
          <>
            {/* Desktop Navigation - switches at 1150px */}
            <div className="hidden xl:flex items-center space-x-2">
              {tabs.map(({ to, label, icon, badge }) => (
                <Link key={to} to={to} className={linkClass(to)}>
                  <span className="flex-shrink-0">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition whitespace-nowrap"
              >
                <LogOut size={18} />
                <span className="font-semibold text-sm">Logout</span>
              </button>

              <button 
                onClick={onToggleTheme} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 ml-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center space-x-2">
              <button 
                onClick={onToggleTheme} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 relative"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                {(notifCount + messageCount) > 0 && !mobileMenuOpen && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {(notifCount + messageCount) > 9 ? '9+' : (notifCount + messageCount)}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isAuth && mobileMenuOpen && (
        <div className="xl:hidden px-4 pb-4 flex flex-col space-y-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          {tabs.map(({ to, label, icon, badge }) => (
            <Link 
              key={to} 
              to={to} 
              className={linkClass(to)} 
              onClick={() => setMobileMenuOpen(false)}
            >
              {icon}
              <span className="font-semibold flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          ))}
          
          <button 
            onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}