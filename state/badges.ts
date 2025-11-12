import { Achievement, AppProgress, Badge, SubjectProgress, TopicProgress } from '../types';

export const ALL_BADGES: Omit<Achievement, 'unlocked'>[] = [
    { id: 'streak_3', title: 'On a Roll', description: 'Maintain a 3-day study streak.', icon: '🥉' },
    { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day study streak.', icon: '🥈' },
    { id: 'streak_21', title: 'Habit Hero', description: 'Maintain a 21-day study streak.', icon: '🥇' },
    { id: 'first_session', title: 'First Steps', description: 'Complete your first practice session.', icon: '🚀' },
    { id: 'first_mock', title: 'Exam Ready', description: 'Complete your first full mock exam.', icon: '📜' },
    { id: 'mastery_80', title: 'Topic Adept', description: 'Achieve 80% mastery in any topic.', icon: '🧠' },
    { id: 'ten_sessions', title: 'Consistent Learner', description: 'Complete 10 study sessions.', icon: '📚' },
    { id: 'ai_tutor', title: 'Curious Mind', description: 'Use the AI Tutor for the first time.', icon: '💡' },
    { id: 'revision_plan', title: 'Planner Pro', description: 'Generate your first revision plan.', icon: '📅' },
    { id: 'perfect_score', title: 'Flawless Victory', description: 'Get a perfect score on a quiz.', icon: '🎯' },
];

/**
 * In a real app, this function would take the user's state and determine which badges are unlocked.
 * For this mock, we'll just unlock a few specific ones.
 * @returns A list of all achievements with their unlocked status.
 */
export const getAchievements = (): Achievement[] => {
    const unlockedIds = ['first_session', 'streak_3', 'streak_7', 'streak_21'];
    return ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: unlockedIds.includes(badge.id)
    }));
};

/**
 * Retrieves a badge's details by its ID.
 */
export const getBadge = (id: string): Badge | null => {
    const badge = ALL_BADGES.find(b => b.id === id);
    return badge ? { ...badge } : null;
};

/**
 * Compares progress before and after an update to determine if any new badges should be awarded.
 * @param progressBefore The AppProgress state before the update.
 * @param progressAfter The AppProgress state after the update.
 * @returns An array of newly awarded Badge objects.
 */
export const shouldAwardBadge = (progressBefore: AppProgress, progressAfter: AppProgress): Badge[] => {
    const awardedBadges: Badge[] = [];

    // Check for topic mastery badges
    const topicMasteryBadge = getBadge('mastery_80');
    if (topicMasteryBadge) {
        let topicMasteryAwarded = false;
        for (const subjectAfter of progressAfter.subjects) {
            const subjectBefore = progressBefore.subjects.find(s => s.id === subjectAfter.id);
            if (!subjectBefore) continue;

            for (const topicAfter of subjectAfter.topics) {
                const topicBefore = subjectBefore.topics.find(t => t.id === topicAfter.id);
                if (!topicBefore) continue;

                // Condition: Topic mastery crosses the 80% threshold
                if (topicAfter.current >= 0.8 && topicBefore.current < 0.8) {
                    topicMasteryAwarded = true;
                    break;
                }
            }
            if (topicMasteryAwarded) break;
        }
        if (topicMasteryAwarded) {
             // To prevent spamming, we only award one "Topic Adept" badge per update session.
             // A real app might track which topics have already earned this badge.
            awardedBadges.push(topicMasteryBadge);
        }
    }

    // Check for subject grade level-up badges
    for (const subjectAfter of progressAfter.subjects) {
        const subjectBefore = progressBefore.subjects.find(s => s.id === subjectAfter.id);
        if (!subjectBefore) continue;

        const gradeAfter = Math.floor(subjectAfter.currentGrade);
        const gradeBefore = Math.floor(subjectBefore.currentGrade);

        // Condition: The whole number of the grade has increased
        if (gradeAfter > gradeBefore) {
            awardedBadges.push({
                id: `grade_up_${subjectAfter.id}_${gradeAfter}`,
                title: `${subjectAfter.name} Grade ${gradeAfter}!`,
                description: `You've reached the next grade level in ${subjectAfter.name}.`,
                icon: '🏆',
            });
        }
    }

    return awardedBadges;
};