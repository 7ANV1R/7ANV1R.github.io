import React from 'react';

const SectionTitle = ({
  primaryText,
  secondaryText,
  fontSize = '96px',
  className = '',
}) => {
  return (
    <div className={`text-left leading-none ${className}`}>
      <h2
        className="font-semibold"
        style={{
          color: 'var(--text-primary)',
          fontSize: `clamp(3.25rem, 9vw, ${fontSize})`,
          lineHeight: '0.8',
          marginBottom: '0',
        }}
      >
        {primaryText}
      </h2>
      <h2
        className="font-semibold"
        style={{
          color: 'var(--text-secondary)',
          fontSize: `clamp(3.25rem, 9vw, ${fontSize})`,
          lineHeight: '0.8',
          marginTop: '0',
          marginBottom: '0',
        }}
      >
        {secondaryText}
      </h2>
    </div>
  );
};

export default SectionTitle;
