import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const ProfileCard = ({ className = "" }) => {
  return (
    <Card title="Profile Card" className={className}>
      <Skeleton className="mb-2" />
      <Skeleton width="w-3/4" className="mb-4" />
      <Skeleton height="h-20 lg:h-32" className="lg:mb-4" />
      <div className="hidden lg:block">
        <Skeleton width="w-1/2" className="mb-2" />
        <Skeleton width="w-2/3" />
      </div>
    </Card>
  );
};

export default ProfileCard;
