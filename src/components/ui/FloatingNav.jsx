import React from 'react';
import ThemeToggle from './ThemeToggle';

const FloatingNav = ({ onNavigate, activeSection }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', symbol: '👤' },
    { id: 'about', label: 'About', symbol: '📖' },
    { id: 'projects', label: 'Projects', symbol: '💼' },
    { id: 'education', label: 'Education', symbol: '🎓' },
  ];

  return (
    <nav 
      className="fixed top-6 right-6 z-50 backdrop-blur-sm border rounded-full px-3 py-2 shadow-lg"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-2 rounded-full transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 relative ${
                activeSection === item.id
                  ? 'text-orange-600'
                  : ''
              }`}
              style={{
                backgroundColor: activeSection === item.id ? 'rgba(243, 108, 56, 0.1)' : 'transparent',
                color: activeSection === item.id ? '#F36C38' : 'var(--text-secondary)',
              }}
              aria-label={item.label}
              title={item.label}
            >
              <span className="text-lg">{item.symbol}</span>
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default FloatingNav;
