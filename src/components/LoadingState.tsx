'use client';

import { FC } from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}; 