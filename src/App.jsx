import React from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';
import useScrollAwareHover from './hooks/useScrollAwareHover';

const App = () => {
  useScrollAwareHover();
  return (
    <div
      className="min-h-screen transition-colors duration-300 font-poppins"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <MobileLayout />
      <DesktopLayout />
    </div>
  );
};

export default App;
