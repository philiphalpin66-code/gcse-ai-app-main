import React, { useState, useMemo } from 'react';
import { ExamConfig, UserSelections } from '../types';
import { TOPICS, SUBJECT_DATA } from '../constants';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import GlassSlider from './ui/GlassSlider';
import GlassTabs from './ui/GlassTabs';
import { useAppContext } from '../state/AppContext';

interface TopicBlitzBuilderPageProps {
  onStartBlitz: (config: ExamConfig) => void;
  onBack: () => void;
  userSelections: UserSelections;
}

const TopicBlitzBuilderPage: React.FC<TopicBlitzBuilderPageProps> = ({ onStartBlitz, onBack, userSelections }) => {
  const [board, setBoard] = useState<keyof typeof TOPICS>('AQA');
  const [subject, setSubject] = useState<keyof typeof TOPICS['AQA']>('Biology');
  const [paper, setPaper] = useState<string>('Paper 1');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const { progress } = useAppContext();

  const availableSubjectsForBoard = Object.keys(TOPICS[board]);
  
  const subjectsToShow = useMemo(() => {
    const userSelectedSubjectIds = Object.keys(userSelections);
    const userSubjectsForCurrentBoard = SUBJECT_DATA
      .filter(s => 
        userSelectedSubjectIds.includes(s.id) && 
        availableSubjectsForBoard.includes(s.name)
      )
      .map(s => s.name);

    return userSubjectsForCurrentBoard.length > 0 ? userSubjectsForCurrentBoard : availableSubjectsForBoard;
  }, [board, userSelections, availableSubjectsForBoard]);


  const papersForSubject = TOPICS[board][subject];
  const availablePapers = Object.keys(papersForSubject);
  const availableTopics = papersForSubject[paper as keyof typeof papersForSubject] || [];


  useMemo(() => {
    if (!subjectsToShow.includes(subject)) {
      setSubject(subjectsToShow[0] as keyof typeof TOPICS['AQA']);
    }
  }, [board, subjectsToShow, subject]);

  useMemo(() => {
    if (!availablePapers.includes(paper)) {
      setPaper(availablePapers[0]);
    }
  }, [subject, availablePapers, paper]);

  useMemo(() => {
    setSelectedTopics([]);
  }, [paper]);
  
  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleStart = () => {
    if (selectedTopics.length > 0) {
      onStartBlitz({
        board,
        subject,
        paper,
        topics: selectedTopics,
        questionCount,
        type: 'blitz',
        syllabus_version: 'GCSE (9-1) 2024-2025',
      });
    }
  };

  const getMasteryScore = (topicName: string): number | null => {
      for (const subject of progress.subjects) {
          const topic = subject.topics.find(t => t.name.includes(topicName)); // Use includes for broader matching
          if (topic) {
              return topic.current; // topic.current is the 0-1 mastery score
          }
      }
      return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 pb-4 border-b border-white/10">
          <h1 className="text-3xl font-bold text-primary">Adaptive Practice Builder</h1>
          <p className="text-secondary text-lg leading-relaxed mt-2">
            Select your topics and the AI will generate a personalized practice session based on your mastery level.
          </p>
        </header>

        <GlassCard>
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-primary mb-3">Subject & Paper</label>
              <GlassTabs
                tabs={subjectsToShow}
                activeTab={subject}
                onTabClick={(tab) => setSubject(tab as keyof typeof TOPICS['AQA'])}
              />
              <div className="mt-4">
                 <GlassTabs
                    tabs={availablePapers}
                    activeTab={paper}
                    onTabClick={setPaper}
                  />
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-primary mb-3">Topics for this Session</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTopics.map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    const masteryScore = getMasteryScore(topic);
                    return (
                        <button
                            key={topic}
                            onClick={() => handleToggleTopic(topic)}
                            className={`topic-button p-4 text-left transition-all duration-200 border ${isSelected ? 'bg-accent-blue text-white shadow-lg border-transparent' : 'bg-slate-100 text-secondary hover:bg-slate-200 border-slate-200'} focus-visible:ring-2 focus-visible:ring-accent-blue`}
                        >
                            <span className="font-semibold">{topic}</span>
                            {masteryScore !== null && (
                                <div className="w-full bg-slate-300 rounded-full h-1.5 mt-2">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${masteryScore * 100}%`}}></div>
                                </div>
                            )}
                        </button>
                    )
                })}
              </div>
            </div>

             <div>
              <label className="block text-lg font-bold text-primary mb-3">Number of Questions: <span className="text-accent-blue">{questionCount}</span></label>
              <GlassSlider
                value={questionCount}
                onChange={setQuestionCount}
                min={3}
                max={15}
                step={1}
              />
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <SecondaryButton onClick={onBack}>Back</SecondaryButton>
              <PrimaryButton onClick={handleStart} disabled={selectedTopics.length === 0}>
                Start Adaptive Practice
              </PrimaryButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default TopicBlitzBuilderPage;