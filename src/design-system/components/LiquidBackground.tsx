"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LiquidBackgroundProps {
  variant?: 'bubbles' | 'flow' | 'waves' | 'particles';
  intensity?: 'subtle' | 'medium' | 'intense';
  color?: 'blue' | 'purple' | 'pink' | 'cyan' | 'multi';
  className?: string;
}

/**
 * LiquidBackground - Animated liquid background with floating bubbles
 * 
 * Features:
 * - Floating bubble animations
 * - Liquid flow effects
 * - Wave patterns
 * - Particle systems
 * - Multiple color themes
 * - Performance optimized
 * 
 * @example
 * ```tsx
 * <LiquidBackground variant="bubbles" intensity="medium" color="cyan" />
 * ```
 */
export function LiquidBackground({ 
  variant = 'bubbles', 
  intensity = 'medium',
  color = 'blue',
  className 
}: LiquidBackgroundProps) {
  const bubbleCount = {
    subtle: 8,
    medium: 15,
    intense: 25,
  }[intensity];

  const colorClasses = {
    blue: ['bg-blue-500/10', 'bg-blue-400/15', 'bg-blue-600/8'],
    purple: ['bg-purple-500/10', 'bg-purple-400/15', 'bg-purple-600/8'],
    pink: ['bg-pink-500/10', 'bg-pink-400/15', 'bg-pink-600/8'],
    cyan: ['bg-cyan-500/10', 'bg-cyan-400/15', 'bg-cyan-600/8'],
    multi: ['bg-blue-500/10', 'bg-purple-400/15', 'bg-pink-500/8', 'bg-cyan-400/12', 'bg-green-500/10'],
  };

  const colors = colorClasses[color];

  const generateBubbles = () => {
    return Array.from({ length: bubbleCount }, (_, i) => {
      const size = Math.random() * 100 + 20; // 20-120px
      const left = Math.random() * 100; // 0-100%
      const delay = Math.random() * 5; // 0-5s delay
      const duration = Math.random() * 10 + 15; // 15-25s duration
      const colorClass = colors[i % colors.length];
      
      return (
        <motion.div
          key={i}
          className={cn(
            'absolute rounded-full blur-sm',
            colorClass
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: '-100px',
          }}
          animate={{
            y: [-100, -800],
            x: [0, Math.random() * 100 - 50],
            scale: [0.5, 1.2, 0.8, 1, 0.5],
            opacity: [0, 0.6, 0.8, 0.6, 0],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut",
          }}
        />
      );
    });
  };

  const generateFlowElements = () => {
    return Array.from({ length: 6 }, (_, i) => (
      <motion.div
        key={i}
        className={cn(
          'absolute w-full h-32 opacity-20',
          colors[i % colors.length]
        )}
        style={{
          top: `${i * 20}%`,
          borderRadius: '50% 50% 0% 100%',
        }}
        animate={{
          x: ['-100%', '100%'],
          skewX: [-15, 15, -15],
          borderRadius: [
            '50% 50% 0% 100%',
            '0% 100% 50% 50%',
            '100% 0% 50% 50%',
            '50% 50% 0% 100%'
          ],
        }}
        transition={{
          duration: 20 + i * 2,
          repeat: Infinity,
          ease: "linear",
          delay: i * 2,
        }}
      />
    ));
  };

  const generateWaves = () => {
    return Array.from({ length: 4 }, (_, i) => (
      <motion.div
        key={i}
        className={cn(
          'absolute w-[200%] h-24 opacity-15',
          colors[i % colors.length]
        )}
        style={{
          bottom: `${i * 30}px`,
          left: '-50%',
          borderRadius: '100% 100% 0% 0%',
        }}
        animate={{
          x: ['-50%', '0%', '-50%'],
          scaleX: [1, 1.2, 1],
          scaleY: [1, 0.8, 1],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 1.5,
        }}
      />
    ));
  };

  const generateParticles = () => {
    return Array.from({ length: bubbleCount * 2 }, (_, i) => {
      const size = Math.random() * 4 + 2; // 2-6px
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 3 + 2; // 2-5s
      const delay = Math.random() * 2;
      
      return (
        <motion.div
          key={i}
          className={cn(
            'absolute rounded-full',
            colors[i % colors.length]
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut",
          }}
        />
      );
    });
  };

  const renderVariant = () => {
    switch (variant) {
      case 'bubbles':
        return generateBubbles();
      case 'flow':
        return generateFlowElements();
      case 'waves':
        return generateWaves();
      case 'particles':
        return generateParticles();
      default:
        return generateBubbles();
    }
  };

  return (
    <div className={cn(
      'fixed inset-0 pointer-events-none overflow-hidden',
      'z-0', // Behind content
      className
    )}>
      {/* Main liquid elements */}
      {renderVariant()}
      
      {/* Ambient glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-purple-500/5" />
      
      {/* Subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
}
