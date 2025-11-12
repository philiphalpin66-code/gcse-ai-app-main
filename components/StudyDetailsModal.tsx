import React from 'react';
import { StudySession } from '../types';
import GlassCard from './ui/GlassCard';
import Pill from './ui/Pill';
import PrimaryButton from './ui/PrimaryButton';

interface StudyDetailsModalProps {
  session: StudySession | null;
  onClose: () => void;
}

const StudyDetailsModal: React.FC<StudyDetailsModalProps> = ({ session, onClose }) => {
  if (!session) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-start mb-4">
            <div>
                <Pill color={session.color} className="mb-2">{session.subject}</Pill>
                <h2 className="text-2xl font-bold text-primary">{session.objective}</h2>
            </div>
            <div className="text-lg font-semibold text-tertiary whitespace-nowrap ml-4">{session.duration} min</div>
        </header>

        <div className="p-4 bg-black/20">
            <h3 className="font-semibold text-secondary mb-1">💡 Pro Tip</h3>
            <p className="text-primary">{session.tip}</p>
        </div>
        
        <footer className="mt-6 flex justify-end">
            <PrimaryButton onClick={onClose}>
                Got it
            </PrimaryButton>
        </footer>
      </GlassCard>
    </div>
  );
};

export default StudyDetailsModal;