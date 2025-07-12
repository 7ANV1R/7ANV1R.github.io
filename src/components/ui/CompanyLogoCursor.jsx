import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const CompanyLogoCursor = () => {
  const cursorRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentLogoRef = useRef(null);
  const isVisibleRef = useRef(false);
  const animationFrameRef = useRef(null);
  const [currentLogo, setCurrentLogo] = useState(null);

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
        x: x - 40, // Center the 80x80 cursor (increased from 60x60)
        y: y - 40,
        duration: 0.3,
        ease: 'power2.out',
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
      ease: 'power2.out',
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
      ease: 'power2.out',
    });
  }, []);

  // Check if element is a work experience item
  const isWorkExperienceItem = useCallback((element) => {
    if (!element) return false;

    // Must be within the work experience section
    const workSection = element.closest('[data-section="work-experience"]');
    if (!workSection) return false;

    // Must be a work experience item or within one
    const hasWorkExpClasses =
      element.classList.contains('work-experience-item') ||
      element.closest('.work-experience-item');

    return hasWorkExpClasses;
  }, []);

  // Get company logo from work experience item
  const getCompanyLogo = useCallback((element) => {
    if (!element) return null;

    // Find the closest work experience item
    const workItem =
      element.closest('.work-experience-item') ||
      element.closest('[data-work-item]') ||
      element;

    // Try to get logo from data attribute first
    const logoFromData = workItem.getAttribute('data-company-logo');
    if (logoFromData) {
      return logoFromData;
    }

    // Try to find logo in the DOM structure
    const logoElement = workItem.querySelector('[data-company-logo]');
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
    periodicCheck = setInterval(() => {
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
    }, 100); // Check every 100ms

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
    isWorkExperienceItem,
    getCompanyLogo,
    showCursor,
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
          className="w-full h-full object-contain max-w-[120px] max-h-[80px]"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '120px',
            maxHeight: '80px',
          }}
          onError={(e) => {
            // Hide cursor if logo fails to load
            e.target.style.display = 'none';
            hideCursor();
          }}
          onLoad={(e) => {
            // Ensure image is visible when loaded
            e.target.style.display = 'block';
          }}
        />
      )}
    </div>
  );
};

export default CompanyLogoCursor;
