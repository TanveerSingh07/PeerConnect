import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { students } from "../utils/mockData";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ setActivePage }) {
  const [profile, setProfile] = useState({});
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("peerProfile")) || {};
    setProfile(savedProfile);

    const collegeId = savedProfile.collegeId || "default";
    const sent =
      JSON.parse(localStorage.getItem(`sentRequests_${collegeId}`)) || [];
    setSentRequests(sent);

    const connected = students.filter((s) => sent.includes(s.id));
    setConnections(connected);
  }, []);

  const sharedSkills = connections.filter((s) =>
    profile.skills?.split(",").some((skill) =>
      s.skills.toLowerCase().includes(skill.trim().toLowerCase())
    )
  );

  const handleNavigate = (page) => {
    setActivePage(page);
    navigate(`/${page}`);
  };

  /* ---------------- MOCK DATA (Backend-ready) ---------------- */

  const communityPosts = [
    {
      id: 1,
      author: "Rahul Verma",
      content: "Looking for 2 frontend devs for a MERN mini-project.",
      likes: 5,
      comments: 2,
      tags: ["React", "MERN"],
    },
    {
      id: 2,
      author: "Ananya Singh",
      content: "Shared my AI project notes for beginners.",
      likes: 8,
      comments: 4,
      tags: ["AI", "ML"],
    },
  ];

  const opportunities = [
    {
      id: 1,
      title: "Hackathon Team Formation",
      type: "Hackathon",
      skills: ["React", "Node"],
      postedBy: "Dev Patel",
    },
    {
      id: 2,
      title: "Final Year Project – Web App",
      type: "Project",
      skills: ["MongoDB", "Express"],
      postedBy: "Simran Kaur",
    },
  ];

  const trendingSkills = ["React", "Node", "AI", "UI/UX"];

  const statsData = {
    labels: ["Connections", "Matches", "Requests"],
    datasets: [
      {
        data: [
          connections.length,
          sharedSkills.length,
          sentRequests.length,
        ],
        backgroundColor: ["#3B82F6", "#8B5CF6", "#F59E0B"],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  const engagementScore =
    connections.length * 2 + sharedSkills.length - sentRequests.length;

  return (
    <div className="p-6 space-y-10">
      {/* Greeting */}
      <h1 className="text-3xl font-bold mb-2">
        👋 Hi, {profile.name || "Student"}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
        Welcome to <strong>PeerConnect</strong> – your personalized networking
        hub to connect, collaborate, and grow within your institute.
      </p>

      {/* Quote */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded shadow text-center font-semibold">
        🚀 "The best way to predict the future is to create it." – Abraham Lincoln
      </div>

      {/* Overview + Chart (UNCHANGED STRUCTURE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📊 Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
              <p className="text-sm">Connections</p>
              <p className="text-2xl font-bold">{connections.length}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded">
              <p className="text-sm">Skill Matches</p>
              <p className="text-2xl font-bold">{sharedSkills.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
              <p className="text-sm">Requests</p>
              <p className="text-2xl font-bold">{sentRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex justify-center">
          <Doughnut data={statsData} />
        </div>
      </div>

      {/* Community Feed + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Community Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🏫 Campus Community Feed</h3>

          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <p className="font-semibold">{post.author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {post.content}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 text-sm mt-3 text-gray-500">
                  👍 {post.likes} Likes · 💬 {post.comments} Comments
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🚀 Opportunities</h3>

          <div className="space-y-4">
            {opportunities.map((op) => (
              <div
                key={op.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <p className="font-semibold">{op.title}</p>
                <p className="text-sm text-gray-500">
                  {op.type} · Posted by {op.postedBy}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {op.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                  Interested
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trending Skills */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">🔥 Trending Skills</h3>
          <div className="flex flex-wrap gap-2">
            {trendingSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Peers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">📌 Recent Activity</h3>
          <ul className="text-sm space-y-2">
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
    </div>
  );
}

