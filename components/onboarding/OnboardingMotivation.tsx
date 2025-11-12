import React, { useState } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import GlassCard from '../ui/GlassCard';
import GlassInput from '../ui/GlassInput';
import PrimaryButton from '../ui/PrimaryButton';
import { OnboardingData } from '../../types';

interface OnboardingMotivationProps {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const avatars = ['🏆', '🚀', '🧠', '⚡️', '🔥', '🎯', '💡', '🌟'];

const OnboardingMotivation: React.FC<OnboardingMotivationProps> = ({ onNext, onBack }) => {
  const [name, setName] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🏆');

  const handleContinue = () => {
    onNext({ name, avatar: selectedAvatar, targetGrade });
  };

  return (
    <OnboardingWrapper step={4} totalSteps={8} onBack={onBack}>
        <div className="animate-fade-in-up max-w-lg mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Let's Get Motivated!
            </h1>
            <p className="text-secondary text-lg leading-relaxed mt-2">
                A little personalization goes a long way.
            </p>
            
            <GlassCard className="mt-12 text-left space-y-8">
                <div>
                    <label className="block text-lg font-bold text-primary mb-3">What should we call you?</label>
                    <GlassInput 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name or nickname"
                    />
                </div>
                
                <div>
                     <label className="block text-lg font-bold text-primary mb-3">Choose your avatar</label>
                     <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {avatars.map(avatar => (
                            <button 
                                key={avatar}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`aspect-square text-4xl flex items-center justify-center transition-all duration-200 rounded-full ${selectedAvatar === avatar ? 'bg-accent-blue scale-110 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                {avatar}
                            </button>
                        ))}
                     </div>
                </div>

                <div>
                    <label className="block text-lg font-bold text-primary mb-3">What grade are you aiming for? <span className="text-sm text-tertiary">(Optional)</span></label>
                    <GlassInput 
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        placeholder="e.g., Grade 9"
                    />
                </div>
            </GlassCard>

             <div className="mt-12">
                <PrimaryButton 
                    onClick={handleContinue}
                    disabled={!name.trim()}
                    className="!px-12 !py-4 !text-lg"
                >
                    Continue
                </PrimaryButton>
            </div>
        </div>
    </OnboardingWrapper>
  );
};

export default OnboardingMotivation;