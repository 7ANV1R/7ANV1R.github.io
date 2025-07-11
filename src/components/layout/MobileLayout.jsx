import React, { useRef } from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import Education from '../sections/Education';
import FloatingNav from '../ui/FloatingNav';

const MobileLayout = () => {
  const sectionRefs = {
    profile: useRef(null),
    about: useRef(null),
    projects: useRef(null),
    education: useRef(null),
  };

  const handleNavigate = (sectionId) => {
    const targetRef = sectionRefs[sectionId];
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="lg:hidden">
      <FloatingNav onNavigate={handleNavigate} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div style={{ height: 70 }} />
        <div ref={sectionRefs.profile}>
          <ProfileCard className="h-64" />
        </div>
        <div ref={sectionRefs.about}>
          <About />
        </div>
        <div style={{ height: 24 }} />
        <div ref={sectionRefs.projects}>
          <RecentProjects />
        </div>
        <div ref={sectionRefs.education}>
          <Education />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
