import React from 'react';
import { SavedQuestion, FeedbackItem, User, TelemetryEvent } from '../types';
import QuestionFeedback from './QuestionFeedback';
import SecondaryButton from './ui/SecondaryButton';
import GlassCard from './ui/GlassCard';

interface ReviewPageProps {
  savedQuestions: SavedQuestion[];
  onBack: () => void;
  onToggleSave: (item: FeedbackItem) => void;
  onAskTutor: (item: FeedbackItem) => void;
  user: User;
  onRecordTelemetry: (event: Omit<TelemetryEvent, 'client_event_id' | 'timestamp' | 'class_id' | 'institution_id'>) => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ savedQuestions, onBack, onToggleSave, onAskTutor, user, onRecordTelemetry }) => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-primary">Saved for Review</h1>
            <p className="text-secondary text-base leading-relaxed mt-1">Your personal deck of questions to revise.</p>
          </div>
          <SecondaryButton onClick={onBack}>
            Back to Home
          </SecondaryButton>
        </header>

        <main className="space-y-8">
          {savedQuestions.length > 0 ? (
            savedQuestions.map((item) => (
              <QuestionFeedback
                key={item.questionId}
                item={item}
                isSaved={true}
                onToggleSave={onToggleSave}
                onAskTutor={onAskTutor}
                user={user}
                onRecordTelemetry={onRecordTelemetry}
              />
            ))
          ) : (
            <GlassCard className="text-center">
              <h2 className="text-2xl font-bold text-primary">No Saved Questions Yet!</h2>
              <p className="text-secondary text-base leading-relaxed mt-2">
                After completing a practice session, click the save icon on any question's feedback to add it here for future revision.
              </p>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReviewPage;