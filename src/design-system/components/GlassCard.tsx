"use client";

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { tokens } from '../tokens';

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  href?: string;
  asChild?: boolean;
}

/**
 * GlassCard - Apple-inspired glass morphism card component
 * 
 * Features:
 * - Glass morphism with backdrop blur
 * - Subtle borders and shadows
 * - Interactive hover states
 * - Accessible focus states
 * - Multiple variants for different contexts
 * 
 * @example
 * ```tsx
 * <GlassCard variant="elevated" size="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </GlassCard>
 * ```
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    children, 
    className, 
    href,
    asChild = false,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // Base glass styling
      'relative overflow-hidden',
      'backdrop-blur-xl bg-white/[0.08]',
      'border border-white/[0.12]',
      'transition-all duration-200 ease-out',
      
      // Focus states for accessibility
      'focus-within:ring-2 focus-within:ring-primary-400/20',
      'focus-within:border-primary-400/30',
    );

    const variantClasses = {
      default: cn(
        'shadow-glass',
        'hover:bg-white/[0.12] hover:border-white/[0.18]',
        'hover:shadow-glassHover hover:-translate-y-0.5',
      ),
      elevated: cn(
        'shadow-lg',
        'bg-white/[0.12] border-white/[0.18]',
        'hover:bg-white/[0.16] hover:border-white/[0.24]',
        'hover:shadow-xl hover:-translate-y-1',
      ),
      subtle: cn(
        'shadow-sm',
        'bg-white/[0.04] border-white/[0.08]',
        'hover:bg-white/[0.08] hover:border-white/[0.12]',
      ),
      interactive: cn(
        'shadow-md cursor-pointer',
        'hover:bg-white/[0.12] hover:border-white/[0.18]',
        'hover:shadow-lg hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-md',
        'active:scale-[0.99]',
      ),
    };

    const sizeClasses = {
      sm: 'p-4 rounded-xl',
      md: 'p-6 rounded-2xl',
      lg: 'p-8 rounded-3xl',
    };

    const Comp = href ? motion.a : motion.div;
    const motionProps = href ? { href } : {};

    return (
      <Comp
        ref={ref as any}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={tokens.motion.spring.gentle}
        {...motionProps}
        {...props}
      >
        {/* Glass overlay for enhanced effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Subtle inner border */}
        <div className="absolute inset-0 rounded-inherit border border-white/[0.05] pointer-events-none" />
      </Comp>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
