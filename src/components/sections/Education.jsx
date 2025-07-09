import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const Education = ({ className = "" }) => {
  return (
    <Card title="Education" className={`h-80 ${className}`}>
      <Skeleton className="mb-2" />
      <Skeleton width="w-1/2" className="mb-4" />
      <div className="space-y-3">
        <Skeleton height="h-16" />
        <Skeleton height="h-16" />
        <Skeleton height="h-16" />
      </div>
    </Card>
  );
};

export default Education;
