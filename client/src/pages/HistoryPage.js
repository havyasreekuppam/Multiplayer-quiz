import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SkeletonTable } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { Trophy, Clock, Users, TrendingUp } from 'lucide-react';

/**
 * Match History Page
 * Shows all past games with statistics and results
 */

export default function HistoryPage() {
  const { user, token } = useAuth();
  const { toasts, showToast } = useToast();
  const showToastRef = useRef(showToast);

  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, wins, losses

  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const userIdentifier = user?.id || user?.email || user?.username;

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (!userIdentifier) {
      setLoading(false);
      return undefined;
    }

    let isCancelled = false;

    const fetchHistoryData = async () => {
      try {
        setLoading(true);

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const [matchesResponse, statsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/matches/user/${encodeURIComponent(userIdentifier)}?limit=50`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/matches/stats/${encodeURIComponent(userIdentifier)}`, {
            headers,
          }),
        ]);

        const [matchesData, statsData] = await Promise.all([
          matchesResponse.json(),
          statsResponse.json(),
        ]);

        if (isCancelled) {
          return;
        }

        if (matchesData.success) {
          setMatches(matchesData.matches || []);
        } else {
          setMatches([]);
          showToastRef.current('Failed to load match history', 'error');
        }

        if (statsData.success) {
          setStats(statsData.stats || null);
        } else {
          setStats(null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching match history:', error);
          setMatches([]);
          setStats(null);
          showToastRef.current('Error loading match history', 'error');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistoryData();

    return () => {
      isCancelled = true;
    };
  }, [API_BASE_URL, token, userIdentifier]);

  // Filter matches based on win/loss
  const filteredMatches = matches.filter((match) => {
    if (filter === 'wins') return match.isWinner;
    if (filter === 'losses') return !match.isWinner;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-500" size={32} />
            Match History
          </h1>
          <p className="text-gray-600">
            {user?.username ? `Stats for ${user.username}` : 'Your performance history'}
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Games */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Games</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalGames}</p>
                </div>
                <Users size={32} className="text-blue-400" />
              </div>
            </div>

            {/* Wins */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Wins</p>
                  <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
                </div>
                <Trophy size={32} className="text-green-400" />
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Win Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.winRate}%</p>
                </div>
                <TrendingUp size={32} className="text-purple-400" />
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.averageScore}</p>
                </div>
                <Clock size={32} className="text-indigo-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            All Games ({matches.length})
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                filter === 'wins'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Wins ({matches.filter((m) => m.isWinner).length})
          </button>
          <button
            onClick={() => setFilter('losses')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                filter === 'losses'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Losses ({matches.filter((m) => !m.isWinner).length})
          </button>
        </div>

        {/* Match List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Your Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Players
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match, index) => (
                    <tr
                      key={match._id || index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(match.endedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {match.roomName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {match.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">
                        {match.userScore}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {match.isWinner ? (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            🏆 Won
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">
                            Loss
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {match.players.length} players
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Play a game to see your match history'
                : `No ${filter} matches yet. Keep playing!`}
            </p>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 max-w-sm space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 border-l-4 rounded shadow-lg
              ${toast.type === 'success'
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-red-100 border-red-400 text-red-800'
              }
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
