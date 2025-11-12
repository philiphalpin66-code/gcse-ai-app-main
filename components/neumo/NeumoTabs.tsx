

import React from 'react';

interface NeumoTabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const NeumoTabs: React.FC<NeumoTabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div
      className="flex items-center p-1 space-x-1 bg-slate-900 rounded-[var(--neumo-radius-md)]"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={`
            flex-1 py-2 px-4 text-center font-semibold rounded-[var(--neumo-radius-sm)]
            transition-all duration-300 ease-in-out
            focus:outline-none focus:z-10 focus:ring-2 focus:ring-[var(--neumo-active-color)]
            ${
              activeTab === tab
                ? 'bg-slate-700 text-[var(--neumo-active-color)] shadow-sm'
                : 'text-[var(--neumo-inactive-color)] hover:bg-slate-800/60'
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

export default NeumoTabs;