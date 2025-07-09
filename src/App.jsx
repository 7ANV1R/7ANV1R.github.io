import React from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileLayout />
      <DesktopLayout />
    </div>
  );
};

export default App;
