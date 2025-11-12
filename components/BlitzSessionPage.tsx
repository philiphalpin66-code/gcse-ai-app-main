import React, { useState, useEffect, useRef } from 'react';
import { ExamConfig, Question, StudentAnswer, User, TopicMastery } from '../types';
import { generateQuestionsForBlitzStream } from '../utils/aiService';
import { getPrimingQuestions } from '../utils/questionBank';
import QuestionSkeleton from './QuestionSkeleton';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import Pill from './ui/Pill';
import { PerformanceMetrics } from '../types';
import { useFlow, setSessionFinishArgs } from './FlowController';
import { useAppContext } from '../state/AppContext';

interface BlitzSessionPageProps {
  config: ExamConfig;
  user: User;
  topicMastery: TopicMastery[];
  onRecordPerformance: (metrics: PerformanceMetrics) => void;
}

const BlitzSessionPage: React.FC<BlitzSessionPageProps> = ({ config, user, topicMastery, onRecordPerformance }) => {
  const { preloadedQuestions, clearPreloadedQuestions } = useAppContext();
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (preloadedQuestions && preloadedQuestions.length > 0) {
        return preloadedQuestions;
    }
    return getPrimingQuestions(config.subject, 2);
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const perfMetricsRef = useRef<Partial<PerformanceMetrics & { perceivedLoadTime?: number }>>({});
  const { endSession } = useFlow();
  const fetchInitiatedRef = useRef(false);


  useEffect(() => {
    // If questions were preloaded (e.g., for a retest), we don't need to generate them.
    if (preloadedQuestions && preloadedQuestions.length > 0) {
        clearPreloadedQuestions(); // Consume the preloaded questions
        return;
    }
    
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;

    const startTime = Date.now();
    perfMetricsRef.current = { startTime, perceivedLoadTime: Date.now() - startTime };

    const fetchAdaptiveQuestions = async () => {
      const primingQuestionCount = 2;
      const questionsToGenerate = config.questionCount - primingQuestionCount;

      if (questionsToGenerate <= 0) {
          const now = Date.now();
          onRecordPerformance({
              startTime, firstChunkTime: now, endTime: now, renderTime: now,
              firstChunkLatency: 0, aiLatency: 0, renderLatency: 0,
              totalLoadTime: perfMetricsRef.current.perceivedLoadTime || 0
          });
          setQuestions(prev => prev.slice(0, config.questionCount));
          return;
      }
      
      const adaptiveConfig = { ...config, questionCount: questionsToGenerate };
      try {
        const questionStream = generateQuestionsForBlitzStream(user, adaptiveConfig, topicMastery);
        let firstChunkReceived = false;
        for await (const question of questionStream) {
          if (!firstChunkReceived) {
            perfMetricsRef.current.firstChunkTime = Date.now();
            firstChunkReceived = true;
          }
          setQuestions(prev => [...prev, question]);
        }
      } catch (error) {
        console.error("Failed to generate adaptive questions in background:", error);
      } finally {
        perfMetricsRef.current.endTime = Date.now();
        const renderTime = Date.now();
        const { startTime: recordedStartTime, firstChunkTime, endTime, perceivedLoadTime } = perfMetricsRef.current;
        if(recordedStartTime && firstChunkTime && endTime) {
             const metrics: PerformanceMetrics = {
                startTime: recordedStartTime, firstChunkTime, endTime, renderTime,
                firstChunkLatency: firstChunkTime - recordedStartTime,
                aiLatency: endTime - recordedStartTime,
                renderLatency: renderTime - endTime,
                totalLoadTime: perceivedLoadTime || (renderTime - recordedStartTime)
            };
            onRecordPerformance(metrics);
        }
      }
    };

    fetchAdaptiveQuestions();
  }, [config, user, topicMastery, onRecordPerformance, preloadedQuestions, clearPreloadedQuestions]);


  const handleNext = () => {
    const newAnswer: StudentAnswer = {
      questionId: questions[currentQuestionIndex].id,
      answerText: currentAnswer,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < config.questionCount - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Hand over to the Flow Controller
      setSessionFinishArgs({ questions: questions.slice(0, config.questionCount), answers: newAnswers });
      endSession('blitz', config.subject);
    }
  };
  
  const progressPercentage = (currentQuestionIndex / config.questionCount) * 100;

  const currentQuestion = questions[currentQuestionIndex];
  
  const headerContent = (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-2">
         <h1 className="text-2xl font-bold text-primary">{config.subject} Blitz</h1>
         <span className="font-semibold text-lg text-accent-blue">{Math.min(currentQuestionIndex + 1, config.questionCount)} / {config.questionCount}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5">
        <div className="bg-accent-blue h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </header>
  );

  if (!currentQuestion) {
      return (
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {headerContent}
                <QuestionSkeleton />
            </div>
          </div>
      );
  }
  
  const isLastQuestion = currentQuestionIndex === config.questionCount - 1;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {headerContent}

        <GlassCard>
            <div className="flex justify-between items-start mb-4">
                 <Pill color="blue">{currentQuestion.topic}</Pill>
                 <Pill color="amber">{currentQuestion.marks} Marks</Pill>
            </div>
          
            {currentQuestion.resources?.map((res, i) => (
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
            {currentQuestion.diagram_description && (
              <div className="mb-3 rounded-lg border-dashed border border-black/20 p-2 text-xs italic bg-black/5 text-tertiary">
                Diagram: {currentQuestion.diagram_description}
              </div>
            )}
            <p className="text-lg text-primary leading-relaxed mb-6 whitespace-pre-wrap">{currentQuestion.questionText}</p>
            
            <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-black/20 text-primary font-medium border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-blue placeholder:text-tertiary transition-all"
                placeholder="Type your answer here..."
            />

            <div className="mt-6 flex justify-end">
                <PrimaryButton onClick={handleNext} disabled={!currentAnswer.trim()}>
                    {isLastQuestion ? 'Finish & See Results' : 'Next Question'}
                </PrimaryButton>
            </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default BlitzSessionPage;