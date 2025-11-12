


import React, { useState, useEffect } from 'react';

interface WhatsNewPopupProps {
  onOpenChangelog: () => void;
}

const CURRENT_APP_VERSION = '3.1';
const CHANGELOG_VIEWED_KEY = 'gcseAiCoachChangelogViewedVersion';

const WhatsNewPopup: React.FC<WhatsNewPopupProps> = ({ onOpenChangelog }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const lastViewedVersion = localStorage.getItem(CHANGELOG_VIEWED_KEY);
      if (lastViewedVersion !== CURRENT_APP_VERSION) {
        // Use a timeout to avoid being too intrusive on page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage for changelog check.", error);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(CHANGELOG_VIEWED_KEY, CURRENT_APP_VERSION);
    } catch (error) {
       console.error("Could not write to localStorage for changelog check.", error);
    }
    setIsVisible(false);
  };

  const handleSeeWhatsNew = () => {
    onOpenChangelog();
    handleDismiss();
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="panel fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-700 shadow-2xl shadow-indigo-900/30 border border-slate-600 w-full max-w-md animate-fade-in-up">
        <div className="p-4 flex items-center justify-between space-x-4">
            <div className="flex-shrink-0 text-2xl">🎉</div>
            <div>
                <h4 className="font-bold text-slate-100">New Performance Optimizations!</h4>
                <p className="text-sm text-slate-300">We've just shipped an update to make the app faster and smarter.</p>
            </div>
            <div className="flex flex-col flex-shrink-0 space-y-2">
                 <button 
                    onClick={handleSeeWhatsNew}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 rounded-md transition-colors whitespace-nowrap"
                 >
                    See what's new
                 </button>
                 <button 
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                 >
                    Dismiss
                 </button>
            </div>
        </div>
    </div>
  );
};

export default WhatsNewPopup;