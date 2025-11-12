import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';

interface StreakCardProps {
  streak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const [animate, setAnimate] = useState(false);
  const prevStreakRef = React.useRef(streak);

  useEffect(() => {
    if (streak > prevStreakRef.current && streak >= 3) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2500); // Duration of the animation
      return () => clearTimeout(timer);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  return (
    <GlassCard className={`flex flex-col items-center justify-center text-center ${animate ? 'streak-glow' : ''}`}>
      <h3 className="text-sm font-bold text-primary mb-1">Streak</h3>
      <p className="text-4xl font-bold text-amber-400">🔥 {streak}</p>
      <p className="text-xs text-secondary mt-1">Keep it going!</p>
    </GlassCard>
  );
};

export default StreakCard;