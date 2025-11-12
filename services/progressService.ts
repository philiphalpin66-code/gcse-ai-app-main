import { db } from '../firebase/config';
import { ExamSession } from '../types';

// Helper to derive weak topics from a marking result
const getWeakTopics = (feedback: any[]): string[] => {
    const topicScores: { [topic: string]: { awarded: number; available: number } } = {};

    feedback.forEach(item => {
        if (!topicScores[item.topic]) {
            topicScores[item.topic] = { awarded: 0, available: 0 };
        }
        topicScores[item.topic].awarded += item.marksAwarded;
        topicScores[item.topic].available += item.maxMarks;
    });

    const weakTopics: string[] = [];
    for (const topic in topicScores) {
        const { awarded, available } = topicScores[topic];
        if (available > 0 && (awarded / available) < 0.6) {
            weakTopics.push(topic);
        }
    }
    return weakTopics;
};


interface UpdateUserProgressArgs {
  results: Omit<ExamSession, 'config' | 'questions' | 'answers'>;
  userId: string;
  paperMeta?: {
    subject: string;
    board: string;
    spec_code: string;
    paper_name?: string;
  };
}

export async function updateUserProgress(args: UpdateUserProgressArgs) {
    const { results, userId, paperMeta } = args;

    const total_marks_awarded = results.totalMarks;
    const total_marks_available = results.feedback.reduce((sum: number, item: any) => sum + item.maxMarks, 0);
    const scorePercent = total_marks_available > 0 ? parseFloat(((total_marks_awarded / total_marks_available) * 100).toFixed(1)) : 0;
    
    const weakTopics = getWeakTopics(results.feedback);
    const timestamp = new Date().toISOString();

    const summary = {
        userId,
        subject: paperMeta?.subject,
        board: paperMeta?.board,
        spec_code: paperMeta?.spec_code,
        paper_name: paperMeta?.paper_name,
        total_marks_awarded,
        total_marks_available,
        scorePercent,
        predictedGrade: results.predictedGrade,
        weakTopics,
        timestamp,
    };

    // The mock firestore doesn't support nested collections, so we simulate it.
    try {
        await db.collection(`users/${userId}/progress`).add(summary);
        console.info(`[progressService] Successfully wrote progress for user ${userId} to Firestore.`);
    } catch (error) {
        console.error(`[progressService] Failed to write progress for user ${userId}:`, error);
    }
    
    // Return the summary needed by the context
    return {
        scorePercent,
        predictedGrade: results.predictedGrade,
        weakTopics,
        subject: paperMeta?.subject,
        board: paperMeta?.board,
        spec_code: paperMeta?.spec_code,
        timestamp,
    };
}