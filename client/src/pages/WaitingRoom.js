import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import RoomInfoCard from '../components/RoomInfoCard';

/**
 * Waiting Room Page
 * Displays players waiting to start the quiz
 * Admin can start the quiz
 */

const WaitingRoom = ({ setActiveTab }) => {
  const { roomId, roomName, players, isAdmin, category, leaveRoom, startQuiz, gameStatus } =
    useQuiz();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (gameStatus === 'IN_PROGRESS') {
      setActiveTab('quiz');
    }
  }, [gameStatus, setActiveTab]);

  const handleStartQuiz = () => {
    if (players.length < 2) {
      alert('At least 2 players required to start quiz');
      return;
    }
    setIsStarting(true);
    startQuiz();
  };

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⏳ Waiting Room</h1>
          <p className="text-purple-200">Get ready to play!</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Room Info - Takes 2 cols on desktop */}
          <div className="md:col-span-2">
            <RoomInfoCard
              roomId={roomId}
              roomName={roomName}
              players={players}
              isAdmin={isAdmin}
              category={category}
            />
          </div>

          {/* Actions Panel */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-6 h-fit">
            <h3 className="text-white text-xl font-bold mb-6">🎮 Actions</h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                <p className="text-sm text-purple-100">Players Ready</p>
                <p className="text-3xl font-bold">{players.length}</p>
              </div>

              {/* Start Button (Admin Only) */}
              {isAdmin ? (
                <button
                  onClick={handleStartQuiz}
                  disabled={isStarting || players.length < 2}
                  className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all ${
                    isStarting || players.length < 2
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-400 text-black hover:bg-yellow-500 hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isStarting ? '🚀 Starting...' : '🚀 Start Quiz'}
                </button>
              ) : (
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center text-white">
                  <p className="text-sm">Waiting for admin to start...</p>
                </div>
              )}

              {/* Leave Button */}
              <button
                onClick={leaveRoom}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                👋 Leave Room
              </button>

              {/* Info Box */}
              <div className="bg-blue-500 bg-opacity-30 rounded-lg p-4 text-white text-sm">
                <p className="font-bold mb-2">💡 Quiz Tip</p>
                <p>Answer quickly and accurately to score more points! Each question has a 15-second timer.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimum Players Notice */}
        {players.length < 2 && (
          <div className="mt-8 bg-yellow-400 bg-opacity-20 border-2 border-yellow-400 rounded-lg p-6 text-yellow-100">
            <p className="font-bold">⚠️ Minimum Players Required</p>
            <p>At least 2 players are needed to start the quiz. Currently: {players.length} player(s)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
