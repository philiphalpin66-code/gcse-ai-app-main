import { StudentAnswer, Question, ExamSession } from '../types';
import { mockAiMarker } from '../utils/mockAiMarker';

/**
 * The internal AI Marker service.
 * This function takes a paper (questions) and student answers, and returns a fully marked paper with feedback.
 * @param questions The questions from the exam paper.
 * @param answers The student's submitted answers.
 * @returns A promise that resolves with the marked paper data.
 */
export const markPaper = async (
  questions: Question[],
  answers: StudentAnswer[]
): Promise<Omit<ExamSession, 'config' | 'questions' | 'answers'>> => {
  console.log("📄 AI Marker Service: Received paper for marking.");
  
  // Simulate network latency or processing time for the batch marking job.
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Call the existing mock marking engine.
  const markingResult = mockAiMarker(answers, questions);
  
  console.log("✅ AI Marker Service: Marking complete.");
  return markingResult;
};
