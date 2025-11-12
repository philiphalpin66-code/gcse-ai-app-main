import { StudentState, NextAction } from '../types';
import { getSubjectForTopic } from './subjectHelpers';
import { TOPICS, SUBJECT_DATA } from '../constants';

const getTopicsForSubject = (subjectName: string): string[] => {
    const board = 'AQA'; // Assuming AQA for simplicity
    const subjects = TOPICS[board];
    const subjectData = Object.entries(subjects).find(([name]) => name === subjectName);
    if (!subjectData) return [];

    const papers = subjectData[1];
    return Object.values(papers).flat();
};

const getMessageTemplate = (action: NextAction): string => {
    const templates = {
        quiz: [
            `You're making great progress in ${action.subject}! Let's tackle a quick ${action.difficulty} quiz on ${action.topic}.`,
            `Time for a quick challenge. How about a few questions on ${action.topic}?`,
            `Let's build on your momentum. A short quiz on ${action.topic} is next.`,
        ],
        flashcards: [
            `Quick win: let’s do 10 ${action.subject} cards on ${action.topic}. Should only take a few minutes!`,
            `Time for a speedy review. Let's run through some flashcards for ${action.topic}.`,
            `Let's lock in that knowledge. A flashcard session for ${action.topic} is up next.`,
        ],
        mock: [
            `You're ready for a bigger challenge. Let's try some exam-style questions on ${action.topic}.`,
            `Time to test your knowledge under pressure. A mini-mock on ${action.topic} awaits.`,
        ],
        coachChat: [
            `It looks like ${action.topic} was a bit tricky. Let’s review that topic together.`,
            `No worries, let's break down ${action.topic} with the AI Coach.`,
        ],
        review: [
            `Let's take a look at your progress. You've been working hard!`,
            `Time for a progress check-in. Let's see how far you've come.`,
        ],
    };

    const choices = templates[action.type] || templates.quiz;
    return choices[Math.floor(Math.random() * choices.length)];
};


export const getNextAction = (studentState: StudentState): NextAction => {
    // Rule 5️⃣: Motivational Layer (Trial Day 6)
    if (studentState.trialDaysLeft === 1) {
        const topics = Object.keys(studentState.mastery);
        const totalMasteryNow = topics.reduce((sum, topic) => sum + (studentState.mastery[topic] || 0), 0);
        const totalMasteryBefore = topics.reduce((sum, topic) => {
            const currentMastery = studentState.mastery[topic] || 0;
            const delta = studentState.masteryDelta?.[topic] || 0;
            return sum + (currentMastery - delta);
        }, 0);
        const avgGain = (totalMasteryNow - totalMasteryBefore) / (topics.length || 1);


        return {
            type: 'review',
            subject: 'Progress',
            topic: 'Summary',
            difficulty: 'medium',
            message: `You've boosted mastery by ${avgGain.toFixed(0)}% and hit a ${studentState.streak}-day streak! Let's review your progress.`
        };
    }

    // Rule 3️⃣: AI Feedback Loop (Confidence Drop)
    // FIX: Added a type guard to ensure `lastActivity` is an object before accessing its properties.
    if (studentState.lastActivity && typeof studentState.lastActivity === 'object' && studentState.confidenceDelta) {
        const lastTopic = studentState.lastActivity.topic;
        const confidenceChange = studentState.confidenceDelta[lastTopic];
        if (confidenceChange && confidenceChange < -15) {
             return {
                type: 'coachChat',
                subject: studentState.lastActivity.subject,
                topic: lastTopic,
                difficulty: 'easy',
                message: getMessageTemplate({ type: 'coachChat', subject: studentState.lastActivity.subject, topic: lastTopic, difficulty: 'easy', message: '' })
            };
        }
    }
    
    // Rule 1️⃣ & 4️⃣: Daily Goal & Interleaving
    let sortedSubjects = [...studentState.subjects]
        .map(subjectId => {
            const subjectInfo = SUBJECT_DATA.find(s => s.id === subjectId);
            if (!subjectInfo) return null;
            
            const subjectTopics = getTopicsForSubject(subjectInfo.name);
            if (subjectTopics.length === 0) return null;
            
            const topicMasteries = subjectTopics.map(t => studentState.mastery[t] || 0);
            const avgMastery = topicMasteries.length > 0 ? topicMasteries.reduce((a, b) => a + b, 0) / topicMasteries.length : 0;
            
            const topicConfidences = subjectTopics.map(t => studentState.confidence[t] || 0);
            const avgConfidence = topicConfidences.length > 0 ? topicConfidences.reduce((a, b) => a + b, 0) / topicConfidences.length : 0;

            return { name: subjectInfo.name, mastery: avgMastery, confidence: avgConfidence };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => a.mastery - b.mastery); // Sort by lowest mastery first

    if (sortedSubjects.length === 0) {
        return { type: 'quiz', subject: 'General', topic: 'Mixed', difficulty: 'easy', message: "Let's start with some general questions to find your strengths!" };
    }

    let chosenSubject = sortedSubjects[0];

    // Interleaving Rule: Don't repeat subject unless mastery < 30%
    // FIX: Added a type guard to ensure `lastActivity` is an object before accessing its properties.
    if (studentState.lastActivity && typeof studentState.lastActivity === 'object' && chosenSubject.name === studentState.lastActivity.subject && chosenSubject.mastery >= 30 && sortedSubjects.length > 1) {
        chosenSubject = sortedSubjects[1];
    }
    
    const topicsForChosenSubject = getTopicsForSubject(chosenSubject.name);
    const chosenTopic = topicsForChosenSubject
        .map(topic => ({ name: topic, mastery: studentState.mastery[topic] || 0 }))
        .sort((a, b) => a.mastery - b.mastery)[0];

    const topicMastery = chosenTopic.mastery;

    // Rule 2️⃣: Adaptive Difficulty
    const difficulty: "easy" | "medium" | "hard" =
        topicMastery < 40 ? 'easy' :
        topicMastery < 70 ? 'medium' :
        'hard';

    // Determine activity type
    const type: NextAction['type'] =
        topicMastery < 50 ? 'quiz' :
        topicMastery < 75 ? 'flashcards' :
        'mock';

    const action: NextAction = {
        type,
        subject: chosenSubject.name,
        topic: chosenTopic.name,
        difficulty,
        message: '' // will be replaced by template
    };
    
    // Rule 6️⃣: AI Message Templates
    action.message = getMessageTemplate(action);

    return action;
};
