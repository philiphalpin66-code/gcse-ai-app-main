import React, { useState, useEffect, useMemo } from 'react';
import { User, UserSelections, TopicMastery } from '../../types';
import GlassCard from './ui/GlassCard';
import ProgressRing from './ui/ProgressRing';
import SecondaryButton from './ui/SecondaryButton';
import Pill from './ui/Pill';
import { ICONS, SUBJECT_DATA } from '../../constants';
import { useAppContext } from '../../state/AppContext';
import { generateProfileInsight } from '../../utils/aiService';

interface ProfilePageProps {
  onNavigateToAnalytics: () => void;
  userSelections: UserSelections;
  user: User;
  topicMastery: TopicMastery[];
}

const MOCK_DATA = {
    XP: 1250,
};

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateToAnalytics, userSelections, user, topicMastery }) => {
    const { progress } = useAppContext();
    const [insight, setInsight] = useState<string | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(true);

    useEffect(() => {
        if (user && topicMastery) {
            setIsInsightLoading(true);
            generateProfileInsight(user, topicMastery)
                .then(setInsight)
                .catch(console.error)
                .finally(() => setIsInsightLoading(false));
        }
    }, [user, topicMastery]);
    
    const subjectStrengths = useMemo(() => {
        return progress.subjects.map(subject => {
            const subjectInfo = SUBJECT_DATA.find(s => s.id === subject.id);
            // Derive average mastery from the grade (grade = mastery * 8 + 1)
            const averageMastery = ((subject.currentGrade - 1) / 8) * 100;
            return {
                subject: subject.name,
                averageMastery: Math.max(0, Math.min(100, averageMastery)), // Clamp between 0 and 100
                color: subjectInfo?.color || 'var(--accent-blue)',
            };
        }).sort((a, b) => b.averageMastery - a.averageMastery);
    }, [progress.subjects]);
    
    const overallGrade = progress.overallGradeEstimate;
    const gradePercentage = ((overallGrade - 1) / 8) * 100;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">Your Profile</h1>
                    <p className="text-secondary text-lg leading-relaxed mt-2">
                        An overview of your progress and achievements.
                    </p>
                </header>
                
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Key Metrics */}
                    <GlassCard className="text-center flex flex-col items-center justify-center">
                        <Pill color="amber" className="mb-3">🔥 {progress.streak} Day Streak</Pill>
                        <p className="text-secondary text-sm">Keep up the great work!</p>
                    </GlassCard>
                     <GlassCard className="text-center flex flex-col items-center justify-center">
                        <Pill color="blue" className="mb-3">💎 {MOCK_DATA.XP.toLocaleString()} XP</Pill>
                        <p className="text-secondary text-sm">Experience Points Earned</p>
                    </GlassCard>
                    <GlassCard className="lg:col-span-2 flex flex-col items-center justify-center">
                         <ProgressRing percentage={gradePercentage} label={overallGrade.toFixed(1)} size={140} color="var(--accent-green)" />
                         <p className="text-primary font-semibold mt-3">Current Predicted Grade</p>
                    </GlassCard>

                    {/* AI Insight */}
                    <GlassCard className="md:col-span-2 lg:col-span-4">
                         <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
                            <div className="w-6 h-6 text-accent-amber">{ICONS.lightbulb}</div>
                            <span className="ml-2">Your Next Step</span>
                         </h2>
                         {isInsightLoading ? (
                             <div className="h-5 w-3/4 shimmer-bg rounded"></div>
                         ) : (
                             <p className="text-secondary text-lg">
                                 {insight}
                             </p>
                         )}
                    </GlassCard>

                    {/* Subject Strengths */}
                    <GlassCard className="md:col-span-2 lg:col-span-4">
                        <h2 className="text-xl font-bold text-primary mb-4">Subject Strength</h2>
                        <div className="space-y-4">
                            {subjectStrengths.length > 0 ? subjectStrengths.map(({ subject, averageMastery, color }) => (
                                <div key={subject}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-primary">{subject}</span>
                                        <span className="text-sm font-bold" style={{ color: color }}>
                                            {Math.round(averageMastery)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-2.5 border border-white/10">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${averageMastery}%`,
                                                backgroundColor: color,
                                                boxShadow: `0 0 8px ${color}80`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-secondary text-center py-4">No mastery data yet. Complete a practice session to see your strengths!</p>
                            )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                             <SecondaryButton onClick={onNavigateToAnalytics}>
                                View Detailed Analytics
                             </SecondaryButton>
                        </div>
                    </GlassCard>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;