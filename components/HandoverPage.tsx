import React from 'react';
import GlassCard from './ui/GlassCard';
import Pill from './ui/Pill';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import ProgressRing from './ui/ProgressRing';
import { ICONS } from '../constants';

const themeTokens = {
  colors: [
    { name: '--bg-gradient-start', value: '#060B21', description: 'Background gradient top' },
    { name: '--surface-color', value: 'rgba(255, 255, 255, 0.08)', description: 'Glass card background' },
    { name: '--text-primary', value: '#FFFFFF', description: 'Primary text color' },
    { name: '--text-secondary', value: 'rgba(255, 255, 255, 0.7)', description: 'Secondary text color' },
    { name: '--accent-blue', value: '#4E9FFF', description: 'Primary accent & focus rings' },
    { name: '--accent-green', value: '#62F5A5', description: 'Secondary accent & success states' },
    { name: '--accent-magenta', value: '#C55FFF', description: 'Tertiary accent' },
    { name: '--accent-amber', value: '#FFB347', description: 'Warning & streak color' },
  ],
  radii: [
    { name: '--radius', value: '16px', description: 'Default for cards & buttons' },
    { name: '--radius-sm', value: '8px', description: 'Smaller elements (e.g., tabs)' },
    { name: '--radius-full', value: '9999px', description: 'Pills & circular elements' },
  ],
  motion: [
    { name: '--transition-fast', value: '150ms', description: 'Button clicks & minor feedback' },
    { name: '--transition-medium', value: '300ms', description: 'Hover effects & standard transitions' },
    { name: '--transition-page', value: '400ms', description: 'Page fade-in and slide transitions' },
  ]
};

const screens = [
  'Authentication', 'Home/Landing Page', 'Weekly Planner', 'Mock Exam Session',
  'Flashcards Trainer', 'AI Coach Chat', 'User Profile', 'Topic Blitz Builder',
  'Blitz Session Page', 'Feedback & Report Page', 'Detailed Analytics',
  'Revision Plan', 'Parent Dashboard', 'Review Saved Questions'
];

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/30 p-4 rounded-lg mt-2"><code className="text-sm font-mono text-accent-green">{children}</code></pre>
);

const HandoverPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <header>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">Final Summary & Handover</h1>
                    <p className="text-secondary text-lg leading-relaxed mt-2">
                        A guide to the application's design system, components, and completed screens.
                    </p>
                </header>

                {/* Theme Tokens */}
                <GlassCard>
                    <h2 className="text-2xl font-bold text-primary mb-6">Theme Tokens</h2>
                    <div className="space-y-6">
                        {Object.entries(themeTokens).map(([category, tokens]) => (
                            <div key={category}>
                                <h3 className="text-xl font-semibold text-primary capitalize mb-3">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tokens.map(token => (
                                        <div key={token.name} className="bg-black/20 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                {category === 'colors' && (
                                                    <div className="w-6 h-6 rounded-full mr-3 border border-white/20" style={{ backgroundColor: token.value }}></div>
                                                )}
                                                <p className="font-mono text-accent-green text-sm">{token.name}</p>
                                            </div>
                                            <p className="text-secondary text-sm mt-1">{token.value}</p>
                                            <p className="text-tertiary text-xs mt-1">{token.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Screen Checklist */}
                <GlassCard>
                    <h2 className="text-2xl font-bold text-primary mb-6">Screen Completion Checklist</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {screens.map(screen => (
                            <li key={screen} className="flex items-center bg-black/20 p-3 rounded-lg">
                                <span className="w-5 h-5 text-green-400">{ICONS.zap}</span>
                                <span className="ml-3 text-primary font-medium">{screen}</span>
                                <Pill color="green" className="ml-auto !text-xs">Done</Pill>
                            </li>
                        ))}
                    </ul>
                </GlassCard>

                {/* Component Guide */}
                <GlassCard>
                    <h2 className="text-2xl font-bold text-primary mb-6">Component Re-use Guide</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">GlassCard</h3>
                            <p className="text-secondary mb-2">The primary container for all content sections. It provides the consistent glassmorphic background, border, and shadow. It accepts standard div attributes, including `className` for overrides.</p>
                            <CodeBlock>{`<GlassCard className="p-8 text-center">\n  <p>Your content here</p>\n</GlassCard>`}</CodeBlock>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">Primary & Secondary Buttons</h3>
                            <p className="text-secondary mb-2">Used for all major actions. The styles, including the blue-to-green gradient, hover glow, and click animation, are applied globally via the `.btn-primary` class in `index.html`.</p>
                            <div className="flex gap-4 my-4"><PrimaryButton>Primary</PrimaryButton><SecondaryButton>Secondary</SecondaryButton></div>
                            <CodeBlock>{`<PrimaryButton onClick={handleClick}>Confirm</PrimaryButton>\n<SecondaryButton>Cancel</SecondaryButton>`}</CodeBlock>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">ProgressRing</h3>
                            <p className="text-secondary mb-2">Visualizes a percentage in a circular format. Key props are `percentage`, `label`, `size`, and `color`.</p>
                            <div className="my-4"><ProgressRing percentage={75} label="Grade 8" size={100} color="var(--accent-green)" /></div>
                            <CodeBlock>{`<ProgressRing percentage={75} label="Grade 8" />`}</CodeBlock>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">Pill</h3>
                            <p className="text-secondary mb-2">Small, rounded tags for status indicators or topics. Use the `color` prop to change its appearance.</p>
                            <div className="flex gap-2 my-4"><Pill color="blue">Algebra</Pill><Pill color="amber">🔥 21 Streak</Pill></div>
                            <CodeBlock>{`<Pill color="blue">Biology</Pill>`}</CodeBlock>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">NavBar</h3>
                            <p className="text-secondary mb-2">The main application navigation bar. It takes an `onNavigate` callback to handle page changes and a `currentPage` prop to highlight the active link.</p>
                            <CodeBlock>{`<NavBar \n  onNavigate={(page) => setPage(page)}\n  currentPage={currentPage}\n/>`}</CodeBlock>
                        </div>
                    </div>
                </GlassCard>

                {/* Final Confirmation */}
                 <GlassCard className="!bg-gradient-to-r from-accent-blue/20 to-accent-green/20">
                    <h2 className="text-2xl font-bold text-primary mb-3">Final Confirmation</h2>
                    <p className="text-lg text-secondary leading-relaxed">
                        This confirms that every screen built shares the consistent **deep-navy glassmorphic style**. All primary and secondary actions utilize the same **gradient glowing button** components, ensuring a cohesive and polished user experience throughout the entire application.
                    </p>
                </GlassCard>
            </div>
        </div>
    );
};

export default HandoverPage;
