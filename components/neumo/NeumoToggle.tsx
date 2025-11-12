import React from 'react';

interface NeumoToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  status?: 'active' | 'new';
}

const NeumoToggle: React.FC<NeumoToggleProps> = ({ label, checked, onChange, status }) => {
  const glowClass = status === 'active' ? 'shadow-[var(--neumo-glow-active)]' : status === 'new' ? 'shadow-[var(--neumo-glow-new)]' : '';

  return (
    <label className="flex items-center cursor-pointer select-none">
      <span className="mr-4 font-semibold text-[var(--neumo-text-color)]">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only" 
        />
        <div className={`
          block w-14 h-8 rounded-[var(--neumo-radius-full)]
          transition-all duration-300 ease-in-out
          ${checked ? 'bg-[var(--neumo-active-color)]' : 'bg-[var(--neumo-bg)] shadow-[var(--neumo-shadow-inset)]'}
          ${checked && glowClass}
        `}></div>
        <div className={`
          dot absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-[var(--neumo-shadow)]
          transition-transform duration-300 ease-in-out
          ${checked ? 'transform translate-x-6' : ''}
        `}></div>
      </div>
    </label>
  );
};

export default NeumoToggle;
