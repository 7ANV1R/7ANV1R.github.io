import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { blobPath, MAX_DEPTH } from './blobShape';
import styles from './BlobCursor.module.css';

// How lazily the dot trails the real cursor (seconds to catch up).
const FOLLOW_S = 0.55;
const SIZE_PX = 22;

// Where the dot steps aside: anything you click or type into (and the nav),
// plus work-experience items, where the company-logo cursor takes over.
const INTERACTIVE =
  'nav, a[href], button, [role="button"], input, textarea, select, label, summary, [contenteditable="true"]';
const WORK_ITEM = '.work-experience-item, [data-work-item]';

const isInteractive = (t) =>
  !!t.closest(INTERACTIVE) || getComputedStyle(t).cursor === 'pointer'; // clickable divs

/**
 * Cursor follower for mouse users: a small, morphing orange cookie that
 * lazily trails the (still visible) native cursor.
 */
export default function BlobCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const blob = el?.firstElementChild;
    if (!blob || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const root = document.documentElement;
    const xTo = gsap.quickTo(el, 'x', { duration: FOLLOW_S, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: FOLLOW_S, ease: 'power3' });

    // Morph the same cookie shapes as the title reveal.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const half = SIZE_PX / 2;
    let time = 0;
    const morph = (_t, deltaMs) => {
      time += Math.min(deltaMs, 50) / 1000;
      blob.style.clipPath = blobPath(half, half, half / (1 + MAX_DEPTH), time, still, 48);
    };
    morph(0, 0);
    if (!still) gsap.ticker.add(morph);

    let placed = false;
    let lastTarget = null;
    let wanted = false;
    const show = (v) => {
      el.dataset.hidden = v ? 'false' : 'true';
    };

    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      if (!placed) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        placed = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const t = e.target instanceof Element ? e.target : null;
        wanted = !!t && !isInteractive(t) && !(t.closest(WORK_ITEM) && !t.closest('[data-app-link]'));
      }
      show(wanted && !root.classList.contains('dm-playing')); // destroy mode has its own
    };
    const onOut = (e) => {
      if (!e.relatedTarget) show(false); // left the window
    };
    const onDown = () => (el.dataset.pressed = 'true');
    const onUp = () => (el.dataset.pressed = 'false');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      gsap.ticker.remove(morph);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cursor} data-hidden="true" aria-hidden="true">
      <div className={styles.blob} style={{ width: SIZE_PX, height: SIZE_PX }} />
    </div>
  );
}
