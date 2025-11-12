import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`
        glass-input
        w-full px-4 py-3
        bg-white/5
        text-primary
        font-medium
        border border-white/10
        focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-accent-blue
        placeholder:text-tertiary
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
};

export default GlassInput;