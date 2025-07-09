import React from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';

const App = () => {
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
