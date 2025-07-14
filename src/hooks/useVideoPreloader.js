import { useEffect, useState } from 'react';

const useVideoPreloader = (videoSources) => {
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  useEffect(() => {
    if (!videoSources || videoSources.length === 0) {
      setIsAllLoaded(true);
      return;
    }

    const videoPromises = videoSources.map((src) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;

        video.addEventListener('loadeddata', () => {
          setLoadedVideos((prev) => new Set([...prev, src]));
          resolve(src);
        });

        video.addEventListener('error', () => {
          console.warn(`Failed to preload video: ${src}`);
          // Still resolve to not block other videos
          resolve(src);
        });

        video.src = src;
      });
    });

    Promise.allSettled(videoPromises).then(() => {
      setIsAllLoaded(true);
    });

    // Update progress as videos load
    const progressInterval = setInterval(() => {
      const progress = (loadedVideos.size / videoSources.length) * 100;
      setLoadingProgress(progress);

      if (loadedVideos.size === videoSources.length) {
        clearInterval(progressInterval);
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [videoSources, loadedVideos.size]);

  return {
    isAllLoaded,
    loadingProgress,
    loadedVideos,
    isVideoLoaded: (src) => loadedVideos.has(src),
  };
};

export default useVideoPreloader;
