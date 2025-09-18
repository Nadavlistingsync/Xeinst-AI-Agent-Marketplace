"use client";

import React, { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { liquidTokens } from '../liquid-tokens';

interface LiquidSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bubble' | 'flow' | 'glow';
  showClearButton?: boolean;
  loading?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * LiquidSearchInput - Bubble and liquid-inspired search input
 * 
 * Features:
 * - Organic bubble shapes that morph on focus
 * - Floating bubble particles
 * - Liquid glow effects
 * - Debounced search with smooth animations
 * - Clear button with bubble pop effect
 * - Accessibility optimized
 * 
 * @example
 * ```tsx
 * <LiquidSearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search liquid agents..."
 *   variant="bubble"
 *   animated
 * />
 * ```
 */
const LiquidSearchInput = forwardRef<HTMLInputElement, LiquidSearchInputProps>(
  ({ 
    value = '',
    onChange,
    onSearch,
    onClear,
    debounceMs = 300,
    placeholder = 'Search...',
    size = 'md',
    variant = 'bubble',
    showClearButton = true,
    loading = false,
    animated = true,
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Sync with external value
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Debounced search
    useEffect(() => {
      if (!onChange && !onSearch) return;
      
      setIsTyping(true);
      const timeoutId = setTimeout(() => {
        if (onChange) onChange(internalValue);
        if (onSearch) onSearch(internalValue);
        setIsTyping(false);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }, [internalValue, debounceMs, onChange, onSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
    };

    const handleClear = () => {
      setInternalValue('');
      if (onChange) onChange('');
      if (onClear) onClear();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(internalValue);
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    const sizeClasses = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-5 text-base',
      lg: 'h-14 px-6 text-lg',
    };

    const borderRadiusClasses = {
      bubble: {
        sm: 'rounded-[1rem_1.5rem_1.2rem_1.8rem]',
        md: 'rounded-[1.5rem_2rem_1.8rem_2.5rem]',
        lg: 'rounded-[2rem_3rem_2.5rem_3.5rem]',
      },
      flow: {
        sm: 'rounded-[1rem_2rem_1.5rem_1rem]',
        md: 'rounded-[2rem_3rem_2.5rem_1.5rem]',
        lg: 'rounded-[3rem_4rem_3.5rem_2rem]',
      },
      glow: {
        sm: 'rounded-2xl',
        md: 'rounded-3xl',
        lg: 'rounded-[2rem]',
      },
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <motion.div 
        className={cn('relative group', className)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={liquidTokens.motion.spring.bubble}
      >
        {/* Floating bubble particles around input */}
        {animated && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'absolute w-2 h-2 rounded-full',
                  i % 3 === 0 ? 'bg-blue-400/20' : 
                  i % 3 === 1 ? 'bg-purple-400/20' : 'bg-cyan-400/20'
                )}
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + (i % 2) * 80}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  x: [0, Math.sin(i) * 5, 0],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        )}

        {/* Main input container */}
        <motion.div
          className={cn(
            'relative',
            borderRadiusClasses[variant][size]
          )}
          animate={animated && isFocused ? {
            scale: [1, 1.02, 1],
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          } : undefined}
        >
          {/* Background with liquid effect */}
          <div className={cn(
            'absolute inset-0',
            'bg-white/[0.08] backdrop-blur-xl',
            'border-2 border-white/[0.15]',
            borderRadiusClasses[variant][size],
            'transition-all duration-500 ease-out',
            isFocused && 'bg-white/[0.12] border-white/[0.25] shadow-bubble-md',
            variant === 'glow' && isFocused && 'shadow-glow-blue',
          )} />

          {/* Flowing border animation */}
          {animated && variant === 'flow' && (
            <motion.div
              className={cn(
                'absolute inset-0 border-2 border-transparent',
                borderRadiusClasses[variant][size]
              )}
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}

          {/* Search icon */}
          <div className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 z-10',
            'text-white/40 transition-all duration-300',
            'group-focus-within:text-white/70',
            isFocused && 'text-blue-400/70',
            iconSizeClasses[size]
          )}>
            {loading || isTyping ? (
              <motion.div
                className={cn('border-2 border-current border-t-transparent rounded-full', iconSizeClasses[size])}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  borderRadius: '50% 40% 60% 30%',
                }}
              />
            ) : (
              <motion.div
                animate={animated ? {
                  rotate: [0, 5, -5, 0],
                  scale: isFocused ? [1, 1.1, 1] : 1,
                } : undefined}
                transition={animated ? {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                } : undefined}
              >
                <Search className={iconSizeClasses[size]} />
              </motion.div>
            )}
          </div>

          {/* Input field */}
          <motion.input
            ref={ref}
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              // Base styling
              'w-full relative z-10 bg-transparent',
              'pl-12 pr-12 text-white placeholder:text-white/40',
              'focus:outline-none',
              'transition-all duration-300 ease-out',
              
              // Size classes
              sizeClasses[size],
              borderRadiusClasses[variant][size]
            )}
            whileFocus={animated ? { scale: 1.01 } : undefined}
            transition={liquidTokens.motion.spring.bubble}
            {...props}
          />

          {/* Clear button */}
          {showClearButton && internalValue && (
            <motion.button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                'text-white/40 hover:text-white/70',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-400/20',
                'rounded-full p-1',
                'hover:bg-white/[0.08]',
                iconSizeClasses[size]
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={liquidTokens.motion.spring.bubble}
              aria-label="Clear search"
            >
              <motion.div
                animate={animated ? {
                  rotate: [0, 90, 180, 270, 360],
                } : undefined}
                transition={animated ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                } : undefined}
              >
                <X className={iconSizeClasses[size]} />
              </motion.div>
            </motion.button>
          )}

          {/* Magic sparkles on focus */}
          {animated && isFocused && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '50%',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -10, -20],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                >
                  <Sparkles className="w-3 h-3 text-blue-400/60" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Liquid glow effect on focus */}
        <AnimatePresence>
          {isFocused && variant === 'glow' && (
            <motion.div
              className={cn(
                'absolute inset-0 -z-10',
                borderRadiusClasses[variant][size]
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1.05,
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                ],
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

LiquidSearchInput.displayName = 'LiquidSearchInput';

export { LiquidSearchInput };
