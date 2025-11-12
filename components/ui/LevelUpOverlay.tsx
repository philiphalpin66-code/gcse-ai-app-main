import React, { useEffect } from 'react';

interface LevelUpOverlayProps {
  title: string;
  subtitle: string;
  icon: string;
  onClose: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ title, subtitle, icon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Increased slightly for better visual timing

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in"
        style={{ animationDuration: '500ms' }}
    >
      <div className="text-center animate-fade-in-up" style={{ animationDuration: '600ms' }}>
        <div className="relative inline-block">
          <div className="absolute -inset-8 bg-gradient-to-r from-accent-blue to-accent-green rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <p className="relative text-8xl drop-shadow-lg">{icon}</p>
        </div>
        <h1 className="relative text-4xl font-bold text-white mt-6 drop-shadow-lg">{title}</h1>
        <p className="relative text-lg text-secondary mt-2 max-w-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default LevelUpOverlay;