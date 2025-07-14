import React, { useRef, useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import RevealCursor from '../ui/RevealCursor';
import {
  HiOutlineCode,
  HiOutlineTemplate,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import orangePattern from '../../assets/orange-pattern.svg';
import greenPattern from '../../assets/green-pattern.svg';

const About = () => {
  const paragraphRef = useRef(null);
  const casualTextRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ x: -200, y: -200 });

  const handleMouseMove = (x, y) => {
    setMaskPosition({ x, y });
  };

  return (
    <>
      <div style={{ height: 80 }} />
      {/* large designation */}
      <SectionTitle primaryText="SOFTWARE" secondaryText="ENGINEER" />

      {/* short bio with reveal effect */}
      <div className="flex flex-col items-start justify-center mt-8 w-full max-w-3xl">
        <div
          ref={paragraphRef}
          className="reveal-paragraph relative text-lg text-gray-500 cursor-none w-full text-left"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Formal paragraph (default - always visible except in circle) */}
          <div
            className="formal-text-container relative z-10"
            style={{
              maskImage: `radial-gradient(circle 75px at ${maskPosition.x}px ${maskPosition.y}px, transparent 100%, black 100%)`,
              WebkitMaskImage: `radial-gradient(circle 75px at ${maskPosition.x}px ${maskPosition.y}px, transparent 100%, black 100%)`,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          >
            <p className="select-none">
              I am a software engineer currently focused on building
              cross-platform mobile apps with Flutter. I enjoy exploring mobile
              app UI designs and bringing them to life in Flutter, always aiming
              to write clean, collaborative, and maintainable code.
            </p>
          </div>

          {/* Casual paragraph (only visible in circle) */}
          <div
            ref={casualTextRef}
            className="casual-text-container absolute inset-0 z-20 select-none"
            style={{
              maskImage: `radial-gradient(circle 75px at ${maskPosition.x}px ${maskPosition.y}px, black 100%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 75px at ${maskPosition.x}px ${maskPosition.y}px, black 100%, transparent 100%)`,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          >
            <p className="text-lg font-semibold text-orange-500">
              Still not replaced by AI so still trying to make good shit and make 
              code impactful. Basically lazy developer who loves watching good design.
            </p>
          </div>
        </div>
      </div>

      <RevealCursor
        isActive={isHovering}
        targetRef={paragraphRef}
        onMouseMove={handleMouseMove}
      />

      {/* two button cards with responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-12 max-w-4xl lg:max-w-3xl">
        {/* Dynamic Animation & Motion Design Card */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white group cursor-pointer w-full lg:max-w-sm about-card-orange"
          onClick={() => window.open('https://github.com/7ANV1R', '_blank')}
        >
          {/* Abstract background pattern */}
          <div className="absolute inset-0 opacity-100">
            <img
              src={orangePattern}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center mb-3">
                <HiOutlineCode className="w-4 h-4" />
              </div>

              <h3 className="text-lg font-bold mb-3 leading-tight">
                CODE, CODE
                <br />& VIBE CODE
              </h3>
            </div>

            <div className="flex justify-start">
              <button className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-orange-500 transition-all duration-500 ease-out">
                <HiOutlineArrowRight className="w-4 h-4 about-arrow-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Framer, Figma, WordPress, ReactJS Card */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-400 to-green-400 p-6 text-black group cursor-pointer w-full lg:max-w-sm about-card-green"
          onClick={() =>
            window.open('https://www.behance.net/Tanvir_ibn_mizan', '_blank')
          }
        >
          {/* Abstract background pattern */}
          <div className="absolute inset-0 opacity-100">
            <img
              src={greenPattern}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <div className="w-6 h-6 border-2 border-black rounded-md flex items-center justify-center mb-3">
                <HiOutlineTemplate className="w-4 h-4" />
              </div>

              <h3 className="text-lg font-bold mb-3 leading-tight">
                FIGMA,SPLINE
                <br />& DESIGN
              </h3>
            </div>

            <div className="flex justify-start">
              <button className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-lime-400 transition-all duration-500 ease-out">
                <HiOutlineArrowRight className="w-4 h-4 about-arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
