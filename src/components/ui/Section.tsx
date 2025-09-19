"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'subtle' | 'glass';
}

/**
 * Section - A semantic section wrapper with consistent spacing
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, className, size = 'lg', background = 'none', ...props }, ref) => {
    const sizeClasses = {
      sm: 'py-8 px-4',
      md: 'py-12 px-4 sm:px-6',
      lg: 'py-16 px-4 sm:px-6 lg:px-8',
      xl: 'py-24 px-4 sm:px-6 lg:px-8',
    };

    const backgroundClasses = {
      none: '',
      subtle: 'bg-black/20',
      glass: 'backdrop-blur-sm bg-white/5',
    };

    return (
      <section
        ref={ref}
        className={cn(
          'w-full max-w-7xl mx-auto',
          sizeClasses[size],
          backgroundClasses[background],
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export { Section };
export type { SectionProps };
