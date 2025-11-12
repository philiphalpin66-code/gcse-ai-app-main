import React, { useState } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import { SUBJECT_DATA, EXAM_BOARD_DATA } from '../../constants';
import GlassCard from '../ui/GlassCard';
import PrimaryButton from '../ui/PrimaryButton';
import { UserSelections, OnboardingData } from '../../types';

interface OnboardingSubjectsProps {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

// Helper can be moved to a utils file if used elsewhere
const hexToRgb = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
};

const OnboardingSubjects: React.FC<OnboardingSubjectsProps> = ({ onNext, onBack }) => {
  const [selections, setSelections] = useState<UserSelections>({});

  const handleSelectSubject = (subjectId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[subjectId]) {
        delete newSelections[subjectId];
      } else {
        newSelections[subjectId] = EXAM_BOARD_DATA[0].id; 
      }
      return newSelections;
    });
  };

  const handleSelectBoard = (e: React.MouseEvent, subjectId: string, boardId: string) => {
    e.stopPropagation();
    setSelections(prev => ({
      ...prev,
      [subjectId]: boardId,
    }));
  };

  const handleContinue = () => {
    onNext({ selections });
  };
  
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <OnboardingWrapper step={3} totalSteps={8} onBack={onBack}>
        <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Choose Your Subjects</h1>
            <p className="text-secondary text-lg leading-relaxed mt-2 max-w-2xl mx-auto">
                Select the subjects you're studying and your exam board for each one.
            </p>
        </div>

        <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 max-h-[60vh] overflow-y-auto pr-4">
          {SUBJECT_DATA.map((subject, index) => {
            const isSelected = !!selections[subject.id];
            
            const cardStyle = isSelected ? { 
              borderColor: subject.color, 
              boxShadow: `0 0 25px ${subject.color}50, ${'var(--surface-shadow)'}`,
              transform: 'scale(1.05)'
            } : {
              boxShadow: 'var(--surface-shadow)'
            };
            
            const rgbColor = isSelected ? hexToRgb(subject.color) : null;
            const iconStyle: React.CSSProperties = rgbColor ? { '--subject-accent-rgb': rgbColor } as React.CSSProperties : {};

            return (
              <div 
                key={subject.id} 
                className={`subject-card ${isSelected ? 'active' : ''} flex flex-col items-center gap-3`}
              >
                <GlassCard
                  onClick={() => handleSelectSubject(subject.id)}
                  className={`w-full aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 !p-4 hover:!scale-105 hover:!shadow-[0_0_25px_rgba(78,159,255,0.25)] rounded-[var(--radius-card)]`}
                  style={cardStyle}
                >
                  <span className="text-5xl mb-2 subject-icon" style={iconStyle}>{subject.icon}</span>
                  <h3 className="font-bold text-primary text-md">{subject.name}</h3>
                </GlassCard>

                <div className={`flex items-center justify-center flex-wrap gap-2 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {EXAM_BOARD_DATA.map(board => {
                    const isBoardSelected = selections[subject.id] === board.id;
                    return (
                      <div key={board.id} className="exam-board-pill-container">
                        <button
                          onClick={(e) => handleSelectBoard(e, subject.id, board.id)}
                          className="exam-board-pill"
                           style={{
                            backgroundColor: isBoardSelected ? board.color : 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'transparent',
                            boxShadow: isBoardSelected
                              ? `0 0 12px ${board.color}99`
                              : '0 0 10px rgba(0,0,0,0.2)',
                          }}
                        >
                          {board.name}
                        </button>
                        <div className="exam-board-tooltip">{board.tooltip}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </main>
        
        <div className="mt-12">
            <PrimaryButton 
                onClick={handleContinue} 
                disabled={!hasSelections}
                className="!px-12 !py-4 !text-lg"
            >
                Continue
            </PrimaryButton>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingSubjects;