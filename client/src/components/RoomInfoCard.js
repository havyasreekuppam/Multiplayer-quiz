import React from 'react';
import { Users, Copy, CheckCircle } from 'lucide-react';

/**
 * Room Info Card Component
 * Displays room details and player list
 */

const RoomInfoCard = ({ roomId, roomName, players, isAdmin, category }) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-xl p-6">
      {/* Room Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{roomName}</h2>
        <p className="text-gray-600 mt-1">Category: {category}</p>
      </div>

      {/* Room Code */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500 mb-2">Room Code</p>
        <div className="flex items-center justify-between bg-gray-50 rounded p-3">
          <code className="text-2xl font-bold text-purple-600 tracking-widest">{roomId}</code>
          <button
            onClick={copyRoomCode}
            className="ml-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Users size={24} className="text-purple-600 mr-2" />
          <h3 className="font-bold text-lg text-gray-800">Players ({players.length})</h3>
          {isAdmin && <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Admin</span>}
        </div>

        <ul className="space-y-2">
          {players && players.length > 0 ? (
            players.map((player, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{player.username}</span>
                <span className="text-sm text-purple-600 font-bold bg-purple-100 px-2 py-1 rounded">
                  {player.score} pts
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-center py-4">Loading players...</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RoomInfoCard;
