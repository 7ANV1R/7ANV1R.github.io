import React from 'react';

const SectionTitle = ({ primaryText, secondaryText, minSize = '3rem', maxSize = '6.875rem' }) => {
  const responsiveFontSize = `clamp(${minSize}, 8vw, ${maxSize})`;
  
  return (
    <div className="text-left leading-none">
      <h1
        className="font-semibold"
        style={{
          color: 'var(--text-primary)',
          fontSize: responsiveFontSize,
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
          fontSize: responsiveFontSize,
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
