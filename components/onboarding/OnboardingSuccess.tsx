import React, { useEffect, useRef } from 'react';
import OnboardingWrapper from './OnboardingWrapper';
import PrimaryButton from '../ui/PrimaryButton';

interface OnboardingSuccessProps {
  onComplete: () => void;
}

// A simple confetti component adapted from the particle effect
const Confetti: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const colors = ['#4E9FFF', '#62F5A5', '#C55FFF', '#FFB347'];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const createConfetti = () => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = `${Math.random() * 8 + 5}px`;
            confetti.style.height = confetti.style.width;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-20px`;
            confetti.style.opacity = '1';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.transition = 'transform 4s linear, top 4s linear, opacity 2s ease-out';
            container.appendChild(confetti);

            setTimeout(() => {
                confetti.style.top = '110vh';
                confetti.style.transform = `rotate(${Math.random() * 360 + 360}deg)`;
                confetti.style.opacity = '0';
            }, 50);

            setTimeout(() => {
                confetti.remove();
            }, 4000);
        };

        const interval = setInterval(createConfetti, 100);
        
        return () => clearInterval(interval);

    }, []);

    return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" />;
}

const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ onComplete }) => {
  return (
    <div className="relative">
        <Confetti />
        <OnboardingWrapper step={8} totalSteps={8} showBack={false}>
            <div className="relative animate-fade-in-up">
                <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,_var(--accent-green)_0%,_transparent_60%)] opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary">
                    You're all set!
                </h1>
                <p className="text-secondary text-lg leading-relaxed mt-4 max-w-lg mx-auto">
                    You’re on your way to smashing your GCSEs! Let's start your first session.
                </p>
                <div className="mt-12">
                    <PrimaryButton 
                        onClick={onComplete}
                        className="!px-12 !py-4 !text-lg"
                    >
                        Go to Dashboard
                    </PrimaryButton>
                </div>
            </div>
        </OnboardingWrapper>
    </div>
  );
};

export default OnboardingSuccess;