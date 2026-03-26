import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, connectionAPI, postAPI } from "../services/api";
import { getCurrentUser } from "../services/auth";
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserCheck,
  Github,
  Linkedin,
  MapPin,
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const [userRes, postsRes, statusRes] = await Promise.all([
        userAPI.getById(userId),
        postAPI.getUserPosts(userId),
        connectionAPI.getStatus(userId),
      ]);

      setUser(userRes.data);
      setPosts(postsRes.data);
      setConnectionStatus(statusRes.data);
    } catch (error) {
      console.error("Fetch user error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectionAPI.send(userId);
      setConnectionStatus({ status: "pending", isRequester: true });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleMessage = () => {
    navigate(`/chat?userId=${userId}`);
  };

  const handleRemove = () => {
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    setShowRemoveModal(false);
    setRemoving(true);

    try {
      await connectionAPI.remove(userId);
      setConnectionStatus({ status: null });
      toast.success("Connection removed");
    } catch (error) {
      toast.error("Failed to remove connection");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser._id === userId;
  const isConnected = connectionStatus?.status === "accepted";
  const isPending = connectionStatus?.status === "pending";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-4xl mx-auto md:mx-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {user.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} />
                      {user.department}
                    </span>
                  )}

                  {user.year && <span>• {user.year}</span>}

                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {user.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2 mt-4 md:mt-0">
                  {isConnected ? (
                    <>
                      <button
                        onClick={handleMessage}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        <MessageCircle size={18} />
                        Message
                      </button>
                      <button
                        onClick={handleRemove}
                        disabled={removing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                      >
                        {removing ? "Removing..." : "Remove"}
                      </button>
                    </>
                  ) : isPending ? (
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold cursor-not-allowed"
                    >
                      <UserCheck size={18} />
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                      <UserPlus size={18} />
                      Connect
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {user.bio}
              </p>
            )}

            {/* Social Links */}
            {(user.github || user.linkedin) && (
              <div className="flex gap-3">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    <Github size={20} />
                    GitHub
                  </a>
                )}

                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    <Linkedin size={20} />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {user.skills && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.split(",").map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.interests && (
            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.split(",").map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-sm"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.experienceLevel && (
            <div>
              <h3 className="font-semibold mb-2">Experience Level</h3>
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-sm">
                {user.experienceLevel}
              </span>
            </div>
          )}

          {user.lookingFor && (
            <div>
              <h3 className="font-semibold mb-2">Looking For</h3>
              <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-sm">
                {user.lookingFor}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Posts ({posts.length})</h2>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {post.content}
                </p>

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Remove Connection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove this connection?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
