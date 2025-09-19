"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PageHeader - A consistent header component for pages
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, actions, className, size = 'lg', ...props }, ref) => {
    const sizeClasses = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    };

    const titleSizeClasses = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl lg:text-5xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className={cn(
            'font-bold text-glow-sm',
            titleSizeClasses[size]
          )}>
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
          
          {actions && (
            <div className="flex items-center justify-center pt-4">
              {actions}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader };
export type { PageHeaderProps };
