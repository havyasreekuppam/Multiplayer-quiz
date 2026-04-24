import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Plus, LogIn } from 'lucide-react';

/**
 * Dashboard Page
 * Allows users to create or join a quiz room
 */

const Dashboard = ({ setActiveTab }) => {
  const { createRoom, joinRoomFunc, loading, error } = useQuiz();
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [joinCode, setJoinCode] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [questionsInput, setQuestionsInput] = useState(5);

  const handleCreateRoom = async () => {
    if (!roomNameInput.trim()) {
      alert('Please enter a room name');
      return;
    }
    const created = await createRoom(roomNameInput, categoryInput, questionsInput);
    if (created) {
      setActiveTab('waiting');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    const joined = await joinRoomFunc(joinCode.toUpperCase());
    if (joined) {
      setActiveTab('waiting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🎯 Quiz Battle</h1>
          <p className="text-2xl text-purple-100">Challenge your friends in real-time!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Main Actions */}
        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Create Room Card */}
            <button
              onClick={() => setMode('create')}
              className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Create Room</h2>
              <p className="text-gray-600 mb-6">Start your own quiz and invite friends</p>
              <div className="flex items-center justify-center text-purple-600 font-bold">
                <Plus size={24} className="mr-2" /> Create
              </div>
            </button>

            {/* Join Room Card */}
            <button
              onClick={() => setMode('join')}
              className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Join Room</h2>
              <p className="text-gray-600 mb-6">Enter room code to join a quiz</p>
              <div className="flex items-center justify-center text-blue-600 font-bold">
                <LogIn size={24} className="mr-2" /> Join
              </div>
            </button>
          </div>
        )}

        {/* Create Room Form */}
        {mode === 'create' && (
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Room</h2>

            {/* Room Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Room Name</label>
              <input
                type="text"
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                placeholder="e.g., Tech Quiz Night"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Category</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                <option value="General">📚 General</option>
                <option value="Tech">💻 Tech</option>
                <option value="Sports">⚽ Sports</option>
                <option value="Movies">🎬 Movies</option>
              </select>
            </div>

            {/* Questions Count */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Number of Questions</label>
              <input
                type="number"
                value={questionsInput}
                onChange={(e) => setQuestionsInput(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '⏳ Creating...' : '✅ Create Room'}
              </button>
              <button
                onClick={() => setMode(null)}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Join Room Form */}
        {mode === 'join' && (
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Join Room</h2>

            {/* Room Code */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-center text-2xl font-bold tracking-widest"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '⏳ Joining...' : '✅ Join Room'}
              </button>
              <button
                onClick={() => setMode(null)}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
