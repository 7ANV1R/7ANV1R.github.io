import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import SectionTitle from '../ui/SectionTitle';

const About = () => {
  return (
    <>
      {/* large designation */}
      <SectionTitle primaryText="SOFTWARE" secondaryText="ENGINEER" />

      {/* short bio */}
      <div className="flex flex-col items-center justify-center mt-8">
        <p className="text-lg text-gray-500">
          I am a software engineer with a passion for building scalable and
          efficient applications. My expertise lies in full-stack development,
          and I enjoy working with modern technologies to create innovative
          solutions.
        </p>
      </div>
    </>
  );
};

export default About;
