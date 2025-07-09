import React from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import Education from '../sections/Education';

const MobileLayout = () => {
  return (
    <div className="lg:hidden">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ProfileCard className="h-64" />
        <About />
        <RecentProjects />
        <Education />
      </div>
    </div>
  );
};

export default MobileLayout;
