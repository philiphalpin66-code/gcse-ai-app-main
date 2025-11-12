import React from 'react';
import { SubjectProgress } from '../../types';
import GlassCard from './GlassCard';
import { SUBJECT_DATA } from '../../constants';
import { ICONS } from '../../constants';

interface ProgressBarsGridProps {
  subjects: SubjectProgress[];
  onNavigateToSubject: (subjectId: string) => void;
}

const ProgressBarsGrid: React.FC<ProgressBarsGridProps> = ({ subjects, onNavigateToSubject }) => {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold text-primary mb-4">Subject Progress</h2>
      <div className="space-y-4">
        {subjects.length > 0 ? subjects.map(subject => {
          const subjectInfo = SUBJECT_DATA.find(s => s.id === subject.id);
          const progressPercentage = (subject.currentGrade / 9) * 100;

          return (
            <div 
              key={subject.id} 
              className="cursor-pointer group p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => onNavigateToSubject(subject.id)}
              aria-label={`View details for ${subject.name}`}
              role="button"
            >
              <div className="flex justify-between items-center mb-1.5 transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{subjectInfo?.icon || '📚'}</span>
                  <span className="font-semibold text-primary group-hover:text-accent-blue">{subject.name}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-bold mr-3" style={{ color: subjectInfo?.color || 'var(--accent-blue)' }}>
                        Grade {subject.currentGrade.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-green-400 flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        +0.0
                    </span>
                </div>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: subjectInfo?.color || 'var(--accent-blue)',
                    boxShadow: `0 0 8px ${subjectInfo?.color}80`
                  }}
                ></div>
              </div>
            </div>
          )
        }) : (
          <p className="text-secondary text-center py-4">Select subjects on the home page to see your progress here!</p>
        )}
      </div>
    </GlassCard>
  );
};

export default ProgressBarsGrid;