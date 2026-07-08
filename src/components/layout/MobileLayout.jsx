import React, { useRef } from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import WorkExperience from '../sections/WorkExperience';
import ToolsAndTech from '../sections/ToolsAndTech';
import FloatingNav from '../ui/FloatingNav';
import GetInTouch from '../sections/GetInTouch';
import Footer from '../sections/Footer';
import useLenis from '../../hooks/useLenis';
import useMediaQuery from '../../hooks/useMediaQuery';

const MobileLayout = () => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const lenisRef = useLenis({ enabled: isMobile }); // window scroll
  const sectionRefs = {
    profile: useRef(null),
    about: useRef(null),
    projects: useRef(null),
    experience: useRef(null),
    skills: useRef(null),
  };

  const handleNavigate = (sectionId) => {
    const lenis = lenisRef.current;

    if (sectionId === 'profile') {
      // For profile, scroll to top of page
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const targetRef = sectionRefs[sectionId];
    if (!targetRef.current) return;

    if (lenis) {
      // Offset clears the floating nav that overlays the top of the page.
      lenis.scrollTo(targetRef.current, { offset: -96 });
    } else {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="lg:hidden">
      <FloatingNav onNavigate={handleNavigate} />

      <div className="container mx-auto px-4 pt-24 pb-6 space-y-6">
        <div ref={sectionRefs.profile}>
          <ProfileCard className="h-64" />
        </div>
        <div ref={sectionRefs.about}>
          <About />
        </div>

        <div ref={sectionRefs.projects}>
          <RecentProjects />
        </div>

        <div ref={sectionRefs.experience}>
          <WorkExperience />
        </div>
        <div ref={sectionRefs.skills}>
          <ToolsAndTech />
        </div>
        <div>
          <GetInTouch />
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
