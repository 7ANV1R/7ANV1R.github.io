import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { track } from '../../analytics';
import fx from './DestroyModeToggle.module.css';

// Game code (and its page-capture lib) is only downloaded on first tap.
let gameRequested = false;
const loadGame = () => {
  gameRequested = true;
  return import('../../game/destroyMode.js');
};

// Every page load: the icon glitches once, hinting at the chaos behind it.
const TEASE_MS = 3900; // .tease delay + run in the CSS, plus a little
// Strips of the button that tear sideways: [top, bottom] insets, shove, stagger.
const BANDS = [
  ['10%', '74%', '4px', '0ms'],
  ['36%', '52%', '-6px', '40ms'],
  ['55%', '30%', '5px', '90ms'],
  ['82%', '12%', '-3px', '130ms'],
].map(([t, b, dx, o]) => ({ clipPath: `inset(${t} 0 ${b} 0)`, '--dx': dx, '--o': o }));
// Dead pixels around the edges: left, top, width, height, colour, shove, stagger.
const BLOCKS = [
  ['-6px', '8px', '6px', '3px', '#00d8ff', '-4px', '0ms'],
  ['40px', '6px', '8px', '2px', '#ff2bd6', '5px', '60ms'],
  ['44px', '30px', '5px', '5px', '#ffd400', '3px', '20ms'],
  ['-4px', '32px', '9px', '2px', '#ff2bd6', '-6px', '100ms'],
  ['18px', '-4px', '10px', '2px', '#00d8ff', '4px', '40ms'],
  ['26px', '44px', '7px', '3px', '#fff', '-3px', '80ms'],
].map(([left, top, width, height, background, bx, o]) => ({ left, top, width, height, background, '--bx': bx, '--o': o }));

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Module-level, so a layout swap at the breakpoint (which remounts the nav) doesn't replay it.
let teased = false;
const shouldTease = () => !teased && !reducedMotion();

const DestroyModeToggle = () => {
  const [state, setState] = useState('off'); // off | loading | on
  // How the button was pressed (touch / pen / mouse); none means Enter/Space.
  // The game opens with the controls that match.
  const pointer = useRef(null);
  const [tease, setTease] = useState(shouldTease);

  useEffect(() => {
    if (!tease) return;
    teased = true;
    const t = setTimeout(() => setTease(false), TEASE_MS);
    return () => clearTimeout(t);
  }, [tease]);

  // Layouts swap at the 1024px breakpoint; don't leave a game running unowned.
  // Never opened: nothing to stop, and no reason to download the game chunk.
  useEffect(() => () => void (gameRequested && loadGame().then((g) => g.stop())), []);

  const toggle = async () => {
    const input = pointer.current || 'keyboard';
    pointer.current = null;
    setTease(false);
    const game = await loadGame();
    if (game.isRunning()) {
      game.stop();
      return setState('off');
    }
    setState('loading');
    await game.start({ onStop: () => setState('off'), input });
    if (game.isRunning()) track('destroy_mode_started');
    setState(game.isRunning() ? 'on' : 'off');
  };

  const on = state !== 'off';
  // Loading the game replays the shatter on a loop; reduced motion keeps the plain pulse.
  const glitch = state === 'loading' && !reducedMotion() ? 'loading' : tease ? 'tease' : null;
  return (
    <button
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onClick={toggle}
      className={`relative p-3 rounded-xl transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-700/30 group ${glitch ? fx[glitch] : state === 'loading' ? 'animate-pulse' : ''}`}
      style={{
        color: on ? '#fff' : 'var(--accent)',
        backgroundColor: on ? 'var(--accent)' : undefined,
      }}
      aria-pressed={on}
      aria-busy={state === 'loading'}
      aria-label={on ? 'Exit destroy mode' : 'Enter destroy mode'}
      title={state === 'loading' ? 'Loading game mode…' : on ? 'Exit game mode' : 'Game mode: destroy this site'}
    >
      {/* data-dm-fx: left out of the game's page snapshot */}
      {glitch && (
        <span key={glitch} className={fx.under} data-dm-fx aria-hidden="true">
          <Icon name="controller" className={`${fx.icon} ${fx.plate} ${fx.yellow}`} />
          <Icon name="controller" className={`${fx.icon} ${fx.plate} ${fx.cyan}`} />
          <Icon name="controller" className={`${fx.icon} ${fx.plate} ${fx.magenta}`} />
        </span>
      )}
      <Icon
        name="controller"
        className={`relative w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${glitch ? fx.jitter : ''}`}
      />
      {glitch && (
        <span key={glitch + '-over'} className={fx.over} data-dm-fx aria-hidden="true">
          {BANDS.map((style, i) => (
            <span key={i} className={fx.band} style={style}>
              <Icon name="controller" className={fx.icon} />
            </span>
          ))}
          {BLOCKS.map((style, i) => (
            <i key={i} style={style} />
          ))}
          <span className={fx.panel}>
            <Icon name="controller" className={fx.icon} />
          </span>
          <b className={fx.zap}>ZZT!</b>
        </span>
      )}
    </button>
  );
};

export default DestroyModeToggle;
