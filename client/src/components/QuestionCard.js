import React from 'react';

/**
 * Question Card Component
 * Displays the current question and options
 */

const QuestionCard = ({ question, questionIndex, totalQuestions, timer }) => {
  if (!question) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
        <p className="text-xl">Waiting for next question...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-xl p-8">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div
            className={`text-2xl font-bold px-4 py-2 rounded-lg ${
              timer <= 5
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {timer}s
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{question}</h2>
      </div>
      {/* Timer Bar */}
      <div className="mt-8 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timer <= 5 ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${(timer / 15) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default QuestionCard;
