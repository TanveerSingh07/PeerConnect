import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, connectionAPI } from '../services/api';
import { UserPlus, TrendingUp, Award } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SkillRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    setConnecting(prev => ({ ...prev, [userId]: true }));
    try {
      await connectionAPI.send(userId);
      setRecommendations(prev => prev.filter(rec => rec._id !== userId));
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setConnecting(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">Recommended For You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((user) => (
          <div
            key={user._id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            {/* Avatar */}
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}

            {/* Info */}
            <h4 className="font-semibold text-center mb-1 truncate">{user.name}</h4>
            <p className="text-xs text-gray-500 text-center mb-3">
              {user.department} • {user.year}
            </p>

            {/* Match Score */}
            <div className="mb-3 flex items-center justify-center gap-2">
              <Award className="text-yellow-500" size={16} />
              <span className="text-sm font-semibold text-blue-600">
                {user.recommendationScore} pts
              </span>
            </div>

            {/* Reasons */}
            {user.recommendationReasons && user.recommendationReasons.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1 justify-center">
                  {user.recommendationReasons.slice(0, 2).map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    >
                      {reason}
                    </span>
                  ))}
                  {user.recommendationReasons.length > 2 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      +{user.recommendationReasons.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConnect(user._id);
              }}
              disabled={connecting[user._id]}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <UserPlus size={16} />
              {connecting[user._id] ? 'Sending...' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}