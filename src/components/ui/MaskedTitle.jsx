import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import SectionTitle from './SectionTitle';
import { blobPath } from './blobShape';
import styles from './MaskedTitle.module.css';

gsap.registerPlugin(ScrollTrigger);

const REVEAL_SCALE = 1.5; // big blob radius, in title font-sizes
const ZONE_PAD = 0.35; // keep it open this far (in radii) past the text edges

// Titles whose big blob is open. While any is, <html data-blob-open> tells the
// cursor dot to step aside. Shared so one title can't close another's.
const openTitles = new Set();
const setOpen = (id, open) => {
  if (open) openTitles.add(id);
  else openTitles.delete(id);
  document.documentElement.toggleAttribute('data-blob-open', openTitles.size > 0);
};

/**
 * A section title with a secret: over it, the cursor's trailing dot grows into
 * a morphing blob that shows a second title through it. On touch screens the
 * blob sweeps across once as a hint, and pressing the title reveals it too.
 */
const MaskedTitle = ({
  primaryText,
  secondaryText,
  revealPrimary,
  revealSecondary,
  scrollContainerRef,
}) => {
  const titleRef = useRef();
  const baseRef = useRef();
  const maskRef = useRef();

  useGSAP(
    () => {
      const wrap = titleRef.current;
      const base = baseRef.current;
      const mask = maskRef.current; // fixed, full-viewport: nothing can crop the blob
      const copy = maskRef.current?.firstElementChild;
      if (!wrap || !base || !mask || !copy) return;

      const id = {};
      const drawn = { x: 0, y: 0, r: 0 };
      const target = { x: 0, y: 0, r: 0 }; // viewport coordinates
      let cx = null; // last pointer position (client coords), null = none
      let cy = null;
      let open = false;
      const bigR = () =>
        parseFloat(getComputedStyle(base.querySelector('h2')).fontSize) * REVEAL_SCALE;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Hover zone: old + new title (the new one may be wider), plus a margin
      // so the blob stays open while you read right up to the last letter.
      const zone = (pad = 0) => {
        const b = base.getBoundingClientRect();
        const c = copy.getBoundingClientRect();
        return {
          left: b.left - pad,
          top: b.top - pad,
          right: Math.max(b.right, c.right) + pad,
          bottom: Math.max(b.bottom, c.bottom) + pad,
        };
      };
      const setOpenState = (v) => {
        if (v === open) return;
        open = v;
        setOpen(id, v);
      };
      const aim = () => {
        const z = zone(bigR() * ZONE_PAD);
        target.x = cx;
        target.y = cy;
        const dx = Math.max(z.left - cx, 0, cx - z.right);
        const dy = Math.max(z.top - cy, 0, cy - z.bottom);
        const inside = Math.hypot(dx, dy) === 0;
        target.r = inside ? bigR() : 0;
        setOpenState(inside);
      };
      const release = () => {
        cx = cy = null;
        target.r = 0;
        setOpenState(false);
      };

      // No hover on touch screens: sweep the blob across once as a hint.
      // `sweep.u` is progress along the title, re-aimed in tick() so it stays
      // on the title even while the page keeps scrolling.
      const sweep = { on: false, u: 0 };
      const peek = () => {
        if (cx !== null) return;
        gsap
          .timeline()
          .set(sweep, { on: true, u: 0 })
          .to(sweep, { u: 1, duration: 2.2, ease: 'sine.inOut' })
          .set(sweep, { on: false })
          .set(target, { r: 0 });
      };

      let time = 0;
      const tick = (_time, deltaMs) => {
        if (cx !== null) aim(); // re-aim each frame so page scroll can't detach it
        else if (sweep.on) {
          const z = zone();
          target.x = z.left + (z.right - z.left) * (0.12 + 0.76 * sweep.u);
          target.y = (z.top + z.bottom) / 2;
          target.r = bigR();
        }
        // Keep the hidden copy glued over the real title (viewport coords).
        const b = base.getBoundingClientRect();
        copy.style.transform = `translate(${b.left}px, ${b.top}px)`;
        const dt = Math.min(deltaMs, 50) / 1000;
        time += dt;
        if (drawn.r < 1) {
          // Invisible: jump straight to the target instead of sliding in.
          drawn.x = target.x;
          drawn.y = target.y;
        }
        // Same lazy pace as the cursor dot, so the blob grows out of it.
        drawn.x += (target.x - drawn.x) * (1 - Math.exp(-dt * 6));
        drawn.y += (target.y - drawn.y) * (1 - Math.exp(-dt * 6));
        drawn.r += (target.r - drawn.r) * (1 - Math.exp(-dt * 8));
        if (target.r === 0 && drawn.r < 0.5) drawn.r = 0;
        mask.style.clipPath = blobPath(drawn.x, drawn.y, drawn.r, time, reduced);
      };

      // Mouse / pen anywhere on the page; touch is handled on the title only.
      const onPointerMove = (e) => {
        if (e.pointerType === 'touch') return;
        cx = e.clientX;
        cy = e.clientY;
      };
      const onPointerOut = (e) => {
        if (!e.relatedTarget) release(); // pointer left the window
      };
      const onTouch = (e) => {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
      };

      const scroller = scrollContainerRef?.current || undefined;
      ScrollTrigger.create({
        trigger: wrap,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        // Callbacks must not return a function: inside a gsap.context, a returned
        // function becomes a revert cleanup (and ticker.add returns `tick`).
        onToggle: (self) => {
          if (self.isActive) {
            gsap.ticker.add(tick);
            return;
          }
          // Off screen: stop, and don't leave a blob stuck on the viewport.
          gsap.ticker.remove(tick);
          release();
          drawn.r = 0;
          mask.style.clipPath = 'circle(0 at 0 0)';
        },
      });
      if (!window.matchMedia('(hover: hover)').matches && !reduced) {
        ScrollTrigger.create({ trigger: wrap, scroller, start: 'top 65%', onEnter: peek });
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerout', onPointerOut);
      wrap.addEventListener('touchstart', onTouch, { passive: true });
      wrap.addEventListener('touchmove', onTouch, { passive: true });
      wrap.addEventListener('touchend', release);
      wrap.addEventListener('touchcancel', release);

      return () => {
        gsap.ticker.remove(tick);
        gsap.killTweensOf([target, sweep]);
        setOpen(id, false);
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerout', onPointerOut);
        wrap.removeEventListener('touchstart', onTouch);
        wrap.removeEventListener('touchmove', onTouch);
        wrap.removeEventListener('touchend', release);
        wrap.removeEventListener('touchcancel', release);
      };
    },
    { scope: titleRef, dependencies: [] },
  );

  return (
    <div ref={titleRef} className="relative">
      <div ref={baseRef} className="inline-block">
        <SectionTitle primaryText={primaryText} secondaryText={secondaryText} />
      </div>
      {/* Same title, rewritten, seen only through the cursor's blob. */}
      <div ref={maskRef} className={styles.reveal} aria-hidden="true">
        <div className={styles.revealCopy}>
          <SectionTitle primaryText={revealPrimary} secondaryText={revealSecondary} />
        </div>
      </div>
    </div>
  );
};

export default MaskedTitle;
