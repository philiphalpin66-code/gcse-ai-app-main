// FIX: Replaced deprecated GenerateContentRequest with GenerateContentParameters.
import { GoogleGenAI, Type, Chat, GenerateContentParameters } from '@google/genai';
import { ExamConfig, ExamSession, FeedbackItem, DiagnosticReport, RevisionPlan, MicroLesson, TopicMastery, User, Question, FeedbackStreamChunk, RevisionPlanObject, DailyPlan, StudySession, UserSelections } from '../types';
import { secureGenerateContent, secureGenerateContentStream, secureCreateChat } from './secureAiService';
import { storage } from '../utils/storage';
import { fetchAIOnce } from '../services/aiManager';
import { SUBJECT_DATA, MOCK_PLAN_TEMPLATE } from '../constants';

// --- Type Definitions for AI Schemas ---
const MARK_EXPLANATION_SCHEMA_FULL = {
    type: Type.OBJECT,
    properties: {
        criterion: { type: Type.STRING, description: 'The specific point from the mark scheme being checked.' },
        met: { type: Type.BOOLEAN, description: 'True if the student\'s answer included this point, false otherwise.' },
        mark_value: { type: Type.NUMBER, description: 'The number of marks this point is worth.' }
    },
    required: ['criterion', 'met', 'mark_value']
};
const FEEDBACK_ITEM_SCHEMA_PARTIAL = {
  type: Type.OBJECT,
  properties: {
    questionId: { type: Type.STRING },
    marksAwarded: { type: Type.NUMBER },
    correctness: { type: Type.STRING, enum: ['correct', 'partial', 'incorrect'] },
    feedback: { type: Type.STRING, description: "A 1-2 sentence, encouraging, and constructive feedback for the student." },
    explanation: { type: Type.STRING, description: "A detailed explanation of the correct answer and how to derive it, referencing the mark scheme." },
    explain_marks: { type: Type.ARRAY, items: MARK_EXPLANATION_SCHEMA_FULL, description: 'A breakdown of how marks were awarded against the mark scheme.'}
  },
  required: ['questionId', 'marksAwarded', 'correctness', 'feedback', 'explanation', 'explain_marks']
};
const DIAGNOSTIC_REPORT_SCHEMA_FULL = {
  type: Type.OBJECT,
  properties: {
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 topics or skills the student demonstrated well." },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 specific topics or skills for the student to focus on for improvement." },
    suggestedResources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ['title', 'url']
      },
      description: "A list of 2-3 online resources (e.g., BBC Bitesize, YouTube) relevant to the weaknesses."
    }
  },
  required: ['strengths', 'weaknesses', 'suggestedResources']
};
const FINAL_REPORT_SCHEMA_PARTIAL = {
  type: Type.OBJECT,
  properties: {
    diagnosticReport: DIAGNOSTIC_REPORT_SCHEMA_FULL,
    predictedGrade: { type: Type.STRING, description: "A predicted GCSE grade (e.g., '7', '8', '9') based on the overall performance." },
    motivationalSummary: { type: Type.STRING, description: "A short (2-3 sentence) paragraph of encouraging and motivational summary of the student's performance, written in a friendly and supportive tone. This should be a general comment on their effort and potential."}
  },
  required: ['diagnosticReport', 'predictedGrade', 'motivationalSummary']
};
const QUESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'A unique ID for the question, e.g., "bio-1-1".' },
    questionText: { type: Type.STRING },
    marks: { type: Type.NUMBER },
    markScheme: { type: Type.STRING, description: 'The ideal answer or key points for marking.' },
    topic: { type: Type.STRING, description: 'The specific topic this question covers.' }
  },
  required: ['id', 'questionText', 'marks', 'markScheme', 'topic']
};

const QUESTION_LIST_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: QUESTION_SCHEMA
        }
    },
    required: ['questions']
};


// Helper function to validate the structure of a streamed question object.
function isValidQuestion(q: any): q is Question {
  return (
    q &&
    typeof q.id === 'string' && q.id.length > 0 &&
    typeof q.questionText === 'string' && q.questionText.length > 0 &&
    typeof q.marks === 'number' && q.marks > 0 &&
    typeof q.markScheme === 'string' && q.markScheme.length > 0 &&
    typeof q.topic === 'string' && q.topic.length > 0
  );
}

const safeParseAIResponse = (responseText: string): any => {
   try {
     const clean = responseText
       .replace(/^.*?\{/, '{')      // strip leading chatter
       .replace(/\}[^}]*$/, '}');   // strip trailing chatter
     return JSON.parse(clean);
   } catch (err) {
     console.warn('AI parse error – returning fallback', {error: err, raw: responseText });
     return { error: true, raw: responseText };
   }
};


// --- Question Generation ---

// NEW: Add a non-streaming fallback generator.
export const generatePaper = async (user: User, config: ExamConfig): Promise<{ questions: Question[] }> => {
    const { board, subject, topics, questionCount } = config;
    console.log(`[Fallback] Generating ${questionCount} questions for ${subject}.`);
    const prompt = `
        You are an expert GCSE exam question generator for a UK student.
        Generate EXACTLY ${questionCount} questions based on this spec:
        - Exam Board: ${board}, Subject: ${subject}
        - Topics: ${topics.join(', ')}
        Your response MUST be a single, valid JSON object with a key "questions", which contains an array of question objects.
        Output ONLY the raw JSON object. Do not wrap it in markdown.`;

    const request: GenerateContentParameters = {
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: QUESTION_LIST_SCHEMA
        }
    };
    
    const response = await secureGenerateContent(user, request);
    try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.questions && Array.isArray(parsed.questions)) {
            const validQuestions = parsed.questions.filter(isValidQuestion);
            console.log(`[Fallback] Successfully generated ${validQuestions.length} valid questions.`);
            return { questions: validQuestions };
        }
    } catch (e) {
        console.error("[Fallback] Failed to parse response:", e, response.text);
    }
    return { questions: [] };
};


// The original generator, now renamed to be a private helper for internal use
// FIX: Changed to an async generator function (`async function*`) to allow the use of `yield`.
async function* _generateQuestionsFromAIStream(
  user: User,
  config: ExamConfig,
  topicMastery: TopicMastery[]
): AsyncGenerator<Question> {
  const { board, subject, paper, topics, questionCount } = config;
  const masteryContext = topics.map(topic => {
    const mastery = topicMastery.find(m => m.topic === topic);
    const score = mastery ? mastery.masteryScore.toFixed(2) : 'N/A';
    return `- ${topic} (Mastery: ${score})`;
  }).join('\n');

  const prompt = `
    You are an expert GCSE exam question generator for a UK student. Your top priority is speed.
    
    Session Specification:
    - Exam Board: ${board}, Subject: ${subject}, Paper: ${paper}
    - Total Questions to Generate: EXACTLY ${questionCount}
    - Student's Weaker Topics: ${topics.join(', ')}

    Your Task:
    1.  Immediately generate the first question. It should be a standard question from one of the weaker topics. Do not delay.
    2.  Then, generate the remaining ${questionCount - 1} questions. Adapt their difficulty based on the provided mastery scores, focusing on weaker topics.
    3.  Output each question as a single, complete JSON object.
    4.  You MUST stream the questions as a JSON array. Start with '[' and separate objects with ','. Do not wait for all questions to be ready before streaming the first one.
    5.  Do not include any text outside of the JSON array.
    
    Example Output Stream for 2 questions:
    [
      {"id": "q1", "questionText": "...", "marks": 4, "markScheme": "...", "topic": "Cell Biology"}
      ,
      {"id": "q2", "questionText": "...", "marks": 2, "markScheme": "...", "topic": "Organisation"}
    ]
  `;

  const request: GenerateContentParameters = {
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: QUESTION_SCHEMA
        }
    }
  };

  let questionsYielded = 0;

  try {
      const stream = await secureGenerateContentStream(user, request);
      let buffer = '';
      let objectDepth = 0;
      let inString = false;
      let startIndex = -1;

      for await (const chunk of stream) {
          buffer += chunk.text;
          for (let i = 0; i < buffer.length; i++) {
              const char = buffer[i];
              if (inString) {
                  if (char === '"' && buffer[i - 1] !== '\\') inString = false;
                  continue;
              }
              if (char === '"') inString = true;
              if (char === '{') {
                  if (objectDepth === 0) startIndex = i;
                  objectDepth++;
              } else if (char === '}') {
                  objectDepth--;
                  if (objectDepth === 0 && startIndex !== -1) {
                      const jsonString = buffer.substring(startIndex, i + 1);
                      try {
                          const parsedQuestion = JSON.parse(jsonString);
                          if (isValidQuestion(parsedQuestion)) {
                              yield parsedQuestion;
                              questionsYielded++;
                          }
                      } catch (e) {
                          console.warn("Failed to parse question JSON object from stream:", jsonString, e);
                      }
                      startIndex = -1;
                  }
              }
          }
          if (startIndex === -1) buffer = '';
      }
  } catch (err) {
      console.warn("AI stream generation failed with an error, will attempt fallback.", err);
  }

  // Fallback Logic: If the stream failed or produced no valid questions, use the standard generator.
  if (questionsYielded === 0) {
      console.warn("Stream yielded no valid questions. Triggering fallback generator.");
      try {
          const fallback = await generatePaper(user, config);
          if (fallback.questions && fallback.questions.length > 0) {
              for (const question of fallback.questions) {
                  yield question;
              }
          }
      } catch (fallbackError) {
          console.error("Fallback question generation also failed:", fallbackError);
          // Generator will end here, yielding nothing further. Priming questions will still be visible.
      }
  }
}

// New public-facing generator with caching logic
export async function* generateQuestionsForBlitzStream(
  user: User,
  config: ExamConfig,
  topicMastery: TopicMastery[]
): AsyncGenerator<Question> {
    const createQuestionCacheKey = (config: ExamConfig): string => {
        const topicsString = config.topics.sort().join('-');
        return `${config.subject}_${topicsString}_mock`;
    };

    const cacheKey = createQuestionCacheKey(config);
    const cachedQuestions = storage.get<Question[] | null>(cacheKey, null);

    if (cachedQuestions && cachedQuestions.length > 0) {
        console.log(`CACHE HIT for key: ${cacheKey}`);
        for (const question of cachedQuestions) {
            yield question;
        }
        return;
    }

    console.log(`CACHE MISS for key: ${cacheKey}. Generating new questions.`);
    const aiStream = _generateQuestionsFromAIStream(user, config, topicMastery);
    const newQuestions: Question[] = [];
    for await (const question of aiStream) {
        newQuestions.push(question);
        yield question;
    }

    if (newQuestions.length > 0) {
        const questionsToCache = newQuestions.slice(0, 10);
        storage.set(cacheKey, questionsToCache);
        console.log(`CACHED ${questionsToCache.length} questions for key: ${cacheKey}`);
    }
}


// --- Feedback Generation ---

// FIX: Changed to an async generator function (`async function*`) to allow the use of `yield`.
export async function* generateFeedbackStream(
    user: User,
    session: ExamSession
): AsyncGenerator<FeedbackStreamChunk> {
    const { config, questions, answers } = session;
    const answersString = questions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return `Q ID: ${q.id}, Topic: ${q.topic}, Q: "${q.questionText}" (${q.marks} marks), Mark Scheme: "${q.markScheme}", Student Answer: "${answer?.answerText || ''}"`;
    }).join('\n---\n');

    const prompt = `You are an expert GCSE examiner AI. Your task is to mark a student's test and provide feedback.

    Exam Context: ${config.board} ${config.subject} ${config.paper}.
    Student's Answers:
    ${answersString}

    Your Instructions:
    1.  Mark EACH question individually against its mark scheme.
    2.  For EACH question, stream a single JSON object with the feedback. This JSON MUST conform to the FEEDBACK_ITEM_SCHEMA.
    3.  After marking ALL questions, generate a final summary report as ONE final JSON object that conforms to the FINAL_REPORT_SCHEMA.
    4.  You MUST stream the entire response as a sequence of JSON objects. Do not wrap them in an array. Do not add any text, explanations, or delimiters between the JSON objects.
    
    Example Output stream for 1 question and a report:
    {"questionId": "q1", ...}
    {"diagnosticReport": {...}, ...}

    FEEDBACK_ITEM_SCHEMA: ${JSON.stringify(FEEDBACK_ITEM_SCHEMA_PARTIAL)}
    FINAL_REPORT_SCHEMA: ${JSON.stringify(FINAL_REPORT_SCHEMA_PARTIAL)}
    `;

    const request = { model: 'gemini-2.5-pro', contents: { parts: [{ text: prompt }] } };
    const stream = await secureGenerateContentStream(user, request);
    
    let buffer = '';
    let braceCount = 0;
    let inString = false;

    for await (const chunk of stream) {
        buffer += chunk.text;
        let start = 0;
        for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            if (inString) {
                if (char === '"' && buffer[i - 1] !== '\\') inString = false;
            } else {
                if (char === '"') inString = true;
                else if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
            }

            if (braceCount === 0 && start < i) {
                const potentialJson = buffer.substring(start, i + 1).trim();
                if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
                    try {
                        const parsed = JSON.parse(potentialJson);
                        if (parsed.questionId) {
                            const q = questions.find(q => q.id === parsed.questionId);
                            const a = answers.find(a => a.questionId === parsed.questionId);
                            if(q && a) {
                                const fullFeedbackItem: FeedbackItem = {
                                    ...parsed,
                                    questionText: q.questionText, maxMarks: q.marks, correctAnswer: q.markScheme,
                                    studentAnswer: a.answerText || '', imageUrl: q.imageUrl, referenceText: q.referenceText,
                                    topic: q.topic || 'Unknown',
                                    resources: q.resources,
                                    diagram_description: q.diagram_description
                                };
                                yield { type: 'feedback_item', data: fullFeedbackItem };
                            }
                        } else if (parsed.diagnosticReport) {
                            yield { type: 'report', data: parsed };
                        }
                        start = i + 1;
                    } catch (e) {
                         // Incomplete JSON, wait for more data
                    }
                }
            }
        }
        buffer = buffer.substring(start);
    }
}


// --- Other AI Services ---

export const generateAdaptiveHint = async (user: User, context: any): Promise<{ hint: string }> => {
  const cacheKey = `adaptive-hint:${btoa(context.question + context.student_answer)}`;
  const fetchFn = async () => {
    const prompt = `You are an AI Tutor. A student needs a hint. Provide a short, guiding hint (1-2 sentences) to help them improve.
      Context - Q: "${context.question}", Student's Answer: "${context.student_answer}".`;
    const response = await secureGenerateContent(user, { model: 'gemini-2.5-flash', contents: {parts: [{text: prompt}]} });
    return { hint: response.text.trim() };
  };
  return fetchAIOnce(cacheKey, fetchFn);
};

const getFallbackPlanObject = (): RevisionPlanObject => {
    console.warn("AI parse error – returning fallback revision plan.");
    return {
        isFallback: true,
        days: [
            { day: 1, topic: 'Fallback Plan: Core Concepts', tasks: [{ type: 'review', description: 'Review the main definitions for your weakest topic.' }] },
            { day: 2, topic: 'Fallback Plan: Practice', tasks: [{ type: 'practice', description: 'Complete 5 practice questions on this topic.' }] },
            { day: 3, topic: 'Fallback Plan: Consolidate', tasks: [{ type: 'read', description: 'Read a study guide summary of the topic.' }] }
        ]
    };
};


export const generateRevisionPlan = async (user: User, report: DiagnosticReport): Promise<RevisionPlanObject> => {
    const cacheKey = `revision-plan:${report.weaknesses.sort().join(',')}`;
    const fetchFn = async () => {
        const prompt = `You are an expert curriculum planner. Create a 7-day revision plan for a GCSE student with these weaknesses: ${report.weaknesses.join(', ')}.
Your response MUST be a single, valid JSON object with a single key "days", which contains an array of 7 daily plan objects.
Output ONLY the raw JSON object. DO NOT wrap it in markdown \`\`\`json tags. DO NOT add any introductory or concluding text.`;
    
        const response = await secureGenerateContent(user, {
            model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }]},
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        days: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.NUMBER },
                                    topic: { type: Type.STRING },
                                    tasks: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                type: { type: Type.STRING, enum: ['review', 'practice', 'watch', 'read'] },
                                                description: { type: Type.STRING }
                                            },
                                            required: ['type', 'description']
                                        }
                                    }
                                },
                                required: ['day', 'topic', 'tasks']
                            }
                        }
                    },
                    required: ['days']
                }
            }
        });

        console.log('AI Study Plan raw response:', response.text);
        const planData = safeParseAIResponse(response.text);

        if (planData.error || !planData?.days?.length) {
            return getFallbackPlanObject();
        }
    
        return planData as RevisionPlanObject;
    };
    return fetchAIOnce(cacheKey, fetchFn);
};

export const generateMicroLesson = async (user: User, topic: string, questionContext: string): Promise<MicroLesson> => {
  const cacheKey = `micro-lesson:${topic}:${btoa(questionContext)}`;
  const fetchFn = async () => {
    const lessonId = `lesson_${topic.replace(/\s+/g, '_')}_${Date.now()}`;
    const prompt = `Generate a 90-second "micro-lesson" on the GCSE topic: "${topic}". The student just answered this question incorrectly: "${questionContext}". The output must be a JSON object conforming to the schema. The unique "id" field MUST be set to "${lessonId}".`;
    
    const response = await secureGenerateContent(user, {
        model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }]},
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            core: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            slip: { type: Type.STRING },
            cue: { type: Type.STRING },
            check: {
                type: Type.OBJECT,
                properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                rationale: { type: Type.STRING }
                },
                required: ['question', 'options', 'answer', 'rationale']
            }
            },
            required: ['id', 'topic', 'core', 'steps', 'slip', 'cue', 'check']
        }
        }
    });
    return JSON.parse(response.text.trim()) as MicroLesson;
  };
  return fetchAIOnce(cacheKey, fetchFn);
};

export const generateProfileInsight = async (user: User, masteryData: TopicMastery[]): Promise<string> => {
    if (masteryData.length === 0) {
        return "Start a practice session to get your first insights!";
    }

    const masterySummaryForCacheKey = masteryData
        .sort((a, b) => a.masteryScore - b.masteryScore)
        .slice(0, 5)
        .map(m => `${m.topic}:${m.masteryScore.toFixed(2)}`)
        .join(',');
    const cacheKey = `profile-insight:${masterySummaryForCacheKey}`;

    const fetchFn = async () => {
        const masterySummary = masteryData
            .sort((a, b) => a.masteryScore - b.masteryScore)
            .slice(0, 5)
            .map(m => `- ${m.topic}: ${Math.round(m.masteryScore * 100)}% mastery`)
            .join('\n');

        const prompt = `
            You are an encouraging AI Coach for a UK GCSE student.
            Based on the following summary of their weakest topics, provide a single, actionable, and encouraging insight (one sentence, max 25 words) for what they should focus on next. Be positive and specific.
            Output ONLY the sentence. Do not add conversational filler like "Here is your insight:".

            Weakest Topics:
            ${masterySummary}
        `;

        const response = await secureGenerateContent(user, {
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
        });
        
        const aiResponse = response.text;
        return aiResponse
            .replace(/^(Here is|Here's|Sure,|Okay,|Let me)/i, '')
            .trim();
    };

    return fetchAIOnce(cacheKey, fetchFn);
};

export const generateOnboardingTourIntro = async (user: User): Promise<string> => {
    const cacheKey = `onboarding-tour-intro:${user.locale}`;
    const fetchFn = async () => {
        const prompt = `
            You are an encouraging AI Coach for a UK GCSE student who is seeing the app for the first time.
            Provide a single, welcoming, and exciting sentence (max 20 words) to introduce the main features of the app.
            Be positive and inspiring.
            Output ONLY the sentence. Do not add conversational filler like "Here is your tour intro:".
        `;

        const response = await secureGenerateContent(user, {
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
        });
        
        const aiResponse = response.text;
        return aiResponse
            .replace(/^(Here is|Here's|Sure,|Okay,|Let me)/i, '')
            .trim();
    };
    return fetchAIOnce(cacheKey, fetchFn);
};


// --- Chat Service ---
export const createChatInstance = (user: User, systemInstruction: string): Chat => {
  return secureCreateChat(user, {
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
};

// --- Planner Service ---
const STUDY_SESSION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING },
        duration: { type: Type.NUMBER, description: 'Duration in minutes, e.g., 30, 45, 60.' },
        color: { type: Type.STRING, enum: ['blue', 'green', 'magenta', 'amber', 'default'] },
        objective: { type: Type.STRING, description: 'A short, actionable goal for the session.' },
        tip: { type: Type.STRING, description: 'A single, concise tip to help the student.' }
    },
    required: ['subject', 'duration', 'color', 'objective', 'tip']
};

const DAILY_PLAN_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.STRING, description: 'Abbreviated day of the week, e.g., "Thu".' },
        date: { type: Type.NUMBER, description: 'The numerical date of the month.' },
        sessions: {
            type: Type.ARRAY,
            items: STUDY_SESSION_SCHEMA
        }
    },
    required: ['day', 'date', 'sessions']
};

const generateSimpleFallbackPlan = (count: number, startDay: number): DailyPlan[] => {
    const fallbackDays: DailyPlan[] = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < count; i++) {
        const dayNumber = startDay + i;
        const dayIndex = dayNumber - 1;

        if (dayIndex >= 0 && dayIndex < weekdays.length) {
            fallbackDays.push({
                day: weekdays[dayIndex], // FIX: Use correct day name
                date: dayNumber,
                sessions: [ // FIX: Add a visible fallback session
                    {
                        subject: 'Review',
                        duration: 45,
                        color: 'default',
                        objective: 'AI Plan Unavailable',
                        tip: 'Could not generate a personalized plan. Try reviewing your notes for your weakest subject.'
                    }
                ],
            });
        }
    }
    return fallbackDays;
};

export const generateRestOfWeekPlan = async (user: User, userSelections: UserSelections, existingPlan: DailyPlan[]): Promise<DailyPlan[]> => {
    const selectedSubjects = Object.keys(userSelections)
        .map(id => SUBJECT_DATA.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(', ');

    const existingPlanSummary = existingPlan.map(d => `${d.day}: ${d.sessions.map(s => s.subject).join(', ')}`).join('; ');
    const nextDayInfo = { day: 'Thu', date: 4 }; // Simple logic for demo

    const prompt = `
        You are an expert GCSE study planner for a UK student.
        The student's subjects are: ${selectedSubjects}.
        Their plan for the week so far is: ${existingPlanSummary}.

        Your task is to generate a study plan for the rest of the 7-day week, starting from ${nextDayInfo.day}.
        Create a plan for Thursday, Friday, Saturday, and Sunday.
        - Intelligently interleave the student's subjects, avoiding too much of one subject on consecutive days.
        - Ensure a mix of activities.
        - Include at least one 'Rest' or 'Review' session.
        - For each session, provide a realistic objective and a helpful tip.
        
        The output MUST be a single, valid JSON object with a key "days", which contains an array of exactly 4 daily plan objects.
        Output ONLY the raw JSON object. Do not wrap it in markdown.
    `;

    const response = await secureGenerateContent(user, {
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    days: {
                        type: Type.ARRAY,
                        items: DAILY_PLAN_SCHEMA
                    }
                },
                required: ['days']
            }
        }
    });

    try {
        const rawText = response.text;
        const cleanedText = rawText
            .replace(/^```json/, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();
        
        const parsed = JSON.parse(cleanedText);

        if (parsed.days && Array.isArray(parsed.days)) {
            return parsed.days as DailyPlan[];
        }
        throw new Error("Parsed JSON did not contain a 'days' array.");
    } catch (err) {
        console.warn("AI plan parse failed, using mock fallback:", err);
        const startDay = existingPlan.length > 0 ? existingPlan[existingPlan.length - 1].date + 1 : 1;
        return generateSimpleFallbackPlan(4, startDay);
    }
};