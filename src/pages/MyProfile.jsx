import { useEffect, useMemo, useState } from "react";
import { students } from "../utils/mockData";
import Toast from "../components/Toast";

const defaultProfile = {
  name: "",
  collegeId: "",
  year: "",
  department: "",
  location: "",
  bio: "",
  profilePic: "",
  skills: "",
  interests: "",
  experienceLevel: "",
  lookingFor: "",
  github: "",
  linkedin: "",
};

export default function MyProfile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Load profile safely on mount
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("peerProfile", JSON.stringify(profile));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Mock counts (later from backend)
  const connectionsCount = connections.length;
  const skillsCount = profile.skills ? profile.skills.split(",").length : 0;

  const completion = useMemo(() => {
    const filled = Object.values(profile).filter(Boolean).length;
    return Math.round((filled / Object.keys(profile).length) * 100);
  }, [profile]);

  const renderTags = (text) =>
    text ? (
      text.split(",").map((t, i) => (
        <span
          key={i}
          className="px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
        >
          {t.trim()}
        </span>
      ))
    ) : (
      <span className="text-gray-500 text-sm">No skills added</span>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
        {/* Avatar */}
        <div className="relative">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold">
              {profile.name ? profile.name[0].toUpperCase() : "?"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold">
            {profile.name || "Your Name"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {profile.bio || "Add a short bio to make your profile stand out"}
          </p>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-10 mt-4 text-sm">
            <div>
              <p className="text-lg font-bold">{connectionsCount}</p>
              <p className="text-gray-500">Connections</p>
            </div>
            <div>
              <p className="text-lg font-bold">{skillsCount}</p>
              <p className="text-gray-500">Skills</p>
            </div>
            <div>
              <p className="text-lg font-bold">{completion}%</p>
              <p className="text-gray-500">Profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Bar */}
      <div className="mb-6">
        <p className="text-sm mb-2 text-gray-600 dark:text-gray-300">
          Profile Completion
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Section */}
          <div className="card">
            <h3 className="section-title text-lg font-semibold">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <input
                className="input"
                name="name"
                placeholder="Full Name"
                value={profile.name}
                onChange={handleChange}
              />
              <input
                className="input"
                name="collegeId"
                placeholder="College ID"
                value={profile.collegeId}
                onChange={handleChange}
              />
              <input
                className="input"
                name="year"
                placeholder="Year"
                value={profile.year}
                onChange={handleChange}
              />
              <input
                className="input"
                name="department"
                placeholder="Department"
                value={profile.department}
                onChange={handleChange}
              />
              <input
                className="input md:col-span-2"
                name="location"
                placeholder="Location"
                value={profile.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title text-lg font-semibold">About You</h3>
            <textarea
              className="input w-full h-20 resize-none mt-5"
              name="bio"
              placeholder="Who you are, what you like building, your goals"
              value={profile.bio}
              onChange={handleChange}
            />
          </div>

          <div className="card">
            <h3 className="section-title text-lg font-semibold">
              Skills & Preferences
            </h3>
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <input
                className="input"
                name="skills"
                placeholder="Skills (comma separated)"
                value={profile.skills}
                onChange={handleChange}
              />
              <input
                className="input"
                name="interests"
                placeholder="Interests (comma separated)"
                value={profile.interests}
                onChange={handleChange}
              />

              <select
                className="input"
                name="experienceLevel"
                value={profile.experienceLevel}
                onChange={handleChange}
              >
                <option value="">Experience Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <select
                className="input"
                name="lookingFor"
                value={profile.lookingFor}
                onChange={handleChange}
              >
                <option value="">Looking For</option>
                <option>Projects</option>
                <option>Mentorship</option>
                <option>Hackathons</option>
                <option>Learning</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title text-lg font-semibold">
              Social Links
            </h3>
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <input
                className="input"
                name="github"
                placeholder="GitHub URL"
                value={profile.github}
                onChange={handleChange}
              />
              <input
                className="input"
                name="linkedin"
                placeholder="LinkedIn URL"
                value={profile.linkedin}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title text-lg font-semibold">
              Profile Image
            </h3>
            <input
              className="input mt-5 w-full"
              name="profilePic"
              placeholder="Profile Image URL (temporary)"
              value={profile.profilePic}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Save Profile
          </button>
        </form>

        {/* PREVIEW */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Profile Preview
          </h3>

          <div>
            <p className="font-medium">{profile.department || "Department"}</p>
            <p className="text-sm text-gray-500">
              {profile.year || "Year"} • {profile.location || "Location"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderTags(profile.skills)}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              <strong>Experience:</strong> {profile.experienceLevel || "N/A"}
            </p>
            <p>
              <strong>Looking For:</strong> {profile.lookingFor || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {showToast && <Toast message="Profile saved successfully!" />}
    </div>
  );
}
