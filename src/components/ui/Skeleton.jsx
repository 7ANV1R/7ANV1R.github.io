import React from 'react';

const Skeleton = ({ 
  width = "w-full", 
  height = "h-4", 
  className = "" 
}) => {
  return (
    <div className={`bg-gray-300 rounded ${width} ${height} ${className}`}></div>
  );
};

export default Skeleton;
