import React from 'react';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';

interface ProgressRingCardProps {
  percent: number;
}

const ProgressRingCard: React.FC<ProgressRingCardProps> = ({ percent }) => {
  return (
    <GlassCard className="flex flex-col items-center justify-center text-center">
      <h3 className="text-sm font-bold text-primary mb-2">Last Score</h3>
      <ProgressRing percentage={percent} label={`${Math.round(percent)}%`} size={90} strokeWidth={8} />
    </GlassCard>
  );
};

export default ProgressRingCard;