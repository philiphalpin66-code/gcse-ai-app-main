import React from 'react';
import { Achievement } from '../types';
import GlassCard from './ui/GlassCard';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <GlassCard className="h-full">
      <h3 className="text-sm font-medium text-tertiary uppercase tracking-wider mb-4">
        Achievements
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`flex flex-col items-center text-center p-3 transition-all ${ach.unlocked ? '' : 'opacity-60'}`}
            title={`${ach.title}: ${ach.description}`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-md ${ach.unlocked ? 'bg-accent-amber' : 'bg-white/10'}`}>
              {ach.icon}
            </div>
            <p className="mt-2 text-xs font-semibold text-secondary">
              {ach.title}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default Achievements;