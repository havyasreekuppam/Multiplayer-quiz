import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

/**
 * Quiz Context - Manages global quiz state
 * Stores: room info, players, questions, leaderboard, user data
 */

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [category, setCategory] = useState('General');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameStatus, setGameStatus] = useState('WAITING'); // WAITING, IN_PROGRESS, COMPLETED
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [timer, setTimer] = useState(15);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchPersistedRoomId, setMatchPersistedRoomId] = useState('');
  const [playerFinished, setPlayerFinished] = useState(false);

  const getRequestIdentity = () => {
    const storedUserRaw = localStorage.getItem('quizBattleUser');
    let storedUser = null;

    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (parseError) {
        console.error('Failed to parse stored quiz user', parseError);
      }
    }

    const resolvedUsername = user?.username || storedUser?.username || username || 'Player';
    const resolvedEmail =
      user?.email ||
      storedUser?.email ||
      `${resolvedUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player'}@quizbattle.local`;

    return {
      username: resolvedUsername,
      email: resolvedEmail,
    };
  };

  const formatApiError = (data, fallbackMessage) => {
    if (!data) {
      return fallbackMessage;
    }

    if (data.error && data.error !== data.message) {
      return `${data.message || fallbackMessage}: ${data.error}`;
    }

    return data.message || fallbackMessage;
  };

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://127.0.0.1:5001';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setError('Connection error: ' + error.message);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive room state
    socket.on('roomState', (data) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setPlayers(data.players);
      setGameStatus(data.status);
      setIsAdmin(data.admin === username);
      setCategory(data.category);
    });

    // User joined room
    socket.on('userJoined', (data) => {
      setPlayers(data.players);
      console.log(data.message);
    });

    // User left room
    socket.on('userLeft', (data) => {
      setPlayers(data.players);
      console.log(data.message);
    });

    // Quiz started
    socket.on('quizStarted', (data) => {
      setGameStatus('IN_PROGRESS');
      setPlayerFinished(false);
      console.log(data.message);
    });

    // Receive next question
    socket.on('nextQuestion', (data) => {
      setQuestionIndex(data.questionIndex);
      setCurrentQuestion({
        question: data.question,
        options: data.options,
        timerDuration: data.timerDuration,
      });
      setPlayerFinished(false);
      setUserAnswer(null);
      setAnswerResult(null);
      setTimer(data.timerDuration);
    });

    // Answer result
    socket.on('answerResult', (data) => {
      setAnswerResult({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        correctOption: data.correctOption,
      });
    });

    // Leaderboard update
    socket.on('leaderboardUpdate', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('playerCompletedQuiz', (data) => {
      setCurrentQuestion(null);
      setPlayerFinished(true);
      setAnswerResult(null);
      setUserAnswer(null);
      setTimer(0);
      console.log(data.message);
    });

    // Quiz ended
    socket.on('quizEnded', async (data) => {
      setGameStatus('COMPLETED');
      setLeaderboard(data.leaderboard);
      console.log('🏆 Quiz ended:', data.message);

      const shouldPersistMatch = isAdmin && roomId && matchPersistedRoomId !== roomId;
      if (!shouldPersistMatch) {
        return;
      }

      try {
        const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
        const leaderboardByUsername = new Map(
          (data.leaderboard || []).map((entry) => [entry.username, entry.score || 0])
        );
        const normalizedPlayers = players.map((player) => ({
          userId: player.userId,
          username: player.username,
          finalScore: leaderboardByUsername.get(player.username) || player.score || 0,
          answers: player.answers || [],
          correctAnswers: 0,
        }));
        const sortedPlayers = [...normalizedPlayers].sort((a, b) => b.finalScore - a.finalScore);

        if (sortedPlayers.length > 0) {
          await fetch(`${apiBaseUrl}/matches/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId,
              roomName,
              category,
              players: normalizedPlayers,
              winner: sortedPlayers[0],
            }),
          });
          setMatchPersistedRoomId(roomId);
        }
      } catch (persistError) {
        console.error('Failed to persist match from client fallback:', persistError);
      }
    });

    return () => {
      socket.off('roomState');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('quizStarted');
      socket.off('nextQuestion');
      socket.off('answerResult');
      socket.off('leaderboardUpdate');
      socket.off('playerCompletedQuiz');
      socket.off('quizEnded');
    };
  }, [socket, username, isAdmin, roomId, roomName, category, players, matchPersistedRoomId]);

  // Create room
  const createRoom = async (roomNameInput, categoryInput, questionsInput) => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      const identity = getRequestIdentity();
      const response = await fetch(`${apiBaseUrl}/rooms/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomNameInput,
          username: identity.username,
          email: identity.email,
          category: categoryInput || 'General',
          totalQuestions: questionsInput || 5,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoomId(data.room.roomId);
        setRoomName(data.room.roomName);
        setPlayers(data.room.players);
        setIsAdmin(true);
        setCategory(data.room.category);
        setTotalQuestions(data.room.totalQuestions);

        // Join room via socket
        if (socket) {
          socket.emit('joinRoom', { roomId: data.room.roomId, username: identity.username });
        }
        setError('');
        return true;
      } else {
        setError(formatApiError(data, 'Failed to create room'));
        return false;
      }
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Join room
  const joinRoomFunc = async (roomIdInput) => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      const identity = getRequestIdentity();
      const response = await fetch(`${apiBaseUrl}/rooms/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomIdInput,
          username: identity.username,
          email: identity.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoomId(data.room.roomId);
        setRoomName(data.room.roomName);
        setPlayers(data.room.players);
        setGameStatus(data.room.status);
        setCategory(data.room.category);
        setTotalQuestions(data.room.totalQuestions);

        // Join room via socket
        if (socket) {
          socket.emit('joinRoom', { roomId: roomIdInput, username: identity.username });
        }
        setError('');
        return true;
      } else {
        setError(formatApiError(data, 'Failed to join room'));
        return false;
      }
    } catch (err) {
      setError('Failed to join room');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Start quiz
  const startQuiz = () => {
    if (socket) {
      socket.emit('startQuiz', { roomId, category });
    }
  };

  // Submit answer
  const submitAnswerFunc = (selectedOption, timeTaken) => {
    setUserAnswer(selectedOption);
    if (socket) {
      socket.emit('submitAnswer', {
        roomId,
        username,
        questionIndex,
        selectedAnswer: selectedOption,
        timeTaken,
      });
    }
  };

  // Next question
  const nextQuestionFunc = () => {
    if (socket) {
      socket.emit('nextQuestion', { roomId, questionIndex });
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom', { roomId, username });
    }
    resetQuizState();
  };

  // Reset state
  const resetQuizState = () => {
    setRoomId('');
    setRoomName('');
    setPlayers([]);
    setIsAdmin(false);
    setGameStatus('WAITING');
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setLeaderboard([]);
    setUserAnswer(null);
    setAnswerResult(null);
    setMatchPersistedRoomId('');
    setPlayerFinished(false);
  };

  return (
    <QuizContext.Provider
      value={{
        socket,
        username,
        setUsername,
        roomId,
        roomName,
        category,
        totalQuestions,
        players,
        isAdmin,
        gameStatus,
        currentQuestion,
        questionIndex,
        leaderboard,
        userAnswer,
        answerResult,
        timer,
        setTimer,
        playerFinished,
        error,
        setError,
        loading,
        createRoom,
        joinRoomFunc,
        startQuiz,
        submitAnswerFunc,
        nextQuestionFunc,
        leaveRoom,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// Custom hook to use quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};
