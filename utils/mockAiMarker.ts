import { StudentAnswer, Question, FeedbackItem, DiagnosticReport, ExamSession } from '../types';

// A collection of AI-style feedback phrases to make the mock feedback more realistic.
const FEEDBACK_PHRASES = {
  correct: [
    "Excellent work! Your answer is comprehensive and hits all the key points from the mark scheme.",
    "Perfect! You've clearly mastered this topic. Your explanation is clear and accurate.",
    "Spot on! A well-structured answer that demonstrates a strong understanding of the material.",
  ],
  partial: [
    "This is a good start, but you could add more detail about a key concept to secure full marks.",
    "You're on the right track! To improve, try to elaborate on the core idea.",
    "A solid attempt. You've grasped the main idea, but remember to include specific terminology from the mark scheme next time.",
    "You've covered some of the important points, but your explanation is missing a crucial element.",
  ],
  incorrect: [
    "It seems there's some confusion here. The question is asking about a specific topic, but your answer focuses on something else.",
    "Not quite. It's important to review the definitions related to this topic. Let's break it down.",
    "This answer doesn't align with the mark scheme. Let's look at the key concepts for this topic again.",
  ],
};

const getCorrectness = (marksAwarded: number, totalMarks: number): 'correct' | 'partial' | 'incorrect' => {
    const percentage = totalMarks > 0 ? (marksAwarded / totalMarks) * 100 : 0;
    if (percentage >= 99) return 'correct'; // Use >= 99 to handle floating point
    if (percentage === 0) return 'incorrect';
    return 'partial';
};

/**
 * Simulates an AI marking engine by evaluating student answers against questions.
 * This is a placeholder for a real Gemini API call.
 * @param answers The student's submitted answers.
 * @param questions The questions from the exam paper.
 * @returns A partial ExamSession object with detailed feedback, diagnostics, and scores.
 */
export const mockAiMarker = (answers: StudentAnswer[], questions: Question[]): Omit<ExamSession, 'config' | 'questions' | 'answers'> => {
  let totalMarks = 0;
  
  const feedbackItems: FeedbackItem[] = questions.map(q => {
    const answer = answers.find(a => a.questionId === q.id);
    const answerText = answer?.answerText.trim() || '';

    // --- Mock Scoring Logic ---
    let marksAwarded = 0;
    const answerWordCount = answerText.split(/\s+/).filter(Boolean).length;

    if (answerWordCount > 2) {
        // Award marks based on answer length relative to an arbitrary target
        const targetLength = 30; // A simple proxy for a detailed answer
        const lengthRatio = Math.min(answerWordCount / targetLength, 1);
        
        // Use a non-linear scale to make it feel more realistic
        marksAwarded = Math.round(Math.pow(lengthRatio, 0.7) * q.marks);

        // Bonus point for using a keyword (simple simulation)
        const keywords = q.markScheme.toLowerCase().split(' ').slice(0, 3); // Use first 3 words of mark scheme as keywords
        if (keywords.some(kw => answerText.toLowerCase().includes(kw)) && marksAwarded < q.marks) {
            marksAwarded += 1;
        }
    }
    marksAwarded = Math.min(marksAwarded, q.marks); // Cap marks at the max for the question
    totalMarks += marksAwarded;
    // --- End Mock Scoring Logic ---

    const correctness = getCorrectness(marksAwarded, q.marks);
    
    // Select a random feedback phrase based on correctness
    const phrases = FEEDBACK_PHRASES[correctness];
    const feedbackText = phrases[Math.floor(Math.random() * phrases.length)];

    const explanationText = `To achieve full marks (${q.marks}), your answer should have included the following points based on the mark scheme: "${q.markScheme}". Your answer was awarded ${marksAwarded} marks because it demonstrated a ${correctness} understanding of the topic.`;

    return {
      questionId: q.id,
      questionText: q.questionText,
      studentAnswer: answerText,
      marksAwarded,
      maxMarks: q.marks,
      correctness,
      feedback: feedbackText,
      explanation: explanationText,
      correctAnswer: q.markScheme,
      imageUrl: q.imageUrl,
      referenceText: q.referenceText,
      topic: q.topic,
      resources: q.resources,
      diagram_description: q.diagram_description,
    };
  });
  
  const totalPossibleMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const percentage = totalPossibleMarks > 0 ? (totalMarks / totalPossibleMarks) * 100 : 0;
  
  let predictedGrade = 'U';
  if (percentage > 85) predictedGrade = '9';
  else if (percentage > 75) predictedGrade = '8';
  else if (percentage > 65) predictedGrade = '7';
  else if (percentage > 55) predictedGrade = '6';
  else if (percentage > 45) predictedGrade = '5';
  else if (percentage > 35) predictedGrade = '4';
  else if (percentage > 25) predictedGrade = '3';
  else if (percentage > 15) predictedGrade = '2';
  else if (percentage > 5) predictedGrade = '1';

  const diagnosticReport: DiagnosticReport = {
    strengths: ["Good time management on the paper.", "Attempted all available questions, leaving nothing blank."],
    weaknesses: ["Lacking specific detail in longer-answer questions.", "Improve use of scientific terminology to match the mark scheme."],
    suggestedResources: [
      { title: "GCSE Bitesize - Key Terminology Guide", url: "https://www.bbc.co.uk/bitesize/topics/z4843j6" },
      { title: "Seneca Learning - Exam Technique", url: "https://senecalearning.com/" },
    ],
  };

  return { feedback: feedbackItems, diagnosticReport, totalMarks, predictedGrade };
};