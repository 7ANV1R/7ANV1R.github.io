import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

/**
 * RevealCursor Component
 * 
 * A custom cursor component that follows the mouse with smooth GSAP animations
 * and reveals masked content through a circular area. Features proximity detection
 * for enhanced UX and smooth entry/exit animations.
 * 
 * @param {boolean} isActive - Whether the cursor should be active
 * @param {React.RefObject} targetRef - Reference to the target element for proximity detection
 * @param {Function} onMouseMove - Callback for mask position updates
 */
const RevealCursor = ({ isActive, targetRef, onMouseMove }) => {
  // Constants
  const CURSOR_SIZE = 230;
  const MASK_RADIUS = 115; // Half of cursor size for centering
  const PROXIMITY_DISTANCE = 30;
  const ANIMATION_DURATION = 0.8;
  const EXIT_DURATION = 0.3;

  // Refs and state
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Position tracking refs
  const currentPosition = useRef({ x: -200, y: -200 });
  const targetPosition = useRef({ x: -200, y: -200 });
  const currentMaskPosition = useRef({ x: -200, y: -200 });
  const targetMaskPosition = useRef({ x: -200, y: -200 });
  const currentMaskSize = useRef(0);
  const targetMaskSize = useRef(0);

  /**
   * Animates cursor position and mask with smooth GSAP transitions
   * Uses lazy following animation for natural cursor movement
   */
  const animateCursor = useCallback(() => {
    if (!cursorRef.current) return;

    // Animate cursor position with easing
    gsap.to(currentPosition.current, {
      x: targetPosition.current.x,
      y: targetPosition.current.y,
      duration: ANIMATION_DURATION,
      ease: "power2.out",
      onUpdate: () => {
        if (cursorRef.current) {
          const { x, y } = currentPosition.current;
          cursorRef.current.style.left = `${x - MASK_RADIUS}px`;
          cursorRef.current.style.top = `${y - MASK_RADIUS}px`;
        }
      }
    });

    // Animate mask position with synchronized timing
    gsap.to(currentMaskPosition.current, {
      x: targetMaskPosition.current.x,
      y: targetMaskPosition.current.y,
      duration: ANIMATION_DURATION,
      ease: "power2.out",
      onUpdate: () => {
        if (onMouseMove) {
          const { x, y } = currentMaskPosition.current;
          onMouseMove(x, y, currentMaskSize.current);
        }
      }
    });

    // Animate mask size
    gsap.to(currentMaskSize, {
      current: targetMaskSize.current,
      duration: ANIMATION_DURATION,
      ease: "power2.out",
      onUpdate: () => {
        if (onMouseMove) {
          const { x, y } = currentMaskPosition.current;
          onMouseMove(x, y, currentMaskSize.current);
        }
      }
    });
  }, [onMouseMove]);

  /**
   * Checks if mouse is within proximity of target element
   * @param {MouseEvent} e - Mouse event
   * @param {DOMRect} rect - Target element bounding rect
   * @returns {boolean} Whether mouse is within proximity
   */
  const isWithinProximity = useCallback((e, rect) => {
    const expandedRect = {
      left: rect.left - PROXIMITY_DISTANCE,
      right: rect.right + PROXIMITY_DISTANCE,
      top: rect.top - PROXIMITY_DISTANCE,
      bottom: rect.bottom + PROXIMITY_DISTANCE
    };
    
    return e.clientX >= expandedRect.left &&
           e.clientX <= expandedRect.right &&
           e.clientY >= expandedRect.top &&
           e.clientY <= expandedRect.bottom;
  }, []);

  /**
   * Initializes cursor visibility with smooth entry animation
   * @param {MouseEvent} e - Mouse event
   * @param {DOMRect} rect - Target element bounding rect
   */
  const showCursor = useCallback((e, rect) => {
    setIsVisible(true);
    
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Set initial positions to prevent glitches
    currentPosition.current.x = e.clientX;
    currentPosition.current.y = e.clientY;
    currentMaskPosition.current.x = relativeX;
    currentMaskPosition.current.y = relativeY;
    currentMaskSize.current = MASK_RADIUS;
    
    // Position cursor immediately
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX - MASK_RADIUS}px`;
      cursorRef.current.style.top = `${e.clientY - MASK_RADIUS}px`;
    }
    
    // Show mask at correct position
    if (onMouseMove) {
      onMouseMove(relativeX, relativeY, MASK_RADIUS);
    }
    
    // Smooth entry animation
    gsap.to(cursorRef.current, {
      opacity: 1,
      scale: 1,
      duration: EXIT_DURATION,
      ease: "back.out(1.7)"
    });
  }, [onMouseMove]);

  /**
   * Hides cursor with smooth exit animation
   */
  const hideCursor = useCallback(() => {
    setIsVisible(false);
    
    // Kill ongoing animations
    gsap.killTweensOf(currentPosition.current);
    gsap.killTweensOf(currentMaskPosition.current);
    
    // Shrink mask smoothly
    targetMaskSize.current = 0;
    
    gsap.to(currentMaskSize, {
      current: 0,
      duration: EXIT_DURATION,
      ease: "power2.in",
      onUpdate: () => {
        if (onMouseMove) {
          const { x, y } = currentMaskPosition.current;
          onMouseMove(x, y, currentMaskSize.current);
        }
      },
      onComplete: () => {
        // Move off-screen after shrinking
        currentMaskPosition.current.x = -200;
        currentMaskPosition.current.y = -200;
        if (onMouseMove) {
          onMouseMove(-200, -200, 0);
        }
      }
    });
    
    // Hide cursor
    gsap.to(cursorRef.current, {
      opacity: 0,
      scale: 0,
      duration: EXIT_DURATION,
      ease: "power2.in"
    });
  }, [onMouseMove]);

  /**
   * Main mouse movement handler with proximity detection
   */
  const handleMouseMove = useCallback((e) => {
    if (!cursorRef.current || !isActive || !targetRef.current) {
      if (isVisible) hideCursor();
      return;
    }

    const rect = targetRef.current.getBoundingClientRect();
    const withinProximity = isWithinProximity(e, rect);

    if (withinProximity) {
      // Show cursor if not visible
      if (!isVisible) {
        showCursor(e, rect);
      }

      // Update target positions for smooth animation
      targetPosition.current.x = e.clientX;
      targetPosition.current.y = e.clientY;
      
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      targetMaskPosition.current.x = relativeX;
      targetMaskPosition.current.y = relativeY;
      targetMaskSize.current = MASK_RADIUS;
      
      animateCursor();
    } else if (isVisible) {
      hideCursor();
    }
  }, [isActive, targetRef, isVisible, isWithinProximity, showCursor, hideCursor, animateCursor]);

  // Mouse move event listener
  useEffect(() => {
    // Skip on touch devices for better performance
    if ('ontouchstart' in window) return;

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Cursor element with optimized styles
  return (
    <div
      ref={cursorRef}
      className="reveal-cursor"
      style={{
        position: 'fixed',
        left: '-200px',
        top: '-200px',
        width: `${CURSOR_SIZE}px`,
        height: `${CURSOR_SIZE}px`,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: '2px solid #f36c38',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transform: 'scale(0)',
        boxShadow: '0 0 0 2px rgba(243, 108, 56, 0.2), 0 0 20px rgba(243, 108, 56, 0.4)',
        willChange: 'transform, opacity', // Optimize for animations
      }}
    />
  );
};

export default RevealCursor;
