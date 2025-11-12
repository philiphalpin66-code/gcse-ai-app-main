import React, { useState } from 'react';
import { ExamSession, FeedbackItem, SavedQuestion, User, TelemetryEvent, Question } from '../types';
import QuestionFeedback from './QuestionFeedback';
import Spinner from './Spinner';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import ProgressRing from './ui/ProgressRing';
import { useFlow } from './FlowController';
import { useAppContext } from '../state/AppContext';
import { retestWeakTopics } from '../services/studyLoop';

interface FeedbackPageProps {
  session: ExamSession;
  onViewAnalytics: () => void;
  savedQuestions: SavedQuestion[];
  onToggleSave: (item: FeedbackItem) => void;
  onAskTutor: (item: FeedbackItem) => void;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
  user: User;
  onRecordTelemetry: (event: Omit<TelemetryEvent, 'client_event_id' | 'timestamp' | 'class_id' | 'institution_id'>) => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ session, onViewAnalytics, savedQuestions, onToggleSave, onAskTutor, onGeneratePlan, isGeneratingPlan, user, onRecordTelemetry }) => {
  const { completeFeedback } = useFlow();
  const { studentState, handleStartBlitz } = useAppContext();
  const [isRetesting, setIsRetesting] = useState(false);
  
  const totalPossibleMarks = session.questions.reduce((sum, q) => sum + q.marks, 0);
  const percentage = totalPossibleMarks > 0 ? Math.round((session.totalMarks / totalPossibleMarks) * 100) : 0;
  const isReportReady = session.diagnosticReport && session.diagnosticReport.strengths.length > 0;
  
  const onRetest = async () => {
    if (!studentState.weakTopics?.length || !user) return;
    setIsRetesting(true);
    try {
        const retestQuestions: Question[] = await retestWeakTopics({
            user,
            weakTopics: studentState.weakTopics,
            subject: session.config.subject,
            board: session.config.board,
            spec_code: session.config.syllabus_version, // Assuming spec_code is in syllabus_version
        });

        if (retestQuestions.length > 0) {
            const retestConfig = {
                ...session.config,
                paper_name: "Targeted Retest",
                questionCount: retestQuestions.length,
                topics: studentState.weakTopics,
            };
            // The AppContext handles starting a new session with these pre-loaded questions
            handleStartBlitz(retestConfig, retestQuestions);
        } else {
             console.warn("Retest generated no questions.");
        }
    } catch (error) {
        console.error("Failed to start retest session:", error);
    } finally {
        setIsRetesting(false);
    }
  };


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-16 pb-4 border-b border-white/10">
          <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Your Exam Feedback</h1>
          <div className="flex space-x-2">
            <SecondaryButton onClick={() => completeFeedback(session.config.subject)}>
              Back to Home
            </SecondaryButton>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <aside className="lg:col-span-1 space-y-10">
            <GlassCard className="text-center flex flex-col items-center">
              {session.predictedGrade ? (
                <>
                  <ProgressRing percentage={percentage} label={session.predictedGrade} size={180} />
                  <p className="text-2xl font-semibold text-primary mt-4">{session.totalMarks} / {totalPossibleMarks}</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Spinner />
                  <p className="mt-2 text-tertiary">Calculating Grade...</p>
                </div>
              )}
            </GlassCard>
             <GlassCard>
              <h2 className="text-xl font-bold text-primary mb-4">Diagnostic Report</h2>
              {isReportReady ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-400">Strengths</h3>
                    <ul className="list-disc list-inside text-secondary text-sm space-y-1 mt-1">
                      {session.diagnosticReport.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Areas for Improvement</h3>
                    <ul className="list-disc list-inside text-secondary text-sm space-y-1 mt-1">
                      {session.diagnosticReport.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-4">
                  <Spinner />
                  <p className="mt-2 text-tertiary">Analyzing performance...</p>
                </div>
              )}
            </GlassCard>
             <GlassCard className="space-y-4">
                 <PrimaryButton onClick={onRetest} disabled={!studentState.weakTopics?.length || isRetesting} className="w-full">
                    {isRetesting ? <><Spinner /> Building Retest...</> : 'Retest Weak Topics'}
                 </PrimaryButton>
                 <PrimaryButton onClick={onGeneratePlan} disabled={isGeneratingPlan || !isReportReady} className="w-full">
                    {isGeneratingPlan ? <><Spinner /> Generating...</> : 'Generate My Revision Plan'}
                  </PrimaryButton>
                  <SecondaryButton onClick={onViewAnalytics} className="w-full">View Overall Progress</SecondaryButton>
            </GlassCard>
          </aside>

          <section className="lg:col-span-2 space-y-8">
            {session.feedback.map((feedbackItem) => {
              if (feedbackItem.marksAwarded === -1) {
                return (
                  <GlassCard key={feedbackItem.questionId}>
                    <div className="animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-full space-y-2">
                          <p className="text-base font-bold text-primary pr-4">{feedbackItem.questionText}</p>
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        </div>
                      </div>
                       <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-center">
                          <div className="h-6 w-1/3 bg-white/10 rounded-md"></div>
                          <div className="flex items-center text-sm text-accent-blue">
                            <Spinner />
                            <span className="ml-2">AI is marking...</span>
                          </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              }

              return (
                <QuestionFeedback 
                  key={feedbackItem.questionId} 
                  item={feedbackItem} 
                  isSaved={savedQuestions.some(q => q.questionId === feedbackItem.questionId)} 
                  onToggleSave={onToggleSave} 
                  onAskTutor={onAskTutor} 
                  user={user} 
                  onRecordTelemetry={onRecordTelemetry}
                />
              );
            })}
          </section>
        </main>
        
        <footer className="text-center text-xs text-tertiary mt-12 py-4 border-t border-white/10">
          <p>AI-generated feedback, marking, and planning. Please verify critical information with official sources.</p>
          <p className="mt-1">Syllabus Version: <span className="font-semibold text-secondary">{session.config.syllabus_version}</span></p>
        </footer>
      </div>
    </div>
  );
};

export default FeedbackPage;