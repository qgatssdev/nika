'use client';

import React from 'react';

type SkeletonProps = {
  className?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={['animate-pulse rounded-md bg-white/10', className ?? '']
        .join(' ')
        .trim()}
    />
  );
};

export default Skeleton;
