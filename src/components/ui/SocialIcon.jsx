const SocialIcon = ({ icon, href, className = '', ...props }) => {
  const IconComponent = icon;

  return (
    <a
      href={href}
      target={href?.startsWith('mailto:') ? undefined : '_blank'}
      rel={href?.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      className={`text-xl p-2 rounded-lg transition-all duration-300 hover:bg-gray-200 hover:shadow-md dark:hover:bg-gray-700 ${className}`}
      style={{ color: 'var(--text-secondary)' }}
      {...props}
    >
      <IconComponent />
    </a>
  );
};

export default SocialIcon;
