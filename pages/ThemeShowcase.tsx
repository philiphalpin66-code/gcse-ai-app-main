import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import GlassInput from '../components/ui/GlassInput';
import GlassSlider from '../components/ui/GlassSlider';
import GlassTabs from '../components/ui/GlassTabs';
import Pill from '../components/ui/Pill';
import ProgressRing from '../components/ui/ProgressRing';

interface ThemeShowcaseProps {
  onBack: () => void;
}

const ThemeShowcase: React.FC<ThemeShowcaseProps> = ({ onBack }) => {
  const [sliderValue, setSliderValue] = useState(40);
  const [activeTab, setActiveTab] = useState('Profile');
  
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Glassmorphic UI Showcase</h1>
          <SecondaryButton onClick={onBack}>Back to App</SecondaryButton>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
            <GlassCard>
              <h2 className="text-lg font-bold text-primary mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <PrimaryButton>Primary</PrimaryButton>
                <SecondaryButton>Secondary</SecondaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-bold text-primary mb-4">Inputs</h2>
              <div className="space-y-4">
                <GlassInput placeholder="Enter your name..." />
                <GlassInput type="password" placeholder="Enter your password..." />
              </div>
            </GlassCard>
            
            <GlassCard>
              <h2 className="text-lg font-bold text-primary mb-4">Tabs</h2>
              <GlassTabs
                tabs={['Profile', 'Settings', 'Notifications']}
                activeTab={activeTab}
                onTabClick={setActiveTab}
              />
              <div className="mt-4 p-4 text-center text-secondary">
                Content for {activeTab}
              </div>
            </GlassCard>
            
            <GlassCard>
              <h2 className="text-lg font-bold text-primary mb-4">Pills</h2>
              <div className="flex flex-wrap gap-2">
                <Pill color="blue">Biology</Pill>
                <Pill color="green">Correct</Pill>
                <Pill color="magenta">Practice</Pill>
                <Pill color="amber">Partial</Pill>
                <Pill>Default</Pill>
              </div>
            </GlassCard>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <GlassCard className="flex flex-col items-center">
              <h2 className="text-lg font-bold text-primary mb-4">Progress Ring</h2>
              <ProgressRing percentage={75} label="75%" size={150} />
            </GlassCard>
            
            <GlassCard>
              <h2 className="text-lg font-bold text-primary mb-4">Slider</h2>
              <p className="text-center font-bold text-2xl text-primary mb-2">{sliderValue}</p>
              <GlassSlider
                value={sliderValue}
                onChange={setSliderValue}
                min={0}
                max={100}
              />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeShowcase;