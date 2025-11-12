import React from 'react';
import { TopicMastery, TelemetryEvent, Achievement, UserSelections, TopicProgress, SubjectProgress } from '../types';
import StreakTracker from './StreakTracker';
import Achievements from './Achievements';
import LearningEfficiencyInsights from './LearningEfficiencyInsights';
import SecondaryButton from './ui/SecondaryButton';
import GlassCard from './ui/GlassCard';
import { getSubjectForTopic } from '../utils/subjectHelpers';
import { SUBJECT_DATA } from '../constants';
import { useAppContext } from '../state/AppContext';

interface AnalyticsPageProps {
  telemetryEvents: TelemetryEvent[];
  achievements: Achievement[];
  onBack: () => void;
  userSelections: UserSelections;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ telemetryEvents, achievements, onBack, userSelections }) => {
  const { progress } = useAppContext();

  // Create a structure similar to the old topicMastery for compatibility, derived from context
  const masteryBySubject: { [key: string]: TopicProgress[] } = progress.subjects.reduce((acc, subject) => {
    acc[subject.name] = subject.topics;
    return acc;
  }, {} as { [key: string]: TopicProgress[] });


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-primary">Your Progress Analytics</h1>
            <p className="text-secondary text-base leading-relaxed mt-1">Track your mastery, streaks, and learning efficiency.</p>
          </div>
          <SecondaryButton onClick={onBack}>
            Back to Profile
          </SecondaryButton>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <StreakTracker currentStreak={progress.streak} longestStreak={21} />
            <Achievements achievements={achievements} />
          </div>

          <div className="lg:col-span-2 space-y-8">
             <LearningEfficiencyInsights events={telemetryEvents} />
             
             {Object.entries(masteryBySubject).map(([subject, topics]) => {
                const subjectInfo = SUBJECT_DATA.find(s => s.name === subject);
                const color = subjectInfo?.color || 'var(--accent-blue)';
                
                return (
                    <GlassCard key={subject}>
                        <h2 className="text-xl font-bold text-primary mb-4">{subject} Topic Mastery</h2>
                        <div className="space-y-4">
                        {topics.sort((a,b) => a.name.localeCompare(b.name)).map(t => (
                            <div key={t.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-primary">{t.name}</span>
                                    <span className="text-sm font-bold" style={{ color }}>
                                        {Math.round(t.current * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="h-2 rounded-full" style={{ width: `${t.current * 100}%`, backgroundColor: color }}></div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </GlassCard>
                )
             })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;