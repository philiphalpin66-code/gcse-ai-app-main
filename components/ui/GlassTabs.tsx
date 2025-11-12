import React from 'react';

interface GlassTabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const GlassTabs: React.FC<GlassTabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div
      className="glass-tabs flex items-center p-1 space-x-1 bg-black/20"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={`
            glass-tab
            flex-1 py-2 px-4 text-center font-semibold
            transition-all duration-300
            focus:outline-none focus:z-10 focus:ring-2 focus:ring-accent-blue
            ${
              activeTab === tab
                ? 'bg-accent-blue text-white shadow-md'
                : 'text-secondary hover:bg-white/10'
            }
          `}
          role="tab"
          aria-selected={activeTab === tab}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default GlassTabs;