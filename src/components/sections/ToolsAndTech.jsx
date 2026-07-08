import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import SectionTitle from '../ui/SectionTitle';
import toolsData from '../../data/tools_and_tech.json';

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

const ToolsAndTech = ({ scrollContainerRef }) => {
  const sectionRef = useRef();
  const containerRef = useRef();
  const toolsRef = useRef();

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

  // How many full loops complete as the slider travels through the viewport.
  const LOOPS_ON_VIEW = 1.5;

  useGSAP(
    () => {
      const container = containerRef.current;
      const tools = toolsRef.current;
      if (!container || !tools) return;

      const cards = gsap.utils.toArray('.tool-card', tools);
      if (cards.length < 2) return;

      // Hint draggability for mouse/trackpad users (fine pointer), not touch.
      if (window.matchMedia('(pointer: fine)').matches) {
        container.style.cursor = 'grab';
      }

      // Seamless infinite loop timeline. Paused — we set its progress by hand.
      const loop = horizontalLoop(cards, { paused: true, repeat: -1 });

      // Single shared position, in loop-cycles. VERTICAL scroll and MANUAL
      // horizontal scroll are ADDITIVE offsets on the same value, so they never
      // fight: vertical scroll sets `scrollCycles` (auto), horizontal gesture
      // accumulates `manualCycles`, and the loop shows the wrapped sum. A flick
      // just shifts the baseline — the next vertical scroll continues smoothly.
      const wrap = gsap.utils.wrap(0, 1);
      const pxToCycles = (px) => px / loop.totalWidthPx;
      let scrollCycles = 0;
      const manual = { cycles: 0 };

      // While the track is moving, disable hover so a card sliding under a
      // stationary cursor doesn't flicker its group-hover scale/translate.
      // Re-enable shortly after motion stops so hover still works when idle.
      let idleTimer;
      const render = () => {
        loop.progress(wrap(scrollCycles + manual.cycles));
        tools.style.pointerEvents = 'none';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          tools.style.pointerEvents = '';
        }, 120);
      };

      // --- Auto driver: vertical scroll, full enter->exit = LOOPS_ON_VIEW ---
      ScrollTrigger.create({
        trigger: container,
        scroller: scrollContainerRef?.current || undefined,
        start: 'top bottom', // slider entering from viewport bottom
        end: 'bottom top', // slider fully exited past viewport top
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollCycles = self.progress * LOOPS_ON_VIEW;
          render();
        },
      });

      // --- Manual driver: HORIZONTAL scroll slides the loop, no visible UI ---
      // Positive horizontal delta (scroll/swipe left-to-next) advances the loop.
      const slideBy = (px) => {
        manual.cycles += pxToCycles(px);
        render();
      };
      const stopFling = () => gsap.killTweensOf(manual);

      // Trackpad horizontal / shift+wheel on desktop. Vertical wheel is left
      // untouched so it scrolls the page and drives the auto loop above.
      const onWheel = (e) => {
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return; // vertical intent -> page scroll
        e.preventDefault();
        stopFling();
        slideBy(dx);
      };

      // Touch: lock axis on first move. Horizontal swipe slides (with a momentum
      // fling on release); vertical swipe is ignored so the page scrolls.
      let axis = null;
      let lastX = 0;
      let lastVel = 0; // px/ms
      let lastT = 0;
      const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
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
        const move = t.clientX - lastX; // finger right = +, content should go +
        const dt = now() - lastT || 16;
        lastVel = -move / dt; // cycles handled below; store px/ms of loop motion
        slideBy(-move); // swipe left (move<0) advances the loop
        lastX = t.clientX;
        lastT = now();
      };
      const onTouchEnd = () => {
        if (axis === 'x' && Math.abs(lastVel) > 0.02) {
          // Fling: throw `manual.cycles` with the release velocity.
          gsap.to(manual, {
            inertia: {
              cycles: { velocity: pxToCycles(lastVel * 1000) }, // px/ms -> cycles/s
            },
            onUpdate: render,
          });
        }
        axis = null;
      };

      // Mouse click-and-drag: a plain mouse has no horizontal scroll, so let
      // mouse users grab the track and drag left/right. Touch (mobile) and
      // trackpad horizontal-wheel paths are untouched — only pointerType
      // 'mouse' enters here.
      let dragging = false;
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
        container.style.cursor = 'grabbing';
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const move = e.clientX - dragLastX; // cursor right = +
        const dt = now() - dragT || 16;
        dragVel = -move / dt;
        slideBy(-move); // drag left advances the loop (matches touch swipe)
        dragLastX = e.clientX;
        dragT = now();
      };
      const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        container.releasePointerCapture?.(e.pointerId);
        container.style.cursor = 'grab';
        if (Math.abs(dragVel) > 0.02) {
          // Momentum fling on release, same as touch.
          gsap.to(manual, {
            inertia: {
              cycles: { velocity: pxToCycles(dragVel * 1000) },
            },
            onUpdate: render,
          });
        }
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

  const ToolCard = ({ tool }) => {
    const LogoComponent = logoMap[tool.name];

    return (
      <div className="tool-card flex-shrink-0 group relative">
        <div
          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-2 sm:mx-3 rounded-2xl sm:rounded-3xl lg:rounded-[28px] transition-all duration-700 flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-5 overflow-hidden group-hover:scale-[1.02] group-hover:-translate-y-1 cursor-pointer"
          style={{
            backgroundColor: 'var(--neuro-card-bg)',
            boxShadow: `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
              inset 4px 4px 12px var(--neuro-card-shadow-inset-dark),
              inset -4px -4px 12px var(--neuro-card-shadow-inset-light),
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
          // Touch events for mobile
          onTouchStart={(e) => {
            e.currentTarget.style.boxShadow = `
              inset 4px 4px 12px var(--neuro-card-shadow-inset-dark),
              inset -4px -4px 12px var(--neuro-card-shadow-inset-light),
              6px 6px 12px var(--neuro-shadow-dark),
              -6px -6px 12px var(--neuro-shadow-light)
            `;
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.boxShadow = `
              8px 8px 16px var(--neuro-shadow-dark),
              -8px -8px 16px var(--neuro-shadow-light)
            `;
          }}
        >
          {/* Subtle inner highlight */}
          <div
            className="absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)] sm:rounded-[calc(theme(borderRadius.3xl)-1px)] lg:rounded-[27px] opacity-25"
            style={{
              background: `linear-gradient(135deg, var(--neuro-shadow-light) 0%, transparent 50%, var(--neuro-shadow-dark) 100%)`,
            }}
          />

          {/* Top reflection highlight */}
          <div
            className="absolute top-[1px] left-[1px] right-[1px] h-6 sm:h-8 lg:h-12 rounded-t-[calc(theme(borderRadius.2xl)-1px)] sm:rounded-t-[calc(theme(borderRadius.3xl)-1px)] lg:rounded-t-[27px] opacity-30 z-5"
            style={{
              background: `linear-gradient(180deg, var(--neuro-shadow-light) 0%, transparent 100%)`,
            }}
          />

          {/* Logo */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center relative z-10">
            {LogoComponent ? (
              <img
                src={LogoComponent}
                alt={`${tool.name} logo`}
                className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner"
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: `
                    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <span className="text-white font-bold text-lg sm:text-2xl lg:text-3xl drop-shadow-lg">
                  {tool.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Tool name */}
          <h3
            className="text-sm sm:text-base lg:text-lg font-semibold text-center relative z-10 px-2 sm:px-3 leading-tight"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            {tool.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />

      <div ref={sectionRef} className="relative px-2 sm:px-4">
        <SectionTitle primaryText="TOOLS" secondaryText="& TECH" />

        {/* Responsive neumorphic horizontal scroll container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden mt-8 sm:mt-12 rounded-3xl sm:rounded-[40px] h-[280px] sm:h-[360px] lg:h-[520px]"
          style={{
            width: '100%',
            // Browser owns vertical panning (page scroll -> auto loop); the
            // horizontal axis is left for our wheel/touch handlers to slide.
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
              <ToolCard key={index} tool={tool} />
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:hidden">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
