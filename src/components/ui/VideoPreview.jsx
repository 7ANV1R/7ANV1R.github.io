import { useState, useRef, useEffect } from 'react';
import { HiOutlinePhotograph } from 'react-icons/hi';
import styles from './VideoPreview.module.css';

const VideoPreview = ({ videoSrc, className, onHover = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrollHovered, setIsScrollHovered] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer for lazy loading and mobile viewport tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            setShouldLoad(true);
            // Don't unobserve if mobile - we need to track viewport for play/pause
            if (!isMobile) {
              observer.unobserve(container);
            }
          }
        });
      },
      { rootMargin: '50px', threshold: 0.3 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isMobile]);

  // Scroll-hover detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScrollHover = () => {
      const hasScrollHover = container.classList.contains('scroll-hover');
      setIsScrollHovered(hasScrollHover);
    };

    // Use MutationObserver to watch for scroll-hover class changes
    const observer = new MutationObserver(handleScrollHover);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Initial check
    handleScrollHover();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      // On mobile, start playing immediately
      if (isMobile) {
        video.play().catch(console.error);
      }
    };

    const handleError = () => {
      setHasError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [isMobile, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || hasError) return;

    if (isMobile) {
      // On mobile, only play when in viewport
      if (isInView) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    } else {
      // On desktop, play on hover OR scroll-hover
      if ((isHovered || isScrollHovered) && onHover) {
        video.play().catch(console.error);
      } else if (!isHovered && !isScrollHovered) {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [isHovered, isScrollHovered, isInView, isLoaded, hasError, isMobile, onHover]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (hasError || !videoSrc) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-xl`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <HiOutlinePhotograph
          className="w-12 h-12 opacity-30"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className} ${styles.videoContainer} group cursor-pointer relative rounded-xl overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Loading placeholder */}
      {(!isLoaded || !shouldLoad) && (
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-xl ${styles.loadingPulse}`}
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <HiOutlinePhotograph
            className="w-12 h-12 opacity-30"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      )}

      {/* Video element - only render when shouldLoad is true */}
      {shouldLoad && (
        <video
          ref={videoRef}
          className={`${
            styles.video
          } w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: 'var(--bg-secondary)' }}
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPreview;
