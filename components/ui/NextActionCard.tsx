import React from 'react';
import { NextAction } from '../../types';
import GlassCard from './GlassCard';
import PrimaryButton from './PrimaryButton';

interface NextActionCardProps {
  action: NextAction | null;
  onStart: (action: NextAction) => void;
  className?: string;
}

const NextActionCard: React.FC<NextActionCardProps> = ({ action, onStart, className='' }) => {
  if (!action) {
    return (
      <GlassCard className={`${className} flex flex-col items-center justify-center text-center animate-fade-in-up`}>
        <h2 className="text-xl font-bold text-primary mb-2">You're all caught up!</h2>
        <p className="text-secondary max-w-xs">Take a break or review your streak. A new smart session will be ready for you soon.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`next-action-card ${className} flex flex-col justify-between animate-fade-in-up`}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-blue mb-2">Your Next Step</p>
        <h2 className="text-2xl font-bold text-primary leading-tight">{action.message}</h2>
      </div>
      <div className="mt-6 flex justify-end">
        <PrimaryButton onClick={() => onStart(action)} className="btn-glowing">
          Start
        </PrimaryButton>
      </div>
    </GlassCard>
  );
};

export default NextActionCard;
