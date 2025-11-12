import React from 'react';
import GlassCard from './ui/GlassCard';
import SecondaryButton from './ui/SecondaryButton';
import { UserSelections, NextAction } from '../types';
import TrialCountdownBanner from './TrialCountdownBanner';
import { useFlow } from './FlowController';
import NextActionCard from './ui/NextActionCard';
import { useAppContext } from '../state/AppContext';
import ProgressBarsGrid from './ui/ProgressBarsGrid';
import AIInsights from './ui/AIInsights';
import ProgressRingCard from './dashboard/ProgressRingCard';
import GradeCard from './dashboard/GradeCard';
import StreakCard from './dashboard/StreakCard';
import WeakTopicsCard from './dashboard/WeakTopicsCard';

interface LandingPageProps {
  onStartPractice: () => void;
  onStartMockExam: () => void;
  onStartFlashcards: () => void;
  onStartAiCoach: () => void;
  userSelections: UserSelections;
  onEditSelections: () => void;
  onViewAnalytics: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartPractice, 
  onStartMockExam, 
  onStartFlashcards, 
  onStartAiCoach, 
  onEditSelections, 
  onViewAnalytics 
}) => {
  const { nextAction } = useFlow();
  const { progress, setTarget, navigateTo } = useAppContext();
  
  const handleStartAction = (action: NextAction) => {
    switch (action.type) {
      case 'quiz':
        onStartPractice();
        break;
      case 'flashcards':
        onStartFlashcards();
        break;
      case 'mock':
        onStartMockExam();
        break;
      case 'coachChat':
        onStartAiCoach();
        break;
      case 'review':
        onViewAnalytics();
        break;
      default:
        onStartPractice(); // Fallback to a practice session
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Trial Countdown Banner */}
        <TrialCountdownBanner />

        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Hey, Ellie! 👋</h1>
              <p className="text-secondary text-lg leading-relaxed mt-2">
                Your progress is looking great. Keep the momentum going!
              </p>
            </div>
             <SecondaryButton onClick={onEditSelections} className="!py-2 !px-4 text-sm h-[36px] mt-4 sm:mt-0">Edit Subjects</SecondaryButton>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Dashboard Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
            <ProgressRingCard percent={progress.lastScorePercent ?? 0} />
            <GradeCard 
              grade={progress.latestGrade} 
              score={progress.lastScorePercent} 
              previousScore={progress.previousScorePercent}
              targetGrade={progress.targetGrade}
            />
            <StreakCard streak={progress.streak} />
            <WeakTopicsCard />
          </div>
          
          <div className="lg:col-span-4 mt-4">
            <ProgressBarsGrid subjects={progress.subjects} onNavigateToSubject={(id) => navigateTo('subject', id)} />
          </div>

          <div className="lg:col-span-4">
            <AIInsights />
          </div>
          
           <div className="lg:col-span-4">
              <NextActionCard 
                action={nextAction}
                onStart={handleStartAction}
              />
          </div>


        </main>
      </div>
    </div>
  );
};

export default LandingPage;