import React from 'react';

const Skeleton = ({ 
  width = "w-full", 
  height = "h-4", 
  className = "" 
}) => {
  return (
    <div 
      className={`rounded animate-pulse transition-colors duration-300 ${width} ${height} ${className}`}
      style={{ backgroundColor: 'var(--text-secondary)', opacity: 0.3 }}
    ></div>
  );
};

export default Skeleton;
