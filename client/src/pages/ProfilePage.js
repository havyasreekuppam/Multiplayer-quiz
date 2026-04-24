import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import { User, Mail, Trophy, Target, Users, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, isAuthenticated } = useAuth();
  const { roomId, roomName, category, players, isAdmin, gameStatus } = useQuiz();

  const winRate = user?.totalGames ? Math.round(((user?.wins || 0) / user.totalGames) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 p-8 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Player Profile</p>
          <h1 className="mt-3 text-4xl font-black">Welcome, {user?.username || 'Player'}</h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100">
            View your account details, gameplay snapshot, and current room status from one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Account Details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-500">
                  <User size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wide">Username</span>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900">{user?.username || 'Player'}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wide">Email</span>
                </div>
                <p className="mt-3 break-all text-xl font-bold text-slate-900">
                  {user?.email || 'Not available'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-500">
                  <Shield size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wide">Session</span>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900">
                  {isAuthenticated ? 'Active' : 'Signed out'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Token status: {token ? 'available' : 'missing'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-500">
                  <Target size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wide">Win Rate</span>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900">{winRate}%</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Performance Snapshot</h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="flex items-center gap-3 text-slate-200">
                  <Trophy size={18} />
                  <span className="text-sm uppercase tracking-wide">Wins</span>
                </div>
                <p className="mt-3 text-3xl font-black">{user?.wins || 0}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <div className="flex items-center gap-3 text-slate-200">
                  <Users size={18} />
                  <span className="text-sm uppercase tracking-wide">Games Played</span>
                </div>
                <p className="mt-3 text-3xl font-black">{user?.totalGames || 0}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Current Room Status</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Room ID</p>
              <p className="mt-3 text-lg font-bold text-slate-900">{roomId || 'Not in a room'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Room Name</p>
              <p className="mt-3 text-lg font-bold text-slate-900">{roomName || 'No active room'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Category</p>
              <p className="mt-3 text-lg font-bold text-slate-900">{category || 'General'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Game State</p>
              <p className="mt-3 text-lg font-bold text-slate-900">
                {roomId ? gameStatus : 'Idle'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {isAdmin ? 'You are the room host.' : `${players.length || 0} player(s) connected.`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
