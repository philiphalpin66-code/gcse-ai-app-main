import React from 'react';
import { useAppContext } from '../../state/AppContext';
import { getInsights } from '../../utils/insights';
import GlassCard from './GlassCard';
import { ICONS } from '../../constants';

const AIInsights: React.FC = () => {
    const { progress } = useAppContext();
    
    // TODO: Replace this heuristic-based insight generation with a call to a Gemini-powered summarizer.
    // The call site would be here, likely inside a useEffect hook to handle the async operation.
    // Example: `generateDashboardInsights(user, progress).then(setInsights)`
    // This would provide more nuanced and personalized feedback than the current rule-based system.
    const insights = getInsights(progress);
    
    if (insights.length === 0) {
        return null;
    }
    
    return (
        <GlassCard>
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                <div className="w-6 h-6 text-accent-magenta mr-2">{ICONS.lightbulb}</div>
                <span>AI Insights</span>
            </h2>
            <ul className="space-y-3">
                {insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-accent-green mt-1 mr-3">◆</span>
                        <p className="text-secondary">{insight}</p>
                    </li>
                ))}
            </ul>
        </GlassCard>
    );
};

export default AIInsights;
