/**
 * ELO Rating Calculator
 * Calculates ELO rating changes for competitive multiplayer
 * Based on chess ELO system adapted for multiplayer
 */

const K_FACTOR = 32; // Determines rating volatility

/**
 * Calculate ELO change for a match result
 *
 * @param {number} winnerRating - Winner's current ELO
 * @param {number} loserRating - Loser's current ELO
 * @param {boolean} isWin - Whether calculating for winner
 * @returns {number} ELO change value
 */
export const calculateELOChange = (winnerRating, loserRating, isWin) => {
  // Expected score using logistic function
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

  // Actual score (1 for win, 0 for loss)
  const actualScore = isWin ? 1 : 0;

  // ELO change
  const change = K_FACTOR * (actualScore - expectedScore);

  return Math.round(change);
};

/**
 * Calculate new ELO rating
 */
export const calculateNewELO = (currentRating, eloChange) => {
  const newRating = currentRating + eloChange;
  return Math.max(0, newRating); // ELO cannot be negative
};

/**
 * Get player level based on ELO rating
 */
export const getLevelFromELO = (eloRating) => {
  if (eloRating >= 2400) return 'Diamond';
  if (eloRating >= 1800) return 'Platinum';
  if (eloRating >= 1400) return 'Gold';
  if (eloRating >= 1200) return 'Silver';
  return 'Bronze';
};

/**
 * Get level progress (0-100) within current level
 */
export const getLevelProgress = (eloRating) => {
  const levelThresholds = [
    { name: 'Bronze', min: 0, max: 1200 },
    { name: 'Silver', min: 1200, max: 1400 },
    { name: 'Gold', min: 1400, max: 1800 },
    { name: 'Platinum', min: 1800, max: 2400 },
    { name: 'Diamond', min: 2400, max: 3000 },
  ];

  const currentLevel = levelThresholds.find(
    (level) => eloRating >= level.min && eloRating < level.max
  );

  if (!currentLevel) return 0;

  const progress =
    ((eloRating - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * Calculate expected win probability
 */
export const getWinProbability = (playerRating, opponentRating) => {
  const probability =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return (probability * 100).toFixed(1);
};

/**
 * Get achievement badges
 */
export const checkBadges = (stats) => {
  const badges = [];

  if (stats.bestWinStreak >= 5) {
    badges.push({
      name: 'On Fire 🔥',
      description: 'Win streak of 5 or more',
    });
  }

  if (stats.bestWinStreak >= 10) {
    badges.push({
      name: 'Unstoppable 💪',
      description: 'Win streak of 10 or more',
    });
  }

  if (stats.rankedWins >= 50) {
    badges.push({
      name: 'Veteran ⭐',
      description: '50 ranked wins',
    });
  }

  if (stats.rankedWins >= 100) {
    badges.push({
      name: 'Legend 👑',
      description: '100 ranked wins',
    });
  }

  if (stats.eloRating >= 1800) {
    badges.push({
      name: 'Champion 🏆',
      description: 'Platinum rank achieved',
    });
  }

  if (stats.eloRating >= 2400) {
    badges.push({
      name: 'Grandmaster 💎',
      description: 'Diamond rank achieved',
    });
  }

  return badges;
};

export default {
  calculateELOChange,
  calculateNewELO,
  getLevelFromELO,
  getLevelProgress,
  getWinProbability,
  checkBadges,
};
