import React, { useEffect } from 'react';
import MobileLayout from './components/layout/MobileLayout';
import DesktopLayout from './components/layout/DesktopLayout';
import useScrollAwareHover from './hooks/useScrollAwareHover';
import CompanyLogoCursor from './components/ui/CompanyLogoCursor';
import BlobCursor from './components/ui/BlobCursor';
import useMediaQuery from './hooks/useMediaQuery';
import useDynamicTitle from './hooks/useDynamicTitle';
import { watchSections } from './analytics';

const App = () => {
  useScrollAwareHover();
  useDynamicTitle();
  // Render only the active layout. Mounting both duplicates every ScrollTrigger
  // (the hidden copy sits on a display:none scroller and corrupts refresh).
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  useEffect(() => watchSections(), [isDesktop]);
  return (
    <div
      className="min-h-screen transition-colors duration-300 font-poppins"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <CompanyLogoCursor />
      <BlobCursor />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </div>
  );
};

export default App;
