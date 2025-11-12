

import React from 'react';

interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
}

const changelogData = [
  {
    version: '3.1',
    date: 'October 2025',
    changes: [
      { type: 'New', text: 'Added a "What\'s New" changelog to keep you updated on new features!' },
      { type: 'New', text: 'Introduced a Performance Monitor to track app speed and AI latency in real-time.' },
      { type: 'Improved', text: 'The app now detects slow performance and automatically enables optimizations like pre-generation and progressive rendering to feel faster.' },
      { type: 'Improved', text: 'Added a telemetry export function (`getPerformanceReport()` in the console) for advanced debugging.' },
    ],
  },
  {
    version: '3.0',
    date: 'September 2025',
    changes: [
      { type: 'New', text: 'Launched the AI Tutor! Get 1-on-1 help for any question you struggled with.' },
      { type: 'New', text: 'Generate a personalized 7-day Revision Plan based on your mock exam results.' },
      { type: 'Improved', text: 'Revamped the Topic Blitz mode with instant feedback after each question.' },
    ],
  },
];

const Changelog: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="modal bg-slate-800 shadow-2xl shadow-indigo-900/20 max-w-2xl w-full h-[80vh] flex flex-col p-6 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 pb-4 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-100">What's New in GCSE AI Coach</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-grow my-4 overflow-y-auto pr-2 space-y-8">
          {changelogData.map(log => (
            <div key={log.version}>
              <div className="flex items-baseline space-x-3">
                <span className="bg-indigo-600 text-white font-bold text-sm px-3 py-1 rounded-full">v{log.version}</span>
                <span className="text-slate-400 font-medium">{log.date}</span>
              </div>
              <ul className="mt-4 space-y-3 border-l border-slate-700 pl-6 ml-4">
                {log.changes.map((change, index) => (
                  <li key={index} className="flex">
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full mr-3 ${
                      change.type === 'New' ? 'bg-green-500/20 text-green-300' :
                      change.type === 'Improved' ? 'bg-sky-500/20 text-sky-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>{change.type}</span>
                    <span className="text-slate-300">{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Changelog;