/**
 * Contains functions for scoring and calculating progress updates.
 */

/**
 * Maps a raw score (0-1) to a mastery delta percentage.
 * This provides a linear scale where 50% is no change, 100% is +10, and 0% is -10.
 * @param score A number between 0 and 1 representing the correctness of an answer.
 * @returns The calculated mastery delta.
 */
export const mapScoreToDelta = (score: number): number => {
  // Maps a [0, 1] score to a [-10, 10] delta.
  return (score - 0.5) * 20;
};

/**
 * Maps a raw score (0-1) to a confidence delta.
 * This provides a tiered change: high scores give a significant boost, low scores a penalty,
 * and scores in the middle have no impact on confidence.
 * @param score A number between 0 and 1.
 * @returns The calculated confidence delta.
 */
export const mapScoreToConfidenceDelta = (score: number): number => {
  if (score >= 0.8) {
    return 10;
  }
  if (score < 0.4) {
    return -10;
  }
  return 0;
};
