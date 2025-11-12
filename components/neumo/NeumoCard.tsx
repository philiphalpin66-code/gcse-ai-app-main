

import React from 'react';

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface NeumoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const NeumoCard: React.FC<NeumoCardProps> = ({ children, className = '', padding = 'md', ...props }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-[var(--neumo-bg)]
        rounded-[var(--neumo-radius-lg)]
        border border-[var(--neumo-separator-color)]
        shadow-[var(--neumo-shadow)]
        transition-all duration-300 ease-in-out
        hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-1
        animate-fade-in-up
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default NeumoCard;