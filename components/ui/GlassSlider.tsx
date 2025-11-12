import React from 'react';

interface GlassSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const GlassSlider: React.FC<GlassSliderProps> = ({ value, onChange, min = 0, max = 100, step = 1 }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full group py-2">
      <div className="relative h-1.5 w-full bg-white/10 rounded-full">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-accent-blue"
          style={{ width: `${percentage}%` }}
        ></div>
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-accent-blue group-hover:scale-110 transition-transform"
          style={{ left: `${percentage}%`, transform: `translateX(-50%) translateY(-50%)` }}
        ></div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        aria-valuenow={value}
      />
    </div>
  );
};

export default GlassSlider;