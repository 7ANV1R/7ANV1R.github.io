import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const RevealCursor = ({ isActive, targetRef, onMouseMove }) => {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentPosition = useRef({ x: -200, y: -200 });
  const targetPosition = useRef({ x: -200, y: -200 });
  const currentMaskPosition = useRef({ x: -200, y: -200 });
  const targetMaskPosition = useRef({ x: -200, y: -200 });
  const currentMaskSize = useRef(0);
  const targetMaskSize = useRef(0);

  // Smooth animation loop for lazy following
  const animateCursor = useCallback(() => {
    if (!cursorRef.current) return;

    // Animate cursor position with easing
    gsap.to(currentPosition.current, {
      x: targetPosition.current.x,
      y: targetPosition.current.y,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (cursorRef.current) {
          cursorRef.current.style.left = `${currentPosition.current.x - 115}px`;
          cursorRef.current.style.top = `${currentPosition.current.y - 115}px`;
        }
      }
    });

    // Animate mask position with same timing
    gsap.to(currentMaskPosition.current, {
      x: targetMaskPosition.current.x,
      y: targetMaskPosition.current.y,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (onMouseMove) {
          onMouseMove(currentMaskPosition.current.x, currentMaskPosition.current.y, currentMaskSize.current);
        }
      }
    });

    // Animate mask size
    gsap.to(currentMaskSize, {
      current: targetMaskSize.current,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (onMouseMove) {
          onMouseMove(currentMaskPosition.current.x, currentMaskPosition.current.y, currentMaskSize.current);
        }
      }
    });
  }, [onMouseMove]);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e) => {
      if (!cursorRef.current) return;

      if (isActive && targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        
        // Expand detection area by 30px around the text section
        const proximityDistance = 30;
        const expandedRect = {
          left: rect.left - proximityDistance,
          right: rect.right + proximityDistance,
          top: rect.top - proximityDistance,
          bottom: rect.bottom + proximityDistance
        };
        
        const isInsideTarget =
          e.clientX >= expandedRect.left &&
          e.clientX <= expandedRect.right &&
          e.clientY >= expandedRect.top &&
          e.clientY <= expandedRect.bottom;

        if (isInsideTarget) {
          // Show cursor and update target position
          if (!isVisible) {
            setIsVisible(true);
            
            // Set initial positions to current mouse position to avoid glitch
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;
            currentPosition.current.x = e.clientX;
            currentPosition.current.y = e.clientY;
            currentMaskPosition.current.x = relativeX;
            currentMaskPosition.current.y = relativeY;
            currentMaskSize.current = 115; // Set initial size
            
            // Position cursor immediately at mouse location
            cursorRef.current.style.left = `${e.clientX - 115}px`;
            cursorRef.current.style.top = `${e.clientY - 115}px`;
            
            // Show mask immediately at correct position
            if (onMouseMove) {
              onMouseMove(relativeX, relativeY, 115);
            }
            
            gsap.to(cursorRef.current, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: "back.out(1.7)"
            });
          }

          // Update target position for smooth animation
          targetPosition.current.x = e.clientX;
          targetPosition.current.y = e.clientY;
          
          // Update mask target position (relative to target element)
          const relativeX = e.clientX - rect.left;
          const relativeY = e.clientY - rect.top;
          targetMaskPosition.current.x = relativeX;
          targetMaskPosition.current.y = relativeY;
          targetMaskSize.current = 115; // Keep size at 115px while hovering
          
          animateCursor();
        } else {
          // Hide cursor
          if (isVisible) {
            setIsVisible(false);
            
            // Kill ongoing position animations
            gsap.killTweensOf(currentPosition.current);
            gsap.killTweensOf(currentMaskPosition.current);
            
            // Keep mask at current position but shrink to 0 smoothly
            targetMaskSize.current = 0;
            
            // Smooth exit animation - only shrink the mask, don't move it
            gsap.to(currentMaskSize, {
              current: 0,
              duration: 0.3,
              ease: "power2.in",
              onUpdate: () => {
                if (onMouseMove) {
                  onMouseMove(currentMaskPosition.current.x, currentMaskPosition.current.y, currentMaskSize.current);
                }
              },
              onComplete: () => {
                // Only move off-screen after shrinking is complete
                currentMaskPosition.current.x = -200;
                currentMaskPosition.current.y = -200;
                if (onMouseMove) {
                  onMouseMove(-200, -200, 0);
                }
              }
            });
            
            gsap.to(cursorRef.current, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
              ease: "power2.in"
            });
          }
        }
      } else {
        // Hide cursor when not active
        if (isVisible) {
          setIsVisible(false);
          
          // Kill ongoing position animations
          gsap.killTweensOf(currentPosition.current);
          gsap.killTweensOf(currentMaskPosition.current);
          
          // Keep mask at current position but shrink to 0 smoothly
          targetMaskSize.current = 0;
          
          // Smooth exit animation - only shrink the mask, don't move it
          gsap.to(currentMaskSize, {
            current: 0,
            duration: 0.3,
            ease: "power2.in",
            onUpdate: () => {
              if (onMouseMove) {
                onMouseMove(currentMaskPosition.current.x, currentMaskPosition.current.y, currentMaskSize.current);
              }
            },
            onComplete: () => {
              // Only move off-screen after shrinking is complete
              currentMaskPosition.current.x = -200;
              currentMaskPosition.current.y = -200;
              if (onMouseMove) {
                onMouseMove(-200, -200, 0);
              }
            }
          });
          
          gsap.to(cursorRef.current, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: "power2.in"
          });
        }
      }
    },
    [isActive, targetRef, onMouseMove, isVisible, animateCursor],
  );

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
        width: '230px',
        height: '230px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: '2px solid #f36c38',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transform: 'scale(0)',
        boxShadow:
          '0 0 0 2px rgba(243, 108, 56, 0.2), 0 0 20px rgba(243, 108, 56, 0.4)',
        backdropFilter: 'none',
      }}
    />
  );
};

export default RevealCursor;
