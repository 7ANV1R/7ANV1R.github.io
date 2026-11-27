import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import SectionTitle from './SectionTitle';
import { blobPath, MAX_DEPTH } from './blobShape';
import styles from './MaskedTitle.module.css';

gsap.registerPlugin(ScrollTrigger);

const REVEAL_SCALE = 1.5; // big blob radius, in title font-sizes
const ZONE_PAD = 0.35; // keep it open this far (in radii) past the text edges
const ORIGIN = { left: 0, top: 0 };
// Touch tuning (calibration knobs, adjust on a real device).
const HOLD_MS = 200; // hold this long before dragging = read; less = scroll
const MOVE_SLOP = 8; // px of finger jitter ignored while deciding
const TAP_LINGER_S = 0.9; // how long a tap's blob stays before shrinking
const SIDE = 1 + MAX_DEPTH; // blob's outer edge (lobes included) ends left of the finger...
const SIDE_PX = 24; // ...with this much clearance for the fingertip
const SIDE_IN_S = 0.45; // grows under the finger, then glides left over this long

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
      // Font size only changes with the viewport (clamp on vw), so read it once
      // per resize instead of forcing a style recalc every frame.
      let bigRCache = 0;
      const bigR = () =>
        (bigRCache ||=
          parseFloat(getComputedStyle(base.querySelector('h2')).fontSize) * REVEAL_SCALE);
      const onResize = () => (bigRCache = 0);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Same test as the CSS `(hover: none)` block that anchors the layer.
      const touchOnly = !window.matchMedia('(hover: hover)').matches;

      // Hover zone: old + new title (the new one may be wider), plus a margin
      // so the blob stays open while you read right up to the last letter.
      const zone = (pad = 0, padRight = 0) => {
        const b = base.getBoundingClientRect();
        const c = copy.getBoundingClientRect();
        return {
          left: b.left - pad,
          top: b.top - pad,
          right: Math.max(b.right, c.right) + pad + padRight,
          bottom: Math.max(b.bottom, c.bottom) + pad,
        };
      };
      const setOpenState = (v) => {
        if (v === open) return;
        open = v;
        setOpen(id, v);
      };
      // Point the blob at (x, y); it opens only inside the zone.
      const aim = (x, y, want = true, padRight = 0) => {
        const z = zone(bigR() * ZONE_PAD, padRight);
        target.x = x;
        target.y = y;
        const dx = Math.max(z.left - x, 0, x - z.right);
        const dy = Math.max(z.top - y, 0, y - z.bottom);
        const inside = want && Math.hypot(dx, dy) === 0;
        target.r = inside ? bigR() : 0;
        setOpenState(inside);
      };
      // Finger on the title (touch only): point relative to the title so it
      // stays glued to the text while the page still moves. `open` = held open.
      let touch = null;
      const release = () => {
        cx = cy = null;
        touch = null;
        target.r = 0;
        setOpenState(false);
      };

      // No hover on touch screens: sweep the blob across once as a hint on
      // scroll-in. `sweep.u` is progress along the title, re-aimed in tick()
      // so it stays on the title even while the page keeps scrolling.
      const sweep = { on: false, u: 0, r: 0 };
      let sweepTl;
      const peek = () => {
        if (cx !== null || touch || sweep.r) return; // someone's in charge, or already showing
        sweepTl?.kill();
        sweepTl = gsap
          .timeline()
          .set(sweep, { on: true, u: 0, r: 1 })
          .to(sweep, { u: 1, duration: 2.2, ease: 'sine.inOut' })
          .set(sweep, { r: 0 })
          // Keep tracking the title while the blob shrinks away.
          .set(sweep, { on: false }, '+=0.8');
      };

      let time = 0;
      let lastCopy = '';
      let lastClip = '';
      const tick = (_time, deltaMs) => {
        if (cx !== null) aim(cx, cy); // re-aim each frame so page scroll can't detach it
        else if (touch) {
          const b = base.getBoundingClientRect();
          // Sit wholly left of the finger, so the thumb doesn't hide the text
          // (`touch.k` eases 0 -> 1: it grows under the finger, then glides
          // over). The touch area reaches the same distance past the end, so
          // the blob can get to the last letters.
          const side = bigR() * SIDE + SIDE_PX;
          aim(b.left + touch.x, b.top + touch.y, touch.open, side);
          target.x -= side * touch.k;
          if (!touch.open && drawn.r === 0) touch = null; // fully shrunk
        } else if (sweep.on) {
          const z = zone();
          target.x = z.left + (z.right - z.left) * (0.12 + 0.76 * sweep.u);
          target.y = (z.top + z.bottom) / 2;
          target.r = sweep.r ? bigR() : 0;
        }
        // Desktop: the layer is fixed at the viewport origin. Touch: CSS anchors
        // it to the title so native (compositor) scrolling carries it along with
        // the text; JS can't chase a fast fling. Draw relative to the layer.
        const o = touchOnly ? mask.getBoundingClientRect() : ORIGIN;
        // Keep the hidden copy glued over the real title.
        const b = base.getBoundingClientRect();
        const copyT = `translate(${b.left - o.left}px, ${b.top - o.top}px)`;
        if (copyT !== lastCopy) copy.style.transform = lastCopy = copyT;
        const dt = Math.min(deltaMs, 50) / 1000;
        time += dt;
        if (drawn.r < 1 || touchOnly) {
          // Invisible: jump straight to the target instead of sliding in.
          // Touch: no lazy follow; the blob stays locked to the finger, and
          // easing would trail the title during a fast scroll.
          drawn.x = target.x;
          drawn.y = target.y;
        } else {
          // Same lazy pace as the cursor dot, so the blob grows out of it.
          drawn.x += (target.x - drawn.x) * (1 - Math.exp(-dt * 6));
          drawn.y += (target.y - drawn.y) * (1 - Math.exp(-dt * 6));
        }
        drawn.r += (target.r - drawn.r) * (1 - Math.exp(-dt * 8));
        if (target.r === 0 && drawn.r < 0.5) drawn.r = 0;
        const clip = blobPath(drawn.x - o.left, drawn.y - o.top, drawn.r, time, reduced);
        if (clip !== lastClip) mask.style.clipPath = lastClip = clip; // idle: no write
      };

      // Mouse / pen anywhere on the page; touch is handled on the title only.
      const onPointerMove = (e) => {
        if (e.pointerType === 'touch') return;
        cx = e.clientX;
        cy = e.clientY;
      };

      // Touch on the title:
      //  - tap: blob grows where you tapped, lingers, shrinks
      //  - hold still, then drag: blob follows the finger (page doesn't scroll);
      //    drag off the title and it closes; lift and it closes
      //  - quick swipe: normal page scroll, blob closes
      let hideLater;
      const onTouchStart = (e) => {
        hideLater?.kill();
        sweepTl?.kill();
        sweep.on = false;
        sweep.r = 0;
        const t = e.touches[0];
        const b = base.getBoundingClientRect();
        touch = {
          x: t.clientX - b.left,
          y: t.clientY - b.top,
          open: true,
          sx: t.clientX,
          sy: t.clientY,
          t0: e.timeStamp,
          mode: null, // null (tap / still holding) | 'drag' | 'scroll'
          k: 0, // side offset progress
        };
        gsap.to(touch, { k: 1, duration: SIDE_IN_S, ease: 'power3.out' });
      };
      const onTouchMove = (e) => {
        if (!touch || touch.mode === 'scroll') return;
        const t = e.touches[0];
        if (!touch.mode) {
          if (Math.hypot(t.clientX - touch.sx, t.clientY - touch.sy) < MOVE_SLOP) return;
          if (e.timeStamp - touch.t0 < HOLD_MS) {
            touch.mode = 'scroll'; // moved straight away: a swipe, let the page scroll
            touch.open = false;
            return;
          }
          touch.mode = 'drag';
        }
        if (e.cancelable) e.preventDefault(); // reading, not scrolling
        const b = base.getBoundingClientRect();
        touch.x = t.clientX - b.left;
        touch.y = t.clientY - b.top;
      };
      const onTouchEnd = () => {
        if (!touch) return;
        if (touch.mode) touch.open = false;
        else hideLater = gsap.delayedCall(TAP_LINGER_S, () => touch && (touch.open = false));
      };
      const noMenu = (e) => e.preventDefault(); // Android long-press menu
      const onPointerOut = (e) => {
        // Pointer left the window. (A lifted finger fires this too; touch
        // closes on its own terms.)
        if (!e.relatedTarget && e.pointerType !== 'touch') release();
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
          mask.style.clipPath = lastClip = 'circle(0 at 0 0)';
        },
      });
      if (touchOnly && !reduced) {
        ScrollTrigger.create({ trigger: wrap, scroller, start: 'top 65%', onEnter: peek });
      }
      if (touchOnly) {
        wrap.addEventListener('touchstart', onTouchStart, { passive: true });
        wrap.addEventListener('touchmove', onTouchMove, { passive: false });
        wrap.addEventListener('touchend', onTouchEnd);
        wrap.addEventListener('touchcancel', onTouchEnd);
        wrap.addEventListener('contextmenu', noMenu);
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('resize', onResize);
      document.addEventListener('pointerout', onPointerOut);

      return () => {
        gsap.ticker.remove(tick);
        sweepTl?.kill();
        hideLater?.kill();
        setOpen(id, false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('pointerout', onPointerOut);
        wrap.removeEventListener('touchstart', onTouchStart);
        wrap.removeEventListener('touchmove', onTouchMove);
        wrap.removeEventListener('touchend', onTouchEnd);
        wrap.removeEventListener('touchcancel', onTouchEnd);
        wrap.removeEventListener('contextmenu', noMenu);
      };
    },
    { scope: titleRef, dependencies: [] },
  );

  return (
    <div ref={titleRef} className={`relative ${styles.title}`}>
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
