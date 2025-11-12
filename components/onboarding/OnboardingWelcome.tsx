import React from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import PrimaryButton from '../ui/PrimaryButton';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onNext }) => {
  return (
    <OnboardingWrapper step={1} totalSteps={8} showBack={false}>
        <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
                Welcome to Your GCSE Power-Up
            </h1>
            <p className="text-secondary text-lg md:text-xl leading-relaxed mt-4 max-w-2xl mx-auto">
                AI-powered study made easy. Let's get you set up in just a few steps.
            </p>
            <div className="mt-12">
                <PrimaryButton 
                    onClick={onNext}
                    className="!px-12 !py-4 !text-lg"
                >
                    Get Started
                </PrimaryButton>
            </div>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingWelcome;