import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

// Clean, modern SVG paths for better animations
const iconPaths = {
  user: [
    {
      d: 'M12 12c2.7 0 4.5-2.1 4.5-4.5S14.7 3 12 3 7.5 5.1 7.5 7.5 9.3 12 12 12z',
      key: 'head',
      strokeWidth: 2,
    },
    {
      d: 'M4 21v-1c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v1',
      key: 'body',
      strokeWidth: 2,
    },
  ],
  mail: [
    {
      d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      key: 'envelope',
      strokeWidth: 2,
    },
    {
      d: 'M22 6L12 13 2 6',
      key: 'flap',
      strokeWidth: 2,
    },
  ],
  message: [
    {
      d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
      key: 'bubble',
      strokeWidth: 2,
    },
  ],
};

const AnimatedLabelIcon = ({
  type = 'user',
  size = 20,
  color = 'var(--accent)',
}) => {
  const svgRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (svgRef.current && !hasAnimated) {
      const paths = svgRef.current.querySelectorAll('path');
      
      // Set up initial state
      paths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0.3,
        });
      });

      // Animate paths drawing
      gsap.to(paths, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.5,
        stagger: 0.3,
        ease: 'power2.out',
        delay: 0.5,
        onComplete: () => {
          // Remove dash array after animation for cleaner look
          gsap.set(paths, { strokeDasharray: 'none' });
        }
      });

      setHasAnimated(true);
    }
  }, [type, hasAnimated]);

  useEffect(() => {
    if (svgRef.current) {
      // Hover animation
      if (isHovered) {
        gsap.to(svgRef.current, {
          scale: 1.2,
          rotation: 10,
          duration: 0.4,
          ease: 'back.out(2)',
        });
        
        // Animate paths on hover
        const paths = svgRef.current.querySelectorAll('path');
        gsap.to(paths, {
          strokeWidth: 2.5,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(svgRef.current, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        
        // Reset paths
        const paths = svgRef.current.querySelectorAll('path');
        gsap.to(paths, {
          strokeWidth: 2,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [isHovered]);

  const paths = iconPaths[type] || iconPaths.user;

  return (
    <div
      className="inline-flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        minWidth: size + 4, 
        minHeight: size + 4,
        filter: isHovered ? `drop-shadow(0 0 15px ${color}50)` : 'none',
        transition: 'filter 0.4s ease',
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animated-label-icon"
        style={{
          transformOrigin: 'center',
          overflow: 'visible',
        }}
      >
        {paths.map((pathData) => (
          <path
            key={pathData.key}
            d={pathData.d}
            strokeWidth={pathData.strokeWidth}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
};

export default AnimatedLabelIcon;
