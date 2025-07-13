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
import ExpoLogo from '../../assets/skills/expo.svg';
import NextJsLogo from '../../assets/skills/next_js.svg';
import PostmanLogo from '../../assets/skills/postman.svg';
import PremiereProLogo from '../../assets/skills/premiere_pro.svg';
import GithubLogo from '../../assets/skills/github.svg';

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
    Expo: ExpoLogo,
    'Next.js': NextJsLogo,
    Postman: PostmanLogo,
    'Premiere Pro': PremiereProLogo,
    GitHub: GithubLogo,
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
          // Create the horizontal scroll animation with perfect easing for Neumorphism
          gsap.to(tools, {
            x: -scrollDistance,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              scroller: scrollContainerRef?.current,
              start: 'top 15%',
              end: '+=50%',
              scrub: 3, // Smoother scrub for the tactile feel
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
          className="w-48 h-48 mx-3 rounded-[28px] transition-all duration-700 flex flex-col items-center justify-center gap-5 overflow-hidden group-hover:scale-[1.02] group-hover:-translate-y-1 cursor-pointer"
          style={{
            backgroundColor: 'var(--neuro-card-bg)',
            boxShadow: `
              12px 12px 24px var(--neuro-shadow-dark),
              -12px -12px 24px var(--neuro-shadow-light)
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
              12px 12px 24px var(--neuro-shadow-dark),
              -12px -12px 24px var(--neuro-shadow-light)
            `;
          }}
        >
          {/* Subtle inner highlight */}
          <div
            className="absolute inset-[1px] rounded-[27px] opacity-25"
            style={{
              background: `linear-gradient(135deg, var(--neuro-shadow-light) 0%, transparent 50%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Top reflection highlight */}
          <div
            className="absolute top-[1px] left-[1px] right-[1px] h-12 rounded-t-[27px] opacity-30 z-5"
            style={{
              background: `linear-gradient(180deg, var(--neuro-shadow-light) 0%, transparent 100%)`,
            }}
          />

          {/* Logo */}
          <div className="w-20 h-20 flex items-center justify-center relative z-10">
            {LogoComponent ? (
              <img
                src={LogoComponent}
                alt={`${tool.name} logo`}
                className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-3xl flex items-center justify-center shadow-inner"
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: `
                    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <span className="text-white font-bold text-3xl drop-shadow-lg">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Tool name */}
          <h3
            className="text-lg font-semibold text-center relative z-10 px-3 leading-tight"
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

      <div ref={sectionRef} className="relative px-4">
        <SectionTitle primaryText="TOOLS &" secondaryText="TECHNOLOGIES" />

        {/* Neumorphic horizontal scroll container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden mt-12 rounded-[40px]"
          style={{
            height: '520px',
            width: '100%',
            backgroundColor: 'var(--neuro-bg)',
            boxShadow: `
              inset 8px 8px 16px var(--neuro-shadow-dark),
              inset -8px -8px 16px var(--neuro-shadow-light)
            `,
          }}
        >
          {/* Subtle inner highlight border */}
          <div
            className="absolute inset-[2px] rounded-[38px] opacity-20 z-5 pointer-events-none"
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
            className="absolute inset-0 rounded-[40px] z-10 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Tools container */}
          <div
            ref={toolsRef}
            className="flex items-center h-full relative z-0"
            style={{
              width: 'max-content',
              minWidth: '100%',
              paddingLeft: '80px',
              paddingRight: '80px',
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
