import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import BrowseStudents from './pages/BrowseStudents';
import Connections from './pages/Connections';
import MyProfile from './pages/MyProfile';
import AboutUs from './pages/AboutUs';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navbar onToggleTheme={toggleTheme} theme={theme} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowseStudents /></ProtectedRoute>} />
          <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} autoClose={3000} />
    </div>
  );
}