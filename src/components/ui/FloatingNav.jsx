import React from 'react';

const FloatingNav = ({ onNavigate, activeSection }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', symbol: '👤' },
    { id: 'about', label: 'About', symbol: '📖' },
    { id: 'projects', label: 'Projects', symbol: '💼' },
    { id: 'education', label: 'Education', symbol: '🎓' },
  ];

  return (
    <nav className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-2 shadow-lg">
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-2 rounded-full transition-all duration-200 hover:bg-gray-100 relative ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600'
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <span className="text-lg">{item.symbol}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingNav;
