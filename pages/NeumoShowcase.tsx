import React, { useState, useEffect } from 'react';
import NeumoButton from '../components/neumo/NeumoButton';
import NeumoCard from '../components/neumo/NeumoCard';
import NeumoInput from '../components/neumo/NeumoInput';
import NeumoSlider from '../components/neumo/NeumoSlider';
import NeumoTabs from '../components/neumo/NeumoTabs';
import NeumoToggle from '../components/neumo/NeumoToggle';

interface NeumoShowcaseProps {
  onBack: () => void;
}

const NeumoShowcase: React.FC<NeumoShowcaseProps> = ({ onBack }) => {
  const [sliderValue, setSliderValue] = useState(40);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--neumo-text-color)]">Neumorphic UI Library</h1>
          <NeumoButton onClick={onBack}>Back to App</NeumoButton>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-8">
            <NeumoCard>
              <h2 className="text-lg font-bold text-[var(--neumo-text-color)] mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <NeumoButton>Default</NeumoButton>
                <NeumoButton status="active">Active</NeumoButton>
                <NeumoButton status="new">New</NeumoButton>
                <NeumoButton status="inactive">Inactive</NeumoButton>
              </div>
            </NeumoCard>

            <NeumoCard>
              <h2 className="text-lg font-bold text-[var(--neumo-text-color)] mb-4">Inputs</h2>
              <div className="space-y-4">
                <NeumoInput placeholder="Enter your name..." />
                <NeumoInput type="password" placeholder="Enter your password..." />
              </div>
            </NeumoCard>
            
            <NeumoCard>
              <h2 className="text-lg font-bold text-[var(--neumo-text-color)] mb-4">Tabs</h2>
              <NeumoTabs
                tabs={['Profile', 'Settings', 'Notifications']}
                activeTab={activeTab}
                onTabClick={setActiveTab}
              />
              <div className="mt-4 p-4 text-center text-[var(--neumo-text-color)]">
                Content for {activeTab}
              </div>
            </NeumoCard>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <NeumoCard>
              <h2 className="text-lg font-bold text-[var(--neumo-text-color)] mb-4">Toggles</h2>
              <div className="space-y-4">
                <NeumoToggle label="Email Notifications" checked={isToggleOn} onChange={setIsToggleOn} />
                <NeumoToggle label="Push Notifications" checked={!isToggleOn} onChange={() => {}} status="active" />
                <NeumoToggle label="New Feature" checked={true} onChange={() => {}} status="new" />
              </div>
            </NeumoCard>

            <NeumoCard>
              <h2 className="text-lg font-bold text-[var(--neumo-text-color)] mb-4">Slider</h2>
              <p className="text-center font-bold text-2xl text-[var(--neumo-text-color)] mb-2">{sliderValue}</p>
              <NeumoSlider
                value={sliderValue}
                onChange={setSliderValue}
                min={0}
                max={100}
              />
            </NeumoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeumoShowcase;