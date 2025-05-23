import React from 'react';

export default function AboutUs() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">About PeerConnect</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        PeerConnect is a platform designed to help students and professionals discover like-minded individuals based on their technical interests and skill sets.
        Our goal is to foster collaboration, inspire innovation, and help build meaningful project partnerships and mentorships.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition">
          <h2 className="text-xl font-semibold mb-2 text-blue-500">🔗 Seamless Connections</h2>
          <p>Connect with peers who match your skills and collaborate on exciting projects together.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition">
          <h2 className="text-xl font-semibold mb-2 text-green-500">🧠 Skill Discovery</h2>
          <p>Browse through a network of students and learn new skills through interactions and shared projects.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition">
          <h2 className="text-xl font-semibold mb-2 text-purple-500">🌍 Global Community</h2>
          <p>Whether you're in college or already working, PeerConnect helps you build a global peer network.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition">
          <h2 className="text-xl font-semibold mb-2 text-yellow-500">🚀 Future Ready</h2>
          <p>We're continuously improving the platform to empower the next generation of innovators.</p>
        </div>
      </div>
    </div>
  );
}
