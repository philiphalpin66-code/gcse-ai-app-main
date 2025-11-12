import { ExamConfig, Question, User } from '../types';
import { generateQuestionsForBlitzStream } from '../utils/aiService';

interface RetestWeakTopicsArgs {
  user: User;
  weakTopics: string[];
  subject: string;
  board: string;
  spec_code: string;
  topicLimit?: number;
}

export async function retestWeakTopics(args: RetestWeakTopicsArgs): Promise<Question[]> {
    const { user, weakTopics, subject, board, spec_code, topicLimit = 4 } = args;
    console.info(`[studyLoop] Generating retest for user ${user.uid} on topics:`, weakTopics);

    const topicsToRetest = weakTopics.slice(0, topicLimit);
    if (topicsToRetest.length === 0) {
        console.warn("[studyLoop] No weak topics provided for retest.");
        return [];
    }

    const retestConfig: ExamConfig = {
        board,
        subject,
        paper: 'Retest',
        topics: topicsToRetest,
        questionCount: 10, // Approx 40 marks as requested
        type: 'blitz',
        syllabus_version: spec_code,
        paper_name: "Targeted Retest"
    };

    // We don't need mastery data for a focused retest, so pass an empty array
    const questionStream = generateQuestionsForBlitzStream(user, retestConfig, []); 
    const questions: Question[] = [];
    for await (const question of questionStream) {
        questions.push(question);
    }

    console.info(`[studyLoop] Generated ${questions.length} questions for retest.`);
    return questions;
}