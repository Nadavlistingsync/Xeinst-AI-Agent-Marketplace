import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
  />
);

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="glass-card p-6">
        <Skeleton className="w-full h-48 mb-4 rounded-lg" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-16 h-6" />
        </div>
        <Skeleton className="w-3/4 h-8 mb-2" />
        <Skeleton className="w-full h-20 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-24 h-10 rounded-lg" />
        </div>
      </div>
    ))}
  </>
);

interface ReviewSkeletonProps {
  count?: number;
}

export const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border-b border-gray-200 pb-6">
        <div className="flex items-center mb-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4 ml-2" />
        </div>
        <Skeleton className="w-full h-16 mb-2" />
        <Skeleton className="w-32 h-4" />
      </div>
    ))}
  </>
); 