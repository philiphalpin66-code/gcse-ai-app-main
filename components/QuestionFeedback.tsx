import React, { useState } from 'react';
import { FeedbackItem, AdaptiveHint, User, MicroLesson, TelemetryEvent } from '../types';
import { ICONS } from '../constants';
import { generateAdaptiveHint, generateMicroLesson } from '../utils/aiService';
import Spinner from './Spinner';
import MicroLessonCard from './MicroLessonCard';
import GlassCard from './ui/GlassCard';
import SecondaryButton from './ui/SecondaryButton';
import { useAppContext } from '../state/AppContext';
import { mapScoreToDelta, mapScoreToConfidenceDelta } from '../utils/scoring';
import { getSubjectForTopic } from '../utils/subjectHelpers';

interface QuestionFeedbackProps {
  item: FeedbackItem;
  isSaved: boolean;
  onToggleSave?: (item: FeedbackItem) => void;
  onAskTutor?: (item: FeedbackItem) => void;
  user: User;
  onRecordTelemetry: (event: Omit<TelemetryEvent, 'client_event_id' | 'timestamp' | 'class_id' | 'institution_id'>) => void;
}

const QuestionFeedback: React.FC<QuestionFeedbackProps> = ({ item, isSaved, onToggleSave, onAskTutor, user, onRecordTelemetry }) => {
  const [adaptiveHint, setAdaptiveHint] = useState<AdaptiveHint | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [microLesson, setMicroLesson] = useState<MicroLesson | null>(null);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState<number | null>(null);
  const { updateTopicProgress } = useAppContext();

  const getCorrectnessClasses = (correctness: 'correct' | 'partial' | 'incorrect') => {
    switch (correctness) {
      case 'correct': return 'border-green-500/50';
      case 'partial': return 'border-amber-500/50';
      case 'incorrect': return 'border-red-500/50';
      default: return 'border-transparent';
    }
  };

  const handleGetAdaptiveHint = async () => {
    if (!user) return;
    setIsHintLoading(true);
    setAdaptiveHint(null);
    try {
      const accuracy = item.maxMarks > 0 ? item.marksAwarded / item.maxMarks : 0;
      const hintContext = {
        question: item.questionText, student_answer: item.studentAnswer, correct_answer: item.correctAnswer, accuracy,
      };
      const newHint = await generateAdaptiveHint(user, hintContext);
      setAdaptiveHint(newHint);
    } catch (error) { console.error("Failed to generate adaptive hint:", error); } 
    finally { setIsHintLoading(false); }
  };
  
  const handleGetMicroLesson = async () => {
    setIsLessonLoading(true);
    setMicroLesson(null);
    setLessonStartTime(Date.now());
    try {
      const lesson = await generateMicroLesson(user, item.topic, item.questionText);
      setMicroLesson(lesson);
    } catch (error) { console.error("Failed to generate micro-lesson:", error); } 
    finally { setIsLessonLoading(false); }
  };
  
  const handleMicroLessonComplete = (quickCheckCorrect: boolean) => {
    const lessonDuration = lessonStartTime ? Date.now() - lessonStartTime : undefined;
    const subject = getSubjectForTopic(item.topic);

    if (subject) {
      const rawScore = quickCheckCorrect ? 0.9 : 0.3; // Correct = big boost, Incorrect = small penalty
      updateTopicProgress({
        subject: subject,
        topic: item.topic,
        delta: mapScoreToDelta(rawScore),
        confidenceDelta: mapScoreToConfidenceDelta(rawScore),
        source: 'coach',
        meta: { quickCheckCorrect, lessonId: microLesson?.id, duration: lessonDuration }
      });
    }

    onRecordTelemetry({
        topic: item.topic, trigger: 'user_request', lift: quickCheckCorrect ? 0.2 : -0.1, confidence_before: 'low',
        confidence_after: quickCheckCorrect ? 'high' : 'medium', quick_check_correct: quickCheckCorrect, retest_correct: null,
        lesson_duration_ms: lessonDuration, lessonId: microLesson?.id,
    });
    setMicroLesson(null);
    setLessonStartTime(null);
  };

  return (
    <GlassCard className={`transition-all ${getCorrectnessClasses(item.correctness)}`}>
      {item.resources?.map((res, i) => (
        <div key={i} className="mb-3 rounded-lg border border-black/10 bg-black/5 p-3 text-sm overflow-auto max-h-48">
          {res.type === "extract" && (
            <>
              <p className="font-semibold mb-1 text-primary">{res.title || "Reading Extract"}</p>
              <p className="whitespace-pre-line text-secondary">{res.content}</p>
            </>
          )}
          {res.type === "table" && (
            <pre className="font-mono text-xs whitespace-pre text-secondary">{res.content}</pre>
          )}
          {res.type === "image" && res.image_url && (
            <img src={res.image_url} alt={res.title || "Diagram"} className="rounded-md" />
          )}
        </div>
      ))}
      {item.diagram_description && (
        <div className="mb-3 rounded-lg border-dashed border border-black/20 p-2 text-xs italic bg-black/5 text-tertiary">
          Diagram: {item.diagram_description}
        </div>
      )}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-base font-bold text-primary pr-4 flex-grow">{item.questionText}</h3>
        {onToggleSave && (
          <button 
            onClick={() => onToggleSave(item)} 
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-tertiary hover:bg-white/10 hover:text-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue transition-colors"
            aria-label={isSaved ? 'Unsave question' : 'Save question'}
          >
            <div className="w-6 h-6">
                {isSaved ? ICONS.saved : ICONS.save}
            </div>
          </button>
        )}
      </div>
      
      {microLesson && (
        <div className="my-4">
            <MicroLessonCard lesson={microLesson} onComplete={handleMicroLessonComplete} />
        </div>
      )}

      <div className="mt-4 border-t border-white/10 pt-4 flex justify-end items-center gap-2 flex-wrap">
        {adaptiveHint && (
          <div className="flex-grow p-3 bg-black/20 animate-fade-in text-secondary">
            <p>{adaptiveHint.hint}</p>
          </div>
        )}
        
        {item.correctness !== 'correct' && !microLesson && (
          <SecondaryButton onClick={handleGetMicroLesson} disabled={isLessonLoading} className="!py-1.5 !px-3 text-xs">
             {isLessonLoading ? <Spinner /> : ICONS.lightning}
             <span className="ml-2">{isLessonLoading ? 'Building...' : '90s Refresher'}</span>
          </SecondaryButton>
        )}

        {!adaptiveHint && (
          <SecondaryButton onClick={handleGetAdaptiveHint} disabled={isHintLoading} className="!py-1.5 !px-3 text-xs">
            {isHintLoading ? <Spinner /> : ICONS.lightbulb}
            <span className="ml-2">{isHintLoading ? 'Getting Hint...' : 'Get Hint'}</span>
          </SecondaryButton>
        )}

        {onAskTutor && (
          <SecondaryButton onClick={() => onAskTutor && onAskTutor(item)} className="!py-1.5 !px-3 text-xs">
              {ICONS.tutor} <span className="ml-2">Ask AI Tutor</span>
          </SecondaryButton>
        )}
      </div>
    </GlassCard>
  );
};

export default QuestionFeedback;