import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BrowseStudents from "./pages/BrowseStudents";
import Connections from "./pages/Connections";
import MyProfile from "./pages/MyProfile";
import AboutUs from './pages/AboutUs';
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar"; // Create this component
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('/dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} transition-colors duration-500`}>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        activePage={activePage}
      />
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigate={navigate}
          activePage={activePage}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard setActivePage={setActivePage} />} />
            <Route path="/dashboard" element={<Dashboard setActivePage={setActivePage} />} />
            <Route path="/browse" element={<BrowseStudents />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/about" element={<AboutUs />} />
            {/* Optional: <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}
