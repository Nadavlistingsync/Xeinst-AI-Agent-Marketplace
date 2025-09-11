"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlowInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'size'> {
  variant?: "default" | "glass" | "neon";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  label?: string;
  helperText?: string;
}

const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    error = false,
    label,
    helperText,
    ...props 
  }, ref) => {
    const baseClasses = "w-full transition-all duration-300 focus:outline-none";
    
    const variantClasses = {
      default: "bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      glass: "bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20",
      neon: "bg-black/50 border border-cyan-400 text-white placeholder-cyan-400/70 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 shadow-[0_0_20px_rgba(0,255,255,0.1)] focus:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
    };
    
    const sizeClasses = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-base rounded-lg",
      lg: "h-12 px-5 text-lg rounded-xl"
    };
    
    const errorClasses = error ? "border-red-500 focus:border-red-400 focus:ring-red-400/20" : "";

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            errorClasses,
            className
          )}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "text-xs",
            error ? "text-red-400" : "text-gray-400"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

GlowInput.displayName = "GlowInput";

export { GlowInput };