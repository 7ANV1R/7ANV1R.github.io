import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const paths = {
  user: [
    // Head
    {
      d: 'M12 12c2.7 0 4.5-2.1 4.5-4.5S14.7 3 12 3 7.5 5.1 7.5 7.5 9.3 12 12 12z',
      key: 'head',
    },
    // Shoulders
    { d: 'M4 21v-1c0-2.2 3.6-4 8-4s8 1.8 8 4v1', key: 'shoulders' },
  ],
  mail: [
    { d: 'M4 4h16v16H4z', key: 'rect', opacity: 0.2 },
    { d: 'M4 4l8 8 8-8', key: 'flap' },
    { d: 'M4 20V8m16 12V8', key: 'sides' },
  ],
  message: [
    {
      d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      key: 'bubble',
    },
  ],
};

const AnimatedLabelIcon = ({
  type = 'user',
  size = 18,
  color = 'var(--accent)',
}) => {
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.querySelectorAll('path'),
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          duration: 1.2,
          stagger: 0.15,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        },
      );
    }
  }, [type]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animated-label-icon"
      ref={groupRef}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {paths[type].map((p) => (
        <path
          key={p.key}
          d={p.d}
          stroke={color}
          fill="none"
          opacity={p.opacity || 1}
        />
      ))}
    </svg>
  );
};

export default AnimatedLabelIcon;
