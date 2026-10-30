const LEVELS = ['Easy', 'Medium', 'Hard'];

function nextDifficulty(current, correctStreak, incorrectStreak) {
  const found = LEVELS.indexOf(current);
  const index = found < 0 ? 1 : found;
  if (correctStreak >= 2) return LEVELS[Math.min(index + 1, 2)];
  if (incorrectStreak >= 2) return LEVELS[Math.max(index - 1, 0)];
  return LEVELS[index];
}

function difficultyDistance(a, b) {
  return Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(b));
}

module.exports = { LEVELS, nextDifficulty, difficultyDistance };
