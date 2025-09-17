'use client';

import * as React from "react";
import { cn } from "../../../lib/utils";

interface LiquidGlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glow' | 'subtle';
  label?: string;
  error?: string;
}

const LiquidGlassInput = React.forwardRef<HTMLInputElement, LiquidGlassInputProps>(
  ({ className, variant = 'default', label, error, ...props }, ref) => {
    const baseClasses = "liquid-input";
    
    const variantClasses = {
      default: "",
      glow: "liquid-glass-glow",
      subtle: "bg-white/3 border-white/10"
    };
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-white/80 text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            error && "border-red-400/50 focus:border-red-400/70",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-400/80 text-sm">{error}</p>
        )}
      </div>
    );
  }
);
LiquidGlassInput.displayName = "LiquidGlassInput";

export { LiquidGlassInput };
