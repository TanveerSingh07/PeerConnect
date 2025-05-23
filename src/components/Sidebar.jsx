import React from 'react';
import { Home, Search, Users, User, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const tabs = [
  { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/browse", label: "Browse", icon: <Search size={20} /> },
  { to: "/connections", label: "Connections", icon: <Users size={20} /> },
  { to: "/profile", label: "Profile", icon: <User size={20} /> },
  { to: "/about", label: "About Us", icon: <Info size={20} /> },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, navigate, activePage }) {
  return (
    <aside className={`transition-all duration-300 bg-white dark:bg-gray-800 shadow-md ${sidebarOpen ? 'w-56' : 'w-14'} overflow-hidden`}>
      <div className="flex justify-end p-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <nav className="flex flex-col space-y-2 px-2">
        {tabs.map(({ to, label, icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md transition ${
              activePage === to
                ? "bg-blue-600 text-white"
                : "text-gray-800 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
            }`}
          >
            {icon}
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
