import { TopicMastery } from '../types';

// --- Configuration Constants ---
const INITIAL_MASTERY_SCORE = 0.3; // Start with a baseline assumption of some knowledge
const MASTERY_THRESHOLD = 0.75; // Score at which a topic is considered "mastered".
const REINFORCE_THRESHOLD = 0.5; // Score below which a topic needs more reinforcement.
const MICRO_LESSON_TRIGGER_THRESHOLD = 0.4; // Score below which a micro-lesson might be shown.

// Weights for the mastery formula M = (A * 0.5) + (C * 0.2) + (L * 0.2) + (R * 0.1)
const WEIGHTS = {
  ACCURACY: 0.5,
  CONFIDENCE: 0.2,
  LIFT: 0.2,
  RECENCY: 0.1,
};

// --- Helper Functions ---

const confidenceToValue = (confidence: 'low' | 'medium' | 'high'): number => {
  switch (confidence) {
    case 'low': return 0.25;
    case 'medium': return 0.6;
    case 'high': return 0.9;
  }
};

const calculateRecencyScore = (history: TopicMastery['history']): number => {
  if (history.length === 0) return 0.5;
  const now = Date.now();
  const recentEvents = history.slice(-5);
  const totalRecency = recentEvents.reduce((acc, event) => {
    const hoursAgo = (now - event.timestamp) / (1000 * 60 * 60);
    // Simple decay function: score is higher for more recent events. Full score if < 1hr ago, half score at 24hrs.
    const recency = Math.max(0, 1 - (hoursAgo / 48));
    return acc + (event.correct ? recency : recency * 0.5); // Correct answers contribute more
  }, 0);
  return Math.min(1, totalRecency / recentEvents.length);
};

// --- Core Engine Logic ---

/**
 * Calculates the updated mastery state for a topic after a new event (e.g., a question).
 * @param event The event that occurred (question result, lesson result).
 * @param currentMastery The current mastery state for the topic, or null if new.
 * @returns The newly calculated TopicMastery object.
 */
export function calculateMasteryForTopic(
  event: { topic: string; correct: boolean; confidence: 'low' | 'medium' | 'high'; lift?: number },
  currentMastery: TopicMastery | null
): TopicMastery {
  const now = new Date().toISOString();
  const baseMastery: TopicMastery = currentMastery || {
    topic: event.topic,
    masteryScore: INITIAL_MASTERY_SCORE,
    trend: 0,
    lastUpdate: now,
    history: [],
  };

  const newHistoryEntry = {
    correct: event.correct,
    timestamp: Date.now(),
    confidence: event.confidence,
    lift: event.lift,
  };
  const newHistory = [...baseMastery.history, newHistoryEntry].slice(-10); // Keep last 10 events

  // Calculate components of the mastery formula
  const accuracyScore = newHistory.filter(h => h.correct).length / newHistory.length;
  const confidenceScore = confidenceToValue(event.confidence);
  
  const liftHistory = newHistory.map(h => h.lift || 0).filter(l => l > 0);
  const avgLiftScore = liftHistory.length > 0 ? liftHistory.reduce((a, b) => a + b, 0) / liftHistory.length : 0;
  
  const recencyScore = calculateRecencyScore(newHistory);

  // Apply the weighted formula
  const newMasteryScore =
    (accuracyScore * WEIGHTS.ACCURACY) +
    (confidenceScore * WEIGHTS.CONFIDENCE) +
    (avgLiftScore * WEIGHTS.LIFT) +
    (recencyScore * WEIGHTS.RECENCY);

  const finalScore = Math.max(0, Math.min(1, newMasteryScore));
  const trend = finalScore - baseMastery.masteryScore;

  return {
    ...baseMastery,
    masteryScore: finalScore,
    trend,
    lastUpdate: now,
    history: newHistory,
  };
}


/**
 * Determines if a micro-lesson should be shown for a topic.
 * The logic is designed to be less intrusive, requiring a clear pattern of
 * weakness before interrupting a practice session.
 * @param mastery The current mastery state for the topic.
 * @returns boolean - True if a lesson should be shown.
 */
export function shouldShowMicroLesson(mastery: TopicMastery | null): boolean {
  // A single data point isn't enough to trigger an intervention.
  // We require at least two interactions to see a pattern.
  if (!mastery || mastery.history.length < 2) {
    return false;
  }
  
  const lastEvent = mastery.history[mastery.history.length - 1];
  
  // We only intervene if the student just made a mistake.
  if (lastEvent.correct) {
    return false;
  }

  // We also don't intervene if their mastery is already at an acceptable level.
  if (mastery.masteryScore >= MICRO_LESSON_TRIGGER_THRESHOLD) {
      return false;
  }
  
  // The main new rule: trigger only if there's a pattern of recent mistakes.
  // We check if at least two of the last few answers for this topic were incorrect.
  const recentHistory = mastery.history.slice(-5);
  const incorrectCount = recentHistory.filter(h => !h.correct).length;
  
  return incorrectCount >= 2;
}


/**
 * Gets the current status of a topic based on its mastery score.
 * @param masteryScore The mastery score (0-1).
 * @returns 'mastered', 'reinforce', or 'active'.
 */
export function getMasteryStatus(masteryScore: number): 'mastered' | 'reinforce' | 'active' {
    if (masteryScore >= MASTERY_THRESHOLD) return 'mastered';
    if (masteryScore < REINFORCE_THRESHOLD) return 'reinforce';
    return 'active';
}