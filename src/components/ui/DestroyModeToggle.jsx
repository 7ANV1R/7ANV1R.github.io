import { useEffect, useRef, useState } from 'react';
import { IoGameControllerOutline } from 'react-icons/io5';
import { track } from '../../analytics';

// Game code (and its page-capture lib) is only downloaded on first tap.
const loadGame = () => import('../../game/destroyMode.js');

const DestroyModeToggle = () => {
  const [state, setState] = useState('off'); // off | loading | on
  // How the button was pressed (touch / pen / mouse); none means Enter/Space.
  // The game opens with the controls that match.
  const pointer = useRef(null);

  // Layouts swap at the 1024px breakpoint; don't leave a game running unowned.
  useEffect(() => () => void loadGame().then((g) => g.stop()), []);

  const toggle = async () => {
    const input = pointer.current || 'keyboard';
    pointer.current = null;
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
  return (
    <button
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onClick={toggle}
      className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-700/30 group ${state === 'loading' ? 'animate-pulse' : ''}`}
      style={{
        color: on ? '#fff' : 'var(--accent)',
        backgroundColor: on ? 'var(--accent)' : undefined,
      }}
      aria-pressed={on}
      aria-busy={state === 'loading'}
      aria-label={on ? 'Exit destroy mode' : 'Enter destroy mode'}
      title={state === 'loading' ? 'Loading game mode…' : on ? 'Exit game mode' : 'Game mode: destroy this site'}
    >
      <IoGameControllerOutline className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
    </button>
  );
};

export default DestroyModeToggle;
