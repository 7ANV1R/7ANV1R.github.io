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

  // Fade out the boot loader (index.html) once the first screen is real:
  // React has committed, Poppins is in and the profile photo is decoded.
  // ponytail: capped at 2.5s so a slow font/CDN never holds the page hostage.
  useEffect(() => {
    const boot = document.getElementById('boot');
    if (!boot) return;
    const photo = document.querySelector('img[alt="Profile"]');
    const ready = Promise.all([document.fonts?.ready, photo?.decode().catch(() => {})]);
    const cap = new Promise((r) => setTimeout(r, 2500));
    Promise.race([ready, cap]).then(() => {
      boot.classList.add('boot-done');
      setTimeout(() => boot.remove(), 500); // after the 0.45s fade
    });
  }, []);
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
