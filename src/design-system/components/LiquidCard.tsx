"use client";

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { liquidTokens } from '../liquid-tokens';

interface LiquidCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
  variant?: 'bubble' | 'flow' | 'glow' | 'float' | 'organic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'pink' | 'cyan' | 'green';
  children: React.ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
  animated?: boolean;
}

/**
 * LiquidCard - Bubble and liquid-inspired card component
 * 
 * Features:
 * - Organic bubble shapes with liquid borders
 * - Flowing background gradients
 * - Floating animations
 * - Glow effects on hover
 * - Multiple color variants
 * - Interactive liquid deformations
 * 
 * @example
 * ```tsx
 * <LiquidCard variant="bubble" color="blue" size="lg" animated>
 *   <h3>Liquid Content</h3>
 *   <p>Flowing like water</p>
 * </LiquidCard>
 * ```
 */
const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ 
    variant = 'bubble', 
    size = 'md', 
    color = 'blue',
    children, 
    className, 
    href,
    interactive = false,
    animated = true,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // Base liquid styling
      'relative overflow-hidden',
      'backdrop-blur-xl',
      'transition-all duration-500 ease-out',
      
      // Focus states for accessibility
      'focus-within:ring-2 focus-within:ring-offset-2',
      'focus-within:ring-offset-black',
    );

    const variantClasses = {
      bubble: cn(
        'bg-white/[0.08]',
        'border-2 border-white/[0.15]',
        'shadow-bubble-md',
        interactive && [
          'hover:bg-white/[0.12] hover:border-white/[0.25]',
          'hover:shadow-bubble-lg hover:scale-105',
          'active:scale-95',
        ]
      ),
      flow: cn(
        'bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent',
        'border border-white/[0.20]',
        'shadow-float-md',
        interactive && [
          'hover:from-white/[0.18] hover:via-white/[0.10]',
          'hover:border-white/[0.30] hover:shadow-float-lg',
          'hover:rotate-1 hover:scale-105',
        ]
      ),
      glow: cn(
        'bg-white/[0.06]',
        'border border-white/[0.12]',
        interactive && [
          'hover:shadow-glow-blue hover:border-blue-400/30',
          'hover:bg-blue-500/[0.08] hover:scale-105',
        ]
      ),
      float: cn(
        'bg-white/[0.10]',
        'border-2 border-white/[0.18]',
        'shadow-float-sm',
        interactive && [
          'hover:shadow-float-lg hover:-translate-y-2',
          'hover:rotate-2 hover:scale-105',
        ]
      ),
      organic: cn(
        'bg-gradient-to-br from-white/[0.15] to-white/[0.05]',
        'border-2 border-white/[0.25]',
        'shadow-bubble-lg',
        interactive && [
          'hover:from-white/[0.20] hover:to-white/[0.08]',
          'hover:border-white/[0.35] hover:shadow-bubble-xl',
          'hover:scale-105',
        ]
      ),
    };

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8',
      xl: 'p-10',
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
      organic: {
        sm: 'rounded-[50%_60%_40%_70%]',
        md: 'rounded-[60%_40%_80%_20%]',
        lg: 'rounded-[40%_60%_20%_80%]',
        xl: 'rounded-[70%_30%_60%_40%]',
      },
    };

    const colorClasses = {
      blue: 'focus-within:ring-blue-400/30',
      purple: 'focus-within:ring-purple-400/30',
      pink: 'focus-within:ring-pink-400/30',
      cyan: 'focus-within:ring-cyan-400/30',
      green: 'focus-within:ring-green-400/30',
    };

    const Comp = href ? motion.a : motion.div;
    const motionProps = href ? { href } : {};

    const animationProps = animated ? {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      whileInView: { opacity: 1, scale: 1, y: 0 },
      viewport: { once: true },
      transition: liquidTokens.motion.spring.bubble,
      ...(interactive && {
        whileHover: { 
          scale: 1.05, 
          y: -5,
          transition: liquidTokens.motion.spring.flow 
        },
        whileTap: { 
          scale: 0.95,
          transition: liquidTokens.motion.spring.bubble 
        },
      })
    } : {};

    return (
      <Comp
        ref={ref as any}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          borderRadiusClasses[variant][size],
          colorClasses[color],
          className
        )}
        {...animationProps}
        {...motionProps}
        {...props}
      >
        {/* Floating bubble background effects */}
        {animated && (
          <>
            <motion.div
              className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400/20 rounded-full blur-sm"
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/15 rounded-full blur-sm"
              animate={{
                y: [0, 8, 0],
                x: [0, -3, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute top-1/2 -left-2 w-4 h-4 bg-cyan-400/10 rounded-full blur-sm"
              animate={{
                y: [0, -5, 0],
                x: [0, 8, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </>
        )}

        {/* Liquid gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: liquidTokens.colors.bubbles[color],
          }}
        />
        
        {/* Flowing border effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-inherit border-2 border-transparent pointer-events-none"
            style={{
              background: `linear-gradient(45deg, transparent, ${color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}, transparent)`,
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-inherit border border-white/[0.08] pointer-events-none" />
      </Comp>
    );
  }
);

LiquidCard.displayName = 'LiquidCard';

export { LiquidCard };
