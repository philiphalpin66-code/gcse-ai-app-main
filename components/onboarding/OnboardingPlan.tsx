import React from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import GlassCard from '../ui/GlassCard';
import PrimaryButton from '../ui/PrimaryButton';
import Pill from '../ui/Pill';

interface OnboardingPlanProps {
  onNext: () => void;
  onBack: () => void;
}

const mockPlan = [
  { day: 'Mon', subject: 'Maths', task: 'Practice algebraic fractions', icon: '➕' },
  { day: 'Tue', subject: 'Biology', task: 'Review cell structure flashcards', icon: '🧬' },
  { day: 'Wed', subject: 'English', task: 'Analyse unseen poetry', icon: '✍️' },
];

const OnboardingPlan: React.FC<OnboardingPlanProps> = ({ onNext, onBack }) => {
  return (
    <OnboardingWrapper step={5} totalSteps={8} onBack={onBack}>
        <div className="animate-fade-in-up max-w-lg mx-auto">
             <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Your AI Study Plan
            </h1>
            <p className="text-secondary text-lg leading-relaxed mt-2">
                We’ll guide you step-by-step to keep you on track.
            </p>

            <GlassCard className="mt-12 text-left">
                <h2 className="text-xl font-bold text-primary mb-4">Your 7-Day Plan</h2>
                <div className="space-y-3">
                    {mockPlan.map((item, index) => (
                        <div 
                            key={item.day} 
                            className="flex items-center p-3 bg-black/20 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms`}}
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full mr-4 text-2xl">{item.icon}</div>
                            <div>
                                <p className="font-bold text-primary">{item.day}: {item.subject}</p>
                                <p className="text-secondary text-sm">{item.task}</p>
                            </div>
                        </div>
                    ))}
                     <div className="flex items-center p-3 bg-black/20">
                        <div className="w-10 h-10 shimmer-bg rounded-full mr-4"></div>
                        <div className="w-full space-y-2">
                            <div className="h-4 w-1/2 shimmer-bg rounded"></div>
                            <div className="h-3 w-3/4 shimmer-bg rounded"></div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="mt-12">
                <PrimaryButton 
                    onClick={onNext}
                    className="!px-12 !py-4 !text-lg"
                >
                    Continue
                </PrimaryButton>
            </div>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingPlan;