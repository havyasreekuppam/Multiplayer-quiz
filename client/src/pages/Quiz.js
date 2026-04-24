import React, { useState, useEffect, useCallback } from 'react';
import { useQuiz } from '../context/QuizContext';
import QuestionCard from '../components/QuestionCard';
import Leaderboard from '../components/Leaderboard';

/**
 * Quiz Page
 * Displays the active quiz with questions and answer submission
 */

const Quiz = ({ setActiveTab }) => {
  const {
    roomId,
    currentQuestion,
    questionIndex,
    totalQuestions,
    timer,
    setTimer,
    leaderboard,
    submitAnswerFunc,
    gameStatus,
    playerFinished,
  } = useQuiz();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  // Initialize timer
  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    setStartTime(Date.now());
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  }, [currentQuestion]);

  const handleSubmitAnswer = useCallback((answer) => {
    if (answerSubmitted) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    submitAnswerFunc(answer, timeTaken);
    setAnswerSubmitted(true);
  }, [answerSubmitted, startTime, submitAnswerFunc]);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || gameStatus === 'COMPLETED') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Auto-submit even when no option was selected so the room can progress.
          if (!answerSubmitted) {
            handleSubmitAnswer(selectedAnswer);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [answerSubmitted, currentQuestion, gameStatus, handleSubmitAnswer, selectedAnswer, setTimer]);

  // Update leaderboard when quiz completes
  useEffect(() => {
    if (gameStatus === 'COMPLETED') {
      setActiveTab('leaderboard');
    }
  }, [gameStatus, setActiveTab]);

  const handleSelectOption = (index) => {
    if (!answerSubmitted) {
      setSelectedAnswer(index);
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl animate-pulse">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🧠 Quiz Battle</h1>
          <p className="text-purple-200">Stay sharp and score points!</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Card - Takes 2 cols on desktop */}
          <div className="lg:col-span-2">
            {playerFinished ? (
              <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl shadow-xl p-8 text-center">
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">All Done</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-800">You finished your quiz run</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Your score is locked in. Final rankings will appear once everyone else finishes.
                </p>
              </div>
            ) : currentQuestion ? (
              <>
                <QuestionCard
                  question={currentQuestion.question}
                  questionIndex={questionIndex}
                  totalQuestions={totalQuestions}
                  timer={timer}
                />

                <div className="mt-8 grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={answerSubmitted}
                      className={`p-4 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] ${
                        selectedAnswer === index
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : answerSubmitted
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-white text-gray-800 hover:bg-purple-100'
                      }`}
                    >
                      <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  {!answerSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(selectedAnswer)}
                      disabled={selectedAnswer === null}
                      className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                        selectedAnswer === null
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                      }`}
                    >
                      ✅ Submit Answer
                    </button>
                  ) : (
                    <div className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg text-center">
                      ⏳ Loading your next question...
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-xl p-8 text-center">
                <p className="text-xl font-semibold text-gray-700">Loading your next question...</p>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div>
            <Leaderboard leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
