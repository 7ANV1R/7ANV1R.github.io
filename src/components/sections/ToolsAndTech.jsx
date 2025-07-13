import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import SectionTitle from '../ui/SectionTitle';
import toolsData from '../../data/tools_and_tech.json';

// Import logo assets
import FlutterLogo from '../../assets/skills/flutter.svg';
import ReactLogo from '../../assets/skills/react.svg';
import NodeJsLogo from '../../assets/skills/node_js.svg';
import FirebaseLogo from '../../assets/skills/firebase.svg';
import SupabaseLogo from '../../assets/skills/supabase.svg';
import FigmaLogo from '../../assets/skills/figma.svg';
import RiveLogo from '../../assets/skills/rive.svg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ToolsAndTech = ({ scrollContainerRef }) => {
  const sectionRef = useRef();
  const containerRef = useRef();
  const toolsRef = useRef();

  // Map logo imports to tool names
  const logoMap = {
    Flutter: FlutterLogo,
    React: ReactLogo,
    'Node.js': NodeJsLogo,
    Firebase: FirebaseLogo,
    Supabase: SupabaseLogo,
    Figma: FigmaLogo,
    Rive: RiveLogo,
  };

  useGSAP(
    () => {
      // Wait for the next tick to ensure DOM is ready
      setTimeout(() => {
        const container = containerRef.current;
        const tools = toolsRef.current;

        if (!container || !tools) {
          console.log('Container or tools not found');
          return;
        }

        // Calculate the total width of the tools container
        const toolsWidth = tools.scrollWidth;
        const containerWidth = container.offsetWidth;
        const scrollDistance = toolsWidth - containerWidth;

        // Create the horizontal scroll animation
        gsap.to(tools, {
          x: -scrollDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: scrollContainerRef?.current,
            start: 'top 5%',
            end: '+=30%',
            scrub: 1,
            pin: false,
          },
        });
      }, 100);
    },
    { scope: sectionRef },
  );

  // Cleanup ScrollTrigger on unmount
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const ToolCard = ({ tool }) => {
    const LogoComponent = logoMap[tool.name];

    return (
      <div className="flex-shrink-0 group relative">
        <div className="w-48 h-48 mx-4 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/20 dark:border-white/10 p-6 hover:bg-gray-100/20 dark:hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 shadow-lg dark:shadow-none">
          {/* Logo */}
          <div className="w-16 h-16 flex items-center justify-center">
            {LogoComponent ? (
              <img
                src={LogoComponent}
                alt={`${tool.name} logo`}
                className="w-full h-full object-contain filter dark:brightness-0 dark:invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Tool name */}
          <h3
            className="text-lg font-semibold text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            {tool.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />

      <div ref={sectionRef} className="relative">
        <SectionTitle primaryText="TOOLS &" secondaryText="TECHNOLOGIES" />

        {/* Horizontal scroll container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden mt-12 rounded-2xl bg-gray-50 dark:bg-gray-800 shadow-lg"
          style={{ height: '500px', width: '100%' }}
        >
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent dark:from-black dark:via-black/90 z-10 pointer-events-none" />

          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent dark:from-black dark:via-black/90 z-10 pointer-events-none" />

          {/* Tools container */}
          <div
            ref={toolsRef}
            className="flex items-center h-full"
            style={{
              width: 'max-content',
              minWidth: '100%',
              paddingLeft: '100px',
              paddingRight: '100px',
            }}
          >
            {toolsData.map((tool, index) => (
              <ToolCard key={index} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
