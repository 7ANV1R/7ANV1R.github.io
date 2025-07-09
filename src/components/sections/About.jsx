import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const About = ({ className = "" }) => {
  return (
    <Card title="About" className={`h-80 ${className}`}>
      <Skeleton className="mb-2" />
      <Skeleton width="w-3/4" className="mb-4" />
      <Skeleton height="h-32" />
    </Card>
  );
};

export default About;
