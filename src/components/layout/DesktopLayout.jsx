import React from 'react';
import ProfileCard from '../sections/ProfileCard';
import About from '../sections/About';
import RecentProjects from '../sections/RecentProjects';
import Education from '../sections/Education';

const DesktopLayout = () => {
  return (
    <div className="hidden lg:flex h-screen">
      {/* Left Side - Pinned Card */}
      <div className="w-1/3 p-6 border-r border-gray-200">
        <div className="sticky top-6">
          <ProfileCard className="h-96" />
        </div>
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="w-2/3 overflow-y-auto">
        <div className="p-6 space-y-6">
          <About className="h-80" />
          <RecentProjects className="h-96" />
          <Education className="h-80" />
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
