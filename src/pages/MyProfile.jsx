import { useEffect, useMemo, useState } from "react";
import { userAPI, authAPI } from "../services/api";
import { setCurrentUser } from "../services/auth";
import { toast } from "react-toastify";

const defaultProfile = {
  name: "",
  collegeId: "",
  email: "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await userAPI.updateProfile(profile);
      setProfile(data);
      setCurrentUser(data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // FIXED: Proper completion calculation capped at 100%
  const completion = useMemo(() => {
    const requiredFields = [
      "name",
      "collegeId",
      "email",
      "year",
      "department",
      "location",
      "bio",
      "profilePic",
      "skills",
      "interests",
      "experienceLevel",
      "lookingFor",
      "github",
      "linkedin",
    ];

    const filledFields = requiredFields.filter((field) => {
      const value = profile[field];
      return value && value.toString().trim() !== "";
    }).length;

    const percentage = Math.round((filledFields / requiredFields.length) * 100);

    // Cap at 100%
    return Math.min(percentage, 100);
  }, [profile]);

  const skillsCount = profile.skills ? profile.skills.split(",").length : 0;

  const handleDeleteAccount = async () => {
  if (deleteConfirmText !== 'DELETE') return;
  
  setDeleting(true);
  try {
    await userAPI.deleteAccount();
    toast.success('Account deleted successfully');
    localStorage.removeItem('token');
    localStorage.removeItem('peerProfile');
    window.location.href = '/login';
  } catch (error) {
    toast.error('Failed to delete account');
    setDeleting(false);
  }
};

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
      <span className="text-gray-500 text-sm">Not added yet</span>
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
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

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold">
            {profile.name || "Your Name"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {profile.bio || "Add a short bio to make your profile stand out"}
          </p>

          <div className="flex justify-center md:justify-start gap-10 mt-4 text-sm">
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

      {/* Completion Bar - FIXED */}
      <div className="mb-6">
        <p className="text-sm mb-2 text-gray-600 dark:text-gray-300">
          Profile Completion
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(completion, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {completion >= 100
            ? "🎉 Profile complete!"
            : `${14 - Math.round((completion / 100) * 14)} fields left to complete your profile`}
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
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
                name="email"
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={handleChange}
                disabled
                title="Email cannot be changed"
              />
              <input
                className="input"
                name="collegeId"
                placeholder="College ID"
                value={profile.collegeId}
                onChange={handleChange}
                disabled
                title="College ID cannot be changed"
              />
              <select
                className="input"
                name="year"
                value={profile.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="5th">5th Year</option>
              </select>
              <input
                className="input"
                name="department"
                placeholder="Department"
                value={profile.department}
                onChange={handleChange}
              />
              <input
                className="input"
                name="location"
                placeholder="Location"
                value={profile.location}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* About You */}
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

          {/* Skills & Preferences */}
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

          {/* Social Links */}
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

          {/* Profile Image */}
          <div className="card">
            <h3 className="section-title text-lg font-semibold">
              Profile Image
            </h3>
            <input
              className="input mt-5 w-full"
              name="profilePic"
              placeholder="Profile Image URL"
              value={profile.profilePic}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter image URL (e.g., from Imgur, Cloudinary)
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* PREVIEW */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-5 h-fit sticky top-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Profile Preview
          </h3>

          <div>
            <p className="font-medium">{profile.department || "Department"}</p>
            <p className="text-sm text-gray-500">
              {profile.year || "Year"} • {profile.location || "Location"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2 text-gray-500 uppercase">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {renderTags(profile.skills)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2 text-gray-500 uppercase">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {renderTags(profile.interests)}
            </div>
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
      {/* Delete Account Section - ADD THIS BEFORE THE CLOSING DIV */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Once you delete your account, there is no going back. This will
          permanently delete your profile, posts, connections, and all
          associated data.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Dialog - ADD THIS */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              ⚠️ Delete Account?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This action <strong>cannot be undone</strong>. This will
              permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>Your profile and all personal information</li>
              <li>All your posts and comments</li>
              <li>All your connections</li>
              <li>All your messages and conversations</li>
              <li>All your notifications</li>
            </ul>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Type <span className="text-red-600">"DELETE"</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
