import React from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';
import useScrollAwareHover from './hooks/useScrollAwareHover';
import CompanyLogoCursor from './components/ui/CompanyLogoCursor';
import useMediaQuery from './hooks/useMediaQuery';
import useDynamicTitle from './hooks/useDynamicTitle';

const App = () => {
  useScrollAwareHover();
  useDynamicTitle();
  // Render only the active layout. Mounting both duplicates every ScrollTrigger
  // (the hidden copy sits on a display:none scroller and corrupts refresh).
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <div
      className="min-h-screen transition-colors duration-300 font-poppins"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <CompanyLogoCursor />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </div>
  );
};

export default App;
