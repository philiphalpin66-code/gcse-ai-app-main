import React, { useState, useEffect } from 'react';
import { RevisionPlanObject, RevisionPlanTask } from '../types';
import { ICONS } from '../constants';
import GlassCard from './ui/GlassCard';
import SecondaryButton from './ui/SecondaryButton';
import Pill from './ui/Pill';

interface RevisionPlanPageProps {
  plan: RevisionPlanObject;
  onBack: () => void;
}

const TaskTypeIcon: React.FC<{ type: RevisionPlanTask['type'] }> = ({ type }) => {
    switch(type) {
        case 'review': return <span title="Review" className="text-accent-amber">{ICONS.lightbulb}</span>;
        case 'practice': return <span title="Practice" className="text-accent-blue">{ICONS.academicCap}</span>;
        case 'watch': return <span title="Watch" className="text-accent-magenta">{ICONS.link}</span>;
        case 'read': return <span title="Read" className="text-accent-green">{ICONS.book}</span>;
        default: return null;
    }
}

const RevisionPlanSkeleton: React.FC = () => (
  <div className="space-y-8">
    {[...Array(3)].map((_, i) => (
      <GlassCard key={i}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-8 w-16 shimmer-bg rounded-full"></div>
            <div className="h-6 w-1/2 ml-4 shimmer-bg rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center p-3">
              <div className="h-5 w-5 shimmer-bg rounded-md mr-4"></div>
              <div className="h-4 w-5/6 shimmer-bg rounded"></div>
            </div>
            <div className="flex items-center p-3">
              <div className="h-5 w-5 shimmer-bg rounded-md mr-4"></div>
              <div className="h-4 w-3/4 shimmer-bg rounded"></div>
            </div>
          </div>
        </div>
      </GlassCard>
    ))}
  </div>
);


const RevisionPlanPage: React.FC<RevisionPlanPageProps> = ({ plan, onBack }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [hasRendered, setHasRendered] = useState(false);
  const isFallback = plan?.isFallback;
  const isLoading = !plan || !plan.days || plan.days.length === 0;

  useEffect(() => {
    if (!isLoading && !hasRendered) {
      setHasRendered(true);
    }
  }, [isLoading, hasRendered]);


  const handleToggleTask = (dayIndex: number, taskIndex: number) => {
    const taskId = `${dayIndex}-${taskIndex}`;
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  if (isLoading && !hasRendered) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-12 pb-4 border-b border-white/10 animate-pulse">
            <div>
              <div className="h-9 w-72 shimmer-bg rounded"></div>
              <div className="h-5 w-96 shimmer-bg rounded mt-2"></div>
            </div>
            <div className="h-11 w-40 shimmer-bg rounded-md"></div>
          </header>
          <main>
            <RevisionPlanSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in" style={{ animationDuration: '250ms' }}>
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-primary">Your Revision Plan</h1>
            <p className="text-secondary text-base leading-relaxed mt-1">An AI-powered plan to focus on your improvement areas.</p>
          </div>
          <SecondaryButton onClick={onBack}>
            Back to Feedback
          </SecondaryButton>
        </header>

        {isFallback && (
            <GlassCard className="mb-8 !bg-amber-500/10 border-amber-500/30">
                <p className="text-center font-semibold text-amber-300">
                    There was an issue generating your custom plan. Using a fallback plan for now, please refresh later.
                </p>
            </GlassCard>
        )}

        <main className="space-y-8">
          {plan.days.map((day, dayIndex) => (
            <GlassCard key={day.day}>
              <div className="flex items-center mb-4">
                <Pill color="blue">Day {day.day}</Pill>
                <h2 className="text-xl font-bold text-primary ml-4">{day.topic}</h2>
              </div>
              <ul className="space-y-3">
                {day.tasks.map((task, taskIndex) => {
                  const taskId = `${dayIndex}-${taskIndex}`;
                  const isCompleted = completedTasks.includes(taskId);
                  return (
                     <li key={taskIndex}>
                        <label className={`flex items-center p-3 hover:bg-white/5 cursor-pointer transition-colors ${isCompleted ? 'bg-white/5' : 'bg-black/20'}`}>
                           <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleTask(dayIndex, taskIndex)}
                            className={`
                                h-5 w-5 rounded-md bg-transparent border-2 transition-colors duration-200
                                focus:ring-2 focus:ring-accent-blue focus:ring-offset-0 focus:ring-offset-[var(--surface-color)]
                                ${isCompleted 
                                    ? 'border-accent-green/50 text-accent-green accent-[var(--accent-green)]' 
                                    : 'border-secondary text-accent-blue accent-[var(--accent-blue)]'
                                }
                            `}
                           />
                           <span className={`ml-4 flex-grow text-primary text-base leading-relaxed ${isCompleted ? 'line-through text-tertiary' : ''}`}>
                             {task.description}
                           </span>
                           <div className="ml-4 flex-shrink-0">
                             <TaskTypeIcon type={task.type} />
                           </div>
                        </label>
                     </li>
                  )
                })}
              </ul>
            </GlassCard>
          ))}
        </main>
      </div>
    </div>
  );
};

export default RevisionPlanPage;