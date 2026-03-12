import { useState, useEffect } from 'react';
import { userAPI, connectionAPI } from '../services/api';
import { getCurrentUser } from '../services/auth';
import { toast } from 'react-toastify';

export default function BrowseStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, [search]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, sentRes, connectionsRes] = await Promise.all([
        userAPI.getAll({ search }),
        connectionAPI.getSent(),
        connectionAPI.getAll()
      ]);

      const filteredStudents = usersRes.data.filter(
        student => student._id !== currentUser?._id
      );

      setStudents(filteredStudents);
      setSentRequests(sentRes.data.map(req => req.to?._id || req.to));
      setConnections(connectionsRes.data.map(conn => conn._id));

      console.log('📊 Browse Data:', {
        students: filteredStudents.length,
        sent: sentRes.data.length,
        connections: connectionsRes.data.length
      });
    } catch (error) {
      console.error('Browse error:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (recipientId) => {
    try {
      await connectionAPI.send(recipientId);
      setSentRequests([...sentRequests, recipientId]);
      toast.success('Connection request sent!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send request';
      
      // ✅ FIX: If connection already exists, refresh to get actual state
      if (errorMsg.includes('already exists')) {
        toast.error('Refreshing connection status...');
        fetchData(); // Refresh to get current state
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleWithdraw = async (recipientId) => {
    try {
      await connectionAPI.withdraw(recipientId);
      setSentRequests(sentRequests.filter(id => id !== recipientId));
      toast.info('Request withdrawn');
    } catch (error) {
      toast.error('Failed to withdraw request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
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
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-shadow"
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
                      {student.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{student.name}</p>
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
                    {student.bio.slice(0, 100)}{student.bio.length > 100 ? '...' : ''}
                  </p>
                )}

                {student.skills && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.split(',').slice(0, 3).map((skill, idx) => (
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
                  <button
                    disabled
                    className="mt-3 w-full px-3 py-2 rounded text-white bg-green-500 cursor-not-allowed"
                  >
                    ✓ Connected
                  </button>
                ) : isPending ? (
                  <button
                    onClick={() => handleWithdraw(student._id)}
                    className="mt-3 w-full px-3 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600 transition"
                  >
                    ⏳ Withdraw Request
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(student._id)}
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
    </div>
  );
}