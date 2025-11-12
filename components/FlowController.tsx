import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SessionType, Question, StudentAnswer, FlowContextType, NextAction, StudentState, SessionResult } from '../types';
import { getNextAction } from '../utils/contentLogic';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import { useAppContext } from '../state/AppContext';
import { mapScoreToDelta, mapScoreToConfidenceDelta } from '../utils/scoring';

// 1. Define Context and Hook
const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

// 2. Define Controller Props
interface FlowControllerProps {
  children: React.ReactNode;
  navigateTo: (page: string) => void;
  onFinishBlitz: (questions: Question[], answers: StudentAnswer[]) => void;
  onGoHome: () => void;
  studentState: StudentState;
}

// Module-level variable to hold session data when flow is interrupted by a modal
let sessionFinishArgs: { questions: Question[], answers: StudentAnswer[] } | null = null;

export const setSessionFinishArgs = (args: { questions: Question[], answers: StudentAnswer[] }) => {
    sessionFinishArgs = args;
};

// 3. Main Controller Component
export const FlowController: React.FC<FlowControllerProps> = ({ children, navigateTo, onFinishBlitz, onGoHome, studentState }) => {
  const [showPostSessionModal, setShowPostSessionModal] = useState(false);
  const [showAddToPlannerModal, setShowAddToPlannerModal] = useState(false);
  const [lastActivity, setLastActivity] = useState<{type: SessionType, subject: string} | null>(null);
  const [lastSubject, setLastSubject] = useState<string | null>(() => localStorage.getItem('lastSubject'));
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [postSessionMessage, setPostSessionMessage] = useState({ title: "Nice work!", body: "What's next?" });
  const { updateTopicProgress } = useAppContext();

  useEffect(() => {
    setNextAction(getNextAction(studentState));
  }, [studentState]);

  const updateLastSubject = (subject: string) => {
    setLastSubject(subject);
    localStorage.setItem('lastSubject', subject);
  };

  const closeModals = () => {
    setShowPostSessionModal(false);
    setShowAddToPlannerModal(false);
  };
  
  const endSession = (type: SessionType, subject: string, result?: SessionResult) => {
    updateLastSubject(subject);
    setLastActivity({ type, subject });

    if (result) {
      const accuracy = result.total > 0 ? (result.correct / result.total) : 0;
      
      updateTopicProgress({
          subject: subject,
          topic: 'various', // Topic is not tracked for aggregate sessions like flashcards
          delta: mapScoreToDelta(accuracy),
          confidenceDelta: result.confidenceDelta ?? mapScoreToConfidenceDelta(accuracy),
          source: type === 'flashcards' ? 'flashcards' : 'coach',
          meta: { correct: result.correct, total: result.total }
      });

      // Set feedback message for modal based on result
      if (accuracy > 0.7) {
        setPostSessionMessage({ title: "🔥 You’re improving fast!", body: `Great work on that ${subject} session. Let's keep the momentum going!` });
      } else if (result.confidenceDelta && result.confidenceDelta < 0) {
        setPostSessionMessage({ title: "You’ve got this.", body: `That was a tricky topic. Let’s revisit ${subject} again soon to lock it in.` });
      } else {
        setPostSessionMessage({ title: "Session Complete!", body: `You've finished your ${subject} session. What would you like to do next?` });
      }
    } else {
      // For 'blitz' sessions without immediate results, show a generic message.
      setPostSessionMessage({ title: "Session Complete!", body: `You've finished your ${subject} session. What would you like to do next?` });
    }

    setShowPostSessionModal(true);
  };

  const completeFeedback = (subject: string) => {
    updateLastSubject(subject);
    setLastActivity({ type: 'blitz', subject });
    setShowAddToPlannerModal(true);
  };
  
  const handlePostSessionNav = (destination: string) => {
    closeModals();
    if (destination === 'feedback' && sessionFinishArgs) {
        onFinishBlitz(sessionFinishArgs.questions, sessionFinishArgs.answers);
    } else {
        navigateTo(destination);
    }
    sessionFinishArgs = null;
  };
  
  const handleAddToPlannerNav = (destination: string) => {
    if(destination === 'weekly-planner') {
        navigateTo(destination);
    } else {
        onGoHome();
    }
    closeModals();
  };

  const contextValue = {
    endSession,
    completeFeedback,
    lastSubject,
    nextAction,
  };

  return (
    <FlowContext.Provider value={contextValue}>
      {children}

      {showPostSessionModal && lastActivity && (
        <div className="flow-modal-overlay">
          <GlassCard className="max-w-md w-full text-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-2">{postSessionMessage.title}</h2>
            <p className="text-secondary mb-6">{postSessionMessage.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <SecondaryButton onClick={() => handlePostSessionNav('ai-coach')}>AI Recap</SecondaryButton>
              {lastActivity.type === 'blitz' && (
                <PrimaryButton onClick={() => handlePostSessionNav('feedback')}>See Feedback</PrimaryButton>
              )}
               <SecondaryButton onClick={() => handlePostSessionNav('landing')}>Back to Dashboard</SecondaryButton>
            </div>
          </GlassCard>
        </div>
      )}

      {showAddToPlannerModal && lastActivity && (
        <div className="flow-modal-overlay">
          <GlassCard className="max-w-md w-full text-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-2">Strengthen Your Skills</h2>
            <p className="text-secondary mb-6">Want to add more practice for {lastActivity.subject} to your study plan?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <SecondaryButton onClick={() => handleAddToPlannerNav('landing')}>No, Thanks</SecondaryButton>
              <PrimaryButton onClick={() => handleAddToPlannerNav('weekly-planner')}>Yes, Add to Plan</PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}

    </FlowContext.Provider>
  );
};