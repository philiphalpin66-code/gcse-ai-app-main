import React, { useState } from 'react';
import { MicroLesson } from '../types';
import { ICONS } from '../constants';

interface MicroLessonCardProps {
  lesson: MicroLesson;
  onComplete: (quickCheckCorrect: boolean) => void;
}

const MicroLessonCard: React.FC<MicroLessonCardProps> = ({ lesson, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleCheckAnswer = () => {
    if (selectedOption) {
      setIsAnswered(true);
    }
  };

  const handleComplete = () => {
    const quickCheckWasCorrect = selectedOption === lesson.check.answer;
    onComplete(quickCheckWasCorrect);
  };

  const getOptionClasses = (option: string) => {
    if (!isAnswered) {
      return `hover:bg-slate-600 ${selectedOption === option ? 'bg-indigo-600/50 ring-2 ring-indigo-400' : 'bg-slate-700/50'}`;
    }
    if (option === lesson.check.answer) {
      return 'bg-green-500/30 ring-2 ring-green-400';
    }
    if (option === selectedOption && option !== lesson.check.answer) {
      return 'bg-red-500/30 ring-2 ring-red-400';
    }
    return 'bg-slate-700/50 opacity-60';
  };

  return (
    <div className="panel bg-slate-800 border border-indigo-500/30 shadow-lg shadow-indigo-900/20 p-6 w-full max-w-2xl mx-auto animate-fade-in space-y-4">
      <header className="text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">90-Second Refresher</h2>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">{lesson.topic}</h1>
      </header>
      
      <div className="p-4 bg-slate-700/50">
        <p className="text-center text-slate-200 font-semibold">"{lesson.core}"</p>
      </div>

      <div className="space-y-3">
        {(lesson.steps || []).map((step, index) => (
          <div key={index} className="flex items-center p-3 bg-slate-700/50">
            <span className="text-indigo-400 font-bold text-lg mr-3">{index + 1}</span>
            <p className="text-slate-300">{step}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-red-500/10 border border-red-500/20">
          <p className="font-semibold text-red-300">Common Slip-up</p>
          <p className="text-slate-300 mt-1">{lesson.slip}</p>
        </div>
        <div className="p-3 bg-green-500/10 border border-green-500/20">
          <p className="font-semibold text-green-300">Remember This</p>
          <p className="text-slate-300 mt-1">{lesson.cue}</p>
        </div>
      </div>
      
      <div className="border-t border-slate-700 pt-4">
        <h3 className="font-bold text-slate-200 text-center mb-3">Quick Check</h3>
        <p className="text-slate-300 mb-4 text-center">{lesson.check.question}</p>
        <div className="space-y-2">
          {lesson.check.options.map((option, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <button
                key={index}
                onClick={() => !isAnswered && setSelectedOption(label)}
                disabled={isAnswered}
                className={`w-full text-left p-3 transition-all duration-200 flex items-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-indigo-400 ${getOptionClasses(label)}`}
              >
                <span className="font-bold mr-3">{label}.</span> {option}
              </button>
            );
          })}
        </div>
        {isAnswered && (
          <div className="mt-4 p-3 bg-slate-700 text-center animate-fade-in">
            <p className="font-semibold text-slate-200">
              {selectedOption === lesson.check.answer ? "Correct!" : "Not quite."}
            </p>
            <p className="text-sm text-slate-400 mt-1">{lesson.check.rationale}</p>
          </div>
        )}
      </div>

      <footer className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
        <button 
          onClick={isAnswered ? handleComplete : handleCheckAnswer}
          disabled={!selectedOption}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 transition shadow-md shadow-indigo-900/20 disabled:bg-indigo-500/50 disabled:cursor-not-allowed min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-indigo-400"
        >
          {isAnswered ? 'Continue Practice' : 'Check Answer'}
        </button>
      </footer>
    </div>
  );
};

export default MicroLessonCard;