import React from 'react';
import { useQuiz } from '../context/QuizContext';
import Leaderboard from '../components/Leaderboard';
import { Trophy, Home } from 'lucide-react';

/**
 * Leaderboard Page
 * Displays the master leaderboard during and after quiz
 */

const LeaderboardPage = ({ setActiveTab }) => {
  const { leaderboard, roomId, roomName, leaveRoom } = useQuiz();

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">❌ Please join or create a room first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Trophy className="text-yellow-400 mr-3" size={40} />
            Leaderboard
          </h1>
          <p className="text-purple-200">Room: {roomName}</p>
        </div>

        {/* Main Leaderboard */}
        <div className="mb-8">
          <Leaderboard leaderboard={leaderboard} />
        </div>

        {/* Stats Cards */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Top Score */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Highest Score</p>
              <p className="text-3xl font-bold">{leaderboard[0]?.score || 0}</p>
              <p className="text-sm opacity-90 mt-2">by {leaderboard[0]?.username || 'N/A'}</p>
            </div>

            {/* Average Score */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Average Score</p>
              <p className="text-3xl font-bold">
                {Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length)}
              </p>
              <p className="text-sm opacity-90 mt-2">across {leaderboard.length} player(s)</p>
            </div>

            {/* Total Points */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Total Points</p>
              <p className="text-3xl font-bold">
                {leaderboard.reduce((sum, p) => sum + p.score, 0)}
              </p>
              <p className="text-sm opacity-90 mt-2">combined</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
          >
            <Home size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            👋 Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
