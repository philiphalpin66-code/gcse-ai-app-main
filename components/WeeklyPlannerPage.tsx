import React, { useState, useMemo, useEffect } from 'react';
import PrimaryButton from './ui/PrimaryButton';
import Pill from './ui/Pill';
import { StudySession, DailyPlan, UserSelections } from '../types';
import GlassCard from './ui/GlassCard';
import { SUBJECT_DATA, MOCK_PLAN_TEMPLATE } from '../constants';
import { useAppContext } from '../state/AppContext';
import { generateRestOfWeekPlan } from '../utils/aiService';

interface WeeklyPlannerPageProps {
  onShowDetails: (session: StudySession) => void;
  onNewSession: () => void;
  userSelections: UserSelections;
}

// Helper to convert hex to an RGB string for CSS variables
const hexToRgb = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #RRGGBB
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
};

const DaySkeleton: React.FC = () => (
    <GlassCard className="flex flex-col animate-pulse !p-4">
        <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-12 shimmer-bg rounded-md"></div>
            <div className="h-4 w-6 shimmer-bg rounded-md"></div>
        </div>
        <div className="space-y-2 flex-grow flex flex-col justify-end">
            <div className="h-8 w-full shimmer-bg rounded-full"></div>
            <div className="h-8 w-full shimmer-bg rounded-full"></div>
        </div>
    </GlassCard>
);

const WeeklyPlannerPage: React.FC<WeeklyPlannerPageProps> = ({ onShowDetails, onNewSession, userSelections }) => {
    const { user } = useAppContext();
    // JS days are 0 (Sun) - 6 (Sat). We map to 1 (Mon) - 7 (Sun).
    const jsDay = new Date().getDay();
    const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1; 
    
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
    
    // A single state array holds the plan. `null` is a placeholder for a loading day.
    const [plan, setPlan] = useState<(DailyPlan | null)[]>([]);
    const staticDayCount = 3; // The number of days to load from the static template.

    useEffect(() => {
        // 1. Instantly set the UI with cached days and placeholders for AI days.
        // This creates a stable layout from the first render, preventing flashes.
        const cachedDays = MOCK_PLAN_TEMPLATE.slice(0, staticDayCount);
        const placeholders = Array(4).fill(null);
        setPlan([...cachedDays, ...placeholders]);

        // 2. Trigger AI generation in the background.
        if (user) {
            generateRestOfWeekPlan(user, userSelections, cachedDays)
                .then(aiDays => {
                    // 3. When AI data arrives, replace the placeholders with the real data.
                    setPlan(prevPlan => {
                        const newPlan = prevPlan.slice(0, staticDayCount); // Keep the original cached days
                        return [...newPlan, ...aiDays]; // Append the new AI days
                    });
                })
                .catch(error => {
                    console.error("AI plan generation failed:", error);
                    // On error, just show the cached days.
                    setPlan(prevPlan => prevPlan.slice(0, staticDayCount));
                });
        }
    }, [user, userSelections]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Weekly Study Plan</h1>
                        <p className="text-secondary text-lg leading-relaxed mt-1">
                            Your AI-curated schedule for the week ahead.
                        </p>
                    </div>
                    <PrimaryButton onClick={onNewSession} className="mt-4 sm:mt-0">
                        + New Session
                    </PrimaryButton>
                </header>
                
                <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {plan.map((dayPlan, index) => {
                        // If a plan item is null, it's loading, so show a skeleton.
                        if (!dayPlan) {
                            return <DaySkeleton key={`skel-${index}`} />;
                        }

                        const isAiGenerated = index >= staticDayCount;
                        return (
                             <GlassCard 
                                key={`${dayPlan.day}-${dayPlan.date}`} // Use a more stable key
                                className={`flex flex-col transition-all duration-300 cursor-pointer ${index === selectedDayIndex ? 'current-day-glow' : ''} ${isAiGenerated ? 'animate-fade-in' : ''}`}
                                style={isAiGenerated ? { animationDuration: '300ms' } : {}}
                                onClick={() => setSelectedDayIndex(index)}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg text-primary">{dayPlan.day}</span>
                                    <span className="text-sm font-semibold text-tertiary">{dayPlan.date}</span>
                                </div>
                                <div className="space-y-2">
                                    {dayPlan.sessions.map((session, sIndex) => {
                                        if (session.duration === 0) {
                                            return <Pill key={sIndex} color="default">Rest Day</Pill>
                                        }
                                        const subjectInfo = SUBJECT_DATA.find(s => s.name === session.subject);
                                        const icon = subjectInfo ? subjectInfo.icon : '📝';
                                        const color = subjectInfo ? subjectInfo.color : '#FFFFFF';
                                        const rgbColor = hexToRgb(color);
                                        const iconStyle: React.CSSProperties = rgbColor ? { '--subject-accent-rgb': rgbColor } as React.CSSProperties : {};

                                        return (
                                            <button 
                                                key={sIndex}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onShowDetails(session);
                                                    setSelectedDayIndex(index);
                                                }}
                                                className={`w-full text-left rounded-full focus-visible:ring-2 focus-visible:ring-accent-blue planner-pill ${index === selectedDayIndex ? 'active' : ''}`}
                                            >
                                                <Pill color={session.color} className="w-full !block hover:ring-2 hover:ring-offset-2 hover:ring-offset-transparent ring-white/80 transition-all !flex !items-center !justify-center">
                                                    <span className="subject-icon mr-2" style={iconStyle}>{icon}</span>
                                                    <span>{session.subject} &bull; {session.duration}m</span>
                                                </Pill>
                                            </button>
                                        )
                                    })}
                                </div>
                            </GlassCard>
                        )
                    })}
                </main>
            </div>
        </div>
    );
};

export default WeeklyPlannerPage;
