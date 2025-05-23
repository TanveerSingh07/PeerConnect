import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BrowseStudents from './pages/BrowseStudents';
import MyConnections from './pages/Connections';
import MyProfile from './pages/MyProfile';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [theme, setTheme] = useState('light');

  // Set theme from localStorage or default to light
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  // Toggle theme and store it
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Navbar onToggleTheme={toggleTheme} theme={theme} />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<BrowseStudents />} />
            <Route path="/connections" element={<MyConnections />} />
            <Route path="/profile" element={<MyProfile />} />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} />
      </div>
    </Router>
  );
}
