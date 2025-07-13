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
    React: ReactLogo,
    'Node.js': NodeJsLogo,
    Flutter: FlutterLogo,
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

        // Only create animation if there's content to scroll
        if (scrollDistance > 0) {
          // Create the horizontal scroll animation - works on all devices
          gsap.to(tools, {
            x: -scrollDistance,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              scroller: scrollContainerRef?.current,
              start: 'top 15%',
              end: '+=50%',
              scrub: 2, // Balanced scrub value for all devices
              pin: false,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
        }
      }, 200);
    },
    { scope: sectionRef, dependencies: [toolsData] },
  );

  // Cleanup ScrollTrigger on unmount
  useEffect(() => {
    const currentSection = sectionRef.current;
    return () => {
      // Kill only ScrollTriggers related to this component
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === currentSection) {
          trigger.kill();
        }
      });
    };
  }, []);

  const ToolCard = ({ tool }) => {
    const LogoComponent = logoMap[tool.name];

    return (
      <div className="flex-shrink-0 group relative">
        <div
          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-2 sm:mx-3 rounded-2xl sm:rounded-3xl lg:rounded-[28px] transition-all duration-700 flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-5 overflow-hidden group-hover:scale-[1.02] group-hover:-translate-y-1 cursor-pointer"
          style={{
            backgroundColor: 'var(--neuro-card-bg)',
            boxShadow: `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
              inset 4px 4px 12px var(--neuro-card-shadow-inset-dark),
              inset -4px -4px 12px var(--neuro-card-shadow-inset-light),
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
          // Touch events for mobile
          onTouchStart={(e) => {
            e.currentTarget.style.boxShadow = `
              inset 4px 4px 12px var(--neuro-card-shadow-inset-dark),
              inset -4px -4px 12px var(--neuro-card-shadow-inset-light),
              6px 6px 12px var(--neuro-shadow-dark),
              -6px -6px 12px var(--neuro-shadow-light)
            `;
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.boxShadow = `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
        >
          {/* Subtle inner highlight */}
          <div
            className="absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)] sm:rounded-[calc(theme(borderRadius.3xl)-1px)] lg:rounded-[27px] opacity-25"
            style={{
              background: `linear-gradient(135deg, var(--neuro-shadow-light) 0%, transparent 50%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Top reflection highlight */}
          <div
            className="absolute top-[1px] left-[1px] right-[1px] h-6 sm:h-8 lg:h-12 rounded-t-[calc(theme(borderRadius.2xl)-1px)] sm:rounded-t-[calc(theme(borderRadius.3xl)-1px)] lg:rounded-t-[27px] opacity-30 z-5"
            style={{
              background: `linear-gradient(180deg, var(--neuro-shadow-light) 0%, transparent 100%)`,
            }}
          />

          {/* Logo */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center relative z-10">
            {LogoComponent ? (
              <img
                src={LogoComponent}
                alt={`${tool.name} logo`}
                className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner"
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: `
                    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <span className="text-white font-bold text-lg sm:text-2xl lg:text-3xl drop-shadow-lg">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Tool name */}
          <h3
            className="text-sm sm:text-base lg:text-lg font-semibold text-center relative z-10 px-2 sm:px-3 leading-tight"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            {tool.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 120 }} />

      <div ref={sectionRef} className="relative px-2 sm:px-4">
        <SectionTitle primaryText="TOOLS &" secondaryText="TECHNOLOGIES" />

        {/* Responsive neumorphic horizontal scroll container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden mt-8 sm:mt-12 rounded-3xl sm:rounded-[40px] h-[280px] sm:h-[360px] lg:h-[520px]"
          style={{
            width: '100%',
            backgroundColor: 'var(--neuro-bg)',
            boxShadow: `
              inset 6px 6px 12px var(--neuro-shadow-dark),
              inset -6px -6px 12px var(--neuro-shadow-light)
            `,
          }}
        >
          {/* Subtle inner highlight border */}
          <div
            className="absolute inset-[2px] rounded-[calc(theme(borderRadius.3xl)-2px)] sm:rounded-[38px] opacity-20 z-5 pointer-events-none"
            style={{
              background: `linear-gradient(135deg,
                var(--neuro-shadow-light) 0%,
                transparent 30%,
                transparent 70%,
                var(--neuro-shadow-dark) 100%)`,
              border: '1px solid',
              borderImage: `linear-gradient(135deg,
                var(--neuro-shadow-light),
                transparent,
                var(--neuro-shadow-dark)) 1`,
            }}
          />

          {/* Subtle inner glow for depth */}
          <div
            className="absolute inset-0 rounded-3xl sm:rounded-[40px] z-10 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Tools container with responsive padding */}
          <div
            ref={toolsRef}
            className="flex items-center h-full relative z-0 px-5 sm:px-10 lg:px-20"
            style={{
              width: 'max-content',
              minWidth: '100%',
            }}
          >
            {toolsData.map((tool, index) => (
              <ToolCard key={index} tool={tool} />
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:hidden">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
