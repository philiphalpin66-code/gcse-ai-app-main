import React, { useState } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import GlassCard from '../ui/GlassCard';
import GlassInput from '../ui/GlassInput';
import PrimaryButton from '../ui/PrimaryButton';

interface OnboardingTrialProps {
  onNext: () => void;
  onBack: () => void;
}

const OnboardingTrial: React.FC<OnboardingTrialProps> = ({ onNext, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  return (
    <OnboardingWrapper step={7} totalSteps={8} onBack={onBack}>
        <div className="animate-fade-in-up max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Start Your 7-Day Challenge
            </h1>
            <p className="text-secondary text-lg leading-relaxed mt-2">
                Unlock all features, completely free for one week.
            </p>
            
            <GlassCard className="mt-12 text-left space-y-4">
                <GlassInput 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                />
                 <GlassInput 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                />
            </GlassCard>

             <div className="mt-8">
                <PrimaryButton 
                    onClick={onNext}
                    className="!px-12 !py-4 !text-lg w-full"
                >
                    Start My Free Week
                </PrimaryButton>
                <p className="text-tertiary text-sm mt-4">
                    No ads • Cancel anytime.
                </p>
            </div>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingTrial;