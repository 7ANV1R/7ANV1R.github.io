import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling via Lenis, driven by the GSAP ticker so it stays in sync
 * with existing ScrollTrigger animations (WorkExperience, ToolsAndTech).
 *
 * Two scroll contexts exist in this app and only one is ever active per
 * viewport, so callers gate with `enabled` to avoid two Lenis instances
 * fighting over the same wheel/touch events:
 *   - Mobile: the page (window) scrolls        -> call with no refs
 *   - Desktop: an inner container scrolls       -> pass wrapperRef + contentRef
 *
 * @returns a ref holding the live Lenis instance (for `scrollTo`), or null.
 */
export default function useLenis({
  wrapperRef,
  contentRef,
  enabled = true,
} = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Wrapper (container) mode needs both elements mounted before we start.
    const usesWrapper = Boolean(wrapperRef);
    if (usesWrapper && (!wrapperRef.current || !contentRef?.current)) return;

    const lenis = new Lenis({
      wrapper: wrapperRef?.current ?? window,
      content: contentRef?.current ?? document.documentElement,
      lerp: 0.1,
      smoothWheel: true, // smooth mouse-wheel scrolling
      syncTouch: true, // smooth touch scrolling too (every device)
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger's scroll position in step with Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => lenis.raf(time * 1000); // gsap time is seconds
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Recalculate trigger positions now that Lenis owns the scroller.
    ScrollTrigger.refresh();

    // Content shifts as web fonts and images finish loading. In dev,
    // StrictMode's double render re-measures late enough to mask this; the
    // production build renders once (early), so trigger start/end positions go
    // stale and scrub animations never fire. Re-measure once those settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off('scroll', ScrollTrigger.update);
      window.removeEventListener('load', refresh);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled, wrapperRef, contentRef]);

  return lenisRef;
}
