import React from 'react';

interface OnboardingWrapperProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children, step, totalSteps, onBack, showBack = true }) => {
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-10">
        <div className="bg-[var(--surface-color)] h-full">
            <div 
              className="progress-bar-neon h-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
      </div>
      
      {/* Back Button */}
      {showBack && onBack && (
         <button 
            onClick={onBack}
            className="fixed top-6 left-6 z-10 flex items-center text-secondary hover:text-primary transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
         </button>
      )}

      <div className="w-full max-w-4xl text-center">
        {children}
      </div>
    </div>
  );
};

export default OnboardingWrapper;