
import React from 'react';

type PillColor = 'blue' | 'green' | 'magenta' | 'amber' | 'default';

interface PillProps {
  children: React.ReactNode;
  className?: string;
  color?: PillColor;
}

const Pill: React.FC<PillProps> = ({ children, className = '', color = 'default' }) => {
  const colorClasses = {
    blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/30',
    magenta: 'bg-accent-magenta/10 text-accent-magenta border-accent-magenta/30',
    amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    default: 'bg-white/10 text-secondary border-white/20',
  };

  return (
    <span
      className={`
        pill
        px-3 py-1
        text-xs font-bold
        border
        inline-block
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default React.memo(Pill);
