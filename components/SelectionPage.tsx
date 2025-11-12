import React, { useState } from 'react';
import { SUBJECT_DATA, EXAM_BOARD_DATA } from '../constants';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import { UserSelections } from '../types';

interface SelectionPageProps {
  onSelectionComplete: (selections: UserSelections) => void;
}

// Helper to convert hex to an RGB string for CSS variables
const hexToRgb = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #RRGGBB
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
};


const SelectionPage: React.FC<SelectionPageProps> = ({ onSelectionComplete }) => {
  const [selections, setSelections] = useState<UserSelections>({});

  const handleSelectSubject = (subjectId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[subjectId]) {
        delete newSelections[subjectId];
      } else {
        // Default to AQA when a new subject is selected
        newSelections[subjectId] = EXAM_BOARD_DATA[0].id; 
      }
      return newSelections;
    });
  };

  const handleSelectBoard = (e: React.MouseEvent, subjectId: string, boardId: string) => {
    e.stopPropagation(); // Prevent card from being deselected
    setSelections(prev => ({
      ...prev,
      [subjectId]: boardId,
    }));
  };
  
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Choose Your Subjects</h1>
          <p className="text-secondary text-lg leading-relaxed mt-2 max-w-2xl mx-auto">
            Select the subjects you're studying and your exam board for each one.
          </p>
        </header>

        <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                className={`subject-card ${isSelected ? 'active' : ''} flex flex-col items-center gap-3 animate-fade-in-up`} 
                style={{ animationDelay: `${index * 30}ms` }}
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
        
        <div className="h-32"></div>

        <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-[var(--bg-gradient-start)] to-transparent z-10">
            <PrimaryButton 
                onClick={() => onSelectionComplete(selections)} 
                disabled={!hasSelections}
                className="!px-12 !py-4 !text-lg"
            >
                Continue
            </PrimaryButton>
        </footer>
      </div>
    </div>
  );
};

export default SelectionPage;