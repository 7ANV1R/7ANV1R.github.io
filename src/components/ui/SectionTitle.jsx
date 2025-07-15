import React from 'react';

const SectionTitle = ({
  primaryText,
  secondaryText,
  fontSize = '110px',
  className = '',
}) => {
  return (
    <div className={`text-left leading-none ${className}`}>
      <h1
        className="font-semibold"
        style={{
          color: 'var(--text-primary)',
          fontSize: `clamp(3.5rem, 10vw, ${fontSize})`,
          lineHeight: '0.8',
          marginBottom: '0',
        }}
      >
        {primaryText}
      </h1>
      <h1
        className="font-semibold"
        style={{
          color: 'var(--text-secondary)',
          fontSize: `clamp(3.5rem, 10vw, ${fontSize})`,
          lineHeight: '0.8',
          marginTop: '0',
          marginBottom: '0',
        }}
      >
        {secondaryText}
      </h1>
    </div>
  );
};

export default SectionTitle;
