import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for scroll-aware hover effects
 * Provides hover effects during scroll without moving the mouse
 */
export const useScrollAwareHover = () => {
  const mousePosition = useRef({ x: -1, y: -1 });
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const lastHoveredElement = useRef(null);
  const isMouseMoving = useRef(false);
  const mouseMoveTimeout = useRef(null);
  const containerListeners = useRef(new Set());

  // Debounced mouse movement detection
  const handleMouseMove = useCallback((e) => {
    mousePosition.current.x = e.clientX;
    mousePosition.current.y = e.clientY;

    isMouseMoving.current = true;

    // Clear any scroll-applied hover when mouse moves
    if (lastHoveredElement.current) {
      lastHoveredElement.current.classList.remove('scroll-hover');
      lastHoveredElement.current = null;
    }

    // Reset mouse moving flag after a short delay
    if (mouseMoveTimeout.current) {
      clearTimeout(mouseMoveTimeout.current);
    }
    mouseMoveTimeout.current = setTimeout(() => {
      isMouseMoving.current = false;
    }, 150);
  }, []);

  // Handle scroll events (both window and container)
  const handleScroll = useCallback(() => {
    // Skip if mouse is actively moving
    if (isMouseMoving.current) return;

    isScrolling.current = true;

    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      const elementUnderMouse = document.elementFromPoint(
        mousePosition.current.x,
        mousePosition.current.y,
      );

      // Find the closest hoverable element
      const hoverableElement = findClosestHoverableElement(elementUnderMouse);

      // Only apply scroll hover if we found a different element
      if (hoverableElement && hoverableElement !== lastHoveredElement.current) {
        // Remove previous scroll hover
        if (lastHoveredElement.current) {
          lastHoveredElement.current.classList.remove('scroll-hover');
        }

        // Apply new scroll hover
        hoverableElement.classList.add('scroll-hover');
        lastHoveredElement.current = hoverableElement;
      }

      // If no hoverable element found, clear any existing scroll hover
      if (!hoverableElement && lastHoveredElement.current) {
        lastHoveredElement.current.classList.remove('scroll-hover');
        lastHoveredElement.current = null;
      }
    });

    // Clear scroll hover after scrolling stops (increased timeout for stability)
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;

      if (lastHoveredElement.current) {
        lastHoveredElement.current.classList.remove('scroll-hover');
        lastHoveredElement.current = null;
      }
    }, 150); // Increased from 100ms to 150ms for more stability
  }, []);

  // Find the closest element with hover effects
  const findClosestHoverableElement = useCallback((element) => {
    if (!element) return null;

    // Check if the element itself is hoverable
    if (isHoverableElement(element)) {
      return element;
    }

    // Check parent elements
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (isHoverableElement(parent)) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return null;
  }, []);

  // Check if an element should have hover effects
  const isHoverableElement = useCallback((element) => {
    if (!element || !element.classList) return false;

    // Skip elements that explicitly opt out of scroll hover
    if (element.classList.contains('no-scroll-hover')) return false;

    // Check for common hoverable classes
    const hoverableClasses = [
      'group',
      'cursor-pointer',
      'transition',
      'hover:scale',
      'hover:bg',
      'hover:text',
      'hover:opacity',
      'hover:translate',
      'hover:mb',
      'hover:max-h',
    ];

    const classList = element.className;
    return hoverableClasses.some((className) => classList.includes(className));
  }, []);

  // Setup container listeners
  const setupContainerListeners = useCallback(() => {
    // Clear existing listeners
    containerListeners.current.forEach((container) => {
      container.removeEventListener('scroll', handleScroll);
    });
    containerListeners.current.clear();

    // Find all scrollable containers
    const scrollableContainers = document.querySelectorAll(
      '[class*="overflow-y-auto"], [class*="overflow-auto"], .overflow-y-auto, .overflow-auto',
    );

    scrollableContainers.forEach((container) => {
      container.addEventListener('scroll', handleScroll, { passive: true });
      containerListeners.current.add(container);
    });
  }, [handleScroll]);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    // Add event listeners for window scroll
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Setup container listeners after a short delay to ensure DOM is ready
    setTimeout(setupContainerListeners, 100);

    // Also setup on window resize to catch new containers
    window.addEventListener('resize', setupContainerListeners);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setupContainerListeners);

      // Remove container listeners
      containerListeners.current.forEach((container) => {
        container.removeEventListener('scroll', handleScroll);
      });
      containerListeners.current.clear();

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }

      // Clean up any remaining scroll hover
      if (lastHoveredElement.current) {
        lastHoveredElement.current.classList.remove('scroll-hover');
      }
    };
  }, [handleMouseMove, handleScroll, setupContainerListeners]);
};

export default useScrollAwareHover;
