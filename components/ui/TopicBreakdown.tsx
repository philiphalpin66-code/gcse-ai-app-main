import React from 'react';
import { TopicProgress } from '../../types';

interface TopicBreakdownProps {
    topics: TopicProgress[];
}

const TopicBreakdown: React.FC<TopicBreakdownProps> = ({ topics }) => {
    const formatDate = (isoString: string) => {
        if (!isoString || new Date(isoString).getFullYear() < 2000) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="space-y-4">
            {topics.sort((a,b) => a.current - b.current).map(topic => {
                const grade = topic.current * 8 + 1;
                const gradePercentage = (grade / 9) * 100;

                return (
                    <div key={topic.id}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-primary">{topic.name}</span>
                            <div className="flex items-center text-sm">
                                <span className="text-secondary mr-3">
                                    Last tested: {formatDate(topic.lastTested)}
                                </span>
                                <span className="font-bold text-accent-blue w-16 text-right">
                                    Grade {grade.toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <div className="relative w-full bg-black/20 rounded-full h-4 border border-white/10 overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-accent-blue"
                                style={{ width: `${gradePercentage}%` }}
                            ></div>
                            {/* Confidence Indicator */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 h-1 bg-white/50 rounded-full"
                                style={{ width: `${topic.confidence * 100}%` }}
                                title={`Confidence: ${Math.round(topic.confidence * 100)}%`}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TopicBreakdown;
