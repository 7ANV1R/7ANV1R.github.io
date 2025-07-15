import React from 'react';
import { 
  FaYoutube, 
  FaGamepad, 
  FaFacebook, 
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaFileAlt,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    {
      icon: FaGamepad,
      href: 'https://www.youtube.com/@7anv1r71',
      label: 'Gaming',
      color: 'hover:text-purple-500'
    },
    {
      icon: FaYoutube,
      href: 'https://www.youtube.com/@tanvir_ibn_mizan',
      label: 'YouTube',
      color: 'hover:text-red-500'
    },
    {
      icon: FaInstagram,
      href: 'https://instagram.com/tanvir_ibn_mizan',
      label: 'Instagram',
      color: 'hover:text-pink-500'
    },
    {
      icon: FaTwitter,
      href: 'https://twitter.com/tanvir_ibn_mizan',
      label: 'Twitter',
      color: 'hover:text-blue-400'
    },
    {
      icon: FaFacebook,
      href: 'https://facebook.com/tanvir.ibn.mizan',
      label: 'Facebook',
      color: 'hover:text-blue-500'
    },
    {
      icon: FaLinkedin,
      href: 'https://linkedin.com/in/7anv1r',
      label: 'LinkedIn',
      color: 'hover:text-blue-600'
    }
  ];

  return (
    <footer 
      className="w-full border-t transition-all duration-300"
      style={{ 
        borderColor: 'var(--card-border)',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div className="w-full px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    p-2 rounded-full transition-all duration-300 hover:scale-110
                    ${social.color}
                  `}
                  style={{ 
                    color: 'var(--text-secondary)'
                  }}
                  aria-label={social.label}
                >
                  <IconComponent className="text-lg" />
                </a>
              );
            })}
          </div>

          {/* Resume and Copyright */}
          <div className="flex items-center gap-4 text-center sm:text-right">
            <a
              href="https://docs.google.com/document/d/1iR0U8p813HnZvBY3LH46_RzbeuhBAQpD"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
              style={{ 
                color: 'var(--text-secondary)'
              }}
            >
              <FaFileAlt className="text-sm" />
              Resume
            </a>
            
            {/* Double Divider - Slanted like // */}
            <div className="flex items-center gap-0.5">
              <div 
                className="w-px h-4 transform rotate-12"
                style={{ backgroundColor: 'var(--card-border)' }}
              />
              <div 
                className="w-px h-4 transform rotate-12"
                style={{ backgroundColor: 'var(--card-border)' }}
              />
            </div>
            
            <p 
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              Made with <FaHeart className="text-red-500 animate-pulse text-xs" /> by Tanvir
            </p>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
