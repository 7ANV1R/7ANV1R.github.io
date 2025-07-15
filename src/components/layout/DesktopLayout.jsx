import React, { useRef } from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import WorkExperience from '../sections/WorkExperience';
import ToolsAndTech from '../sections/ToolsAndTech';
import FloatingNav from '../ui/FloatingNav';
import GetInTouch from '../sections/GetInTouch';
import Footer from '../sections/Footer';

const DesktopLayout = () => {
  const scrollContainerRef = useRef(null);
  const sectionRefs = {
    profile: useRef(null),
    about: useRef(null),
    projects: useRef(null),
    experience: useRef(null),
    skills: useRef(null),
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
    <div className="hidden lg:flex h-screen flex-col">
      <FloatingNav onNavigate={handleNavigate} />

      <div className="flex flex-1">
        {/* Left Side - Pinned Card */}
        <div className="w-1/3 p-6 transition-colors duration-300">
          <div className="sticky top-6" ref={sectionRefs.profile}>
            <ProfileCard className="h-96" />
          </div>
        </div>

        {/* Right Side - Scrollable Content */}
        <div className="w-2/3 overflow-y-auto" ref={scrollContainerRef}>
          <div className="p-6 space-y-6">
            <div ref={sectionRefs.about}>
              <About className="h-80" />
            </div>

            <div ref={sectionRefs.projects}>
              <RecentProjects className="h-96" />
            </div>

            <div ref={sectionRefs.experience}>
              <WorkExperience className="h-96" />
            </div>

            <div ref={sectionRefs.skills}>
              <ToolsAndTech
                className="h-96"
                scrollContainerRef={scrollContainerRef}
              />
            </div>

            <div>
              <GetInTouch />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Footer */}
      <Footer />
    </div>
  );
};

export default DesktopLayout;
