import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { students } from '../utils/mockData';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ setActivePage }) {
  const [profile, setProfile] = useState({});
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('peerProfile')) || {};
    setProfile(savedProfile);

    const collegeId = savedProfile.collegeId || 'default';
    const sent = JSON.parse(localStorage.getItem(`sentRequests_${collegeId}`)) || [];
    setSentRequests(sent);

    const connected = students.filter((s) => sent.includes(s.id));
    setConnections(connected);
  }, []);

  const sharedSkills = connections.filter((s) =>
    profile.skills?.split(',').some((skill) =>
      s.skills.toLowerCase().includes(skill.trim().toLowerCase())
    )
  );

  const handleNavigate = (page) => {
    setActivePage(page);
    navigate(`/${page}`);
  };

  const statsData = {
    labels: ['Connections', 'Matches', 'Requests'],
    datasets: [
      {
        data: [connections.length, sharedSkills.length, sentRequests.length],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B'],
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const engagementScore = (connections.length * 2 + sharedSkills.length) - sentRequests.length;

  return (
    <div className="p-6">
      {/* Greeting */}
      <h1 className="text-3xl font-bold mb-2">👋 Hi, {profile.name || 'Student'}!</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
        Welcome to <strong>PeerConnect</strong> – your personalized networking hub to connect with peers, discover shared skills, and grow collaboratively within your college network.
      </p>

      {/* Quote */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded shadow mb-8 text-center text-lg font-semibold">
        🚀 "The best way to predict the future is to create it." – Abraham Lincoln
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Overview Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📊 Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Total Connections</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{connections.length}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Skill Matches</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{sharedSkills.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{sentRequests.length}</p>
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center justify-center">
          <Doughnut data={statsData} options={{ maintainAspectRatio: false }} width={200} height={200} />
        </div>
      </div>

      {/* Engagement Score */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8 text-center">
        <h3 className="text-lg font-semibold mb-1">⚡ Your Engagement Score</h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-300">{engagementScore >= 0 ? engagementScore : 0}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Based on your current PeerConnect activity</p>
      </div>

      {/* Achievement Badges */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-2">🏅 Achievement Badges</h3>
        <div className="flex gap-4 flex-wrap">
          {connections.length >= 1 && (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              🔗 First Connection
            </span>
          )}
          {sharedSkills.length >= 1 && (
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
              🎯 Skill Matcher
            </span>
          )}
          {connections.length >= 3 && (
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm">
              🌟 Networker
            </span>
          )}
          {connections.length === 0 && sharedSkills.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No achievements yet. Start connecting!</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-3">⚡ Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => handleNavigate("connections")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
            Connect Now
          </button>
          <button onClick={() => handleNavigate("profile")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow">
            Update Profile
          </button>
          <button onClick={() => handleNavigate("browse")} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow">
            Explore Students
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">📌 Recent Activity</h3>
        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
          {connections.length > 0 ? (
            connections.slice(0, 5).map((student) => (
              <li key={student.id}>Connected with {student.name}</li>
            ))
          ) : (
            <li>No recent connections</li>
          )}
        </ul>
      </div>
    </div>
  );
}
