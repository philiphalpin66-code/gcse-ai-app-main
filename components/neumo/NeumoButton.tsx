

import React from 'react';

interface NeumoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  status?: 'default' | 'active' | 'secondary' | 'new' | 'inactive';
}

const NeumoButton: React.FC<NeumoButtonProps> = ({ children, className = '', status = 'default', ...props }) => {
  const baseClasses = `
    px-5 py-3
    font-semibold
    rounded-[var(--neumo-radius-md)]
    active:scale-[0.97]
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[var(--neumo-active-color)]
    disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100 disabled:border-transparent
  `;

  const statusClasses = {
    default: 'bg-[var(--neumo-bg)] text-[var(--neumo-text-color)] hover:bg-slate-700 shadow-sm border border-transparent',
    active: 'bg-[var(--button-active-gradient)] text-white shadow-[var(--button-active-shadow)] hover:shadow-[var(--button-hover-glow)] hover:-translate-y-0.5 border-transparent',
    secondary: 'bg-[var(--neumo-secondary-color)] text-white shadow-md hover:brightness-105 border-transparent',
    new: 'bg-[var(--neumo-bg)] text-[var(--neumo-inactive-color)] border border-slate-600 hover:bg-slate-700 hover:border-slate-500 shadow-sm relative',
    inactive: 'bg-slate-800 text-[var(--neumo-tertiary-color)] cursor-not-allowed border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${statusClasses[status]} ${className}`}
      {...props}
    >
      {children}
      {status === 'new' && (
        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-[var(--neumo-highlight-color)] rounded-bl-lg rounded-tr-md">NEW</span>
      )}
    </button>
  );
};

export default NeumoButton;