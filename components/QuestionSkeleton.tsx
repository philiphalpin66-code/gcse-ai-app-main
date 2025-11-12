
import React from 'react';
import GlassCard from './ui/GlassCard';

const QuestionSkeleton: React.FC = () => {
  return (
    <GlassCard>
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-6 bg-white/10 rounded-full w-20"></div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
          <div className="h-3 bg-white/10 rounded w-full"></div>
        </div>
        <div className="h-40 bg-black/20 rounded-lg mt-4"></div>
        <div className="flex justify-end items-center mt-6">
            <div className="h-10 bg-white/10 rounded-md w-1/4"></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default React.memo(QuestionSkeleton);
