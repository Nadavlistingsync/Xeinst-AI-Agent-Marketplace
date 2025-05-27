import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card p-6">
          <Skeleton className="w-full h-48 mb-4" />
          <Skeleton className="w-24 h-6 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      ))}
    </>
  );
}

export function ReviewSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border-b border-gray-200 py-4">
          <div className="flex items-center mb-2">
            <Skeleton className="w-12 h-12 rounded-full mr-3" />
            <div>
              <Skeleton className="w-32 h-4 mb-1" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      ))}
    </>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 