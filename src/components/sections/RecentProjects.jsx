import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const RecentProjects = ({ className = "" }) => {
  return (
    <Card title="Recent Projects" className={`h-96 ${className}`}>
      <Skeleton className="mb-2" />
      <Skeleton width="w-2/3" className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton height="h-20" />
        <Skeleton height="h-20" />
        <Skeleton height="h-20" />
        <Skeleton height="h-20" />
      </div>
    </Card>
  );
};

export default RecentProjects;
