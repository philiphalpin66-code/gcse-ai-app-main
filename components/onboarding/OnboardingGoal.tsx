import React, { useState } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import GlassCard from '../ui/GlassCard';
import { OnboardingData } from '../../types';
import PrimaryButton from '../ui/PrimaryButton';

interface OnboardingGoalProps {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const goals = [
  { id: 'improve_grade', icon: '📈', title: 'Improve my grade', description: 'Target specific topics to boost your scores.' },
  { id: 'stay_organised', icon: '📅', title: 'Stay organised', description: 'Get a clear, structured plan for your revision.' },
  { id: 'feel_confident', icon: '💪', title: 'Feel more confident', description: 'Build knowledge and reduce exam stress.' },
] as const;


const OnboardingGoal: React.FC<OnboardingGoalProps> = ({ onNext, onBack }) => {
    const [selectedGoal, setSelectedGoal] = useState<OnboardingData['goal'] | null>(null);

    const handleSelectGoal = (goal: OnboardingData['goal']) => {
        setSelectedGoal(goal);
    };

    const handleContinue = () => {
        if (selectedGoal) {
            onNext({ goal: selectedGoal });
        }
    };

    return (
        <OnboardingWrapper step={2} totalSteps={8} onBack={onBack}>
            <div className="animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold text-primary">
                    What’s your main goal?
                </h1>
                <p className="text-secondary text-lg leading-relaxed mt-2">
                    This helps us personalize your experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {goals.map((goal) => {
                        const isSelected = selectedGoal === goal.id;
                        return (
                            <GlassCard
                                key={goal.id}
                                onClick={() => handleSelectGoal(goal.id)}
                                className={`cursor-pointer text-center !p-8 transition-all duration-300 ${isSelected ? 'border-accent-blue scale-105' : 'border-transparent'}`}
                                style={isSelected ? { boxShadow: `0 0 25px var(--accent-blue)` } : {}}
                            >
                                <span className="text-5xl">{goal.icon}</span>
                                <h3 className="text-xl font-bold text-primary mt-4">{goal.title}</h3>
                                <p className="text-secondary mt-2">{goal.description}</p>
                            </GlassCard>
                        )
                    })}
                </div>
                <div className="mt-12">
                    <PrimaryButton
                        onClick={handleContinue}
                        disabled={!selectedGoal}
                        className="!px-12 !py-4 !text-lg"
                    >
                        Continue
                    </PrimaryButton>
                </div>
            </div>
        </OnboardingWrapper>
    );
};

export default OnboardingGoal;