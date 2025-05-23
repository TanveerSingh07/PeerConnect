import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Home, Search, Users, User } from 'lucide-react';
import { Info } from 'lucide-react';

export default function Navbar({ onToggleTheme, theme }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/browse', label: 'Browse', icon: <Search size={18} /> },
    { to: '/connections', label: 'Connections', icon: <Users size={18} /> },
    { to: '/profile', label: 'Profile', icon: <User size={18} /> },
    { to: '/about', label: 'About Us', icon: <Info size={18} /> },
  ];

  const linkClass = (path) =>
    `flex items-center space-x-1 px-4 py-2 rounded-md transition-colors duration-300
    ${
      location.pathname === path
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white'
    }`;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 select-none"
        >
          PeerConnect
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-4">
          {tabs.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={linkClass(to)} onClick={() => setMobileMenuOpen(false)}>
              {icon}
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
          <button
            onClick={onToggleTheme}
            className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-700">
          {tabs.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={linkClass(to)}
              onClick={() => setMobileMenuOpen(false)}
            >
              {icon}
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
