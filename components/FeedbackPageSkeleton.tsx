import React from 'react';
import GlassCard from './ui/GlassCard';

const ShimmerBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`shimmer-bg rounded ${className}`}></div>
);

const FeedbackPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <ShimmerBlock className="h-10 w-3/5" />
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <ShimmerBlock className="h-10 w-28 rounded-md" />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <GlassCard className="text-center">
              <ShimmerBlock className="h-16 w-1/3 mx-auto" />
              <ShimmerBlock className="h-8 w-1/2 mx-auto mt-3" />
            </GlassCard>
            <GlassCard>
              <ShimmerBlock className="h-6 w-2/3 mb-4" />
              <div className="space-y-3">
                <ShimmerBlock className="h-4 w-full" />
                <ShimmerBlock className="h-4 w-5/6" />
                <ShimmerBlock className="h-4 w-full" />
              </div>
            </GlassCard>
            <GlassCard className="space-y-4">
              <ShimmerBlock className="h-12 w-full rounded-md" />
              <ShimmerBlock className="h-12 w-full rounded-md" />
            </GlassCard>
          </aside>

          <section className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, index) => (
              <GlassCard key={index}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-5/6 space-y-2">
                    <ShimmerBlock className="h-5 w-full" />
                    <ShimmerBlock className="h-5 w-3/4" />
                  </div>
                  <ShimmerBlock className="h-6 w-6 rounded-full" />
                </div>
                <ShimmerBlock className="h-24 w-full rounded-md" />
                <div className="mt-4 border-t border-white/10 pt-4 flex justify-end gap-2">
                  <ShimmerBlock className="h-8 w-24 rounded-md" />
                  <ShimmerBlock className="h-8 w-24 rounded-md" />
                </div>
              </GlassCard>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default FeedbackPageSkeleton;