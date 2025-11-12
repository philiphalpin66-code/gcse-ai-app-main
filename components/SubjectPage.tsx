import React from 'react';
import { useAppContext } from '../state/AppContext';
import { SUBJECT_DATA } from '../constants';
import { computeSubjectMomentum, getSubjectHistory } from '../utils/momentum';
import GlassCard from './ui/GlassCard';
import TopicBreakdown from './ui/TopicBreakdown';
import SecondaryButton from './ui/SecondaryButton';

interface SubjectPageProps {
  subjectId: string;
  onBack: () => void;
}

const SubjectPage: React.FC<SubjectPageProps> = ({ subjectId, onBack }) => {
    const { progress } = useAppContext();

    const subjectData = progress.subjects.find(s => s.id === subjectId);
    const subjectInfo = SUBJECT_DATA.find(s => s.id === subjectId);
    
    if (!subjectData || !subjectInfo) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-primary">Subject not found</h1>
                <SecondaryButton onClick={onBack} className="mt-4">Back to Home</SecondaryButton>
            </div>
        );
    }
    
    const allEvents = progress.events || [];
    const momentum = computeSubjectMomentum(subjectData.name, allEvents);
    const history = getSubjectHistory(subjectData.name, 10, allEvents);
    
    const momentumColor = momentum > 0.5 ? 'text-green-400' : momentum < -0.5 ? 'text-red-400' : 'text-secondary';
    const momentumIcon = momentum > 0.5 ? '▲' : momentum < -0.5 ? '▼' : '▬';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-5xl mr-4">{subjectInfo.icon}</span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-primary">{subjectInfo.name}</h1>
                            <p className="text-secondary text-lg">Detailed progress and topic breakdown</p>
                        </div>
                    </div>
                    <SecondaryButton onClick={onBack}>Back to Home</SecondaryButton>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard>
                            <h2 className="text-xl font-bold text-primary mb-4">Topic Breakdown</h2>
                            <TopicBreakdown topics={subjectData.topics} />
                        </GlassCard>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <GlassCard>
                             <h2 className="text-xl font-bold text-primary mb-4">At a Glance</h2>
                             <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Current Grade</p>
                                    <p className="text-4xl font-bold text-gradient">{subjectData.currentGrade.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-secondary uppercase tracking-wider">7-Day Momentum</p>
                                    <p className={`text-4xl font-bold ${momentumColor}`}>{momentumIcon} {momentum.toFixed(1)}%</p>
                                </div>
                             </div>
                        </GlassCard>
                        <GlassCard>
                            <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
                            <ul className="space-y-3">
                                {history.length > 0 ? history.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center text-sm p-2 bg-black/20 rounded-lg">
                                        <span className="text-secondary">
                                            {new Date(item.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className="text-right">
                                            <p className={`font-semibold ${item.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {item.delta >= 0 ? '+' : ''}{item.delta.toFixed(1)}% Mastery
                                            </p>
                                            <p className={`text-xs ${item.confidenceDelta >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                                 {item.confidenceDelta >= 0 ? '+' : ''}{item.confidenceDelta} Conf.
                                            </p>
                                        </div>
                                    </li>
                                )) : (
                                    <p className="text-secondary text-sm text-center py-4">No recent activity for this subject.</p>
                                )}
                            </ul>
                        </GlassCard>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubjectPage;