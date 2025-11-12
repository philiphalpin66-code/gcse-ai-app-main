import React, { useMemo } from 'react';
import { ICONS } from '../constants';
import { PerformanceMetrics } from '../types';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  history: PerformanceMetrics[];
  optimizations: {
    preGeneration: boolean;
    progressiveRender: boolean;
  };
  onClose: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ metrics, history, optimizations, onClose }) => {
  const formatTime = (ms: number) => {
    if (ms < 0) return '0ms';
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const performanceStatus = useMemo(() => {
    const total = metrics.totalLoadTime;
    if (total < 200) {
      return { text: 'Instant', color: 'text-green-400', emoji: '⚡️', tooltip: 'Excellent performance (<200ms)' };
    }
    if (total < 1000) {
      return { text: 'Fast', color: 'text-sky-400', emoji: '✅', tooltip: 'Great performance (<1s)' };
    }
    if (total < 3000) {
      return { text: 'Acceptable', color: 'text-amber-400', emoji: '🟡', tooltip: 'Acceptable (1-3s)' };
    }
    return { text: 'Slow', color: 'text-red-400', emoji: '🔴', tooltip: 'Slow (>3s) - auto-optimisation may activate.' };
  }, [metrics.totalLoadTime]);

  const averageLoadTime = useMemo(() => {
    if (history.length === 0) return 0;
    const total = history.reduce((acc, run) => acc + run.totalLoadTime, 0);
    return total / history.length;
  }, [history]);
  
  const backgroundGenTime = metrics.aiLatency;

  return (
    <div className="panel fixed bottom-4 right-4 z-50 bg-slate-800/90 backdrop-blur-md shadow-2xl shadow-indigo-900/30 border border-slate-700 w-full max-w-sm font-sans">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-bold text-slate-100 flex items-center">
            <span className="mr-2 text-indigo-400">{ICONS.chart}</span>
            Performance Report
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 rounded-md" title={performanceStatus.tooltip}>
            <span className="flex items-center font-bold text-slate-200">
              Perceived Load Time
            </span>
            <span className={`font-mono font-bold ${performanceStatus.color}`}>
              {formatTime(metrics.totalLoadTime)} {performanceStatus.emoji}
            </span>
          </div>
           <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-md">
            <span className="flex items-center text-slate-300" title="Total time for the AI to generate adaptive questions in the background">
              {ICONS.server}
              <span className="ml-2">Background Gen.</span>
            </span>
            <span className="font-mono font-semibold text-sky-300">{formatTime(backgroundGenTime)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-md">
            <span className="flex items-center text-slate-300" title="Time to receive the first AI-generated question after the session started">
              {ICONS.lightning}
              <span className="ml-2 font-semibold text-slate-200">First AI Question</span>
            </span>
            <span className="font-mono font-bold text-amber-300">{formatTime(metrics.firstChunkLatency)}</span>
          </div>

          <div className="border-t border-slate-700 my-2"></div>
          
          <div className="flex justify-between items-center p-2 rounded-md">
            <span className="flex items-center text-slate-300">
              Avg Perceived Load ({history.length} runs)
            </span>
            <span className="font-mono font-semibold text-slate-400">{formatTime(averageLoadTime)}</span>
          </div>
          
          <div className="border-t border-slate-700 my-2"></div>

           <div className="flex justify-between items-center p-2 rounded-md">
            <span className="flex items-center text-slate-300">Priming & Streaming</span>
            <span className="font-semibold text-green-400">
              Active ✅
            </span>
          </div>
           <div className="flex justify-between items-center p-2 rounded-md">
            <span className="flex items-center text-slate-300">Pre-generation</span>
            <span className={`font-semibold ${optimizations.preGeneration ? 'text-green-400' : 'text-slate-400'}`}>
              {optimizations.preGeneration ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;