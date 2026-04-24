import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { TrendingUp, Award, Trophy, Zap } from 'lucide-react';

/**
 * Analytics Dashboard Page
 * Display player statistics with charts
 */

export default function AnalyticsDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);

  const [stats, setStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const userIdentifier = user?.id || user?.email || user?.username;

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (!userIdentifier) {
      setStats({
        totalGames: 0,
        wins: 0,
        averageScore: 0,
        bestScore: 0,
      });
      setRanking(null);
      setLoading(false);
      return undefined;
    }

    let isCancelled = false;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const [statsResponse, rankingResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/matches/stats/${encodeURIComponent(userIdentifier)}`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/rankings/player/${encodeURIComponent(userIdentifier)}`),
        ]);

        const [statsData, rankingData] = await Promise.all([
          statsResponse.json(),
          rankingResponse.json(),
        ]);

        if (isCancelled) {
          return;
        }

        if (statsData.success) {
          setStats(
            statsData.stats || {
              totalGames: 0,
              wins: 0,
              averageScore: 0,
              bestScore: 0,
            }
          );
        } else {
          setStats({
            totalGames: 0,
            wins: 0,
            averageScore: 0,
            bestScore: 0,
          });
        }

        if (rankingData.success) {
          setRanking(rankingData.ranking || null);
        } else {
          setRanking(null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching analytics:', error);
          setStats({
            totalGames: 0,
            wins: 0,
            averageScore: 0,
            bestScore: 0,
          });
          setRanking(null);
          showToastRef.current('Error loading analytics', 'error');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isCancelled = true;
    };
  }, [API_BASE_URL, token, userIdentifier]);

  if (loading || !stats) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <SkeletonLoader width="w-1/3" height="h-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} height="h-24" />
            ))}
          </div>
          <SkeletonLoader height="h-96" />
        </div>
      </div>
    );
  }

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;

  // Chart data
  const performanceData = [
    { category: 'Wins', value: stats.wins || 0, fill: '#10b981' },
    { category: 'Losses', value: (stats.totalGames - stats.wins) || 0, fill: '#ef4444' },
  ];

  const scoreData = [
    { game: 'Avg Score', value: Math.round(stats.averageScore || 0) },
    { game: 'Best Score', value: stats.bestScore || 0 },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-500" size={32} />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Your performance metrics and statistics</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Games */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Games</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalGames}</p>
              </div>
              <Trophy size={32} className="text-blue-400" />
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-green-600">{winRate}%</p>
              </div>
              <Zap size={32} className="text-green-400" />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Score</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(stats.averageScore || 0)}
                </p>
              </div>
              <Award size={32} className="text-purple-400" />
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Best Score</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.bestScore || 0}</p>
              </div>
              <Trophy size={32} className="text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Rankings Card */}
        {ranking && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Ranking System</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-gray-600 text-sm">ELO Rating</p>
                <p className="text-2xl font-bold text-gray-800">{ranking.eloRating}</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-gray-600 text-sm">Level</p>
                <p className="text-2xl font-bold text-blue-600">{ranking.level}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-600 text-sm">Level Progress</p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${ranking.levelProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{ranking.levelProgress}%</p>
              </div>
            </div>

            {/* Win Streak */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600 text-sm mb-2">Win Streak: {ranking.winStreak} | Best: {ranking.bestWinStreak}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((ranking.winStreak / ranking.bestWinStreak) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Win/Loss Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Win/Loss Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Score Trend Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Score Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranked Stats */}
        {ranking && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Ranked Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm">Ranked Games</p>
                <p className="text-2xl font-bold text-blue-600">{ranking.totalRankedGames}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm">Ranked Wins</p>
                <p className="text-2xl font-bold text-green-600">{ranking.rankedWins}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-purple-600">{ranking.bestWinStreak}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-gray-600 text-sm">Total Badges</p>
                <p className="text-2xl font-bold text-yellow-600">{ranking.badges?.length || 0}</p>
              </div>
            </div>

            {/* Badges */}
            {ranking.badges && ranking.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-gray-700 font-semibold mb-3">🎖️ Achievements</p>
                <div className="flex flex-wrap gap-2">
                  {ranking.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-sm font-semibold"
                      title={badge.description}
                    >
                      {badge.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
