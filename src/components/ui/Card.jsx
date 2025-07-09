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
          className={`text-h5 mb-4 ${titleClassName}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
