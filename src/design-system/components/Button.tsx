"use client";

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { tokens } from '../tokens';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  href?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button - Apple-inspired button component with glass morphism
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    className, 
    href,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center',
      'font-medium transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'focus:ring-offset-black focus:ring-primary-400/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
      'border-0 outline-none',
    );

    const variantClasses = {
      primary: cn(
        'bg-gradient-to-r from-primary-500 to-primary-600',
        'text-white shadow-primary',
        'hover:from-primary-400 hover:to-primary-500',
        'hover:shadow-lg hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.98]',
      ),
      secondary: cn(
        'bg-white/[0.08] backdrop-blur-xl',
        'border border-white/[0.12] text-white',
        'shadow-glass',
        'hover:bg-white/[0.12] hover:border-white/[0.18]',
        'hover:shadow-glassHover hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.98]',
      ),
      ghost: cn(
        'bg-transparent text-white/80',
        'hover:bg-white/[0.08] hover:text-white',
        'hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.98]',
      ),
      outline: cn(
        'bg-transparent border border-white/[0.24]',
        'text-white',
        'hover:bg-white/[0.08] hover:border-white/[0.32]',
        'hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.98]',
      ),
      glass: cn(
        'bg-white/[0.06] backdrop-blur-xl',
        'border border-white/[0.08] text-white/90',
        'shadow-sm',
        'hover:bg-white/[0.10] hover:border-white/[0.14]',
        'hover:text-white hover:shadow-md',
        'hover:-translate-y-0.5',
        'active:translate-y-0 active:scale-[0.98]',
      ),
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
      md: 'px-4 py-2 text-base rounded-xl gap-2',
      lg: 'px-6 py-3 text-lg rounded-2xl gap-2.5',
      xl: 'px-8 py-4 text-xl rounded-2xl gap-3',
    };

    if (href) {
      return (
        <motion.a
          href={href}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
          whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
          transition={tokens.motion.spring.gentle}
        >
          {loading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
          
          <span className={cn('flex items-center gap-inherit', loading && 'opacity-0')}>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </span>
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        transition={tokens.motion.spring.gentle}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        <span className={cn('flex items-center gap-inherit', loading && 'opacity-0')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };