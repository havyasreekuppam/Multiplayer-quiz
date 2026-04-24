import Room from '../models/Room.js';
import Question from '../models/Question.js';
import Match from '../models/Match.js';
import Ranking from '../models/Ranking.js';
import User from '../models/User.js';
import {
  calculateELOChange,
  calculateNewELO,
  checkBadges,
  getLevelFromELO,
  getLevelProgress,
} from '../utils/eloCalculator.js';

/**
 * Socket.io event handlers for real-time quiz gameplay
 * Handles joining rooms, starting quizzes, submitting answers, and updating leaderboards
 */

const updateRankingsAfterMatch = async (winnerId, loserId) => {
  if (!winnerId || !loserId || winnerId === loserId) {
    return;
  }

  let winnerRanking = await Ranking.findOne({ userId: winnerId });
  let loserRanking = await Ranking.findOne({ userId: loserId });

  if (!winnerRanking) {
    winnerRanking = await Ranking.create({
      userId: winnerId,
      eloRating: 1000,
      level: 'Bronze',
      levelProgress: 0,
    });
  }

  if (!loserRanking) {
    loserRanking = await Ranking.create({
      userId: loserId,
      eloRating: 1000,
      level: 'Bronze',
      levelProgress: 0,
    });
  }

  const winnerELOChange = calculateELOChange(
    winnerRanking.eloRating,
    loserRanking.eloRating,
    true
  );
  const loserELOChange = calculateELOChange(
    loserRanking.eloRating,
    winnerRanking.eloRating,
    false
  );

  winnerRanking.eloRating = calculateNewELO(winnerRanking.eloRating, winnerELOChange);
  winnerRanking.level = getLevelFromELO(winnerRanking.eloRating);
  winnerRanking.levelProgress = getLevelProgress(winnerRanking.eloRating);
  winnerRanking.totalRankedGames += 1;
  winnerRanking.rankedWins += 1;
  winnerRanking.winStreak += 1;
  winnerRanking.bestWinStreak = Math.max(
    winnerRanking.bestWinStreak,
    winnerRanking.winStreak
  );
  winnerRanking.lastRankedMatch = new Date();
  winnerRanking.badges = checkBadges(winnerRanking);

  loserRanking.eloRating = calculateNewELO(loserRanking.eloRating, loserELOChange);
  loserRanking.level = getLevelFromELO(loserRanking.eloRating);
  loserRanking.levelProgress = getLevelProgress(loserRanking.eloRating);
  loserRanking.totalRankedGames += 1;
  loserRanking.winStreak = 0;
  loserRanking.lastRankedMatch = new Date();
  loserRanking.badges = checkBadges(loserRanking);

  await winnerRanking.save();
  await loserRanking.save();
};

const persistCompletedMatch = async (room) => {
  const existingMatch = await Match.findOne({ roomId: room.roomId, status: 'COMPLETED' }).sort({
    createdAt: -1,
  });

  if (existingMatch) {
    const existingLeaderboard = sortPlayersForResults([...(existingMatch.players || [])])
      .map((player) => ({
        userId: player.userId,
        username: player.username,
        score: player.finalScore || 0,
        totalTime: player.totalTime || 0,
        correctAnswers: player.correctAnswers || 0,
        isFinished: true,
      }));

    return {
      matchId: existingMatch._id,
      finalLeaderboard: existingLeaderboard,
      winner: existingMatch.winner,
    };
  }

  const questions = await Question.find({ _id: { $in: room.questions } }).select('_id correctAnswer');
  const questionMap = new Map(
    questions.map((question) => [question._id.toString(), question.correctAnswer])
  );

  const normalizedPlayers = room.players.map((player) => {
    const correctAnswers = (player.answers || []).reduce((count, selectedAnswer, answerIndex) => {
      const questionId = room.questions[answerIndex]?.toString();
      const correctAnswer = questionId ? questionMap.get(questionId) : undefined;
      return count + (selectedAnswer === correctAnswer ? 1 : 0);
    }, 0);

    return {
      userId: player.userId,
      username: player.username,
      finalScore: player.score || 0,
      totalTime: player.totalTime || 0,
      answers: player.answers || [],
      correctAnswers,
      finishedAt: player.finishedAt,
    };
  });

  const sortedPlayers = sortPlayersForResults(normalizedPlayers);
  const winner = sortedPlayers[0];

  if (!winner) {
    return null;
  }

  const match = await Match.create({
    roomId: room.roomId,
    roomName: room.roomName,
    category: room.category,
    players: normalizedPlayers,
    winner: {
      userId: winner.userId,
      username: winner.username,
      finalScore: winner.finalScore,
      totalTime: winner.totalTime,
    },
    questions: room.questions,
    duration: room.startedAt && room.endedAt
      ? Math.max(0, Math.round((room.endedAt.getTime() - room.startedAt.getTime()) / 1000))
      : 0,
    totalQuestions: room.questions.length,
    startedAt: room.startedAt,
    endedAt: room.endedAt,
    status: 'COMPLETED',
  });

  for (const player of normalizedPlayers) {
    const user = await User.findById(player.userId);

    if (!user) {
      continue;
    }

    user.totalGames += 1;
    user.score += player.finalScore;
    user.averageScore = Math.round(user.score / user.totalGames);

    if (winner.userId?.toString() === player.userId?.toString()) {
      user.wins += 1;
    }

    await user.save();
  }

  if (sortedPlayers.length >= 2) {
    await updateRankingsAfterMatch(
      sortedPlayers[0].userId?.toString(),
      sortedPlayers[1].userId?.toString()
    );
  }

  return {
    matchId: match._id,
    finalLeaderboard: sortedPlayers.map((player) => ({
      userId: player.userId,
      username: player.username,
      score: player.finalScore,
      totalTime: player.totalTime,
      correctAnswers: player.correctAnswers,
      isFinished: true,
    })),
    winner: sortedPlayers[0],
  };
};

const shuffleArray = (items) => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
};

const getQuizQuestions = async (category, totalQuestions) => {
  const categoryQuestions = await Question.find({ category });
  const shuffledCategoryQuestions = shuffleArray(categoryQuestions);

  if (shuffledCategoryQuestions.length >= totalQuestions) {
    return shuffledCategoryQuestions.slice(0, totalQuestions);
  }

  const selectedQuestions = [...shuffledCategoryQuestions];
  const remainingCount = totalQuestions - selectedQuestions.length;
  const selectedIds = selectedQuestions.map((question) => question._id);

  const fallbackQuestions = await Question.find({
    _id: { $nin: selectedIds },
  });

  return [
    ...selectedQuestions,
    ...shuffleArray(fallbackQuestions).slice(0, remainingCount),
  ];
};

const sortPlayersForResults = (players) =>
  [...players].sort((a, b) => {
    if ((b.finalScore || 0) !== (a.finalScore || 0)) {
      return (b.finalScore || 0) - (a.finalScore || 0);
    }

    if ((a.totalTime || 0) !== (b.totalTime || 0)) {
      return (a.totalTime || 0) - (b.totalTime || 0);
    }

    return new Date(a.finishedAt || 0).getTime() - new Date(b.finishedAt || 0).getTime();
  });

const getLeaderboardPayload = (players) =>
  sortPlayersForResults(
    players.map((player) => ({
      userId: player.userId,
      username: player.username,
      finalScore: player.score || 0,
      totalTime: player.totalTime || 0,
      isFinished: Boolean(player.isFinished),
      finishedAt: player.finishedAt,
    }))
  ).map((player) => ({
    userId: player.userId,
    username: player.username,
    score: player.finalScore,
    totalTime: player.totalTime,
    isFinished: player.isFinished,
  }));

const emitQuestionToPlayer = async (socket, room, player) => {
  const nextQuestion = await Question.findById(room.questions[player.currentQuestionIndex]);

  if (!nextQuestion) {
    socket.emit('error', { message: 'Question not found' });
    return;
  }

  socket.emit('nextQuestion', {
    questionIndex: player.currentQuestionIndex,
    question: nextQuestion.question,
    options: nextQuestion.options,
    timerDuration: 15,
  });
};

const finishRoomIfReady = async (io, room) => {
  const everyoneFinished = room.players.every((player) => player.isFinished);

  if (!everyoneFinished) {
    return;
  }

  room.status = 'COMPLETED';
  room.endedAt = new Date();
  await room.save();

  const persistedResult = await persistCompletedMatch(room);
  const finalLeaderboard = persistedResult?.finalLeaderboard || getLeaderboardPayload(room.players);

  io.to(room.roomId).emit('quizEnded', {
    message: 'Quiz completed!',
    winner: persistedResult?.winner || finalLeaderboard[0],
    leaderboard: finalLeaderboard,
  });

  console.log('🏆 Quiz ended in room', room.roomId);
};

export const setupSocketEvents = (io) => {
  // Connection handler
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // EVENT: Join Room
    // Client sends: { roomId, username }
    // Server broadcasts to room: "userJoined" with player info
    socket.on('joinRoom', async (data) => {
      try {
        const { roomId, username } = data;
        console.log(`📌 ${username} joining room ${roomId}`);

        // Add user to socket room
        socket.join(roomId);
        socket.userId = socket.id;
        socket.username = username;
        socket.roomId = roomId;

        // Get room details
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Broadcast to all users in room that someone joined
        io.to(roomId).emit('userJoined', {
          username,
          players: room.players,
          message: `${username} joined the room`,
        });

        // Send room state to joining user
        socket.emit('roomState', {
          roomId: room.roomId,
          roomName: room.roomName,
          admin: room.admin,
          category: room.category,
          status: room.status,
          players: room.players,
          currentQuestionIndex: room.currentQuestionIndex,
        });
      } catch (error) {
        console.error('❌ Join Room Error:', error.message);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // EVENT: Start Quiz
    // Only admin can start the quiz
    // Actions: Load questions, send first question, update room status
    socket.on('startQuiz', async (data) => {
      try {
        const { roomId, category } = data;
        console.log(`🚀 Starting quiz in room ${roomId}`);

        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is admin
        if (room.admin !== socket.username) {
          socket.emit('error', { message: 'Only admin can start quiz' });
          return;
        }

        // Fetch questions. If the selected category doesn't have enough,
        // fill the remainder from the rest of the question pool.
        const questions = await getQuizQuestions(category, room.totalQuestions);
        if (questions.length === 0) {
          socket.emit('error', { message: 'No questions available' });
          return;
        }

        if (questions.length < room.totalQuestions) {
          socket.emit('error', {
            message: `Only ${questions.length} question(s) are available right now`,
          });
          return;
        }

        // Store question IDs in room
        room.questions = questions.map((q) => q._id);
        room.status = 'IN_PROGRESS';
        room.currentQuestionIndex = 0;
        room.startedAt = new Date();
        room.players.forEach((player) => {
          player.score = 0;
          player.answers = [];
          player.currentQuestionIndex = 0;
          player.totalTime = 0;
          player.isFinished = false;
          player.finishedAt = null;
        });
        await room.save();

        io.to(roomId).emit('quizStarted', {
          message: 'Quiz has started!',
          questionIndex: 0,
          totalQuestions: questions.length,
        });

        const socketsInRoom = await io.in(roomId).fetchSockets();
        for (const playerSocket of socketsInRoom) {
          const roomPlayer = room.players.find((player) => player.username === playerSocket.username);
          if (roomPlayer) {
            await emitQuestionToPlayer(playerSocket, room, roomPlayer);
          }
        }

        console.log('📤 Sent first question to each player');
      } catch (error) {
        console.error('❌ Start Quiz Error:', error.message);
        socket.emit('error', { message: 'Failed to start quiz' });
      }
    });

    // EVENT: Submit Answer
    // Client sends: { roomId, username, questionIndex, selectedAnswer, timeTaken }
    socket.on('submitAnswer', async (data) => {
      try {
        const { roomId, username, questionIndex, selectedAnswer, timeTaken } = data;
        console.log(
          `📝 ${username} submitted answer ${selectedAnswer} for question ${questionIndex}`
        );

        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Find player
        const player = room.players.find((p) => p.username === username);
        if (!player) {
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }

        if (player.isFinished) {
          socket.emit('error', { message: 'You already finished this quiz' });
          return;
        }

        if (questionIndex !== player.currentQuestionIndex) {
          socket.emit('error', {
            message: 'Question mismatch. Please continue from your current question.',
          });
          return;
        }

        // Store answer
        if (!player.answers) {
          player.answers = [];
        }

        if (typeof player.answers[questionIndex] !== 'undefined') {
          socket.emit('error', { message: 'Answer already submitted for this question' });
          return;
        }

        player.answers[questionIndex] = selectedAnswer;
        player.totalTime = (player.totalTime || 0) + Math.max(0, Number(timeTaken) || 0);

        // Get the question to check correctness
        const question = await Question.findById(room.questions[questionIndex]);
        const isCorrect = selectedAnswer === question.correctAnswer;

        // Award points (100 - (timeTaken in seconds) for faster answers)
        if (isCorrect) {
          const pointsAwarded = Math.max(10, 100 - timeTaken);
          player.score += pointsAwarded;
          console.log(`✅ Correct! ${username} earned ${pointsAwarded} points`);
        } else {
          console.log(`❌ Incorrect answer by ${username}`);
        }

        // Emit feedback to the player
        socket.emit('answerResult', {
          isCorrect,
          correctAnswer: question.correctAnswer,
          correctOption: question.options[question.correctAnswer],
        });

        if (player.currentQuestionIndex + 1 >= room.questions.length) {
          player.currentQuestionIndex = room.questions.length;
          player.isFinished = true;
          player.finishedAt = new Date();
          socket.emit('playerCompletedQuiz', {
            message: 'You finished all questions. Final ranking will appear once everyone is done.',
          });
        } else {
          player.currentQuestionIndex += 1;
        }

        await room.save();

        io.to(roomId).emit('leaderboardUpdate', {
          leaderboard: getLeaderboardPayload(room.players),
        });

        if (!player.isFinished) {
          await emitQuestionToPlayer(socket, room, player);
        }

        await finishRoomIfReady(io, room);
      } catch (error) {
        console.error('❌ Submit Answer Error:', error.message);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // EVENT: Next Question
    // Manual question changes are disabled; each player advances
    // immediately after submitting their own answer.
    socket.on('nextQuestion', async (data) => {
      socket.emit('error', {
        message: 'The next question appears automatically after you answer.',
      });
    });

    // EVENT: Leave Room
    socket.on('leaveRoom', async (data) => {
      try {
        const { roomId, username } = data;
        console.log(`👋 ${username} left room ${roomId}`);

        const room = await Room.findOne({ roomId });
        if (room) {
          // Remove player from room
          room.players = room.players.filter((p) => p.username !== username);
          await room.save();

          // Broadcast player left
          io.to(roomId).emit('userLeft', {
            username,
            players: room.players,
            message: `${username} left the room`,
          });
        }

        socket.leave(roomId);
      } catch (error) {
        console.error('❌ Leave Room Error:', error.message);
      }
    });

    // EVENT: Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      if (socket.roomId && socket.username) {
        io.to(socket.roomId).emit('userLeft', {
          username: socket.username,
          message: `${socket.username} disconnected`,
        });
      }
    });

    // ERROR HANDLER
    socket.on('error', (error) => {
      console.error('❌ Socket Error:', error);
    });
  });
};
