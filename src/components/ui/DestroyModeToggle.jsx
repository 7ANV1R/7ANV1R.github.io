import { useEffect, useState } from 'react';
import { IoGameControllerOutline } from 'react-icons/io5';

// Game code (and its page-capture lib) is only downloaded on first tap.
const loadGame = () => import('../../game/destroyMode.js');

const DestroyModeToggle = () => {
  const [state, setState] = useState('off'); // off | loading | on

  // Layouts swap at the 1024px breakpoint; don't leave a game running unowned.
  useEffect(() => () => void loadGame().then((g) => g.stop()), []);

  const toggle = async () => {
    const game = await loadGame();
    if (game.isRunning()) {
      game.stop();
      return setState('off');
    }
    setState('loading');
    await game.start({ onStop: () => setState('off') });
    setState(game.isRunning() ? 'on' : 'off');
  };

  const on = state !== 'off';
  return (
    <button
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
