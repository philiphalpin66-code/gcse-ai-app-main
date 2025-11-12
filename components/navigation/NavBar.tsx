import React from 'react';

interface NavBarProps {
    onNavigate: (page: string) => void;
    currentPage: string;
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate, currentPage }) => {
  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'weekly-planner', label: 'Planner' },
    { id: 'mock-exam', label: 'Mocks' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'ai-coach', label: 'AI Coach' },
    { id: 'profile', label: 'Profile' },
    { id: 'handover', label: 'Handover' },
  ];
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 h-20 bg-[var(--surface-color)] backdrop-blur-[var(--surface-blur)] border-b border-[var(--surface-border-color)] z-40 flex items-center justify-center"
      style={{ boxShadow: 'var(--surface-shadow)' }}
    >
      <div className="flex items-center justify-between w-full max-w-7xl px-8">
        <div className="text-xl font-bold text-primary">GCSE AI Coach</div>
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => onNavigate(item.id)} 
              className={`transition-colors duration-200 text-lg px-2 py-1 ${currentPage === item.id ? 'nav-item-active' : 'text-secondary hover:text-primary'} focus-visible:ring-2 focus-visible:ring-accent-blue`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;