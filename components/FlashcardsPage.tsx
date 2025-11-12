import React, { useState, useMemo } from 'react';
import SecondaryButton from './ui/SecondaryButton';
import GlassCard from './ui/GlassCard';
import Pill from './ui/Pill';
import { useFlow } from './FlowController';
import { SessionResult } from '../types';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const MOCK_FLASHCARDS: Flashcard[] = [
  { id: 'c1', question: 'What is the function of the mitochondria?', answer: 'To carry out aerobic respiration, releasing energy for the cell.' },
  { id: 'c2', question: 'What is a ribosome?', answer: 'A small organelle responsible for protein synthesis.' },
  { id: 'c3', question: 'Describe the cell wall in a plant cell.', answer: 'A rigid outer layer made of cellulose that provides structural support.' },
  { id: 'c4', question: 'What is osmosis?', answer: 'The net movement of water molecules across a partially permeable membrane from a region of higher water concentration to a region of lower water concentration.' },
  { id: 'c5', question: 'What is the role of the nucleus?', answer: 'It contains the genetic material (DNA) and controls the activities of the cell.' },
];

const MASTERY_MESSAGES = [
    { threshold: 0, message: "Let's get started! Every card you review helps." },
    { threshold: 25, message: "You're building a foundation. Keep up the great work!" },
    { threshold: 50, message: "Great progress! You're really getting the hang of this." },
    { threshold: 75, message: "Excellent! You've nearly mastered this topic." },
    { threshold: 95, message: "Incredible! You have a solid command of this material." },
]

const FlashcardsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answerState, setAnswerState] = useState<'correct' | 'incorrect' | null>(null);
  const [mastery, setMastery] = useState(30);
  const { endSession } = useFlow();

  // State for progress tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentCard = MOCK_FLASHCARDS[currentIndex];
  
  const encouragementMessage = useMemo(() => {
    return [...MASTERY_MESSAGES].reverse().find(m => mastery >= m.threshold)?.message || "Let's get started!";
  }, [mastery]);

  const handleEndSession = () => {
    const result: SessionResult = {
      correct: correctCount,
      total: answeredCount > 0 ? answeredCount : 1, // Avoid division by zero
    };
    endSession('flashcards', 'Biology', result);
  };

  const handleAnswer = (correct: boolean) => {
    if (answerState) return; // Prevent multiple clicks
    
    setAnswerState(correct ? 'correct' : 'incorrect');
    setMastery(prev => Math.max(0, Math.min(100, prev + (correct ? 10 : -5))));
    
    // Update progress
    setAnsweredCount(prev => prev + 1);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }


    setTimeout(() => {
        setAnswerState(null);
        setIsFlipped(false);
        if (currentIndex < MOCK_FLASHCARDS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // End of deck logic
            console.log("Deck finished!");
            handleEndSession();
        }
    }, 1200);
  };
  
  if (!currentCard) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Deck Complete!</h1>
            <SecondaryButton onClick={handleEndSession}>Back to Home</SecondaryButton>
        </div>
      )
  }

  const answerStateClass = answerState === 'correct' ? 'flashcard-correct' : answerState === 'incorrect' ? 'flashcard-incorrect' : '';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Flashcards Trainer</h1>
                    <p className="text-secondary text-lg leading-relaxed mt-1">Biology • Cells</p>
                </div>
                <SecondaryButton onClick={handleEndSession}>End Session</SecondaryButton>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`flashcard-wrapper ${answerStateClass}`}>
                    <div className="flashcard-container h-80" onClick={() => !isFlipped && setIsFlipped(true)}>
                        <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                             {/* Front of Card */}
                            <GlassCard className="flashcard-face">
                                <p className="text-2xl font-semibold text-primary text-center">
                                    {currentCard.question}
                                </p>
                            </GlassCard>
                            {/* Back of Card */}
                             <GlassCard className="flashcard-face flashcard-back">
                                <p className="text-xl font-semibold text-secondary text-center flex-grow flex items-center">
                                    {currentCard.answer}
                                </p>
                                <div className="flex w-full justify-around pt-4 border-t border-white/10">
                                    <button onClick={() => handleAnswer(false)} className="btn-flashcard-answer px-8 py-3 min-h-[44px] bg-accent-magenta/20 text-accent-magenta font-bold hover:bg-accent-magenta/30 transition-colors focus-visible:ring-2 focus-visible:ring-accent-magenta">
                                        Incorrect
                                    </button>
                                    <button onClick={() => handleAnswer(true)} className="btn-flashcard-answer px-8 py-3 min-h-[44px] bg-accent-green/20 text-accent-green font-bold hover:bg-accent-green/30 transition-colors focus-visible:ring-2 focus-visible:ring-accent-green">
                                        Correct
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                <GlassCard className="flex flex-col justify-center items-center text-center h-80">
                    <h2 className="text-xl font-bold text-primary mb-4">Topic Mastery</h2>
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between items-center mb-1 text-secondary">
                            <span>Novice</span>
                            <span>Expert</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden border border-white/10">
                            <div 
                                className="bg-gradient-to-r from-accent-blue to-accent-green h-full rounded-full transition-all duration-500"
                                style={{ width: `${mastery}%` }}
                            ></div>
                        </div>
                        <p className="font-bold text-3xl text-primary mt-4">{mastery}%</p>
                    </div>
                    <p className="text-secondary mt-6 max-w-xs">{encouragementMessage}</p>
                </GlassCard>
            </main>
        </div>
    </div>
  );
};

export default FlashcardsPage;