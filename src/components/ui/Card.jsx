import React from 'react';

const Card = ({ 
  title, 
  children, 
  className = "",
  titleClassName = "" 
}) => {
  return (
    <div 
      className={`rounded-lg p-6 border transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {title && (
        <div 
          className={`text-sm mb-2 ${titleClassName}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
