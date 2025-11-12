import React from 'react';
import GlassCard from './ui/GlassCard';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak = 7,
  longestStreak = 21,
}) => {
  return (
    <GlassCard className="text-center flex flex-col items-center w-full max-w-xs mx-auto">
      <h3 className="text-sm font-medium text-tertiary uppercase tracking-wider mb-2">
        Practice Streak
      </h3>

      <div className="relative my-2" title="Keep your streak alive!">
        <span className="text-6xl font-extrabold text-accent-amber">
          {currentStreak}
        </span>
        {currentStreak > 0 && (
          <span className="absolute -inset-3 bg-accent-amber/10 rounded-full blur-xl animate-pulse duration-3000"></span>
        )}
      </div>

      <p className="text-primary text-lg font-medium">
        {currentStreak === 1 ? 'Day' : 'Days'}
      </p>

      <div className="w-1/2 h-px bg-white/10 my-4"></div>

      <p className="text-sm text-tertiary">
        Longest Streak: <span className="font-bold text-secondary">{longestStreak} days</span>
      </p>
    </GlassCard>
  );
};

export default StreakTracker;