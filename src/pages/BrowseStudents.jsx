import { useState, useEffect } from "react";
import { userAPI, connectionAPI } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function BrowseStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const currentUser = getCurrentUser();
  const [removing, setRemoving] = useState({});
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [search]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, sentRes, connectionsRes] = await Promise.all([
        userAPI.getAll({ search }),
        connectionAPI.getSent(),
        connectionAPI.getAll(),
      ]);

      const filteredStudents = usersRes.data.filter(
        (student) => student._id !== currentUser?._id,
      );

      setStudents(filteredStudents);
      setSentRequests(sentRes.data.map((req) => req.to?._id || req.to));
      setConnections(connectionsRes.data.map((conn) => conn._id));

      console.log("📊 Browse Data:", {
        students: filteredStudents.length,
        sent: sentRes.data.length,
        connections: connectionsRes.data.length,
      });
    } catch (error) {
      console.error("Browse error:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (recipientId, e) => {
    e.stopPropagation(); // Prevent card click
    try {
      await connectionAPI.send(recipientId);
      setSentRequests([...sentRequests, recipientId]);
      toast.success("Connection request sent!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to send request";

      if (errorMsg.includes("already exists")) {
        toast.error("Refreshing connection status...");
        fetchData();
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleWithdraw = async (recipientId, e) => {
    e.stopPropagation(); // Prevent card click
    try {
      await connectionAPI.withdraw(recipientId);
      setSentRequests(sentRequests.filter((id) => id !== recipientId));
      toast.info("Request withdrawn");
    } catch (error) {
      toast.error("Failed to withdraw request");
    }
  };

  const handleRemove = async (userId, e) => {
    e.stopPropagation();
    setSelectedUserId(userId);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    const userId = selectedUserId;
    setShowRemoveModal(false);

    setRemoving((prev) => ({ ...prev, [userId]: true }));
    try {
      await connectionAPI.remove(userId);
      setConnections(connections.filter((id) => id !== userId));
      toast.success("Connection removed");
    } catch (error) {
      toast.error("Failed to remove connection");
    } finally {
      setRemoving((prev) => ({ ...prev, [userId]: false }));
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Browse Students</h1>

      <input
        type="text"
        placeholder="Search by name, skill, or department"
        className="w-full md:w-1/2 mb-6 p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search students"
      />

      {students.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No students found. Try adjusting your search.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const isConnected = connections.includes(student._id);
            const isPending = sentRequests.includes(student._id);

            return (
              <article
                key={student._id}
                onClick={() => navigate(`/profile/${student._id}`)}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  {student.profilePic ? (
                    <img
                      src={student.profilePic}
                      alt={student.name}
                      className="w-16 h-16 object-cover rounded-full border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {student.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg hover:text-blue-600">
                      {student.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.year} • {student.department}
                    </p>
                    {student.lookingFor && (
                      <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900">
                        {student.lookingFor}
                      </span>
                    )}
                  </div>
                </div>

                {student.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {student.bio.slice(0, 100)}
                    {student.bio.length > 100 ? "..." : ""}
                  </p>
                )}

                {student.skills && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills
                        .split(",")
                        .slice(0, 3)
                        .map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {isConnected ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      disabled
                      className="flex-1 px-3 py-2 rounded text-white bg-green-500 cursor-not-allowed"
                    >
                      ✓ Connected
                    </button>
                    <button
                      onClick={(e) => handleRemove(student._id, e)}
                      disabled={removing[student._id]}
                      className="px-3 py-2 rounded text-white bg-red-500 hover:bg-red-600 transition"
                    >
                      {removing[student._id] ? "..." : "Remove"}
                    </button>
                  </div>
                ) : isPending ? (
                  <button
                    onClick={(e) => handleWithdraw(student._id, e)}
                    className="mt-3 w-full px-3 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600 transition"
                  >
                    ⏳ Withdraw Request
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleConnect(student._id, e)}
                    className="mt-3 w-full px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Connect
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
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
