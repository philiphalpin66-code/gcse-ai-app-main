import React, { useMemo } from 'react';
import { TelemetryEvent } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import GlassCard from './ui/GlassCard';

interface LearningEfficiencyInsightsProps {
  events: TelemetryEvent[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 backdrop-blur-sm p-3 rounded-md border border-slate-600 shadow-lg">
        <p className="label text-slate-200 font-semibold">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toFixed(2)}${pld.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LearningEfficiencyInsights: React.FC<LearningEfficiencyInsightsProps> = ({ events }) => {

  const topicLiftData = useMemo(() => {
    const topicMap = new Map<string, { totalLift: number; count: number }>();
    events.forEach(event => {
      const existing = topicMap.get(event.topic) || { totalLift: 0, count: 0 };
      topicMap.set(event.topic, {
        totalLift: existing.totalLift + event.lift,
        count: existing.count + 1,
      });
    });
    return Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      lift: (data.totalLift / data.count) * 100, // as percentage
    }));
  }, [events]);

  const confidenceChangeData = useMemo(() => {
    const confidenceTransitions = {
      'low_to_medium': 0, 'low_to_high': 0, 'medium_to_high': 0, 'improved': 0
    };
    events.forEach(e => {
        if (e.confidence_before === 'low' && e.confidence_after === 'medium') confidenceTransitions.low_to_medium++;
        if (e.confidence_before === 'low' && e.confidence_after === 'high') confidenceTransitions.low_to_high++;
        if (e.confidence_before === 'medium' && e.confidence_after === 'high') confidenceTransitions.medium_to_high++;
    });
    confidenceTransitions.improved = confidenceTransitions.low_to_medium + confidenceTransitions.low_to_high + confidenceTransitions.medium_to_high;
    return confidenceTransitions;
  }, [events]);

  const triggerMixData = useMemo(() => {
      const triggers = { 'incorrect_answer': 0, 'low_confidence': 0, 'gate_stall': 0 };
      events.forEach(e => {
          if (triggers.hasOwnProperty(e.trigger)) {
              triggers[e.trigger]++;
          }
      });
      return Object.entries(triggers).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [events]);

  const overallLift = useMemo(() => {
    if (events.length === 0) return 0;
    const totalLift = events.reduce((sum, e) => sum + e.lift, 0);
    return (totalLift / events.length) * 100;
  }, [events]);

  if (events.length === 0) {
    return (
      <GlassCard>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Learning Efficiency Insights</h2>
        <p className="text-slate-400">Complete some adaptive questions and get an incorrect answer to trigger a micro-lesson. Your learning analytics will appear here!</p>
      </GlassCard>
    );
  }
  
  const COLORS = ['#818cf8', '#60a5fa', '#f87171'];

  return (
    <GlassCard>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Learning Efficiency Insights</h2>
      <p className="text-slate-400 mb-4">
        Your lessons improved topic mastery by <span className="font-bold text-green-400">+{overallLift.toFixed(1)}%</span> this week — keep it up!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Topic Lift Graph */}
        <div className="lg:col-span-2">
            <h3 className="font-semibold text-slate-200 mb-2 text-center">Topic Lift (Accuracy Before vs. After Lesson)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topicLiftData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="topic" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.3)' }} />
                    <Bar dataKey="lift" name="Learning Lift" unit="%" fill="#34d399" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Confidence & Triggers */}
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-slate-200 mb-2 text-center">Confidence Growth</h3>
                <div className="p-4 bg-slate-700/50 text-center">
                    <p className="text-3xl font-bold text-indigo-400">{confidenceChangeData.improved}</p>
                    <p className="text-sm text-slate-400">times your confidence measurably improved after a lesson.</p>
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-slate-200 mb-2 text-center">Lesson Triggers</h3>
                 <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                        <Pie data={triggerMixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} labelLine={false}>
                            {triggerMixData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#475569' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default LearningEfficiencyInsights;