import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext.jsx';
import Icon from './Icon';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-700/30 group"
      style={{ color: 'var(--accent)' }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div 
        className="relative w-5 h-5 transition-transform duration-200 group-hover:scale-110"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06))',
          color: 'var(--accent)'
        }}
      >
        <Icon name={isDark ? 'sun' : 'moon'} className="w-5 h-5" />
      </div>
    </button>
  );
};

export default ThemeToggle;
