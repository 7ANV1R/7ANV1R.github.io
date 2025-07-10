import React from 'react';
import SectionTitle from '../ui/SectionTitle';

const About = () => {
  return (
    <>
      {/* large designation */}
      <SectionTitle primaryText="SOFTWARE" secondaryText="ENGINEER" />

      {/* short bio */}
      <div className="flex flex-col items-center justify-center mt-8">
        <p className="text-lg text-gray-500">
          I am a software engineer currently focused on building cross-platform
          mobile apps with Flutter. I enjoy exploring mobile app UI designs and
          bringing them to life in Flutter, always aiming to write clean,
          collaborative, and maintainable code.
        </p>
      </div>

      {/* two button cards with responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-12 max-w-4xl lg:max-w-3xl">
        {/* Dynamic Animation & Motion Design Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white group hover:scale-105 transition-transform duration-300 cursor-pointer w-full lg:max-w-sm">
          {/* Abstract background pattern */}
          <div className="absolute inset-0 opacity-100">
            <img
              src="/src/assets/orange-pattern.svg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center mb-3">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>

              <h3 className="text-lg font-bold mb-3 leading-tight">
                CODE, CODE &
                <br />
                VIBE CODE
              </h3>
            </div>

            <div className="flex justify-start">
              <button className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-orange-500 transition-all duration-300 hover:scale-110">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Framer, Figma, WordPress, ReactJS Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-400 to-green-400 p-6 text-black group hover:scale-105 transition-transform duration-300 cursor-pointer w-full lg:max-w-sm">
          {/* Abstract background pattern */}
          <div className="absolute inset-0 opacity-100">
            <img
              src="/src/assets/green-pattern.svg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <div className="w-6 h-6 border-2 border-black rounded-md flex items-center justify-center mb-3">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-bold mb-3 leading-tight">
                FIGMA,SPLINE
                <br />& DESIGN
              </h3>
            </div>

            <div className="flex justify-start">
              <button className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-lime-400 transition-all duration-300 hover:scale-110">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
