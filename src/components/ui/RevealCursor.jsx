import React, { useEffect, useRef, useState, useCallback } from 'react';

const RevealCursor = ({ isActive, targetRef, onMouseMove }) => {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    if (!cursorRef.current) return;
    
    if (isActive && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isInsideTarget = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (isInsideTarget) {
        // Show cursor and update position
        if (!isVisible) {
          setIsVisible(true);
          cursorRef.current.style.opacity = '1';
          cursorRef.current.style.transform = 'scale(1)';
        }
        
        // Update cursor position
        cursorRef.current.style.left = `${e.clientX - 75}px`;
        cursorRef.current.style.top = `${e.clientY - 75}px`;
        
        // Update mask position
        if (onMouseMove) {
          const relativeX = e.clientX - rect.left;
          const relativeY = e.clientY - rect.top;
          onMouseMove(relativeX, relativeY);
        }
      } else {
        // Hide cursor
        if (isVisible) {
          setIsVisible(false);
          cursorRef.current.style.opacity = '0';
          cursorRef.current.style.transform = 'scale(0)';
          if (onMouseMove) {
            onMouseMove(-200, -200); // Hide mask
          }
        }
      }
    } else {
      // Hide cursor when not active
      if (isVisible) {
        setIsVisible(false);
        cursorRef.current.style.opacity = '0';
        cursorRef.current.style.transform = 'scale(0)';
        if (onMouseMove) {
          onMouseMove(-200, -200); // Hide mask
        }
      }
    }
  }, [isActive, targetRef, onMouseMove, isVisible]);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={cursorRef}
      className="reveal-cursor"
      style={{
        position: 'fixed',
        left: '-200px',
        top: '-200px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: '2px solid #f36c38',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transform: 'scale(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        boxShadow: '0 0 0 2px rgba(243, 108, 56, 0.2), 0 0 20px rgba(243, 108, 56, 0.4)',
        backdropFilter: 'none',
      }}
    />
  );
};

export default RevealCursor;
