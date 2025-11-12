import React from 'react';
import { User } from '../types';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {

  const handleLogin = () => {
    // This now just triggers the authentication process handled by the AppContext.
    onAuth();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <GlassCard className="w-full max-w-md text-center">
        <div className="relative isolate mb-6">
            <div 
                className="absolute -inset-20 top-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(78,159,255,0.18),_transparent_70%)] -z-10" 
                aria-hidden="true"
            />
            <h1 className="text-xl font-semibold text-primary mb-2" style={{lineHeight: '1.4'}}>Welcome to</h1>
            <h2 className="text-4xl md:text-5xl font-semibold text-primary">GCSE AI Coach</h2>
        </div>
        <p className="text-secondary text-base leading-relaxed mb-8 max-w-[600px] mx-auto">
          Sign in to start your session. In a development environment without Firebase keys, a demo user will be used automatically.
        </p>
        
        <PrimaryButton
          className="w-full !py-3 !text-base"
          onClick={handleLogin}
        >
          Sign In
        </PrimaryButton>
      </GlassCard>
    </div>
  );
};

export default AuthPage;