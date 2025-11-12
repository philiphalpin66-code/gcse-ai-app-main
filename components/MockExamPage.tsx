

import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { Question } from '../types';
import { ICONS } from '../constants';
import GlassCard from './ui/GlassCard';
import GlassInput from './ui/GlassInput';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import { useAppContext } from '../state/AppContext';
import { mapScoreToConfidenceDelta, mapScoreToDelta } from '../utils/scoring';


// Mock Data
const mockQuestions: (Question & { correctAnswerValue: string })[] = [
    { id: 'm1', questionText: 'What is 5 x 7?', marks: 1, markScheme: 'The answer is 35.', topic: 'Multiplication', correctAnswerValue: '35' },
    { id: 'm2', questionText: 'Calculate the area of a rectangle with a width of 8cm and a height of 6cm.', marks: 2, markScheme: 'Area = width x height. 8cm x 6cm = 48cm².', topic: 'Area', correctAnswerValue: '48' },
    { id: 'm3', questionText: 'Solve for x: 3x + 7 = 22', marks: 2, markScheme: '3x = 22 - 7 -> 3x = 15 -> x = 5.', topic: 'Algebra', correctAnswerValue: '5' },
    { id: 'm4', questionText: 'What is the next prime number after 13?', marks: 1, markScheme: 'The next prime number after 13 is 17.', topic: 'Number Theory', correctAnswerValue: '17' },
    { id: 'm5', questionText: 'What is 15% of 200?', marks: 2, markScheme: '10% is 20, 5% is 10, so 15% is 30.', topic: 'Percentages', correctAnswerValue: '30'},
];

const TOTAL_QUESTIONS = 20; // For display purposes

// --- State Management with Reducer for Performance ---
const initialState = {
  currentQuestionIndex: 2,
  userAnswer: '',
  isSubmitted: false,
  isCorrect: null as boolean | null,
  isFlagged: false,
  animationState: null as 'enter' | 'exit' | null,
  toastMessage: null as string | null,
  prefetchedQuestion: null as (Question & { correctAnswerValue: string }) | null,
  isPrefetching: false,
};

function reducer(state: typeof initialState, action: any) {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, userAnswer: action.payload };
    case 'SUBMIT':
      return { ...state, isSubmitted: true, isCorrect: action.payload.correct, toastMessage: `Mastery change: ${action.payload.masteryDelta >= 0 ? '+' : ''}${action.payload.masteryDelta.toFixed(1)}%` };
    case 'FLAG':
      return { ...state, isFlagged: !state.isFlagged };
    case 'DISMISS_TOAST':
      return { ...state, toastMessage: null };
    case 'SET_ANIMATION':
      return { ...state, animationState: action.payload };
    case 'PREFETCH_START':
      return { ...state, isPrefetching: true };
    case 'PREFETCH_SUCCESS':
      return { ...state, prefetchedQuestion: action.payload, isPrefetching: false };
    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      return {
        ...initialState,
        currentQuestionIndex: nextIndex,
        animationState: 'exit',
        prefetchedQuestion: state.prefetchedQuestion, // Carry over in case it's not used
      };
    default:
      return state;
  }
}

// Mock async fetch function to simulate network latency
const fetchQuestion = async (index: number): Promise<Question & { correctAnswerValue: string }> => {
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
    return mockQuestions[index % mockQuestions.length];
};


interface MockExamPageProps {
    onBack: () => void;
}

const MockExamPage: React.FC<MockExamPageProps> = ({ onBack }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { updateTopicProgress } = useAppContext();

    const currentQuestion = useMemo(() => {
        // On "next", if a prefetched question is ready, use it immediately. Otherwise, fall back to the mock array.
        if (state.animationState === 'exit' && state.prefetchedQuestion) {
            return state.prefetchedQuestion;
        }
        return mockQuestions[state.currentQuestionIndex % mockQuestions.length];
    }, [state.currentQuestionIndex, state.prefetchedQuestion, state.animationState]);

    const progressPercentage = ((state.currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
    
    // Prefetching effect
    useEffect(() => {
        const nextIndex = state.currentQuestionIndex + 1;
        if (nextIndex < TOTAL_QUESTIONS && !state.prefetchedQuestion && !state.isPrefetching) {
            dispatch({ type: 'PREFETCH_START' });
            fetchQuestion(nextIndex).then(question => {
                console.log('PREFETCH READY');
                dispatch({ type: 'PREFETCH_SUCCESS', payload: question });
            });
        }
    }, [state.currentQuestionIndex, state.prefetchedQuestion, state.isPrefetching]);
    
    // Animation and Toast effects
    useEffect(() => {
        // Defer enter animation to prioritize content render
        const enterTimer = setTimeout(() => dispatch({ type: 'SET_ANIMATION', payload: 'enter' }), 10);
        
        if (state.animationState === 'enter') {
            const animTimer = setTimeout(() => dispatch({ type: 'SET_ANIMATION', payload: null }), 400);
            return () => clearTimeout(animTimer);
        }
        return () => clearTimeout(enterTimer);
    }, [state.currentQuestionIndex]);

    useEffect(() => {
        if (state.toastMessage) {
            const timer = setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [state.toastMessage]);


    const handleSubmit = () => {
        if (!state.userAnswer.trim()) return;
        const correct = state.userAnswer.trim().replace('cm²', '') === currentQuestion.correctAnswerValue;
        
        const rawScore = correct ? 1.0 : 0.0;
        const masteryDelta = mapScoreToDelta(rawScore);

        dispatch({ type: 'SUBMIT', payload: { correct, masteryDelta } });

        updateTopicProgress({
            subject: 'Maths',
            topic: currentQuestion.topic,
            delta: masteryDelta,
            confidenceDelta: mapScoreToConfidenceDelta(rawScore),
            source: "mock",
            meta: { rawScore }
        });
    };

    const handleNextQuestion = () => {
        if (state.currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
            onBack();
            return;
        }
        
        dispatch({ type: 'SET_ANIMATION', payload: 'exit' });
        setTimeout(() => {
            dispatch({ type: 'NEXT_QUESTION' });
        }, 400); // Wait for exit animation to complete
    };

    const getAnimationClass = () => {
        if (state.animationState === 'enter') return 'question-enter';
        if (state.animationState === 'exit') return 'question-exit';
        return '';
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="fixed top-20 left-0 right-0 h-1.5 z-30">
                <div className="progress-bar-neon" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div className="max-w-4xl mx-auto pt-4">
                <header className="mb-8">
                    <h1 className="text-xl font-bold text-primary text-center">AQA • Maths Foundation • Q{state.currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</h1>
                </header>

                <div className={`question-container ${getAnimationClass()}`}>
                    <GlassCard>
                        {currentQuestion.resources?.map((res, i) => (
                          <div key={i} className="mb-3 rounded-lg border border-black/10 bg-black/5 p-3 text-sm overflow-auto max-h-48 text-left">
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
                          <div className="mb-3 rounded-lg border-dashed border border-black/20 p-2 text-xs italic bg-black/5 text-tertiary text-left">
                            Diagram: {currentQuestion.diagram_description}
                          </div>
                        )}
                        <p className="text-2xl text-primary leading-relaxed mb-6 whitespace-pre-wrap font-semibold text-center">{currentQuestion.questionText}</p>
                        
                        {!state.isSubmitted ? (
                             <div className="flex flex-col items-center space-y-4">
                                <GlassInput
                                    value={state.userAnswer}
                                    onChange={(e) => dispatch({ type: 'SET_ANSWER', payload: e.target.value })}
                                    placeholder="Your answer..."
                                    className="text-center text-lg max-w-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                                <div className="flex items-center justify-center space-x-2 pt-4">
                                    <SecondaryButton onClick={() => dispatch({ type: 'FLAG' })} className={state.isFlagged ? '!bg-amber-500/20' : ''}>
                                        {ICONS.flag} <span className="ml-2">{state.isFlagged ? 'Flagged' : 'Flag'}</span>
                                    </SecondaryButton>
                                    <SecondaryButton onClick={() => console.log('AI Explain')}>
                                        AI Explain
                                    </SecondaryButton>
                                    <PrimaryButton onClick={handleSubmit} disabled={!state.userAnswer.trim()}>
                                        Submit
                                    </PrimaryButton>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <GlassCard className={`text-center max-w-lg mx-auto ${state.isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                                     <h3 className={`text-2xl font-bold ${state.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {state.isCorrect ? 'Correct!' : 'Incorrect'}
                                     </h3>
                                     <p className="text-secondary mt-2">{currentQuestion.markScheme}</p>
                                     <div className="mt-6 flex justify-center space-x-4">
                                        <SecondaryButton onClick={onBack}>End Session</SecondaryButton>
                                        <PrimaryButton onClick={handleNextQuestion}>
                                            Next Question
                                        </PrimaryButton>
                                     </div>
                                </GlassCard>
                            </div>
                        )}
                       
                    </GlassCard>
                </div>
            </div>

            {state.toastMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-full shadow-lg animate-fade-in-up border border-slate-700 z-50">
                    {state.toastMessage}
                </div>
            )}
        </div>
    );
};

export default MockExamPage;