import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, Settings } from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Displays navigation links and user info
 * Now integrated with Auth system
 */

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();
  const { username, leaveRoom, roomId, gameStatus } = useQuiz();
  const { user, token, logout: authLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    totalGames: user?.totalGames || 0,
    wins: user?.wins || 0,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const userIdentifier = useMemo(
    () => user?.id || user?.email || user?.username || username,
    [user?.email, user?.id, user?.username, username]
  );

  useEffect(() => {
    setUserStats({
      totalGames: user?.totalGames || 0,
      wins: user?.wins || 0,
    });
  }, [user?.totalGames, user?.wins]);

  useEffect(() => {
    if (!userIdentifier) {
      return undefined;
    }

    let isCancelled = false;

    const fetchLatestStats = async () => {
      try {
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const response = await fetch(
          `${API_BASE_URL}/matches/stats/${encodeURIComponent(userIdentifier)}`,
          { headers }
        );
        const data = await response.json();

        if (!isCancelled && data.success && data.stats) {
          setUserStats({
            totalGames: data.stats.totalGames || 0,
            wins: data.stats.wins || 0,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to refresh sidebar stats:', error);
        }
      }
    };

    fetchLatestStats();

    return () => {
      isCancelled = true;
    };
  }, [API_BASE_URL, token, userIdentifier, gameStatus, activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'quiz', label: 'Active Quiz', icon: '🧠' },
    { id: 'waiting', label: 'Waiting Room', icon: '⏳' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'history', label: 'My History', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const handleLogout = () => {
    if (roomId) {
      leaveRoom();
    }
    authLogout(); // Call auth logout
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-900 to-blue-900 text-white transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 pt-8 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="px-6 mb-8 sticky top-0 bg-gradient-to-b from-purple-900 to-blue-900 pb-4">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="text-yellow-400">🎯</span> Quiz Battle
          </h1>
          <p className="text-purple-200 text-sm mt-2">Real-time Quiz Platform</p>
        </div>

        {/* User Info Card */}
        <div className="px-6 py-4 bg-purple-800 mx-4 rounded-lg mb-6">
          <p className="text-sm text-purple-300">Logged in as</p>
          <p className="font-bold text-lg text-white truncate">
            {user?.username || username || 'Player'}
          </p>
          {user?.email && (
            <p className="text-xs text-purple-200 truncate mt-1">{user.email}</p>
          )}
          <div className="mt-3 pt-3 border-t border-purple-700 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-xs text-purple-300">Games</p>
              <p className="font-bold text-sm text-yellow-300">{userStats.totalGames}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-300">Wins</p>
              <p className="font-bold text-sm text-green-300">{userStats.wins}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 px-4 mb-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === item.id
                  ? 'bg-yellow-500 text-black font-bold'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings and Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-900 to-transparent border-t border-purple-700 space-y-2">
          {/* Settings Button */}
          <button
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
          >
            <Settings size={18} /> Profile
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-bold transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
