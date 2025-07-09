import React, { useRef } from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import Education from '../sections/Education';
import FloatingNav from '../ui/FloatingNav';

const DesktopLayout = () => {
  const scrollContainerRef = useRef(null);
  const sectionRefs = {
    profile: useRef(null),
    about: useRef(null),
    projects: useRef(null),
    education: useRef(null),
  };

  const handleNavigate = (sectionId) => {
    if (sectionId === 'profile') {
      // For profile, scroll to top of right container
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
      return;
    }

    const targetRef = sectionRefs[sectionId];
    if (targetRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = targetRef.current;
      const targetTop = target.offsetTop - container.offsetTop - 24;

      container.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="hidden lg:flex h-screen">
      <FloatingNav onNavigate={handleNavigate} />

      {/* Left Side - Pinned Card */}
      <div className="w-1/3 p-6 transition-colors duration-300">
        <div className="sticky top-6" ref={sectionRefs.profile}>
          <ProfileCard className="h-96" />
        </div>
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="w-2/3 overflow-y-auto" ref={scrollContainerRef}>
        <div className="p-6 space-y-6">
          <div style={{ height: 70 }} />
          <div ref={sectionRefs.about}>
            <About className="h-80" />
          </div>
          <div ref={sectionRefs.projects}>
            <RecentProjects className="h-96" />
          </div>
          <div ref={sectionRefs.education}>
            <Education className="h-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
