"use client";

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { liquidTokens } from '../liquid-tokens';

interface LiquidButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'bubble' | 'flow' | 'glow' | 'float' | 'liquid' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'pink' | 'cyan' | 'green';
  children: React.ReactNode;
  className?: string;
  href?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animated?: boolean;
}

/**
 * LiquidButton - Bubble and liquid-inspired button component
 */
const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ 
    variant = 'bubble', 
    size = 'md', 
    color = 'blue',
    children, 
    className, 
    href,
    loading = false,
    leftIcon,
    rightIcon,
    animated = true,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center',
      'font-medium transition-all duration-500 ease-out',
      'focus:outline-none overflow-hidden',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
      'cursor-pointer',
    );

    const variantClasses = {
      bubble: cn(
        'bg-white/[0.10] backdrop-blur-xl',
        'border-2 border-white/[0.20]',
        'shadow-bubble-md',
        'hover:bg-white/[0.15] hover:border-white/[0.30]',
        'hover:shadow-bubble-lg',
      ),
      flow: cn(
        'bg-gradient-to-r from-white/[0.12] via-white/[0.08] to-white/[0.12]',
        'border border-white/[0.25]',
        'shadow-float-md',
        'hover:from-white/[0.18] hover:via-white/[0.12] hover:to-white/[0.18]',
        'hover:border-white/[0.35] hover:shadow-float-lg',
      ),
      glow: cn(
        'bg-white/[0.06]',
        'border border-white/[0.15]',
        'hover:shadow-glow-blue hover:border-blue-400/40',
        'hover:bg-blue-500/[0.10]',
      ),
      float: cn(
        'bg-white/[0.12]',
        'border-2 border-white/[0.22]',
        'shadow-float-sm',
        'hover:shadow-float-lg hover:-translate-y-1',
      ),
      liquid: cn(
        'bg-gradient-to-br from-white/[0.15] to-white/[0.08]',
        'border-2 border-white/[0.25]',
        'shadow-bubble-lg',
        'hover:from-white/[0.20] hover:to-white/[0.12]',
        'hover:border-white/[0.35] hover:shadow-bubble-xl',
      ),
      ghost: cn(
        'bg-transparent text-white/80',
        'border border-transparent',
        'hover:bg-white/[0.08] hover:text-white',
        'hover:border-white/[0.12]',
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
      sm: 'px-4 py-2 text-sm gap-2 min-h-[2.5rem]',
      md: 'px-6 py-3 text-base gap-2.5 min-h-[3rem]',
      lg: 'px-8 py-4 text-lg gap-3 min-h-[3.5rem]',
      xl: 'px-10 py-5 text-xl gap-3.5 min-h-[4rem]',
    };

    const borderRadiusClasses = {
      bubble: {
        sm: 'rounded-[1rem_1.5rem_1.2rem_1.8rem]',
        md: 'rounded-[1.5rem_2rem_1.8rem_2.5rem]',
        lg: 'rounded-[2rem_3rem_2.5rem_3.5rem]',
        xl: 'rounded-[3rem_4rem_3.5rem_4.5rem]',
      },
      flow: {
        sm: 'rounded-[1rem_2rem_1.5rem_1rem]',
        md: 'rounded-[2rem_3rem_2.5rem_1.5rem]',
        lg: 'rounded-[3rem_4rem_3.5rem_2rem]',
        xl: 'rounded-[4rem_5rem_4.5rem_3rem]',
      },
      glow: {
        sm: 'rounded-2xl',
        md: 'rounded-3xl',
        lg: 'rounded-[2rem]',
        xl: 'rounded-[3rem]',
      },
      float: {
        sm: 'rounded-[1.2rem_1.8rem_1rem_1.5rem]',
        md: 'rounded-[1.8rem_2.5rem_1.5rem_2rem]',
        lg: 'rounded-[2.5rem_3.5rem_2rem_3rem]',
        xl: 'rounded-[3.5rem_4.5rem_3rem_4rem]',
      },
      liquid: {
        sm: 'rounded-[1rem_1.5rem_1.2rem_1.8rem]',
        md: 'rounded-[1.5rem_2rem_1.8rem_2.5rem]',
        lg: 'rounded-[2rem_3rem_2.5rem_3.5rem]',
        xl: 'rounded-[3rem_4rem_3.5rem_4.5rem]',
      },
      ghost: {
        sm: 'rounded-xl',
        md: 'rounded-2xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
      },
      glass: {
        sm: 'rounded-xl',
        md: 'rounded-2xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
      },
    };

    const colorGlowClasses = {
      blue: 'hover:shadow-glow-blue focus:ring-blue-400/30',
      purple: 'hover:shadow-glow-purple focus:ring-purple-400/30',
      pink: 'hover:shadow-glow-pink focus:ring-pink-400/30',
      cyan: 'hover:shadow-glow-cyan focus:ring-cyan-400/30',
      green: 'hover:shadow-glow-green focus:ring-green-400/30',
    };

    const content = (
      <>
        {/* Loading liquid spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                borderRadius: '50% 40% 60% 30%',
              }}
            />
          </motion.div>
        )}
        
        {/* Content */}
        <motion.span 
          className={cn('flex items-center gap-inherit relative z-10', loading && 'opacity-0')}
          animate={animated ? {
            y: [0, -1, 0],
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          } : undefined}
        >
          {leftIcon && (
            <motion.span 
              className="flex-shrink-0"
              animate={animated ? { rotate: [0, 5, -5, 0] } : undefined}
              transition={animated ? { duration: 3, repeat: Infinity } : undefined}
            >
              {leftIcon}
            </motion.span>
          )}
          {children}
          {rightIcon && (
            <motion.span 
              className="flex-shrink-0"
              animate={animated ? { rotate: [0, -5, 5, 0] } : undefined}
              transition={animated ? { duration: 3, repeat: Infinity, delay: 0.5 } : undefined}
            >
              {rightIcon}
            </motion.span>
          )}
        </motion.span>
      </>
    );

    const commonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      borderRadiusClasses[variant][size],
      colorGlowClasses[color],
      className
    );

    const motionProps = {
      whileHover: !disabled && !loading ? { 
        scale: 1.05,
        y: -2,
        transition: liquidTokens.motion.spring.bubble 
      } : undefined,
      whileTap: !disabled && !loading ? { 
        scale: 0.95,
        transition: liquidTokens.motion.spring.bubble 
      } : undefined,
      ...(animated && {
        animate: {
          y: [0, -2, 0],
          rotate: [0, 1, -1, 0],
        },
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }
      })
    };

    if (href) {
      return (
        <Link href={href} className={commonClasses}>
          <motion.div className="w-full h-full flex items-center justify-center" {...motionProps}>
            {content}
          </motion.div>
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={commonClasses}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton };