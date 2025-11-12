import React, { useState, useEffect } from 'react';
import { User } from '../types';
// FIX: The cloudService module exports individual functions, not a single object. Use import * to namespace them.
import * as cloudService from '../services/cloudService';
import SecondaryButton from './ui/SecondaryButton';
import GlassCard from './ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ParentDashboardProps {
  user: User;
  onBack: () => void;
}

interface AnalyticsData {
    topicMastery: { topic: string; avgScore: number }[];
    avgLift: number;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onBack }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeClassId] = useState<string>(user.class_ids[0]);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeClassId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await cloudService.getAnalyticsAggregate(activeClassId);
        setAnalytics(data);
      } catch (err) {
        setError("Failed to load class analytics. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeClassId]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-primary">Parent & Teacher Dashboard</h1>
            <p className="text-secondary text-base leading-relaxed mt-1">Class-wide insights to guide learning.</p>
          </div>
          <SecondaryButton onClick={onBack}>
            Back to Home
          </SecondaryButton>
        </header>

        {isLoading && <p>Loading dashboard...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && analytics && (
            <main className="space-y-8">
                 <GlassCard>
                     <h2 className="text-xl font-bold text-primary mb-4">Class Performance Overview</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 text-center bg-black/20">
                            <p className="text-4xl font-bold text-accent-green">+{analytics.avgLift.toFixed(1)}%</p>
                            <p className="text-tertiary">Average Learning Lift from Micro-Lessons</p>
                        </div>
                        <div className="p-6 text-center bg-black/20">
                            <p className="text-4xl font-bold text-accent-blue">{analytics.topicMastery.filter(t => t.avgScore > 75).length}</p>
                            <p className="text-tertiary">Topics with Average Mastery >75%</p>
                        </div>
                     </div>
                 </GlassCard>
                 <GlassCard>
                     <h2 className="text-xl font-bold text-primary mb-4">Class Mastery by Topic</h2>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.topicMastery} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis type="number" unit="%" domain={[0, 100]} stroke="var(--text-secondary)" />
                            <YAxis type="category" dataKey="topic" width={150} stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 20, 40, 0.9)', borderColor: 'var(--surface-border-color)' }} />
                            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                            <Bar dataKey="avgScore" name="Average Mastery" fill="var(--accent-blue)" />
                        </BarChart>
                    </ResponsiveContainer>
                 </GlassCard>
            </main>
        )}

      </div>
    </div>
  );
};

export default ParentDashboard;