"use client";

import React, { forwardRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../tokens';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * SearchInput - Apple-inspired search input with debouncing and glass morphism
 * 
 * Features:
 * - Debounced search functionality
 * - Glass morphism styling
 * - Clear button with animation
 * - Loading states
 * - Keyboard accessibility
 * - Smooth micro-interactions
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search agents..."
 *   debounceMs={300}
 * />
 * ```
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    value = '',
    onChange,
    onSearch,
    onClear,
    debounceMs = 300,
    placeholder = 'Search...',
    size = 'md',
    showClearButton = true,
    loading = false,
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    // Sync with external value
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Debounced search
    useEffect(() => {
      if (!onChange && !onSearch) return;
      
      const timeoutId = setTimeout(() => {
        if (onChange) onChange(internalValue);
        if (onSearch) onSearch(internalValue);
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
      sm: 'h-9 px-3 text-sm rounded-lg',
      md: 'h-11 px-4 text-base rounded-xl',
      lg: 'h-13 px-5 text-lg rounded-2xl',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <motion.div 
        className={cn('relative group', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={tokens.motion.spring.gentle}
      >
        {/* Search icon */}
        <div className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2',
          'text-white/40 transition-colors duration-200',
          'group-focus-within:text-white/60',
          iconSizeClasses[size]
        )}>
          {loading ? (
            <motion.div
              className={cn('border-2 border-current border-t-transparent rounded-full', iconSizeClasses[size])}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <Search className={iconSizeClasses[size]} />
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
            'w-full pl-10 pr-10',
            'bg-white/[0.06] backdrop-blur-xl',
            'border border-white/[0.12]',
            'text-white placeholder:text-white/40',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-primary-400/20',
            'focus:border-primary-400/30 focus:bg-white/[0.10]',
            'hover:bg-white/[0.08] hover:border-white/[0.16]',
            
            // Size classes
            sizeClasses[size]
          )}
          whileFocus={{ scale: 1.01 }}
          transition={tokens.motion.spring.gentle}
          {...props}
        />

        {/* Clear button */}
        {showClearButton && internalValue && (
          <motion.button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-white/40 hover:text-white/70',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              'rounded-full p-0.5',
              iconSizeClasses[size]
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={tokens.motion.spring.gentle}
            aria-label="Clear search"
          >
            <X className={iconSizeClasses[size]} />
          </motion.button>
        )}

        {/* Focus ring enhancement */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-inherit border-2 border-primary-400/30 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={tokens.motion.spring.gentle}
          />
        )}
      </motion.div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
