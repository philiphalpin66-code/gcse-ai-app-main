import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { useAppContext } from '../../state/AppContext';
import SecondaryButton from '../ui/SecondaryButton';
import { retestWeakTopics } from '../../services/studyLoop';
import { getSubjectForTopic } from '../../utils/subjectHelpers';
import { SUBJECT_DATA } from '../../constants';
import { Question } from '../../types';
import Spinner from '../Spinner';

const WeakTopicsCard: React.FC = () => {
    const { studentState, user, userSelections, handleStartBlitz } = useAppContext();
    const [retestingTopic, setRetestingTopic] = useState<string | null>(null);

    const handleRetest = async (topic: string) => {
        if (!user || retestingTopic) return;
        setRetestingTopic(topic);

        try {
            const subjectName = getSubjectForTopic(topic);
            const subjectInfo = SUBJECT_DATA.find(s => s.name === subjectName);
            const subjectId = subjectInfo?.id;
            const board = subjectId ? userSelections[subjectId] || 'AQA' : 'AQA';

            const retestQuestions: Question[] = await retestWeakTopics({
                user,
                weakTopics: [topic],
                subject: subjectName || 'Unknown',
                board: board,
                spec_code: 'GCSE (9-1) 2024-2025',
                topicLimit: 1,
            });
            
            if (retestQuestions.length > 0) {
                 const retestConfig = {
                    board,
                    subject: subjectName || 'Unknown',
                    paper: 'Retest',
                    topics: [topic],
                    questionCount: retestQuestions.length,
                    type: 'blitz' as const,
                    syllabus_version: 'GCSE (9-1) 2024-2025',
                    paper_name: "Targeted Retest"
                };
                handleStartBlitz(retestConfig, retestQuestions);
            } else {
                console.warn("Retest generated no questions for topic:", topic);
            }
        } catch (error) {
            console.error("Failed to start retest for weak topic:", error);
        } finally {
            setRetestingTopic(null);
        }
    };

    const topics = studentState.weakTopics.slice(0, 3);

    return (
        <GlassCard className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold text-primary mb-2">Focus Areas</h3>
            {topics.length > 0 ? (
                <div className="space-y-2">
                    {topics.map(topic => (
                        <div key={topic} className="flex items-center justify-between bg-black/10 p-2 rounded-md">
                            <p className="text-sm font-semibold text-primary truncate pr-2">{topic}</p>
                            <SecondaryButton 
                                onClick={() => handleRetest(topic)} 
                                disabled={!!retestingTopic}
                                className="!py-1 !px-3 !text-xs whitespace-nowrap"
                            >
                                {retestingTopic === topic ? <Spinner/> : 'Practice'}
                            </SecondaryButton>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-secondary text-center">No weak topics found. Great job!</p>
                </div>
            )}
        </GlassCard>
    );
};

export default WeakTopicsCard;