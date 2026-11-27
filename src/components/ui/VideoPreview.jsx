import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import MonoLoader from './MonoLoader';
import styles from './VideoPreview.module.css';

// Plays whenever it is on screen (desktop and mobile), pauses when scrolled away.
// The poster is a small still shown until the video plays. It also keeps
// destroy mode's page snapshot from showing empty boxes for videos that were
// never scrolled into view.
const VideoPreview = ({ videoSrc, poster, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Lazy-load on first approach, then keep tracking visibility for play/pause
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: '50px', threshold: 0.3 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const handleLoadedData = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || hasError) return;

    if (isInView) video.play().catch(() => {});
    else video.pause();
  }, [isInView, isLoaded, hasError]);

  if (hasError || !videoSrc) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-xl`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <Icon
          name="photo"
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
      style={{ aspectRatio: '4/3' }}
    >
      {/* Loading placeholder: the site loader until the poster (or video) is in */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }}
        >
          {!posterReady && <MonoLoader size={56} />}
        </div>
      )}
      {!isLoaded && poster && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setPosterReady(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
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
          poster={poster}
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
