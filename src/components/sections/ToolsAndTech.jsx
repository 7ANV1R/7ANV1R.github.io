import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import MaskedTitle from '../ui/MaskedTitle';
import toolsData from '../../data/tools_and_tech.json';
import styles from './ToolsAndTech.module.css';

// Import logo assets
import FlutterLogo from '../../assets/skills/flutter.svg';
import ReactLogo from '../../assets/skills/react.svg';
import NodeJsLogo from '../../assets/skills/node_js.svg';
import FirebaseLogo from '../../assets/skills/firebase.svg';
import SupabaseLogo from '../../assets/skills/supabase.svg';
import FigmaLogo from '../../assets/skills/figma.svg';
import RiveLogo from '../../assets/skills/rive.svg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, InertiaPlugin);

// Track motion tuning knobs.
const DRIFT_PX_S = 28; // idle auto-scroll speed
const SCROLL_GAIN = 9; // page-scroll px -> extra track px/s
const BOOST_MAX = 1400; // cap on that extra speed
const BOOST_DECAY = 2.5; // how fast the extra speed eases back to the drift (1/s)
const TYPE_CPS = 20; // prompt typing speed (chars/s) at idle drift; scales up with track speed
const TYPE_GAP_PX = 6; // caret must stay this far behind the AI beam


/** Corner cobweb in a 64x64 box anchored at (0,0): spokes + sagging rings. */
const WEB_PATH = (() => {
  const R = 62;
  const spokes = [0, 1, 2, 3, 4].map((i) => (i / 4) * (Math.PI / 2));
  const pt = (r, a) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  let d = spokes.map((a) => `M0 0L${pt(R, a)}`).join('');
  for (let k = 1; k <= 4; k++) {
    const r = (R * k) / 4.4;
    d += `M${pt(r, spokes[0])}`;
    for (let i = 1; i < spokes.length; i++) {
      // Threads between spokes sag toward the corner, like a real web.
      d += `Q${pt(r * 0.8, (spokes[i - 1] + spokes[i]) / 2)} ${pt(r, spokes[i])}`;
    }
  }
  return d;
})();

const Web = ({ className }) => (
  <svg viewBox="0 0 64 64" className={`${styles.web} ${className}`} aria-hidden="true">
    <path d={WEB_PATH} />
  </svg>
);

const Spider = ({ className = '' }) => (
  <div className={`${styles.hang} ${className}`} aria-hidden="true">
    <div className={styles.thread} />
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="7" cy="4.2" r="1.7" />
      <ellipse cx="7" cy="8.6" rx="2.7" ry="3.3" />
      <path
        d="M5 6.5L1.5 3.5M5 8L1 7.5M5 9.5L1.5 12M5.4 11L3 13.5M9 6.5L12.5 3.5M9 8L13 7.5M9 9.5L12.5 12M8.6 11L11 13.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </div>
);

/**
 * Official GSAP `horizontalLoop` helper (trimmed). Builds a SEAMLESS, infinitely
 * repeating timeline from a row of elements: as each item scrolls off one edge
 * it wraps to the other, so `tl.progress(p)` for p in [0,1] is one full cycle
 * with no visible seam. We drive `progress` ourselves from scroll + drag instead
 * of letting it autoplay.
 * https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop
 */
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
  });
  const length = items.length;
  const startX = items[0].offsetLeft;
  const widths = [];
  const xPercents = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap =
    config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);

  gsap.set(items, {
    xPercent: (i, el) => {
      const w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px')));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px')) / w) * 100 +
          gsap.getProperty(el, 'xPercent'),
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });

  const totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      gsap.getProperty(items[length - 1], 'scaleX') +
    (parseFloat(config.paddingRight) || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    ).fromTo(
      item,
      {
        xPercent: snap(
          ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
        ),
      },
      {
        xPercent: xPercents[i],
        duration:
          (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond,
    );
  }
  // Expose the loop's full pixel travel so callers can map px drag -> progress.
  tl.totalWidthPx = totalWidth;
  return tl;
}

// Map logo imports to tool names
const logoMap = {
  React: ReactLogo,
  'Node.js': NodeJsLogo,
  Flutter: FlutterLogo,
  Firebase: FirebaseLogo,
  Supabase: SupabaseLogo,
  Figma: FigmaLogo,
  Rive: RiveLogo,
};

const ToolCard = ({ tool, index }) => {
  const logo = logoMap[tool.name];

  return (
    <div className="tool-card flex-shrink-0 group relative">
      <div
        data-face
        className={`${styles.face} w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-2 sm:mx-3 rounded-2xl sm:rounded-3xl lg:rounded-[28px] group-hover:scale-[1.02] group-hover:-translate-y-1`}
      >
        {/* BEFORE the beam: the tool in full colour. */}
        <div className={`${styles.then} gap-2 sm:gap-3 lg:gap-5`}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
            {logo && (
              <img
                src={logo}
                alt={`${tool.name} logo`}
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))' }}
                draggable="false"
              />
            )}
          </div>
          <h3
            className="text-sm sm:text-base lg:text-lg font-semibold text-center px-2 sm:px-3 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {tool.name}
          </h3>
        </div>

        {/* AFTER the beam: abandoned, black & white, replaced by a prompt. */}
        <div className={`${styles.now} gap-1 sm:gap-1.5 lg:gap-2 px-3`} aria-hidden="true">
          {logo && <img src={logo} alt="" className={styles.ghost} draggable="false" />}
          <Web className={styles.webTL} />
          <Web className={index % 2 ? styles.webTR : styles.webBR} />
          {index % 2 === 0 && <Spider />}
          <p
            className={`${styles.mono} relative text-[10px] sm:text-xs lg:text-[15px] font-semibold text-center leading-snug`}
            style={{ color: 'var(--text-primary)' }}
          >
            {/* Invisible full prompt reserves the space, so typing never
                makes the card's content jump. */}
            <span className="invisible">
              “{tool.prompt}”<span className={styles.caret} />
            </span>
            <span className="absolute inset-0">
              <span data-typed={`“${tool.prompt}”`}>“{tool.prompt}”</span>
              <span className={styles.caret} />
            </span>
          </p>
          <p
            className={`${styles.mono} ${styles.was} relative text-[9px] sm:text-[10px] lg:text-xs`}
            style={{ color: 'var(--text-secondary)' }}
          >
            {tool.name}
          </p>
        </div>
      </div>
    </div>
  );
};

const ToolsAndTech = ({ scrollContainerRef }) => {
  const sectionRef = useRef();
  const containerRef = useRef();
  const toolsRef = useRef();

  useGSAP(
    () => {
      const container = containerRef.current;
      const tools = toolsRef.current;
      if (!container || !tools) return;
      const scroller = scrollContainerRef?.current || undefined;

      const cards = gsap.utils.toArray('.tool-card', tools);
      if (cards.length < 2) return;

      // Seamless infinite loop timeline. Paused — we set its progress by hand.
      const loop = horizontalLoop(cards, { paused: true, repeat: -1 });
      const wrap = gsap.utils.wrap(0, 1);
      const pxToCycles = (px) => px / loop.totalWidthPx;

      // One position (in loop cycles) that everything nudges: a constant
      // drift, a decaying boost from page scroll, and direct drag/swipe/wheel.
      // The drift always runs right to left (before -> after); scroll and drag
      // can push either way, then it settles back.
      const manual = { cycles: 0 };
      let boost = 0; // extra px/s from page scroll, eases back to 0
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const drift = reduced ? 0 : DRIFT_PX_S;

      // Typing: each card's prompt types only behind the beam. A character is
      // added only if the caret would still sit left of the beam, so typing
      // starts when the beam passes the (centred) caret and never runs ahead
      // of it. Lines below the first re-centre, so they type at a steady rate,
      // faster while the track moves fast. Clears once the card is fully back
      // on the "before" side.
      const typers = cards.map((c) => {
        const el = c.querySelector('[data-typed]');
        // From the attribute, not the DOM text: effects can run twice (StrictMode,
        // HMR) and the first run has already emptied the text.
        const full = el.dataset.typed;
        if (!reduced) el.textContent = '';
        return {
          el,
          caret: el.nextElementSibling,
          face: c.querySelector('[data-face]'),
          full,
          n: reduced ? full.length : 0,
          budget: 0,
          cut: 0,
        };
      });
      const typeStep = (dt, speedFactor) => {
        if (reduced) return;
        for (const t of typers) {
          if (t.cut <= 0 || t.n >= t.full.length) continue;
          t.budget = Math.min(t.budget + TYPE_CPS * speedFactor * dt, 2); // no bursts
          const fr = t.face.getBoundingClientRect();
          const limit = t.cut >= 1 ? Infinity : fr.left + fr.width * t.cut - TYPE_GAP_PX;
          while (t.budget >= 1 && t.n < t.full.length) {
            t.el.textContent = t.full.slice(0, t.n + 1);
            if (t.caret.getBoundingClientRect().right > limit) {
              t.el.textContent = t.full.slice(0, t.n); // would pass the beam: wait
              break;
            }
            t.n++;
            t.budget--;
          }
        }
      };

      // The beam sits at the track's centre: whatever part of a card has slid
      // past it (to the left) shows its "after" face, the rest its "before".
      const faces = cards.map((c) => c.querySelector('[data-face]'));
      const updateCuts = () => {
        const cr = container.getBoundingClientRect();
        if (!cr.width) return; // the other layout's (display:none) instance
        const beamX = cr.left + cr.width / 2;
        faces.forEach((f, i) => {
          const r = f.getBoundingClientRect();
          const cut = gsap.utils.clamp(0, 1, (beamX - r.left) / r.width);
          f.style.setProperty('--cut', cut.toFixed(3));
          const t = typers[i];
          t.cut = cut;
          if (cut === 0 && t.n && !reduced) {
            t.n = 0;
            t.budget = 0;
            t.el.textContent = '';
          }
        });
      };
      const render = () => {
        loop.progress(wrap(manual.cycles));
        updateCuts();
      };

      // During fast motion, disable hover so a card sliding under a still
      // cursor doesn't flicker its group-hover lift. The slow drift keeps hover.
      let idleTimer;
      const quietHover = () => {
        tools.style.pointerEvents = 'none';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          tools.style.pointerEvents = '';
        }, 150);
      };

      let dragging = false;
      let axis = null;
      let lastCycles = 0;
      const tick = (_time, deltaMs) => {
        if (!container.offsetWidth) return;
        const dt = Math.min(deltaMs, 50) / 1000;
        // Track speed since last frame (drift, scroll, drag, fling all count).
        const speed = (Math.abs(manual.cycles - lastCycles) * loop.totalWidthPx) / dt;
        lastCycles = manual.cycles;
        typeStep(dt, Math.max(1, speed / DRIFT_PX_S));
        boost *= Math.exp(-BOOST_DECAY * dt);
        if (dragging || axis === 'x') return; // the finger/mouse is in charge
        manual.cycles += pxToCycles((drift + boost) * dt);
        render();
      };

      // Only animate while the track is on screen.
      let lastScroll = null;
      ScrollTrigger.create({
        trigger: container,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        // Block body on purpose: a returned function would become a gsap.context
        // revert cleanup (ticker.add returns `tick`).
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        },
        onUpdate: (self) => {
          const s = self.scroll();
          const delta = lastScroll === null ? 0 : s - lastScroll;
          lastScroll = s;
          if (!delta || Math.abs(delta) > 400) return; // ignore jumps (nav clicks)
          boost = gsap.utils.clamp(-BOOST_MAX, BOOST_MAX, boost + delta * SCROLL_GAIN);
          quietHover();
        },
        onRefresh: updateCuts,
      });
      render();

      // --- Manual driver: horizontal wheel, swipe and mouse drag ---
      const slideBy = (px) => {
        manual.cycles += pxToCycles(px);
        quietHover();
        render();
      };
      const stopFling = () => gsap.killTweensOf(manual);
      const fling = (pxPerMs) =>
        gsap.to(manual, {
          inertia: { cycles: { velocity: pxToCycles(pxPerMs * 1000) } }, // px/ms -> cycles/s
          onUpdate: render,
        });

      // Trackpad horizontal / shift+wheel on desktop. Vertical wheel is left
      // untouched so it scrolls the page (and boosts the drift above).
      const onWheel = (e) => {
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return; // vertical intent -> page scroll
        e.preventDefault();
        stopFling();
        slideBy(dx);
      };

      // Touch: lock axis on first move. Horizontal swipe slides (with a momentum
      // fling on release); vertical swipe is ignored so the page scrolls.
      let lastX = 0;
      let lastVel = 0; // px/ms
      let lastT = 0;
      const now = () => performance.now();
      const onTouchStart = (e) => {
        stopFling();
        const t = e.touches[0];
        axis = null;
        lastX = t.clientX;
        lastVel = 0;
        lastT = now();
        onTouchStart.startX = t.clientX;
        onTouchStart.startY = t.clientY;
      };
      const onTouchMove = (e) => {
        const t = e.touches[0];
        if (!axis) {
          const dx = Math.abs(t.clientX - onTouchStart.startX);
          const dy = Math.abs(t.clientY - onTouchStart.startY);
          if (dx < 6 && dy < 6) return;
          axis = dx > dy ? 'x' : 'y';
        }
        if (axis !== 'x') return; // vertical -> let the page scroll
        e.preventDefault();
        const move = t.clientX - lastX;
        lastVel = -move / (now() - lastT || 16);
        slideBy(-move); // swipe left (move<0) advances the loop
        lastX = t.clientX;
        lastT = now();
      };
      const onTouchEnd = () => {
        if (axis === 'x' && Math.abs(lastVel) > 0.02) fling(lastVel);
        axis = null;
      };

      // Mouse click-and-drag (a plain mouse has no horizontal scroll).
      let dragLastX = 0;
      let dragVel = 0; // px/ms
      let dragT = 0;
      const onPointerDown = (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        e.preventDefault(); // no text/image selection while dragging
        dragging = true;
        stopFling();
        dragLastX = e.clientX;
        dragVel = 0;
        dragT = now();
        container.setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const move = e.clientX - dragLastX;
        dragVel = -move / (now() - dragT || 16);
        slideBy(-move); // drag left advances the loop (matches touch swipe)
        dragLastX = e.clientX;
        dragT = now();
      };
      const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        container.releasePointerCapture?.(e.pointerId);
        if (Math.abs(dragVel) > 0.02) fling(dragVel);
      };

      container.addEventListener('wheel', onWheel, { passive: false });
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: false });
      container.addEventListener('touchend', onTouchEnd, { passive: true });
      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', endDrag);
      container.addEventListener('pointercancel', endDrag);

      return () => {
        gsap.ticker.remove(tick);
        clearTimeout(idleTimer);
        stopFling();
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', onTouchEnd);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', endDrag);
        container.removeEventListener('pointercancel', endDrag);
      };
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <>
      <div style={{ height: 80 }} />

      <div ref={sectionRef} className="relative px-2 sm:px-4">
        <MaskedTitle
          primaryText="TOOLS"
          secondaryText="& TECH"
          revealPrimary="AI AGENTS"
          revealSecondary="& PROMPTS"
          scrollContainerRef={scrollContainerRef}
        />

        {/* Neumorphic track. Tools drift in from the right in full colour,
            cross the AI beam, and leave on the left as a cobwebbed prompt. */}
        <div
          ref={containerRef}
          className="relative overflow-hidden mt-8 sm:mt-12 rounded-3xl sm:rounded-[40px] h-[280px] sm:h-[360px] lg:h-[520px]"
          style={{
            width: '100%',
            // Browser owns vertical panning (page scroll); the horizontal axis
            // is left for our wheel/touch handlers to slide.
            touchAction: 'pan-y',
            backgroundColor: 'var(--neuro-bg)',
            boxShadow: `
              inset 6px 6px 12px var(--neuro-shadow-dark),
              inset -6px -6px 12px var(--neuro-shadow-light)
            `,
          }}
        >
          {/* Subtle inner highlight border */}
          <div
            className="absolute inset-[2px] rounded-[calc(theme(borderRadius.3xl)-2px)] sm:rounded-[38px] opacity-20 z-5 pointer-events-none"
            style={{
              background: `linear-gradient(135deg,
                var(--neuro-shadow-light) 0%,
                transparent 30%,
                transparent 70%,
                var(--neuro-shadow-dark) 100%)`,
              border: '1px solid',
              borderImage: `linear-gradient(135deg,
                var(--neuro-shadow-light),
                transparent,
                var(--neuro-shadow-dark)) 1`,
            }}
          />

          {/* Subtle inner glow for depth */}
          <div
            className="absolute inset-0 rounded-3xl sm:rounded-[40px] z-10 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Tools track. horizontalLoop() wraps each card seamlessly, so a
              single set is enough — no manual duplication. */}
          <div
            ref={toolsRef}
            className="flex items-center h-full relative z-0 select-none"
            style={{ width: 'max-content' }}
          >
            {toolsData.map((tool, index) => (
              <ToolCard key={tool.name} tool={tool} index={index} />
            ))}
          </div>

          {/* The AI beam + before/after labels */}
          <div className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
            <div className={styles.beamGlow} />
            <div className={styles.beam} />
            <div className={styles.beamChip}>✦ AI</div>
            <span className={styles.edgeLabel} style={{ left: '6%' }}>← now</span>
            <span className={styles.edgeLabel} style={{ right: '6%' }}>before →</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
