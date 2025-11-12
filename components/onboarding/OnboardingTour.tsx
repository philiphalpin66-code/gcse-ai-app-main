import React, { useState, useEffect } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import PrimaryButton from '../ui/PrimaryButton';

interface OnboardingTourProps {
  introMessage: string | null;
  onNext: () => void;
  onBack: () => void;
}

const TourStep: React.FC<{ title: string, description: string, className?: string, delay?: number }> = 
({ title, description, className = '', delay = 0 }) => (
    <div 
        className={`absolute bg-slate-800 p-4 border border-accent-blue shadow-lg shadow-accent-blue/20 animate-fade-in-up ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <h4 className="font-bold text-primary text-gradient">{title}</h4>
        <p className="text-secondary text-sm mt-1">{description}</p>
    </div>
);


const OnboardingTour: React.FC<OnboardingTourProps> = ({ introMessage, onNext, onBack }) => {
  const [hasRendered, setHasRendered] = useState(false);
  const isLoading = introMessage === null;
  const message = introMessage || "Here are the main tools to power your revision.";
  
  useEffect(() => {
    if (!isLoading && !hasRendered) {
      setHasRendered(true);
    }
  }, [isLoading, hasRendered]);

  return (
    <OnboardingWrapper step={6} totalSteps={8} onBack={onBack}>
        <div className="animate-fade-in-up w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
                A Quick Tour
            </h1>
            {isLoading && !hasRendered ? (
                <div className="h-7 w-3/4 shimmer-bg rounded mx-auto mt-2"></div>
            ) : (
                <p className="text-secondary text-lg leading-relaxed mt-2 animate-fade-in" style={{ animationDuration: '250ms' }}>
                    {message}
                </p>
            )}
            
            {/* Mock Dashboard Layout */}
            <div className="relative mt-8 w-full max-w-4xl h-[450px] mx-auto bg-black/20 border border-white/10 p-6">
                {/* Mock Nav */}
                <div className="absolute top-4 left-6 h-6 w-1/3 shimmer-bg"></div>

                {/* Mock Main Content */}
                <div className="grid grid-cols-3 gap-6 h-full mt-10">
                    <div className="col-span-1 h-full shimmer-bg"></div>
                    <div className="col-span-2 h-full shimmer-bg"></div>
                </div>
                
                {/* Tour Overlays */}
                <div className="absolute inset-0">
                    <TourStep 
                        title="Your Planner" 
                        description="AI-curated weekly plans to keep you on track."
                        className="top-1/4 left-10"
                        delay={200}
                    />
                     <TourStep 
                        title="Practice Modes" 
                        description="Start flashcards, topic blitzes, or full mock exams."
                        className="top-1/2 right-10"
                        delay={400}
                    />
                     <TourStep 
                        title="AI Coach" 
                        description="Get 1-on-1 help and explanations anytime."
                        className="bottom-10 left-1/2 -translate-x-1/2"
                        delay={600}
                    />
                </div>
            </div>

            <div className="mt-12">
                <PrimaryButton 
                    onClick={onNext}
                    className="!px-12 !py-4 !text-lg"
                >
                    Got it!
                </PrimaryButton>
            </div>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingTour;