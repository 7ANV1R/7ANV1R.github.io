import React from 'react';

const Card = ({ 
  title, 
  children, 
  className = "",
  titleClassName = "" 
}) => {
  return (
    <div className={`bg-gray-200 rounded-lg p-6 ${className}`}>
      {title && (
        <div className={`text-sm text-gray-500 mb-2 ${titleClassName}`}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
