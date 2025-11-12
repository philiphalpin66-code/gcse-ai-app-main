import React, { useState, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';

const TrialCountdownBanner: React.FC = () => {
  const [trialInfo, setTrialInfo] = useState<{ day: number; message: string; show: boolean } | null>(null);

  useEffect(() => {
    try {
      const startDateString = localStorage.getItem('trialStartDate');
      if (!startDateString) {
        setTrialInfo({ day: 0, message: '', show: false });
        return;
      }

      const startDate = new Date(parseInt(startDateString, 10));
      const today = new Date();

      // Normalize dates to midnight to count full days
      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - startDate.getTime();
      const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const dayOfTrial = daysElapsed + 1;

      if (dayOfTrial > 7) {
        setTrialInfo({ 
            day: dayOfTrial, 
            message: "Your 7-Day Power-Up has finished 💡 Continue your journey to keep your streak!",
            show: true
        });
      } else if (dayOfTrial === 7) {
        setTrialInfo({
          day: 7,
          message: "Last day of your Power-Up! Finish strong and keep your progress.",
          show: true,
        });
      } else {
        setTrialInfo({
          day: dayOfTrial,
          message: `🎯 7-Day Power-Up: You’re on Day ${dayOfTrial}/7 — Keep your streak alive!`,
          show: true,
        });
      }
    } catch (error) {
      console.error("Failed to process trial data from localStorage", error);
      setTrialInfo({ day: 0, message: '', show: false });
    }
  }, []);

  if (!trialInfo || !trialInfo.show) {
    return null;
  }
  
  if (trialInfo.day >= 7) {
    return (
        <GlassCard className="mb-8 flex flex-col sm:flex-row items-center justify-between !p-6 animate-fade-in-up bg-gradient-to-r from-accent-blue/10 to-accent-green/10">
            <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-primary">{trialInfo.message}</h3>
                <p className="text-secondary mt-1">You've mastered 3 topics and built a 21-day streak. Don't lose your momentum!</p>
            </div>
            <PrimaryButton onClick={() => console.log('Upgrade clicked')} className="!py-3 !px-6 text-base whitespace-nowrap mt-4 sm:mt-0 btn-glowing">
                Unlock Full Plan
            </PrimaryButton>
        </GlassCard>
    );
  }

  return (
    <GlassCard className="mb-8 flex flex-col sm:flex-row items-center justify-between !p-4 animate-fade-in-up">
      <p className="text-primary font-semibold text-center sm:text-left mb-3 sm:mb-0">
        {trialInfo.message}
      </p>
      <PrimaryButton onClick={() => console.log('Upgrade clicked')} className="!py-2 !px-5 text-sm whitespace-nowrap">
        Upgrade
      </PrimaryButton>
    </GlassCard>
  );
};

export default TrialCountdownBanner;