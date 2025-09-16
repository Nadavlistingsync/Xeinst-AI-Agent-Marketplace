import React from 'react';
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/10 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AgentExecutionSkeletonProps {
  variant?: 'default' | 'compact' | 'detailed';
}

export function AgentExecutionSkeleton({ variant = 'default' }: AgentExecutionSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="space-y-4 p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-6 p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/60">
            <span>Executing agent...</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Execution Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white/30 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <div className="text-xs text-white/60">Execution Time</div>
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <div className="text-xs text-white/60">Tokens Used</div>
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-14 mx-auto mb-2" />
            <div className="text-xs text-white/60">Cost</div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-4 p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

interface UploadSkeletonProps {
  progress?: number;
}

export function UploadSkeleton({ progress = 0 }: UploadSkeletonProps) {
  return (
    <div className="space-y-6 p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
      {/* File Info */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>

      {/* Upload Progress */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-white/60">
          <span>Uploading agent...</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Upload Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-white/80">Validating file...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-green-500' : 'bg-white/30'}`} />
          <span className="text-sm text-white/80">Uploading to storage...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-green-500' : 'bg-white/30'}`} />
          <span className="text-sm text-white/80">Creating agent record...</span>
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-white/10 p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/10">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DashboardSkeletonProps {
  variant?: 'stats' | 'full';
}

export function DashboardSkeleton({ variant = 'full' }: DashboardSkeletonProps) {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <DashboardSkeleton variant="stats" />
      
      {/* Quick Actions */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={3} columns={5} />
    </div>
  );
} 