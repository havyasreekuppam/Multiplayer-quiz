import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

/**
 * Leaderboard Component
 * Displays live ranking with player scores
 */

const Leaderboard = ({ leaderboard }) => {
  const sortedLeaderboard = [...(leaderboard || [])].sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }

    return (a.totalTime || 0) - (b.totalTime || 0);
  });

  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="text-yellow-500" size={24} />;
      case 1:
        return <Medal className="text-gray-400" size={24} />;
      case 2:
        return <Award className="text-orange-600" size={24} />;
      default:
        return <span className="text-lg font-bold text-gray-600">{position + 1}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Trophy className="text-yellow-500 mr-3" size={32} />
        Leaderboard
      </h2>

      <div className="space-y-3">
        {sortedLeaderboard.length > 0 ? (
          sortedLeaderboard.map((player, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-300 to-yellow-100 ring-2 ring-yellow-400'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-200 to-gray-50  ring-2 ring-gray-400'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-200 to-orange-50 ring-2 ring-orange-400'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 flex items-center justify-center font-bold">
                  {getMedalIcon(index)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">{player.username}</p>
                  <p className="text-sm text-gray-500">
                    {(player.totalTime || 0) > 0 ? `${player.totalTime}s total time` : 'Player'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{player.score}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No players yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
