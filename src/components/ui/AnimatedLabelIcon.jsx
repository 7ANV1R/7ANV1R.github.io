import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// Enhanced SVG paths with more detailed animations
const iconPaths = {
  user: [
    {
      d: 'M12 12c2.7 0 4.5-2.1 4.5-4.5S14.7 3 12 3 7.5 5.1 7.5 7.5 9.3 12 12 12z',
      key: 'head',
      strokeWidth: 2,
      delay: 0,
    },
    {
      d: 'M4 21v-1c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v1',
      key: 'body',
      strokeWidth: 2,
      delay: 0.3,
    },
  ],
  mail: [
    {
      d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      key: 'envelope',
      strokeWidth: 2,
      delay: 0,
    },
    {
      d: 'M22 6L12 13 2 6',
      key: 'flap',
      strokeWidth: 2,
      delay: 0.4,
    },
  ],
  message: [
    {
      d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
      key: 'bubble',
      strokeWidth: 2,
      delay: 0,
    },
    {
      d: 'M9 11h6m-4 2h4',
      key: 'lines',
      strokeWidth: 1.5,
      delay: 0.6,
    },
  ],
};

/**
 * AnimatedLabelIcon Component
 *
 * A sophisticated animated SVG icon component with drawing animations and hover effects.
 *
 * @param {Object} props - Component props
 * @param {'user'|'mail'|'message'} props.type - The type of icon to display
 * @param {number} props.size - The size of the icon in pixels
 * @param {string} props.color - The color of the icon (CSS variable or hex)
 * @returns {JSX.Element} The animated icon component
 */
const AnimatedLabelIcon = ({
  type = 'user',
  size = 20,
  color = 'var(--accent)',
}) => {
  const svgRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Memoize hover handlers to prevent unnecessary re-renders
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Initial drawing animation effect
  useEffect(() => {
    if (!svgRef.current || hasAnimated) return;

    const paths = svgRef.current.querySelectorAll('path');
    const currentPaths = iconPaths[type];

    if (!paths.length || !currentPaths) return;

    // Set up initial state for each path
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0.4,
      });
    });

    // Animate paths drawing with individual delays
    paths.forEach((path, index) => {
      const pathData = currentPaths[index];
      if (!pathData) return;

      gsap.to(path, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
        delay: pathData.delay,
        onComplete: () => {
          // Create a subtle pulse effect after drawing
          gsap.to(path, {
            opacity: 0.8,
            duration: 0.8,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: 1,
          });
        },
      });
    });

    // Clean up dash arrays after animation for better performance
    timeoutRef.current = setTimeout(() => {
      if (svgRef.current) {
        const currentPaths = svgRef.current.querySelectorAll('path');
        currentPaths.forEach((path) => {
          gsap.set(path, { strokeDasharray: 'none' });
        });
      }
    }, 2000);

    setHasAnimated(true);
  }, [type, hasAnimated]);

  // Hover animation effect
  useEffect(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll('path');
    const currentPaths = iconPaths[type];

    if (!paths.length || !currentPaths) return;

    if (isHovered) {
      // Hover: Scale up and create wave effect
      gsap.to(svgRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });

      // Wave animation through paths
      paths.forEach((path, index) => {
        const pathData = currentPaths[index];
        if (!pathData) return;

        gsap.to(path, {
          strokeWidth: pathData.strokeWidth * 1.2,
          duration: 0.3,
          ease: 'power2.out',
          delay: index * 0.05,
        });
      });

      // Create morphing effect
      gsap.to(paths, {
        transformOrigin: 'center',
        scaleY: 1.05,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
        stagger: 0.1,
      });
    } else {
      // Reset animations
      gsap.to(svgRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });

      paths.forEach((path, index) => {
        const pathData = currentPaths[index];
        if (!pathData) return;

        gsap.to(path, {
          strokeWidth: pathData.strokeWidth,
          scaleY: 1,
          duration: 0.3,
          ease: 'power2.out',
          delay: index * 0.02,
        });
      });
    }
  }, [isHovered, type]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const paths = iconPaths[type] || iconPaths.user;

  return (
    <div
      className="inline-flex items-center justify-center cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        minWidth: size + 6,
        minHeight: size + 6,
        filter: isHovered
          ? `drop-shadow(0 0 20px ${color}40) brightness(1.2)`
          : 'none',
        transition: 'filter 0.4s ease',
      }}
      role="img"
      aria-label={`${type} icon`}
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
        aria-hidden="true"
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
