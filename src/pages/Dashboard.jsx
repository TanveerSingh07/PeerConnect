import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { userAPI, connectionAPI, postAPI } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { toast } from "react-toastify";
import { Heart, MessageCircle, Send, Trash2, Search, X } from "lucide-react";
import SkillRecommendations from "../components/SkillRecommendations";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({
    connections: 0,
    pendingRequests: 0,
    sentRequests: 0,
  });
  const [connections, setConnections] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postTags, setPostTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [deleteDialogPost, setDeleteDialogPost] = useState(null);
  const [deleteDialogComment, setDeleteDialogComment] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Filter posts based on search query
    if (searchQuery.trim() === "") {
      setFilteredPosts(communityPosts);
    } else {
      const filtered = communityPosts.filter(
        (post) =>
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, communityPosts]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      setProfile(user || {});

      const [statsRes, connectionsRes, postsRes] = await Promise.all([
        userAPI.getStats(),
        connectionAPI.getAll(),
        postAPI.getAll({ limit: 20 }),
      ]);

      setStats(statsRes.data);
      setConnections(connectionsRes.data);
      setCommunityPosts(postsRes.data.posts || []);
      setFilteredPosts(postsRes.data.posts || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sharedSkills = connections.filter((c) => {
    if (!profile.skills || !c.skills) return false;
    
    const userSkills = profile.skills.split(',').map(s => s.trim().toLowerCase());
    const connectionSkills = c.skills.split(',').map(s => s.trim().toLowerCase());
    return userSkills.some(userSkill => 
      connectionSkills.some(connSkill => 
        connSkill.includes(userSkill) || userSkill.includes(connSkill)
      )
    );
  });

  const statsData = {
    labels: ["Connections", "Matches", "Requests"],
    datasets: [
      {
        data: [stats.connections, sharedSkills.length, stats.pendingRequests],
        backgroundColor: ["#3B82F6", "#8B5CF6", "#F59E0B"],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const tags = postTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await postAPI.create({
        content: newPost,
        tags,
        type: "post",
      });

      setCommunityPosts([data, ...communityPosts]);
      setNewPost("");
      setPostTags("");
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await postAPI.toggleLike(postId);
      setCommunityPosts((posts) =>
        posts.map((p) => (p._id === postId ? data.post : p)),
      );
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postAPI.delete(postId);
      setCommunityPosts((posts) => posts.filter((p) => p._id !== postId));
      setDeleteDialogPost(null);
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await postAPI.deleteComment(postId, commentId);
      setCommunityPosts((posts) =>
        posts.map((p) => {
          if (p._id === postId) {
            return {
              ...p,
              comments: p.comments.filter((c) => c._id !== commentId),
            };
          }
          return p;
        }),
      );
      setDeleteDialogComment(null);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const { data } = await postAPI.addComment(postId, commentText);
      setCommunityPosts((posts) =>
        posts.map((p) => (p._id === postId ? data : p)),
      );
      setCommentText("");
      setActivePostId(null);
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          👋 Hi, {profile.name || "Student"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
          Welcome to <strong>PeerConnect</strong> – your personalized networking
          hub to connect, collaborate, and grow within your institute.
        </p>
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded shadow text-center font-semibold">
        🚀 "The best way to predict the future is to create it." – Abraham
        Lincoln
      </div>

      {/* Overview + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📊 Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
              <p className="text-sm">Connections</p>
              <p className="text-2xl font-bold">{stats.connections}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded">
              <p className="text-sm">Skill Matches</p>
              <p className="text-2xl font-bold">{sharedSkills.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
              <p className="text-sm">Pending Requests</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex justify-center items-center">
          <Doughnut data={statsData} />
        </div>
      </div>

      {/* Skill Recommendations */}
      <SkillRecommendations />

      {/* Community Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">🏫 Campus Community Feed</h3>

            {/* Search Bar */}
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-10 pr-8 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Create Post Form */}
          <form
            onSubmit={handleCreatePost}
            className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <textarea
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="What's on your mind? Share with your peers..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 input text-sm"
                placeholder="Tags (comma separated, e.g. React, AI)"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
              />
              <button
                type="submit"
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </form>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchQuery
                  ? "No posts found matching your search."
                  : "No posts yet. Be the first to share something!"}
              </p>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                      onClick={() => handleUserClick(post.author?._id)}
                    >
                      {post.author?.profilePic ? (
                        <img
                          src={post.author.profilePic}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {post.author?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold hover:text-blue-600">
                          {post.author?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.author?.department} • {post.author?.year}
                        </p>
                      </div>
                    </div>
                    {post.author?._id === profile._id && (
                      <button
                        onClick={() => setDeleteDialogPost(post._id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {post.content}
                  </p>

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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

                  <div className="flex gap-4 text-sm text-gray-500 mb-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1 hover:text-blue-600 transition ${
                        post.likes?.includes(profile._id) ? "text-blue-600" : ""
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={
                          post.likes?.includes(profile._id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      {post.likes?.length || 0} Likes
                    </button>
                    <button
                      onClick={() =>
                        setActivePostId(
                          activePostId === post._id ? null : post._id,
                        )
                      }
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <MessageCircle size={16} />
                      {post.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activePostId === post._id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {/* Comment Input */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          disabled={!commentText.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      {post.comments?.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="flex gap-2 text-sm"
                            >
                              {comment.user?.profilePic ? (
                                <img
                                  src={comment.user.profilePic}
                                  alt=""
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                  {comment.user?.name?.[0]?.toUpperCase() ||
                                    "?"}
                                </div>
                              )}
                              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-xs">
                                      {comment.user?.name}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {comment.text}
                                    </p>
                                  </div>
                                  {(comment.user?._id === profile._id ||
                                    post.author?._id === profile._id) && (
                                    <button
                                      onClick={() =>
                                        setDeleteDialogComment({
                                          postId: post._id,
                                          commentId: comment._id,
                                        })
                                      }
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Connections Sidebar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-3">📌 Recent Connections</h3>
          <ul className="text-sm space-y-2">
            {connections.length === 0 ? (
              <li className="text-gray-500">No connections yet</li>
            ) : (
              connections.slice(0, 5).map((student) => (
                <li 
                  key={student._id} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                  onClick={() => handleUserClick(student._id)}
                >
                  {student.profilePic ? (
                    <img
                      src={student.profilePic}
                      alt={student.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {student.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="hover:text-blue-600">{student.name}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Your Skills */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">🔥 Your Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills ? (
            profile.skills.split(",").map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-sm"
              >
                {skill.trim()}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Add skills in your profile</p>
          )}
        </div>
      </div>

      {/* Delete Post Dialog */}
      {deleteDialogPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Post?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialogPost(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteDialogPost)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Dialog */}
      {deleteDialogComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Comment?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this comment?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialogComment(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteComment(
                    deleteDialogComment.postId,
                    deleteDialogComment.commentId,
                  );
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}