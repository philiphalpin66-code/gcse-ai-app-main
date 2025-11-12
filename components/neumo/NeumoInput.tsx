

import React from 'react';

interface NeumoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const NeumoInput: React.FC<NeumoInputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`
        w-full px-4 py-3
        bg-[var(--neumo-bg)]
        text-[var(--neumo-text-color)]
        font-medium
        rounded-[var(--neumo-radius-md)]
        border border-[var(--neumo-separator-color)]
        focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--neumo-active-color)]
        placeholder:text-[var(--neumo-tertiary-color)]
        transition-all duration-200 ease-in-out
        ${className}
      `}
      {...props}
    />
  );
};

export default NeumoInput;