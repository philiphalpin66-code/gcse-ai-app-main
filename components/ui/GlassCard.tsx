
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        glass-card
        bg-[var(--surface-color)] 
        border border-[var(--surface-border-color)]
        p-6
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        ${className}
      `}
      style={{
        boxShadow: 'var(--surface-shadow)',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default React.memo(GlassCard);
