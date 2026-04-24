/**
 * Gameplay Improvements Utility
 * Handles:
 * - Prevent multiple answer submissions
 * - Restore state on reconnect
 * - Countdown synchronization
 * - Waiting for players logic
 */

class GameplayManager {
  constructor() {
    this.answerSubmitted = false;
    this.submittedAnswer = null;
    this.countdownTime = 0;
    this.serverTime = 0;
    this.localTime = 0;
  }

  /**
   * Check if answer can be submitted
   */
  canSubmitAnswer() {
    return !this.answerSubmitted;
  }

  /**
   * Mark answer as submitted
   */
  submitAnswer(answer) {
    if (this.answerSubmitted) {
      console.warn('⚠️ Answer already submitted');
      return false;
    }

    this.answerSubmitted = true;
    this.submittedAnswer = answer;
    return true;
  }

  /**
   * Reset answer submission for next question
   */
  resetAnswerSubmission() {
    this.answerSubmitted = false;
    this.submittedAnswer = null;
  }

  /**
   * Sync countdown timer with server
   */
  syncCountdown(serverCountdown, questionTimeLimit = 15) {
    this.countdownTime = serverCountdown;
    this.serverTime = Date.now();
    this.localTime = this.serverTime;

    return this;
  }

  /**
   * Get current countdown time (accounting for local time passage)
   */
  getCurrentCountdown() {
    if (this.countdownTime <= 0) return 0;

    const elapsed = (Date.now() - this.localTime) / 1000;
    const remaining = this.countdownTime - elapsed;

    return Math.max(0, Math.ceil(remaining));
  }

  /**
   * Check if time is up
   */
  isTimeUp() {
    return this.getCurrentCountdown() <= 0;
  }

  /**
   * Restore game state from session storage (on reconnect)
   */
  restoreState() {
    try {
      const savedState = sessionStorage.getItem('gameplayState');
      if (savedState) {
        const state = JSON.parse(savedState);
        Object.assign(this, state);
        return state;
      }
    } catch (error) {
      console.error('Error restoring gameplay state:', error);
    }
    return null;
  }

  /**
   * Save game state to session storage (for reconnect recovery)
   */
  saveState() {
    try {
      sessionStorage.setItem(
        'gameplayState',
        JSON.stringify({
          answerSubmitted: this.answerSubmitted,
          submittedAnswer: this.submittedAnswer,
          countdownTime: this.countdownTime,
          serverTime: this.serverTime,
          localTime: this.localTime,
        })
      );
    } catch (error) {
      console.error('Error saving gameplay state:', error);
    }
  }

  /**
   * Clear saved state (after game ends)
   */
  clearState() {
    sessionStorage.removeItem('gameplayState');
    this.resetAnswerSubmission();
  }
}

/**
 * Waiting Room Manager
 * Handles "waiting for players" and countdown logic
 */
class WaitingRoomManager {
  constructor() {
    this.players = [];
    this.readyPlayers = [];
    this.startCountdown = null;
    this.minPlayers = 2;
  }

  /**
   * Add player to waiting room
   */
  addPlayer(player) {
    if (!this.players.find(p => p.id === player.id)) {
      this.players.push(player);
    }
  }

  /**
   * Mark player as ready
   */
  markReady(playerId) {
    if (!this.readyPlayers.includes(playerId)) {
      this.readyPlayers.push(playerId);
    }
  }

  /**
   * Check if all players are ready
   */
  allPlayersReady() {
    return this.players.length >= this.minPlayers &&
           this.readyPlayers.length === this.players.length;
  }

  /**
   * Get players not ready
   */
  getPendingPlayers() {
    return this.players.filter(p => !this.readyPlayers.includes(p.id));
  }

  /**
   * Reset waiting room
   */
  reset() {
    this.players = [];
    this.readyPlayers = [];
    this.startCountdown = null;
  }

  /**
   * Get readiness percentage
   */
  getReadinessPercentage() {
    if (this.players.length === 0) return 0;
    return Math.round((this.readyPlayers.length / this.players.length) * 100);
  }
}

/**
 * Reconnection Manager
 * Handles socket reconnection and state recovery
 */
class ReconnectionManager {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 10000; // Max 10 seconds
  }

  /**
   * Calculate reconnect delay with exponential backoff
   */
  getReconnectDelay() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    return Math.min(delay, this.maxReconnectDelay);
  }

  /**
   * Increment attempt counter
   */
  incrementAttempts() {
    this.reconnectAttempts++;
  }

  /**
   * Reset on successful connection
   */
  reset() {
    this.reconnectAttempts = 0;
  }

  /**
   * Check if max attempts reached
   */
  maxAttemptsReached() {
    return this.reconnectAttempts >= this.maxReconnectAttempts;
  }

  /**
   * Get retry information
   */
  getRetryInfo() {
    return {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      nextRetryIn: this.getReconnectDelay(),
      canRetry: !this.maxAttemptsReached(),
    };
  }
}

// Export singleton instances
export const gameplayManager = new GameplayManager();
export const waitingRoomManager = new WaitingRoomManager();
export const reconnectionManager = new ReconnectionManager();

/*
 * Usage Examples:
 *
 * // Prevent double submission
 * if (gameplayManager.canSubmitAnswer()) {
 *   gameplayManager.submitAnswer(selectedOption);
 *   socket.emit('submitAnswer', { answer: selectedOption });
 * } else {
 *   showToast('Answer already submitted', 'warning');
 * }
 *
 * // Reset for next question
 * gameplayManager.resetAnswerSubmission();
 *
 * // Sync countdown
 * gameplayManager.syncCountdown(15);
 * const remaining = gameplayManager.getCurrentCountdown();
 *
 * // Waiting room
 * waitingRoomManager.addPlayer(player);
 * if (waitingRoomManager.allPlayersReady()) {
 *   socket.emit('startQuiz');
 * }
 *
 * // Reconnection
 * socket.on('disconnect', () => {
 *   reconnectionManager.incrementAttempts();
 *   const delay = reconnectionManager.getReconnectDelay();
 *   setTimeout(() => socket.connect(), delay);
 * });
 *
 * socket.on('connect', () => {
 *   reconnectionManager.reset();
 *   gameplayManager.restoreState();
 * });
 */
