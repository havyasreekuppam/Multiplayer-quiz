import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'quizBattleUser';
const TOKEN_STORAGE_KEY = 'accessToken';

const readStoredUser = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Failed to parse stored user', error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const createDemoUser = (username, email) => ({
  id: email,
  username,
  email,
  totalGames: 0,
  wins: 0,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [loading, setLoading] = useState(false);

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  };

  const login = async (email, password) => {
    setLoading(true);

    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const username = email.split('@')[0] || 'Player';
      const nextUser = createDemoUser(username, email);
      const nextToken = `demo-token-${username}`;

      persistAuth(nextUser, nextToken);

      return { success: true, message: 'Logged in successfully', user: nextUser };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    setLoading(true);

    try {
      if (!username || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }

      if (confirmPassword !== undefined && password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      const nextUser = createDemoUser(username, email);
      const nextToken = `demo-token-${username}`;

      persistAuth(nextUser, nextToken);

      return { success: true, message: 'Account created successfully', user: nextUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken('');
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    return { success: true, message: 'Logged out successfully' };
  };

  const refreshToken = async () => {
    if (!user) {
      return { success: false, message: 'No active session' };
    }

    const nextToken = `demo-token-${user.username}`;
    setToken(nextToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);

    return { success: true, accessToken: nextToken };
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
