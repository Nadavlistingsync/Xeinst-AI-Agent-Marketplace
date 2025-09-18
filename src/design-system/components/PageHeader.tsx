"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { tokens } from '../tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Apple-inspired page header with stats and actions
 * 
 * Features:
 * - Responsive typography scale
 * - Optional stats display with trends
 * - Action area for buttons/controls
 * - Smooth entrance animations
 * - Consistent spacing and layout
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="AI Agent Marketplace"
 *   subtitle="Discover and deploy intelligent automation"
 *   stats={[
 *     { label: 'Agents', value: 1247, trend: 'up' },
 *     { label: 'Categories', value: 12 },
 *     { label: 'Avg Rating', value: '4.8' }
 *   ]}
 *   actions={<Button>Upload Agent</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  description,
  stats,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <motion.header
      className={cn(
        'relative py-12 px-4 sm:px-6 lg:px-8',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tokens.motion.spring.gentle}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main header content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Title section */}
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...tokens.motion.spring.gentle, delay: 0.1 }}
            >
              <h1 className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-bold',
                'bg-gradient-to-br from-white via-white to-white/70',
                'bg-clip-text text-transparent',
                'tracking-tight leading-tight'
              )}>
                {title}
              </h1>
            </motion.div>

            {subtitle && (
              <motion.p
                className="text-xl sm:text-2xl text-white/70 font-medium max-w-3xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...tokens.motion.spring.gentle, delay: 0.2 }}
              >
                {subtitle}
              </motion.p>
            )}

            {description && (
              <motion.p
                className="text-lg text-white/60 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...tokens.motion.spring.gentle, delay: 0.3 }}
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...tokens.motion.spring.gentle, delay: 0.2 }}
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <motion.div
            className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...tokens.motion.spring.gentle, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={cn(
                  'relative p-4 rounded-2xl',
                  'bg-white/[0.06] backdrop-blur-xl',
                  'border border-white/[0.08]',
                  'text-center group',
                  'hover:bg-white/[0.10] hover:border-white/[0.12]',
                  'transition-all duration-200'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  ...tokens.motion.spring.gentle, 
                  delay: 0.5 + (index * 0.1) 
                }}
                whileHover={{ y: -2 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-1">
                  {stat.label}
                </div>
                
                {/* Trend indicator */}
                {stat.trend && (
                  <div className={cn(
                    'absolute top-2 right-2 w-2 h-2 rounded-full',
                    stat.trend === 'up' && 'bg-green-400',
                    stat.trend === 'down' && 'bg-red-400',
                    stat.trend === 'neutral' && 'bg-yellow-400'
                  )} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional content */}
        {children && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...tokens.motion.spring.gentle, delay: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
