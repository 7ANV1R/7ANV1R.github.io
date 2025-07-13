import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

// Constants for better maintainability and performance
const CURSOR_CONFIG = {
  SIZE: 80,
  OFFSET: 40,
  MAX_LOGO_WIDTH: 120,
  MAX_LOGO_HEIGHT: 80,
  ANIMATION_DURATION: 0.3,
  ANIMATION_EASE: 'power2.out',
  PERIODIC_CHECK_INTERVAL: 100,
};

const SELECTORS = {
  WORK_SECTION: '[data-section="work-experience"]',
  WORK_ITEM: '.work-experience-item',
  WORK_ITEM_DATA: '[data-work-item]',
  COMPANY_LOGO: '[data-company-logo]',
};

const CompanyLogoCursor = () => {
  const cursorRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentLogoRef = useRef(null);
  const isVisibleRef = useRef(false);
  const animationFrameRef = useRef(null);
  const [currentLogo, setCurrentLogo] = useState(null);

  // Dynamic logo sizing based on aspect ratio
  const [logoStyle, setLogoStyle] = useState({
    width: 'auto',
    height: 'auto',
    maxWidth: `${CURSOR_CONFIG.MAX_LOGO_WIDTH}px`,
    maxHeight: `${CURSOR_CONFIG.MAX_LOGO_HEIGHT}px`,
  });

  // Function to calculate logo size based on aspect ratio
  const calculateLogoSize = useCallback((img) => {
    if (!img || !img.naturalWidth || !img.naturalHeight) {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: `${CURSOR_CONFIG.MAX_LOGO_WIDTH}px`,
        maxHeight: `${CURSOR_CONFIG.MAX_LOGO_HEIGHT}px`,
      };
    }

    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // For very wide logos (typography style like NexusLab), make them bigger
    if (aspectRatio > 4) {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: '180px',
        maxHeight: '45px',
      };
    }
    // For wide logos
    else if (aspectRatio > 2.5) {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: '150px',
        maxHeight: '50px',
      };
    }
    // For moderately wide logos
    else if (aspectRatio > 1.5) {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: '120px',
        maxHeight: '70px',
      };
    }
    // For square-ish or tall logos, keep current size
    else {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: `${CURSOR_CONFIG.MAX_LOGO_WIDTH}px`,
        maxHeight: `${CURSOR_CONFIG.MAX_LOGO_HEIGHT}px`,
      };
    }
  }, []);

  // GSAP animation for smooth cursor movement
  const animateCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth performance
    animationFrameRef.current = requestAnimationFrame(() => {
      gsap.to(cursorRef.current, {
        x: x - CURSOR_CONFIG.OFFSET,
        y: y - CURSOR_CONFIG.OFFSET,
        duration: CURSOR_CONFIG.ANIMATION_DURATION,
        ease: CURSOR_CONFIG.ANIMATION_EASE,
      });
    });
  }, []);

  // Show cursor with logo
  const showCursor = useCallback((logoPath) => {
    if (
      !cursorRef.current ||
      (isVisibleRef.current && currentLogoRef.current === logoPath)
    )
      return;

    isVisibleRef.current = true;
    currentLogoRef.current = logoPath;
    setCurrentLogo(logoPath);

    gsap.to(cursorRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: CURSOR_CONFIG.ANIMATION_EASE,
    });
  }, []);

  // Hide cursor
  const hideCursor = useCallback(() => {
    if (!cursorRef.current || !isVisibleRef.current) return;

    isVisibleRef.current = false;
    currentLogoRef.current = null;
    setCurrentLogo(null);

    gsap.to(cursorRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.2,
      ease: CURSOR_CONFIG.ANIMATION_EASE,
    });
  }, []);

  // Check if element is a work experience item
  const isWorkExperienceItem = useCallback((element) => {
    if (!element) return false;

    // Must be within the work experience section
    const workSection = element.closest(SELECTORS.WORK_SECTION);
    if (!workSection) return false;

    // Must be a work experience item or within one
    const hasWorkExpClasses =
      element.classList.contains('work-experience-item') ||
      element.closest(SELECTORS.WORK_ITEM);

    return hasWorkExpClasses;
  }, []);

  // Get company logo from work experience item
  const getCompanyLogo = useCallback((element) => {
    if (!element) return null;

    // Find the closest work experience item
    const workItem =
      element.closest(SELECTORS.WORK_ITEM) ||
      element.closest(SELECTORS.WORK_ITEM_DATA) ||
      element;

    // Try to get logo from data attribute first
    const logoFromData = workItem.getAttribute('data-company-logo');
    if (logoFromData) {
      return logoFromData;
    }

    // Try to find logo in the DOM structure
    const logoElement = workItem.querySelector(SELECTORS.COMPANY_LOGO);
    if (logoElement) {
      const logoPath = logoElement.getAttribute('data-company-logo');
      return logoPath;
    }

    return null;
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Animate cursor position
      animateCursor(e.clientX, e.clientY);

      // Check if mouse is over a work experience item
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);

      if (elementUnderMouse && isWorkExperienceItem(elementUnderMouse)) {
        const logoPath = getCompanyLogo(elementUnderMouse);
        if (logoPath && logoPath !== currentLogoRef.current) {
          showCursor(logoPath);
        }
      } else {
        // Hide cursor immediately when not over a work experience item
        if (currentLogoRef.current) {
          hideCursor();
        }
      }
    },
    [
      animateCursor,
      isWorkExperienceItem,
      getCompanyLogo,
      showCursor,
      hideCursor,
    ],
  );

  // Handle scroll-aware hover (integrate with existing system)
  const handleScrollHover = useCallback(() => {
    if (!mouseRef.current.x || !mouseRef.current.y) return;

    const elementUnderMouse = document.elementFromPoint(
      mouseRef.current.x,
      mouseRef.current.y,
    );

    if (elementUnderMouse && isWorkExperienceItem(elementUnderMouse)) {
      const logoPath = getCompanyLogo(elementUnderMouse);
      if (logoPath && logoPath !== currentLogoRef.current) {
        showCursor(logoPath);
      }
    } else {
      // Only hide cursor if we're not over a work experience item
      if (currentLogoRef.current) {
        hideCursor();
      }
    }
  }, [isWorkExperienceItem, getCompanyLogo, showCursor, hideCursor]);

  // Listen for scroll-hover class changes
  const observeScrollHover = useCallback(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const target = mutation.target;

          // Check if scroll-hover was added to a work experience item
          if (
            target.classList.contains('scroll-hover') &&
            isWorkExperienceItem(target)
          ) {
            const logoPath = getCompanyLogo(target);
            if (logoPath && logoPath !== currentLogoRef.current) {
              showCursor(logoPath);
            }
          }

          // Check if scroll-hover was removed - but only hide if we're not over a work experience item
          if (!target.classList.contains('scroll-hover')) {
            // Check if mouse is still over a work experience item
            const elementUnderMouse = document.elementFromPoint(
              mouseRef.current.x,
              mouseRef.current.y,
            );

            if (
              !elementUnderMouse ||
              !isWorkExperienceItem(elementUnderMouse)
            ) {
              if (currentLogoRef.current) {
                hideCursor();
              }
            }
          }
        }
      });
    });

    // Observe the entire document for class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });

    return observer;
  }, [isWorkExperienceItem, getCompanyLogo, showCursor, hideCursor]);

  // Periodic check function
  const performPeriodicCheck = useCallback(() => {
    if (mouseRef.current.x && mouseRef.current.y) {
      const elementUnderMouse = document.elementFromPoint(
        mouseRef.current.x,
        mouseRef.current.y,
      );

      if (elementUnderMouse && isWorkExperienceItem(elementUnderMouse)) {
        const logoPath = getCompanyLogo(elementUnderMouse);
        if (logoPath && !currentLogoRef.current) {
          showCursor(logoPath);
        }
      }
    }
  }, [isWorkExperienceItem, getCompanyLogo, showCursor]);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    let observer;
    let periodicCheck;

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScrollHover, { passive: true });

    // Setup scroll hover observer
    observer = observeScrollHover();

    // Periodic check to maintain cursor when mouse is over work experience item
    periodicCheck = setInterval(
      performPeriodicCheck,
      CURSOR_CONFIG.PERIODIC_CHECK_INTERVAL,
    );

    // Initial cursor position
    gsap.set(cursorRef.current, {
      opacity: 0,
      scale: 0.8,
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScrollHover);

      if (observer) {
        observer.disconnect();
      }

      if (periodicCheck) {
        clearInterval(periodicCheck);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    handleMouseMove,
    handleScrollHover,
    observeScrollHover,
    performPeriodicCheck,
  ]);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] w-[80px] h-[80px] opacity-0"
    >
      {currentLogo && (
        <img
          src={currentLogo}
          alt="Company Logo"
          className="w-full h-full object-contain"
          style={logoStyle}
          onError={(e) => {
            // Hide cursor if logo fails to load
            e.target.style.display = 'none';
            hideCursor();
          }}
          onLoad={(e) => {
            // Ensure image is visible when loaded
            e.target.style.display = 'block';
            // Calculate and set the appropriate size based on aspect ratio
            const newStyle = calculateLogoSize(e.target);
            setLogoStyle(newStyle);
          }}
        />
      )}
    </div>
  );
};

export default CompanyLogoCursor;
