import { useEffect } from 'react';

// Must match <title> in index.html.
const BASE = 'Tanvir Ibn Mizan // Developer Portfolio';
const GAP = '   •   '; // spacer so the scroll loops cleanly
const SPEED = 200; // ms per character shift

// Shown when the user switches away from the tab.
const AWAY = ['👀 still here, waiting', '👀 you’ll return… right?'];
// Brief greeting when they come back.
const BACK = [
  'oh, you’re back ✨',
  'hey, welcome back 👋',
  'knew you’d return 🤜',
];

// Googlebot (and other renderers) execute JS and snapshot document.title,
// so nothing here touches the title until a real human input happens.
// Bots never move a pointer, press a key or scroll a wheel.
const HUMAN_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'wheel'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Animates document.title, starting only after the first user input:
 *  - marquee scroll (right -> left) while the tab is active
 *  - a playful "come back" line when the tab is hidden/blurred
 *  - a short greeting on return, then resumes the marquee
 * Honors prefers-reduced-motion (keeps a static title, still swaps on blur).
 */
export default function useDynamicTitle() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let text = BASE + GAP;
    let mode = 'marquee'; // 'marquee' | 'away' | 'greet'
    let tickTimer;
    let greetTimer;
    let started = false;

    const tick = () => {
      if (mode === 'marquee') {
        if (reduceMotion) {
          document.title = BASE;
        } else {
          text = text.slice(1) + text.slice(0, 1); // first char -> end (scrolls right -> left)
          document.title = text;
        }
      }
      tickTimer = setTimeout(tick, SPEED);
    };

    const onHide = () => {
      mode = 'away';
      clearTimeout(greetTimer);
      document.title = pick(AWAY);
    };

    const onShow = () => {
      if (mode !== 'away') return;
      mode = 'greet';
      document.title = pick(BACK);
      greetTimer = setTimeout(() => {
        text = BASE + GAP;
        mode = 'marquee';
      }, 1500);
    };

    const onVisibility = () => (document.hidden ? onHide() : onShow());

    const start = () => {
      if (started) return;
      started = true;
      HUMAN_EVENTS.forEach((e) => window.removeEventListener(e, start));
      tick();
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('blur', onHide);
      window.addEventListener('focus', onShow);
    };

    HUMAN_EVENTS.forEach((e) =>
      window.addEventListener(e, start, { passive: true }),
    );

    return () => {
      clearTimeout(tickTimer);
      clearTimeout(greetTimer);
      HUMAN_EVENTS.forEach((e) => window.removeEventListener(e, start));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onHide);
      window.removeEventListener('focus', onShow);
      document.title = BASE;
    };
  }, []);
}
