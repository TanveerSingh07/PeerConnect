import { useEffect, useState } from 'react';
import { connectionAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function Connections() {
  const [activeTab, setActiveTab] = useState('connected');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [connectionsRes, pendingRes, sentRes] = await Promise.all([
        connectionAPI.getAll(),
        connectionAPI.getPending(),
        connectionAPI.getSent()
      ]);

      setConnections(connectionsRes.data);
      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error('Connections error:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await connectionAPI.accept(connectionId);
      const accepted = pendingRequests.find(req => req._id === connectionId);
      if (accepted) {
        setConnections([...connections, accepted.from]);
        setPendingRequests(pendingRequests.filter(req => req._id !== connectionId));
      }
      toast.success('Connection accepted!');
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionAPI.reject(connectionId);
      setPendingRequests(pendingRequests.filter(req => req._id !== connectionId));
      toast.info('Connection rejected');
    } catch (error) {
      toast.error('Failed to reject connection');
    }
  };

  const handleWithdraw = async (recipientId) => {
    try {
      await connectionAPI.withdraw(recipientId);
      setSentRequests(sentRequests.filter(req => req.to._id !== recipientId));
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
          <p className="text-gray-600 dark:text-gray-400">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Network</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('connected')}
          className={`pb-2 px-4 font-semibold transition whitespace-nowrap ${
            activeTab === 'connected'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Connected ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-4 font-semibold transition whitespace-nowrap ${
            activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 px-4 font-semibold transition whitespace-nowrap ${
            activeTab === 'sent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {/* Connected Tab */}
      {activeTab === 'connected' && (
        <div>
          {connections.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              No connections yet. Start browsing students to connect!
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((student) => (
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
                    <div>
                      <p className="font-semibold text-lg">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.year} • {student.department}
                      </p>
                    </div>
                  </div>

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

                  {student.interests && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Interests:</strong> {student.interests}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              No pending requests 🎉
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  {request.from?.profilePic ? (
                    <img
                      src={request.from.profilePic}
                      alt={request.from.name}
                      className="w-16 h-16 object-cover rounded-full border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {request.from?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{request.from?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.from?.year} • {request.from?.department}
                    </p>
                    {request.from?.bio && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {request.from.bio.slice(0, 100)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div>
          {sentRequests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              No sent requests. Browse students to connect!
            </p>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  {request.to?.profilePic ? (
                    <img
                      src={request.to.profilePic}
                      alt={request.to.name}
                      className="w-16 h-16 object-cover rounded-full border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {request.to?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{request.to?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.to?.year} • {request.to?.department}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      ⏳ Pending approval
                    </p>
                  </div>

                  <button
                    onClick={() => handleWithdraw(request.to._id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition flex-shrink-0"
                  >
                    Withdraw
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}