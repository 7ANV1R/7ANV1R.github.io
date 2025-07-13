import React from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';
import useScrollAwareHover from './hooks/useScrollAwareHover';
import CompanyLogoCursor from './components/ui/CompanyLogoCursor';

const App = () => {
  useScrollAwareHover();
  return (
    <div
      className="min-h-screen transition-colors duration-300 font-poppins"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <CompanyLogoCursor />
      <MobileLayout />
      <DesktopLayout />
    </div>
  );
};

export default App;
