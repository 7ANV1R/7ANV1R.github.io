import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import ThemeToggle from './ThemeToggle';

const FloatingNav = ({ onNavigate }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'projects', label: 'Projects', icon: HiOutlineBriefcase },
    { id: 'experience', label: 'Experience', icon: HiOutlineBuildingOffice },
    { id: 'skills', label: 'Tools', icon: HiOutlineWrenchScrewdriver },
  ];

  return (
    <nav
      className="fixed top-4 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-xl rounded-2xl px-6 lg:px-8 py-2"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'var(--nav-bg)',
        border: '1px solid var(--nav-border)',
        boxShadow: 'var(--nav-shadow)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)', // Safari support
      }}
    >
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-3 rounded-xl transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-700/30 relative group hover:text-gray-900 dark:hover:text-white"
              style={{ color: 'var(--accent)' }}
              aria-label={item.label}
              title={item.label}
            >
              <IconComponent
                className="w-5 h-5"
                style={{
                  filter:
                    'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06))',
                  color: 'var(--accent)',
                }}
              />

              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        <div
          className="w-px h-6 mx-3"
          style={{
            backgroundColor: 'var(--border-color, rgba(156, 163, 175, 0.8))',
          }}
        />

        <ThemeToggle />
      </div>
    </nav>
  );
};

export default FloatingNav;
