// types.ts

export type SessionType = 'blitz' | 'flashcards' | 'mock' | 'coach';

export interface User {
  uid: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  class_ids: string[];
  institution_id: string;
  locale: 'en-GB' | 'en-US';
}

export interface UserSelections {
  [subjectId: string]: string; // e.g. { maths: 'AQA', biology: 'Edexcel' }
}

export interface OnboardingData {
    goal: 'improve_grade' | 'stay_organised' | 'feel_confident';
    selections: UserSelections;
    name: string;
    avatar: string;
    targetGrade: string;
}

export interface ExamConfig {
  board: string;
  subject: string;
  paper: string;
  topics: string[];
  questionCount: number;
  type: SessionType | 'blitz';
  syllabus_version: string;
  paper_name?: string; // For identifying retests
}

export interface Question {
  id: string;
  questionText: string;
  marks: number;
  markScheme: string;
  topic: string;
  imageUrl?: string;
  referenceText?: string;
  resources?: Array<{ type: string; title?: string; content?: string; image_url?: string }>;
  diagram_description?: string;
}

export interface StudentAnswer {
  questionId: string;
  answerText: string;
}

export interface MarkExplanation {
    criterion: string;
    met: boolean;
    mark_value: number;
}

export interface FeedbackItem {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  correctness: 'correct' | 'partial' | 'incorrect';
  feedback: string;
  explanation: string;
  correctAnswer: string;
  imageUrl?: string;
  referenceText?: string;
  topic: string;
  explain_marks?: MarkExplanation[];
  resources?: Array<{ type: string; title?: string; content?: string; image_url?: string }>;
  diagram_description?: string;
}

export interface SavedQuestion extends FeedbackItem {}

export interface SuggestedResource {
  title: string;
  url: string;
}

export interface DiagnosticReport {
  strengths: string[];
  weaknesses: string[];
  suggestedResources: SuggestedResource[];
}

export interface ExamSession {
  config: ExamConfig;
  questions: Question[];
  answers: StudentAnswer[];
  feedback: FeedbackItem[];
  diagnosticReport: DiagnosticReport;
  totalMarks: number;
  predictedGrade: string;
}

export interface FeedbackStreamChunk {
  type: 'feedback_item' | 'report';
  data: any; // Can be FeedbackItem or final report structure
}

export interface AdaptiveHint {
  hint: string;
}

export interface RevisionPlanTask {
    type: 'review' | 'practice' | 'watch' | 'read';
    description: string;
}

export interface RevisionPlanDay {
    day: number;
    topic: string;
    tasks: RevisionPlanTask[];
}
export type RevisionPlan = RevisionPlanDay[];

export interface RevisionPlanObject {
    days: RevisionPlan;
    isFallback?: boolean;
}

export interface MicroLesson {
    id: string;
    topic: string;
    core: string; // The core concept
    steps: string[]; // Step-by-step explanation
    slip: string; // Common slip-up
    cue: string; // A memorable cue
    check: {
        question: string;
        options: string[];
        answer: string; // The correct option letter, e.g., 'A'
        rationale: string;
    };
}

export interface TopicMastery {
    topic: string;
    masteryScore: number;
    trend: number;
    lastUpdate: string;
    history: {
        correct: boolean;
        timestamp: number;
        confidence: 'low' | 'medium' | 'high';
        lift?: number;
    }[];
}

export interface TelemetryEvent {
  client_event_id: string; // uuid
  timestamp: string; // ISO 8601
  class_id: string;
  institution_id: string;
  topic: string;
  trigger: 'incorrect_answer' | 'low_confidence' | 'gate_stall' | 'user_request';
  lift: number; // e.g., 0.2 for +20%
  confidence_before: 'low' | 'medium' | 'high';
  confidence_after: 'low' | 'medium' | 'high';
  quick_check_correct: boolean | null;
  retest_correct: boolean | null;
  lesson_duration_ms?: number;
  lessonId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PerformanceMetrics {
  startTime: number;
  firstChunkTime: number;
  endTime: number;
  renderTime: number;
  firstChunkLatency: number;
  aiLatency: number;
  renderLatency: number;
  totalLoadTime: number;
}

export interface NextAction {
    type: 'quiz' | 'flashcards' | 'mock' | 'coachChat' | 'review';
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    message: string;
}

export interface ProgressEvent {
    id: string;
    ts: string;
    subject: string;
    topic: string;
    kind: 'mock_submitted' | 'flashcard_session' | 'coach_session';
    delta: number;
    confidenceDelta: number;
    meta?: any;
}

export interface UpdateProgressArgs {
    subject: string;
    topic: string;
    delta: number;
    confidenceDelta: number;
    source: 'mock' | 'flashcards' | 'coach';
    meta?: any;
}


export interface StudentState {
  subjects: string[]; // array of subject IDs
  mastery: Record<string, number>; // topic -> score (0-100)
  confidence: Record<string, number>; // topic -> score (0-100)
  streak: number;
  trialDaysLeft: number;
  lastActivity: { subject: string; topic: string } | string | null;
  confidenceDelta?: Record<string, number>;
  masteryDelta?: Record<string, number>;
  weakTopics: string[];
}

export interface SessionResult {
  correct: number;
  total: number;
  confidenceDelta?: number;
}

export interface TopicProgress {
    id: string;
    name: string;
    current: number; // 0-1 mastery
    confidence: number; // 0-1 confidence
    lastTested: string; // ISO date
}

export interface SubjectProgress {
    id: string;
    name: string;
    currentGrade: number; // 1-9 grade
    topics: TopicProgress[];
}

export interface AppProgress {
    overallGradeEstimate: number;
    targetGrade: number;
    streak: number;
    subjects: SubjectProgress[];
    schemaVersion?: number;
    events?: ProgressEvent[];
    latestGrade?: string | null;
    lastScorePercent?: number | null;
    previousScorePercent?: number | null;
    weakTopics: string[];
}

export interface StudySession {
  subject: string;
  duration: number;
  color: 'blue' | 'green' | 'magenta' | 'amber' | 'default';
  objective: string;
  tip: string;
}

export interface DailyPlan {
  day: string;
  date: number;
  sessions: StudySession[];
}

export interface FlowContextType {
  endSession: (type: SessionType, subject: string, result?: SessionResult) => void;
  completeFeedback: (subject: string) => void;
  lastSubject: string | null;
  nextAction: NextAction | null;
}