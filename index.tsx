import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// FIX: Corrected import path for App component.
import App from './App';

const RootComponent = () => {
  useEffect(() => {
    const particleContainer = document.getElementById('particle-container');
    if (!particleContainer) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 5 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
      particle.style.animationDelay = `${Math.random() * -25}s`;
      particleContainer.appendChild(particle);
      
      // Remove particle after animation ends to prevent DOM clutter
      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    };

    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }
    
    // Add new particles periodically
    const interval = setInterval(createParticle, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(<RootComponent />);