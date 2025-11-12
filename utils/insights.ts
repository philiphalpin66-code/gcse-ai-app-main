import { AppProgress } from '../types';
import { computeSubjectMomentum } from './momentum';

const MAX_INSIGHT_LENGTH = 120; // Increased length slightly for more descriptive insights

// Helper to truncate strings to ensure they fit nicely in the UI
const truncate = (str: string): string => {
    if (str.length <= MAX_INSIGHT_LENGTH) return str;
    // Find the last space to avoid cutting words
    const lastSpace = str.lastIndexOf(' ', MAX_INSIGHT_LENGTH - 3);
    if (lastSpace > 0) {
        return str.substring(0, lastSpace) + '...';
    }
    return str.substring(0, MAX_INSIGHT_LENGTH - 3) + '...';
};

/**
 * Generates 2-3 personalized study insights based on simple heuristics.
 * @param progress The student's current progress state.
 * @returns An array of string-based insights.
 */
export const getInsights = (progress: AppProgress): string[] => {
    const insights: string[] = [];
    const allEvents = progress.events || [];

    // --- Fallback Check ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hasRecentEvents = allEvents.some(event => new Date(event.ts) >= sevenDaysAgo);

    if (!hasRecentEvents && progress.subjects.length > 0) {
        let weakestTopicName = 'your lowest topic';
        let weakestSubjectName = progress.subjects[0].name;

        // Find absolute weakest topic for the fallback message
        let absoluteWeakestTopic: { name: string, current: number, subject: string } | null = null;
        progress.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                if (!absoluteWeakestTopic || topic.current < absoluteWeakestTopic.current) {
                    absoluteWeakestTopic = { ...topic, subject: subject.name };
                }
            });
        });
        if (absoluteWeakestTopic?.name) {
            weakestTopicName = `'${absoluteWeakestTopic.name}'`;
        }

        return [truncate(`Quick win: do a 5-min mock in ${weakestTopicName} to get back on track.`)];
    }
    
    // --- Insight Generation ---

    // 1. Find the fastest rising subject
    let fastestMover = { name: '', momentum: 0.05 }; // Use 0.05 as the floor
    for (const subject of progress.subjects) {
        const momentum = computeSubjectMomentum(subject.name, allEvents);
        if (momentum > fastestMover.momentum) {
            fastestMover = { name: subject.name, momentum };
        }
    }
    if (fastestMover.name) {
        insights.push(truncate(`Your hard work in ${fastestMover.name} is paying off. Keep up the momentum!`));
    }

    // 2. Find the weakest topic
    let weakestTopicWithLowConfidence: { name: string; current: number; subject: string } | null = null;
    let absoluteWeakestTopic: { name: string; current: number; subject: string } | null = null;

    progress.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
            // First pass: look for low mastery and low confidence
            if (topic.confidence < 0.65) {
                if (!weakestTopicWithLowConfidence || topic.current < weakestTopicWithLowConfidence.current) {
                    weakestTopicWithLowConfidence = { ...topic, subject: subject.name };
                }
            }
            // Always track the absolute weakest topic as a fallback
            if (!absoluteWeakestTopic || topic.current < absoluteWeakestTopic.current) {
                absoluteWeakestTopic = { ...topic, subject: subject.name };
            }
        });
    });

    const targetTopic = weakestTopicWithLowConfidence || absoluteWeakestTopic;
    if (targetTopic) {
        insights.push(truncate(`Focus on '${targetTopic.name}' in ${targetTopic.subject}. A quick blitz could help!`));
    }
    
    // 3. Add a streak nudge
    if (progress.streak > 0) {
        const subjectForNudge = absoluteWeakestTopic ? absoluteWeakestTopic.subject : (progress.subjects[0]?.name || 'a subject');
        insights.push(truncate(`Protect your ${progress.streak}-day streak with a 5-min ${subjectForNudge} quiz.`));
    }

    // 4. Add a generic tip if we still don't have enough insights
    if (insights.length < 2 && progress.subjects.length > 0) {
        const randomSubject = progress.subjects[Math.floor(Math.random() * progress.subjects.length)];
        insights.push(truncate(`Consider starting a flashcard session for ${randomSubject.name} to reinforce key concepts.`));
    }

    // Return a maximum of 3 insights to keep the list concise
    return insights.slice(0, 3);
};